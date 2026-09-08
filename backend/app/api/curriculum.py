from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.database.connection import get_db
from app.models.baseline import FSLBaseline
from app.models.session import EvaluationAttempt
from app.models.user import User
from typing import List, Optional, Dict, Any
import uuid

router = APIRouter(tags=["Curriculum & Progression"])

DEFAULT_CURRICULUM = [
    {
        "id": 1,
        "title": "SECTION 1",
        "units": [
            {
                "id": 1,
                "title": "UNIT 1",
                "stages": [
                    {
                        "id": 1,
                        "title": "Numbers 1-10",
                        "description": "Let's dive into sign language using numbers 1 to 10.",
                        "items": [
                            {"globalId": 1, "name": "1"},
                            {"globalId": 2, "name": "2"},
                            {"globalId": 3, "name": "3"},
                            {"globalId": 4, "name": "4"},
                            {"globalId": 5, "name": "5"},
                            {"globalId": 6, "name": "6"},
                            {"globalId": 7, "name": "7"},
                            {"globalId": 8, "name": "8"},
                            {"globalId": 9, "name": "9"},
                            {"globalId": 10, "name": "10"}
                        ]
                    },
                    {
                        "id": 2,
                        "title": "Numbers 11-20",
                        "description": "Keep counting with numbers 11 to 20.",
                        "items": [
                            {"globalId": 11, "name": "11"},
                            {"globalId": 12, "name": "12"},
                            {"globalId": 13, "name": "13"},
                            {"globalId": 14, "name": "14"},
                            {"globalId": 15, "name": "15"},
                            {"globalId": 16, "name": "16"},
                            {"globalId": 17, "name": "17"},
                            {"globalId": 18, "name": "18"},
                            {"globalId": 19, "name": "19"},
                            {"globalId": 20, "name": "20"}
                        ]
                    }
                ]
            },
            {
                "id": 2,
                "title": "UNIT 2",
                "stages": [
                    {
                        "id": 3,
                        "title": "Alphabet A-J",
                        "description": "Learn the first letters of the alphabet.",
                        "items": [
                            {"globalId": 21, "name": "A"},
                            {"globalId": 22, "name": "B"},
                            {"globalId": 23, "name": "C"}
                        ]
                    }
                ]
            }
        ]
    }
]

@router.get("/curriculum")
async def get_curriculum(db: AsyncSession = Depends(get_db)):
    curriculum = [dict(sec) for sec in DEFAULT_CURRICULUM]

    try:
        result = await db.execute(
            select(FSLBaseline)
            .where(FSLBaseline.is_active == True)
            .order_by(FSLBaseline.stage_id)
        )
        baselines = result.scalars().all()

        custom_stages = []
        for b in baselines:
            if b.stage_id > 3:
                custom_stages.append({
                    "id": b.stage_id,
                    "title": f"FSL Sign: {b.sign_name}",
                    "description": f"Custom stage created by teacher for sign '{b.sign_name}'.",
                    "items": [
                        {"globalId": 1000 + b.stage_id, "name": b.sign_name}
                    ]
                })

        if custom_stages:
            curriculum[0]["units"].append({
                "id": 3,
                "title": "UNIT 3 (Teacher Custom Signs)",
                "stages": custom_stages
            })

    except Exception as e:
        print(f"Curriculum DB warning: {e}")

    return {"sections": curriculum}


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

    attempts_res = await db.execute(
        select(EvaluationAttempt)
        .where(EvaluationAttempt.student_id == stud_uuid)
        .order_by(EvaluationAttempt.stage_id, desc(EvaluationAttempt.score_overall))
    )
    attempts = attempts_res.scalars().all()

    stage_scores: Dict[int, float] = {}
    passed_stages = set()

    for att in attempts:
        if att.stage_id is not None:
            score = att.score_overall or 0.0
            if att.stage_id not in stage_scores or score > stage_scores[att.stage_id]:
                stage_scores[att.stage_id] = score
            if att.passed or score >= 60.0:
                passed_stages.add(att.stage_id)

    unlocked_stages = [1]
    max_evaluated_stage = max(stage_scores.keys()) if stage_scores else 1
    for s in range(1, max_evaluated_stage + 2):
        if s in passed_stages:
            next_stage = s + 1
            if next_stage not in unlocked_stages:
                unlocked_stages.append(next_stage)

    def calculate_stars(score: float) -> int:
        if score >= 90: return 5
        if score >= 75: return 4
        if score >= 60: return 3
        if score >= 40: return 2
        if score > 0: return 1
        return 0

    stage_progress = []
    for s_id in sorted(unlocked_stages):
        best_score = stage_scores.get(s_id, 0.0)
        stage_progress.append({
            "stage_id": s_id,
            "unlocked": True,
            "passed": s_id in passed_stages,
            "best_score": round(best_score, 1),
            "stars": calculate_stars(best_score)
        })

    return {
        "student_id": student_id,
        "student_name": user.name,
        "unlocked_stages": sorted(unlocked_stages),
        "stages": stage_progress,
        "total_signs_mastered": user.signs_mastered or len(passed_stages),
        "current_streak": user.streak or 0,
        "avg_score": user.avg_score or 0.0
    }

