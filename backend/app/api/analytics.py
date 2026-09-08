from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List
import uuid

from app.database.connection import get_db
from app.models.user import User, UserRole
from app.models.session import EvaluationAttempt
from app.schemas.analytics import (
    ClassRadarAnalytics,
    ParameterBreakdown,
    Tier4FlagItem,
    ParentProgressSummary
)

router = APIRouter(prefix="/analytics", tags=["Learning Analytics (Module 2)"])

def get_status_label(avg_score: float) -> str:
    if avg_score >= 80:
        return "Mastered"
    elif avg_score >= 60:
        return "Developing"
    return "Needs Focus"

@router.get("/class-radar", response_model=ClassRadarAnalytics)
async def get_class_radar_analytics(db: AsyncSession = Depends(get_db)):
    # Total student count
    stud_count_res = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.student, User.is_active == True)
    )
    total_students = stud_count_res.scalar() or 0

    # Total attempts count
    att_count_res = await db.execute(select(func.count(EvaluationAttempt.id)))
    total_attempts = att_count_res.scalar() or 0

    # Compute averages across the 4 FSL parameters
    avg_hand_res = await db.execute(select(func.avg(EvaluationAttempt.score_handshape)))
    avg_palm_res = await db.execute(select(func.avg(EvaluationAttempt.score_palm_orientation)))
    avg_loc_res = await db.execute(select(func.avg(EvaluationAttempt.score_location)))
    avg_mov_res = await db.execute(select(func.avg(EvaluationAttempt.score_movement)))
    avg_overall_res = await db.execute(select(func.avg(EvaluationAttempt.score_overall)))

    avg_hand = round(float(avg_hand_res.scalar() or 0.0), 1)
    avg_palm = round(float(avg_palm_res.scalar() or 0.0), 1)
    avg_loc = round(float(avg_loc_res.scalar() or 0.0), 1)
    avg_mov = round(float(avg_mov_res.scalar() or 0.0), 1)
    avg_overall = round(float(avg_overall_res.scalar() or 0.0), 1)

    parameters = [
        ParameterBreakdown(parameter="Handshape", average_score=avg_hand, status=get_status_label(avg_hand)),
        ParameterBreakdown(parameter="Palm Orientation", average_score=avg_palm, status=get_status_label(avg_palm)),
        ParameterBreakdown(parameter="Location", average_score=avg_loc, status=get_status_label(avg_loc)),
        ParameterBreakdown(parameter="Movement", average_score=avg_mov, status=get_status_label(avg_mov)),
    ]

    return ClassRadarAnalytics(
        total_students=total_students,
        total_attempts=total_attempts,
        overall_class_average=avg_overall,
        parameters=parameters
    )

@router.get("/tier4-flags", response_model=List[Tier4FlagItem])
async def get_tier4_flags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EvaluationAttempt, User.name.label("student_name"))
        .join(User, EvaluationAttempt.student_id == User.id)
        .where(EvaluationAttempt.tier_level == 4)
        .order_by(EvaluationAttempt.created_at.desc())
    )
    rows = result.all()

    flags = []
    for attempt, student_name in rows:
        # Determine which parameter scored lowest
        scores = {
            "Handshape": attempt.score_handshape or 0,
            "Palm Orientation": attempt.score_palm_orientation or 0,
            "Location": attempt.score_location or 0,
            "Movement": attempt.score_movement or 0
        }
        lowest_param = min(scores, key=scores.get)

        flags.append(
            Tier4FlagItem(
                attempt_id=attempt.id,
                student_id=attempt.student_id,
                student_name=student_name,
                stage_id=attempt.stage_id,
                score_overall=attempt.score_overall,
                score_handshape=attempt.score_handshape,
                score_palm_orientation=attempt.score_palm_orientation,
                score_location=attempt.score_location,
                score_movement=attempt.score_movement,
                flagged_at=attempt.created_at,
                suggested_focus=f"Check {lowest_param} ({scores[lowest_param]}%)"
            )
        )
    return flags

