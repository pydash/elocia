from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database.connection import get_db
from app.models.baseline import FSLBaseline, CurriculumStage, Curriculum, CurriculumSection, CurriculumUnit
from app.models.session import EvaluationAttempt, StudentStageProgress
from app.models.user import User, StudentProfile
from app.schemas.curriculum import (
    CurriculumCreate, CurriculumUpdate, CurriculumResponse,
    SectionCreate, SectionUpdate, SectionResponse,
    UnitCreate, UnitUpdate, UnitResponse,
    StageCreate, StageUpdate, StageResponse
)
from typing import List, Optional, Dict, Any
import uuid

router = APIRouter(tags=["Curriculum & Progression"])

@router.get("/curriculum")
async def get_curriculum(grade_level: Optional[int] = Query(None), db: AsyncSession = Depends(get_db)):
    """
    Returns curriculum structure built dynamically from curriculums -> sections -> units -> stages -> baselines.
    Includes backward-compatible fallback to flat curriculum_stages if normalized tables are not yet populated.
    """
    try:
        # 1. Try querying normalized tables first
        curr_query = select(Curriculum).where(Curriculum.is_active == True)
        if grade_level:
            curr_query = curr_query.where(Curriculum.grade_level == grade_level)
        curr_query = curr_query.order_by(Curriculum.grade_level.asc())
        curr_res = await db.execute(curr_query)
        curr_list = curr_res.scalars().all()

        if curr_list:
            curr_ids = [c.id for c in curr_list]
            sections_res = await db.execute(
                select(CurriculumSection)
                .where(CurriculumSection.curriculum_id.in_(curr_ids))
                .order_by(CurriculumSection.section_number.asc())
            )
            sections = sections_res.scalars().all()

            sec_ids = [s.id for s in sections]
            units_res = await db.execute(
                select(CurriculumUnit)
                .where(CurriculumUnit.section_id.in_(sec_ids))
                .order_by(CurriculumUnit.unit_number.asc())
            )
            units = units_res.scalars().all()

            unit_ids = [u.id for u in units]
            stages_res = await db.execute(
                select(CurriculumStage)
                .where(CurriculumStage.unit_id.in_(unit_ids), CurriculumStage.is_active == True)
                .order_by(CurriculumStage.stage_number.asc())
            )
            stages = stages_res.scalars().all()

            baselines_res = await db.execute(
                select(FSLBaseline)
                .where(FSLBaseline.is_active == True)
                .order_by(FSLBaseline.order_index.asc().nulls_last(), FSLBaseline.sign_id.asc().nulls_last())
            )
            baselines = baselines_res.scalars().all()

            baselines_by_stage: Dict[int, List[Dict[str, Any]]] = {}
            for b in baselines:
                if b.sign_id is None or b.sign_id == 0:
                    continue
                item = {"globalId": b.sign_id, "name": b.sign_name}
                if b.stage_id_new is not None:
                    baselines_by_stage.setdefault(b.stage_id_new, []).append(item)

            stages_by_unit: Dict[uuid.UUID, List[Dict[str, Any]]] = {}
            for st in stages:
                if st.unit_id:
                    stages_by_unit.setdefault(st.unit_id, []).append({
                        "id": st.stage_number,
                        "title": st.title,
                        "description": st.description or "",
                        "items": baselines_by_stage.get(st.id, [])
                    })

            units_by_sec: Dict[uuid.UUID, List[Dict[str, Any]]] = {}
            for un in units:
                units_by_sec.setdefault(un.section_id, []).append({
                    "id": un.unit_number,
                    "title": un.title,
                    "stages": stages_by_unit.get(un.id, [])
                })

            curriculum_sections = []
            for sec in sections:
                curriculum_sections.append({
                    "id": sec.section_number,
                    "title": sec.title,
                    "units": units_by_sec.get(sec.id, [])
                })

            if curriculum_sections:
                return {"sections": curriculum_sections}

        # 2. Fallback to reading flat curriculum_stages if normalized tables are not yet populated
        stages_res = await db.execute(
            select(CurriculumStage)
            .where(CurriculumStage.is_active == True)
            .order_by(CurriculumStage.stage_number.asc())
        )
        stages = stages_res.scalars().all()

        baselines_res = await db.execute(
            select(FSLBaseline)
            .where(FSLBaseline.is_active == True)
            .order_by(FSLBaseline.order_index.asc().nulls_last(), FSLBaseline.sign_id.asc().nulls_last())
        )
        baselines = baselines_res.scalars().all()

        baselines_by_stage: Dict[int, List[Dict[str, Any]]] = {}
        custom_baselines: List[Dict[str, Any]] = []

        for b in baselines:
            if b.sign_id is None or b.sign_id == 0:
                continue
            item = {"globalId": b.sign_id, "name": b.sign_name}
            if b.stage_id_new is not None:
                baselines_by_stage.setdefault(b.stage_id_new, []).append(item)
            else:
                custom_baselines.append(item)

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

        curriculum = [sections_map[k] for k in sorted(sections_map.keys())]

        if custom_baselines and curriculum:
            curriculum[0]["units"].append({
                "id": 99,
                "title": "Teacher Custom Signs",
                "stages": [
                    {
                        "id": 1000 + idx,
                        "title": f"FSL Sign: {cb['name']}",
                        "description": f"Custom sign '{cb['name']}'",
                        "items": [cb]
                    }
                    for idx, cb in enumerate(custom_baselines)
                ]
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


# ── 1. Curriculums CRUD ───────────────────────────────────────────────────────
@router.get("/curriculums", response_model=List[CurriculumResponse])
async def list_curriculums(
    grade_level: Optional[int] = Query(None, description="Filter by grade level"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Curriculum).where(Curriculum.is_active == True)
    if grade_level is not None:
        query = query.where(Curriculum.grade_level == grade_level)
    query = query.order_by(Curriculum.grade_level.asc(), Curriculum.created_at.asc())
    res = await db.execute(query)
    return res.scalars().all()

@router.post("/curriculums", response_model=CurriculumResponse, status_code=status.HTTP_201_CREATED)
async def create_curriculum(payload: CurriculumCreate, db: AsyncSession = Depends(get_db)):
    new_curr = Curriculum(
        grade_level=payload.grade_level,
        title=payload.title,
        description=payload.description
    )
    db.add(new_curr)
    await db.commit()
    await db.refresh(new_curr)
    return new_curr

@router.get("/curriculums/{curriculum_id}", response_model=CurriculumResponse)
async def get_curriculum_by_id(curriculum_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Curriculum)
        .options(
            selectinload(Curriculum.sections)
            .selectinload(CurriculumSection.units)
            .selectinload(CurriculumUnit.stages)
        )
        .where(Curriculum.id == curriculum_id)
    )
    curr = res.scalar_one_or_none()
    if not curr:
        raise HTTPException(status_code=404, detail="Curriculum not found")
    return curr

@router.put("/curriculums/{curriculum_id}", response_model=CurriculumResponse)
async def update_curriculum(curriculum_id: uuid.UUID, payload: CurriculumUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Curriculum).where(Curriculum.id == curriculum_id))
    curr = res.scalar_one_or_none()
    if not curr:
        raise HTTPException(status_code=404, detail="Curriculum not found")
    if payload.title is not None:
        curr.title = payload.title
    if payload.grade_level is not None:
        curr.grade_level = payload.grade_level
    if payload.description is not None:
        curr.description = payload.description
    if payload.is_active is not None:
        curr.is_active = payload.is_active
    await db.commit()
    await db.refresh(curr)
    return curr

@router.delete("/curriculums/{curriculum_id}", status_code=status.HTTP_200_OK)
async def delete_curriculum(curriculum_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Curriculum).where(Curriculum.id == curriculum_id))
    curr = res.scalar_one_or_none()
    if not curr:
        raise HTTPException(status_code=404, detail="Curriculum not found")
    curr.is_active = False
    await db.commit()
    return {"status": "deactivated", "curriculum_id": str(curriculum_id)}


