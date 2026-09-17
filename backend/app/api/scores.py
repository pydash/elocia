from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
from datetime import datetime
import uuid

from app.database.connection import get_db
from app.models.user import User, StudentProfile
from app.models.session import EvaluationAttempt, StudentStageProgress
from app.models.baseline import FSLBaseline, CurriculumStage
from app.models.minigame import MiniGameSession
from app.schemas.score import ScoreSaveRequest

router = APIRouter(prefix="/scores", tags=["Scoring & Evaluation"])

def compute_level_from_xp(total_xp: int) -> int:
    """
    Level 1: 0 - 499 XP (Beginner Signer)
    Level 2: 500 - 1,499 XP (Junior Signer)
    Level 3: 1,500 - 2,999 XP (Active Signer)
    Level 4: 3,000 - 4,999 XP (Skilled Signer)
    Level 5: 5,000 - 7,499 XP (Star Signer)
    Level 6: 7,500 - 10,499 XP (Honor Signer)
    Level 7: 10,500 - 13,999 XP (Advanced Signer)
    Level 8: 14,000 - 17,999 XP (Class Top Signer)
    Level 9: 18,000 - 22,499 XP (Senior Signer)
    Level 10: 22,500+ XP (Master Signer)
    """
    thresholds = [
        (22500, 10),
        (18000, 9),
        (14000, 8),
        (10500, 7),
        (7500, 6),
        (5000, 5),
        (3000, 4),
        (1500, 3),
        (500, 2),
    ]
    for xp, lvl in thresholds:
        if total_xp >= xp:
            return lvl
    return 1

