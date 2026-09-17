from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.database.connection import get_db
from app.models.baseline import FSLBaseline, CurriculumStage
from app.models.session import EvaluationAttempt, StudentStageProgress
from app.models.user import User, StudentProfile
from typing import List, Optional, Dict, Any
import uuid

router = APIRouter(tags=["Curriculum & Progression"])

@router.get("/curriculum")
async def get_curriculum(db: AsyncSession = Depends(get_db)):
    """
    Returns curriculum structure built dynamically from curriculum_stages and fsl_baselines.
    """
    try:
        # 1. Fetch all active curriculum stages
        stages_res = await db.execute(
            select(CurriculumStage)
            .where(CurriculumStage.is_active == True)
            .order_by(CurriculumStage.stage_number.asc())
        )
        stages = stages_res.scalars().all()

        # 2. Fetch all active baselines
        baselines_res = await db.execute(
            select(FSLBaseline)
            .where(FSLBaseline.is_active == True)
            .order_by(FSLBaseline.order_index.asc().nulls_last(), FSLBaseline.sign_id.asc().nulls_last())
        )
        baselines = baselines_res.scalars().all()

        # Group baselines by stage_id_new
        baselines_by_stage: Dict[int, List[Dict[str, Any]]] = {}
        custom_baselines: List[Dict[str, Any]] = []

        for b in baselines:
            if b.sign_id is None or b.sign_id == 0:
                continue
            item = {
                "globalId": b.sign_id,
                "name": b.sign_name
            }
            if b.stage_id_new is not None:
                if b.stage_id_new not in baselines_by_stage:
                    baselines_by_stage[b.stage_id_new] = []
                baselines_by_stage[b.stage_id_new].append(item)
            else:
                # Baselines without a standard stage (custom/unassigned)
                custom_baselines.append(item)

        # Build nested section -> unit -> stage hierarchy
        sections_map: Dict[int, Dict[str, Any]] = {}

        for st in stages:
            sec_num = st.section_number
            if sec_num not in sections_map:
                sections_map[sec_num] = {
                    "id": sec_num,
                    "title": st.section_title,
                    "units": []
                }

            sec = sections_map[sec_num]
            # Find or create unit
            unit = next((u for u in sec["units"] if u["id"] == st.unit_number), None)
            if not unit:
                unit = {
                    "id": st.unit_number,
                    "title": st.unit_title,
                    "stages": []
                }
                sec["units"].append(unit)

            unit["stages"].append({
                "id": st.stage_number,
                "title": st.title,
                "description": st.description or "",
                "items": baselines_by_stage.get(st.id, [])
            })

        # Sort sections and units
        curriculum = [sections_map[k] for k in sorted(sections_map.keys())]

        # Add teacher custom signs if present
        if custom_baselines:
            custom_stages = [
                {
                    "id": 1000 + idx,
                    "title": f"FSL Sign: {cb['name']}",
                    "description": f"Custom sign '{cb['name']}'",
                    "items": [cb]
                }
                for idx, cb in enumerate(custom_baselines)
            ]
            if curriculum:
                curriculum[0]["units"].append({
                    "id": 99,
                    "title": "Teacher Custom Signs",
                    "stages": custom_stages
                })

        return {"sections": curriculum}

    except Exception as e:
        # Fallback in case of DB error
        print(f"Curriculum DB warning: {e}")
        return {"sections": []}


@router.get("/users/{student_id}/progress")
async def get_student_progress(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        stud_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid student UUID")

    user_res = await db.execute(select(User).where(User.id == stud_uuid))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    profile_res = await db.execute(select(StudentProfile).where(StudentProfile.student_id == stud_uuid))
    profile = profile_res.scalar_one_or_none()

    # Query progression from student_stage_progress (source of truth)
    prog_res = await db.execute(
        select(StudentStageProgress, CurriculumStage)
        .join(CurriculumStage, StudentStageProgress.stage_id == CurriculumStage.id)
        .where(StudentStageProgress.student_id == stud_uuid)
        .order_by(CurriculumStage.stage_number.asc())
    )
    rows = prog_res.all()

    unlocked_stages = []
    stage_progress = []

    for ssp, stage in rows:
        if ssp.unlocked:
            unlocked_stages.append(stage.stage_number)
        stage_progress.append({
            "stage_id": stage.stage_number,
            "unlocked": ssp.unlocked,
            "passed": ssp.passed,
            "best_score": round(float(ssp.best_score or 0.0), 1),
            "stars": ssp.stars
        })

    # If student has no unlocked stages yet, dynamically unlock the first active curriculum stage
    if not unlocked_stages:
        first_st_res = await db.execute(
            select(CurriculumStage)
            .where(CurriculumStage.is_active == True)
            .order_by(CurriculumStage.stage_number.asc())
            .limit(1)
        )
        first_st = first_st_res.scalar_one_or_none()
        default_stage_num = first_st.stage_number if first_st else 1
        unlocked_stages = [default_stage_num]
        stage_progress.append({
            "stage_id": default_stage_num,
            "unlocked": True,
            "passed": False,
            "best_score": 0.0,
            "stars": 0
        })

    streak = profile.streak if profile else 0

    # Total signs mastered (Tier 1 passes)
    mastered_res = await db.execute(
        select(func.count(func.distinct(EvaluationAttempt.sign_id)))
        .where(
            EvaluationAttempt.student_id == student_id,
            EvaluationAttempt.passed == True,
            EvaluationAttempt.tier_level == 1
        )
    )
    total_signs_mastered = mastered_res.scalar() or 0

    avg_res = await db.execute(
        select(func.avg(EvaluationAttempt.score_overall))
        .where(EvaluationAttempt.student_id == student_id)
    )
    avg_score = round(float(avg_res.scalar() or 0.0), 2)

    return {
        "student_id": student_id,
        "student_name": user.name,
        "unlocked_stages": sorted(unlocked_stages),
        "stages": stage_progress,
        "total_signs_mastered": total_signs_mastered,
        "current_streak": streak,
        "avg_score": avg_score
    }