# ── 2. Sections CRUD ──────────────────────────────────────────────────────────
@router.get("/curriculums/{curriculum_id}/sections", response_model=List[SectionResponse])
async def list_curriculum_sections(curriculum_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CurriculumSection)
        .options(
            selectinload(CurriculumSection.units)
            .selectinload(CurriculumUnit.stages)
        )
        .where(CurriculumSection.curriculum_id == curriculum_id)
        .order_by(CurriculumSection.section_number.asc())
    )
    return res.scalars().all()

@router.post("/curriculums/{curriculum_id}/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_curriculum_section(curriculum_id: uuid.UUID, payload: SectionCreate, db: AsyncSession = Depends(get_db)):
    curr_res = await db.execute(select(Curriculum).where(Curriculum.id == curriculum_id))
    if not curr_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Curriculum not found")

    new_sec = CurriculumSection(
        curriculum_id=curriculum_id,
        section_number=payload.section_number,
        title=payload.title
    )
    db.add(new_sec)
    await db.commit()
    await db.refresh(new_sec)
    return new_sec

@router.put("/curriculum-sections/{section_id}", response_model=SectionResponse)
async def update_curriculum_section(section_id: uuid.UUID, payload: SectionUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CurriculumSection).where(CurriculumSection.id == section_id))
    sec = res.scalar_one_or_none()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    if payload.title is not None:
        sec.title = payload.title
    if payload.section_number is not None:
        sec.section_number = payload.section_number
    await db.commit()
    await db.refresh(sec)
    return sec