def calculate_stars(score: float) -> int:
    if score >= 90: return 5
    if score >= 75: return 4
    if score >= 60: return 3
    if score >= 40: return 2
    if score > 0: return 1
    return 0


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_score(
    student_id: str,
    activity_type: str = "evaluation",
    stage_id: Optional[int] = 1,
    sign_id: Optional[int] = None,
    attempt_number: int = 1,
    tier_level: int = 1,
    score_handshape: int = 0,
    score_palm_orientation: int = 0,
    score_location: int = 0,
    score_movement: int = 0,
    score_overall: float = 0.0,
    passed: bool = False,
    streak: int = 0,
    xp_earned: int = 0,
    db: AsyncSession = Depends(get_db)
):
    stud_uuid = uuid.UUID(student_id)

    # 1. Resolve sign_id and stage_id_new correctly
    resolved_sign_id = sign_id
    resolved_stage_id_new = None

    if activity_type == "evaluation":
        # In evaluation mode:
        # If sign_id wasn't passed directly, check whether stage_id is actually the sign_id (common in legacy clients)
        if resolved_sign_id is None and stage_id is not None:
            # Check baseline for sign_id == stage_id
            b_res = await db.execute(select(FSLBaseline).where(FSLBaseline.sign_id == stage_id))
            b = b_res.scalar_one_or_none()
            if b:
                resolved_sign_id = b.sign_id
                resolved_stage_id_new = b.stage_id_new
            else:
                # stage_id might refer to curriculum_stages.id or stage_number
                resolved_sign_id = stage_id
        elif resolved_sign_id is not None:
            # Look up stage_id_new for this sign
            b_res = await db.execute(select(FSLBaseline).where(FSLBaseline.sign_id == resolved_sign_id))
            b = b_res.scalar_one_or_none()
            if b:
                resolved_stage_id_new = b.stage_id_new
        
        # If stage_id was explicitly provided and stage_id_new not resolved, lookup CurriculumStage dynamically
        if resolved_stage_id_new is None and stage_id is not None:
            # Check if stage_id matches a curriculum_stages.stage_number or curriculum_stages.id
            st_res = await db.execute(
                select(CurriculumStage).where(
                    (CurriculumStage.stage_number == stage_id) | (CurriculumStage.id == stage_id)
                )
            )
            st = st_res.scalar_one_or_none()
            if st:
                resolved_stage_id_new = st.id
    else:
        # puzzle_sign or other mini-game activities:
        # stage_id_new MUST remain NULL to prevent corrupting curriculum stages!
        resolved_stage_id_new = None
        if resolved_sign_id is None and stage_id is not None:
            resolved_sign_id = stage_id

    # 2. Record the EvaluationAttempt
    attempt = EvaluationAttempt(
        student_id=stud_uuid,
        activity_type=activity_type,
        stage_id=stage_id,  # Legacy column preserved
        sign_id=resolved_sign_id,
        stage_id_new=resolved_stage_id_new,
        attempt_number=attempt_number,
        tier_level=tier_level,
        score_handshape=score_handshape,
        score_palm_orientation=score_palm_orientation,
        score_location=score_location,
        score_movement=score_movement,
        score_overall=score_overall,
        passed=passed,
        streak=streak,
        xp_earned=xp_earned
    )
    db.add(attempt)

    # 3. Update StudentProfile and User
    prof_res = await db.execute(select(StudentProfile).where(StudentProfile.student_id == stud_uuid))
    profile = prof_res.scalar_one_or_none()

    user_res = await db.execute(select(User).where(User.id == stud_uuid))
    user = user_res.scalar_one_or_none()

    if user or profile:
        now = datetime.utcnow()
        # Streak handling
        last_date = (profile.updated_at if profile else user.updated_at)
        today_date = now.date()
        if passed and (last_date is None or last_date.date() != today_date):
            if profile:
                profile.streak = (profile.streak or 0) + 1
            if user:
                user.streak = (user.streak or 0) + 1

        # Signs mastered (Tier 1 passes)
        if passed and tier_level == 1 and user:
            user.signs_mastered = (user.signs_mastered or 0) + 1

        # Calculate live total XP
        eval_xp_res = await db.execute(
            select(func.coalesce(func.sum(EvaluationAttempt.xp_earned), 0))
            .where(EvaluationAttempt.student_id == stud_uuid)
        )
        total_eval_xp = (eval_xp_res.scalar() or 0) + xp_earned

        game_xp_res = await db.execute(
            select(func.coalesce(func.sum(MiniGameSession.score), 0))
            .where(MiniGameSession.student_id == stud_uuid)
        )
        total_game_xp = game_xp_res.scalar() or 0

        total_xp = int(total_eval_xp + total_game_xp)
        new_lvl = compute_level_from_xp(total_xp)

        if profile:
            profile.total_xp = total_xp
            profile.level = new_lvl
            profile.updated_at = now
        if user:
            user.level = new_lvl

        # Recalculate student avg_score
        avg_res = await db.execute(
            select(func.avg(EvaluationAttempt.score_overall))
            .where(EvaluationAttempt.student_id == stud_uuid)
        )
        avg_val = avg_res.scalar()
        if avg_val is not None and user:
            user.avg_score = round(float(avg_val), 2)

    # 4. Curriculum Progression & Stage Unlocking Rule
    # Only applies to official 'evaluation' activity with an assigned stage_id_new
    if activity_type == "evaluation" and resolved_stage_id_new is not None:
        # Fetch or create student_stage_progress record
        ssp_res = await db.execute(
            select(StudentStageProgress)
            .where(
                StudentStageProgress.student_id == stud_uuid,
                StudentStageProgress.stage_id == resolved_stage_id_new
            )
        )
        ssp = ssp_res.scalar_one_or_none()

        # Fetch current curriculum stage record to check ordering and attributes
        curr_stage_res = await db.execute(
            select(CurriculumStage).where(CurriculumStage.id == resolved_stage_id_new)
        )
        curr_stage = curr_stage_res.scalar_one_or_none()

        if not ssp:
            # First active stage in curriculum is unlocked by default
            first_stage_res = await db.execute(
                select(CurriculumStage)
                .where(CurriculumStage.is_active == True)
                .order_by(CurriculumStage.stage_number.asc())
                .limit(1)
            )
            first_stage = first_stage_res.scalar_one_or_none()
            is_default_unlocked = (first_stage and first_stage.id == resolved_stage_id_new)

            ssp = StudentStageProgress(
                id=uuid.uuid4(),
                student_id=stud_uuid,
                stage_id=resolved_stage_id_new,
                unlocked=bool(is_default_unlocked),
                passed=False,
                best_score=0.0,
                stars=0
            )
            db.add(ssp)

        # Update best score and stars if current score is higher
        if score_overall > ssp.best_score:
            ssp.best_score = round(float(score_overall), 2)
            ssp.stars = calculate_stars(ssp.best_score)

        # Check Stage Completion:
        # Total active signs assigned to this curriculum stage in the database
        signs_count_res = await db.execute(
            select(func.count(FSLBaseline.id))
            .where(FSLBaseline.stage_id_new == resolved_stage_id_new, FSLBaseline.is_active == True)
        )
        total_signs_in_stage = signs_count_res.scalar() or 0

        # Distinct passed signs in this stage for this student
        passed_signs_res = await db.execute(
            select(func.count(func.distinct(EvaluationAttempt.sign_id)))
            .where(
                EvaluationAttempt.student_id == stud_uuid,
                EvaluationAttempt.stage_id_new == resolved_stage_id_new,
                EvaluationAttempt.passed == True
            )
        )
        distinct_passed_signs = passed_signs_res.scalar() or 0

        # If ALL signs assigned to this stage in the DB are passed (and stage has signs), mark stage as passed and unlock NEXT stage
        if total_signs_in_stage > 0 and distinct_passed_signs >= total_signs_in_stage:
            ssp.passed = True
            if ssp.completed_at is None:
                ssp.completed_at = datetime.utcnow()

            # Unlock the immediately NEXT active stage in curriculum order
            if curr_stage:
                next_stage_res = await db.execute(
                    select(CurriculumStage)
                    .where(
                        CurriculumStage.is_active == True,
                        CurriculumStage.stage_number > curr_stage.stage_number
                    )
                    .order_by(CurriculumStage.stage_number.asc())
                    .limit(1)
                )
                next_stage = next_stage_res.scalar_one_or_none()
                if next_stage:
                    next_ssp_res = await db.execute(
                        select(StudentStageProgress)
                        .where(
                            StudentStageProgress.student_id == stud_uuid,
                            StudentStageProgress.stage_id == next_stage.id
                        )
                    )
                    next_ssp = next_ssp_res.scalar_one_or_none()
                    if next_ssp:
                        next_ssp.unlocked = True
                    else:
                        new_next_ssp = StudentStageProgress(
                            id=uuid.uuid4(),
                            student_id=stud_uuid,
                            stage_id=next_stage.id,
                            unlocked=True,
                            passed=False,
                            best_score=0.0,
                            stars=0
                        )
                        db.add(new_next_ssp)

    await db.commit()
    return {"status": "saved", "attempt_id": str(attempt.id)}


@router.get("/{student_id}")
async def get_student_scores(student_id: str, db: AsyncSession = Depends(get_db)):
    stud_uuid = uuid.UUID(student_id)
    result = await db.execute(
        select(EvaluationAttempt)
        .where(EvaluationAttempt.student_id == stud_uuid)
        .order_by(EvaluationAttempt.created_at.desc())
    )
    attempts = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "activity_type": a.activity_type,
            "stage_id": a.stage_id,
            "sign_id": a.sign_id,
            "stage_id_new": a.stage_id_new,
            "score_overall": a.score_overall,
            "score_handshape": a.score_handshape,
            "score_palm_orientation": a.score_palm_orientation,
            "score_location": a.score_location,
            "score_movement": a.score_movement,
            "passed": a.passed,
            "tier_level": a.tier_level,
            "streak": a.streak,
            "xp_earned": a.xp_earned,
            "created_at": str(a.created_at)
        }
        for a in attempts
    ]