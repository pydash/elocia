from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import uuid

from app.database.connection import get_db
from app.models.user import User
from app.models.session import EvaluationAttempt

router = APIRouter(prefix="/scores", tags=["Scoring & Evaluation"])

@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_score(
    student_id: str,
    activity_type: str = "evaluation",
    stage_id: int = 1,
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
    attempt = EvaluationAttempt(
        student_id=stud_uuid,
        activity_type=activity_type,
        stage_id=stage_id,
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

    # Automatically update the student's aggregate progress in User table
    user_res = await db.execute(select(User).where(User.id == stud_uuid))
    user = user_res.scalar_one_or_none()
    if user:
        if passed:
            user.streak = (user.streak or 0) + 1
            if tier_level == 1:
                user.signs_mastered = (user.signs_mastered or 0) + 1
        else:
            user.streak = 0
            
        avg_res = await db.execute(
            select(func.avg(EvaluationAttempt.score_overall))
            .where(EvaluationAttempt.student_id == stud_uuid)
        )
        avg_val = avg_res.scalar()
        if avg_val is not None:
            user.avg_score = round(float(avg_val), 2)
            
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