@router.delete("/curriculum-sections/{section_id}", status_code=status.HTTP_200_OK)
async def delete_curriculum_section(section_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CurriculumSection).where(CurriculumSection.id == section_id))
    sec = res.scalar_one_or_none()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    await db.delete(sec)
    await db.commit()
    return {"status": "deleted", "section_id": str(section_id)}


# ── 3. Units CRUD ─────────────────────────────────────────────────────────────
@router.get("/curriculum-sections/{section_id}/units", response_model=List[UnitResponse])
async def list_section_units(section_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CurriculumUnit)
        .options(selectinload(CurriculumUnit.stages))
        .where(CurriculumUnit.section_id == section_id)
        .order_by(CurriculumUnit.unit_number.asc())
    )
    return res.scalars().all()

@router.post("/curriculum-sections/{section_id}/units", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_section_unit(section_id: uuid.UUID, payload: UnitCreate, db: AsyncSession = Depends(get_db)):
    sec_res = await db.execute(select(CurriculumSection).where(CurriculumSection.id == section_id))
    if not sec_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Section not found")

    new_unit = CurriculumUnit(
        section_id=section_id,
        unit_number=payload.unit_number,
        title=payload.title
    )
    db.add(new_unit)
    await db.commit()
    await db.refresh(new_unit)
    return new_unit

@router.put("/curriculum-units/{unit_id}", response_model=UnitResponse)
async def update_section_unit(unit_id: uuid.UUID, payload: UnitUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CurriculumUnit).where(CurriculumUnit.id == unit_id))
    un = res.scalar_one_or_none()
    if not un:
        raise HTTPException(status_code=404, detail="Unit not found")
    if payload.title is not None:
        un.title = payload.title
    if payload.unit_number is not None:
        un.unit_number = payload.unit_number
    await db.commit()
    await db.refresh(un)
    return un

@router.delete("/curriculum-units/{unit_id}", status_code=status.HTTP_200_OK)
async def delete_section_unit(unit_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CurriculumUnit).where(CurriculumUnit.id == unit_id))
    un = res.scalar_one_or_none()
    if not un:
        raise HTTPException(status_code=404, detail="Unit not found")
    await db.delete(un)
    await db.commit()
    return {"status": "deleted", "unit_id": str(unit_id)}


# ── 4. Stages CRUD ────────────────────────────────────────────────────────────
@router.get("/curriculum-units/{unit_id}/stages", response_model=List[StageResponse])
async def list_unit_stages(unit_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CurriculumStage)
        .where(CurriculumStage.unit_id == unit_id, CurriculumStage.is_active == True)
        .order_by(CurriculumStage.stage_number.asc())
    )
    return res.scalars().all()

@router.post("/curriculum-units/{unit_id}/stages", response_model=StageResponse, status_code=status.HTTP_201_CREATED)
async def create_unit_stage(unit_id: uuid.UUID, payload: StageCreate, db: AsyncSession = Depends(get_db)):
    un_res = await db.execute(select(CurriculumUnit).where(CurriculumUnit.id == unit_id))
    if not un_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Unit not found")

    new_stage = CurriculumStage(
        unit_id=unit_id,
        stage_number=payload.stage_number,
        title=payload.title,
        description=payload.description
    )
    db.add(new_stage)
    await db.commit()
    await db.refresh(new_stage)
    return new_stage

@router.put("/curriculum-stages/{stage_id}", response_model=StageResponse)
async def update_curriculum_stage(stage_id: int, payload: StageUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CurriculumStage).where(CurriculumStage.id == stage_id))
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Stage not found")
    if payload.title is not None:
        st.title = payload.title
    if payload.description is not None:
        st.description = payload.description
    if payload.stage_number is not None:
        st.stage_number = payload.stage_number
    if payload.is_active is not None:
        st.is_active = payload.is_active
    await db.commit()
    await db.refresh(st)
    return st

@router.delete("/curriculum-stages/{stage_id}", status_code=status.HTTP_200_OK)
async def delete_curriculum_stage(stage_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CurriculumStage).where(CurriculumStage.id == stage_id))
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Stage not found")
    st.is_active = False
    await db.commit()
    return {"status": "deactivated", "stage_id": stage_id}