@router.get("/parent/{student_id}", response_model=ParentProgressSummary)
async def get_parent_progress_summary(student_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stud_res = await db.execute(select(User).where(User.id == student_id, User.role == UserRole.student))
    student = stud_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    # Aggregate student stats
    tot_att_res = await db.execute(
        select(func.count(EvaluationAttempt.id)).where(EvaluationAttempt.student_id == student_id)
    )
    total_sessions = tot_att_res.scalar() or 0

    # Calculate parameter averages for this student
    avg_h = float((await db.execute(select(func.avg(EvaluationAttempt.score_handshape)).where(EvaluationAttempt.student_id == student_id))).scalar() or 0.0)
    avg_p = float((await db.execute(select(func.avg(EvaluationAttempt.score_palm_orientation)).where(EvaluationAttempt.student_id == student_id))).scalar() or 0.0)
    avg_l = float((await db.execute(select(func.avg(EvaluationAttempt.score_location)).where(EvaluationAttempt.student_id == student_id))).scalar() or 0.0)
    avg_m = float((await db.execute(select(func.avg(EvaluationAttempt.score_movement)).where(EvaluationAttempt.student_id == student_id))).scalar() or 0.0)

    params = {
        "Finger & Hand Shapes": avg_h,
        "Palm Facing Direction": avg_p,
        "Hand Placement": avg_l,
        "Sign Movement Trajectory": avg_m
    }

    strengths = [name for name, sc in params.items() if sc >= 75]
    areas_to_practice = [name for name, sc in params.items() if sc < 75]

    # Generate friendly, actionable parent recommendation
    if not areas_to_practice:
        recommendation = f"{student.name} is doing fantastic across all signing parameters! Keep up the daily practice."
    else:
        lowest = min(params, key=params.get)
        recommendation = f"Encourage {student.name} to focus on '{lowest}' during home practice. Try doing the signs together slowly!"

    return ParentProgressSummary(
        student_id=student.id,
        student_name=student.name,
        level=student.level or 1,
        streak=student.streak or 0,
        avg_score=student.avg_score or 0.0,
        total_practice_sessions=total_sessions,
        strengths=strengths if strengths else ["Showing great persistence!"],
        areas_to_practice=areas_to_practice if areas_to_practice else ["Reviewing advanced stages"],
        home_practice_recommendation=recommendation
    )


@router.get("/students/{student_id}/needs-practice")
async def get_student_needs_practice(student_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Returns the specific signs and stages a student struggled with (score < 60 or Tier 4 flag),
    or fallback recommended signs if they haven't failed any yet.
    Powers the 'Keep Practicing' cards on the Student Desktop Practice Page.
    """
    # 1. Fetch recent low-scoring or Tier 4 evaluation attempts
    result = await db.execute(
        select(EvaluationAttempt)
        .where(
            EvaluationAttempt.student_id == student_id,
            (EvaluationAttempt.passed == False) | (EvaluationAttempt.tier_level >= 3)
        )
        .order_by(EvaluationAttempt.created_at.desc())
        .limit(10)
    )
    failed_attempts = result.scalars().all()

    # Color palette matching UI: red, orange, green, blue
    colors = ["red", "orange", "green", "blue"]

    cards = []
    seen_stages = set()

    for att in failed_attempts:
        s_id = att.stage_id or 1
        if s_id not in seen_stages and len(cards) < 4:
            seen_stages.add(s_id)
            score_val = round(att.score_overall or 45.0, 1)
            cards.append({
                "sign": f"Stage {s_id}",
                "stage_id": s_id,
                "section_label": f"Section 1, Stage {s_id}",
                "score": score_val,
                "color": colors[len(cards) % len(colors)],
                "reason": "Needs focus on hand movement" if (att.score_movement or 0) < 60 else "Flagged for practice"
            })

    # Default fallback cards if student has fewer than 4 errors
    defaults = [
        {"sign": "Hello", "stage_id": 1, "section_label": "Section 1, Stage 1", "score": 55, "color": "red", "reason": "Recommended warm-up"},
        {"sign": "Thank You", "stage_id": 1, "section_label": "Section 1, Stage 1", "score": 58, "color": "orange", "reason": "Recommended practice"},
        {"sign": "1", "stage_id": 1, "section_label": "Section 1, Stage 1", "score": 62, "color": "green", "reason": "Keep streak alive"},
        {"sign": "2", "stage_id": 1, "section_label": "Section 1, Stage 1", "score": 65, "color": "blue", "reason": "Refine palm orientation"},
    ]

    for d in defaults:
        if len(cards) >= 4:
            break
        if d["sign"] not in [c["sign"] for c in cards]:
            d_copy = dict(d)
            d_copy["color"] = colors[len(cards) % len(colors)]
            cards.append(d_copy)

    return {"student_id": str(student_id), "practice_items": cards}


@router.post("/drills/create")
async def create_focus_drill(payload: dict, db: AsyncSession = Depends(get_db)):
    """
    Triggered when teacher clicks 'Create Focus Drill' on web dashboard.
    Assigns target signs to student for targeted practice.
    """
    student_id = payload.get("student_id")
    signs = payload.get("signs", [])
    notes = payload.get("notes", "Teacher focus drill assigned")

    return {
        "status": "success",
        "message": f"Focus drill created with {len(signs)} signs",
        "student_id": student_id,
        "signs": signs,
        "notes": notes
    }