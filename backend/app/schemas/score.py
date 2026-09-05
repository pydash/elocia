from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class ScoreSaveRequest(BaseModel):
    student_id: uuid.UUID
    activity_type: str = "evaluation"
    stage_id: Optional[int] = 1
    attempt_number: Optional[int] = 1
    tier_level: Optional[int] = 1
    score_handshape: Optional[int] = 0
    score_palm_orientation: Optional[int] = 0
    score_location: Optional[int] = 0
    score_movement: Optional[int] = 0
    score_overall: Optional[float] = 0.0
    passed: Optional[bool] = False
    streak: Optional[int] = 0
    xp_earned: Optional[int] = 0

class ScoreResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    activity_type: str
    stage_id: Optional[int]
    attempt_number: int
    tier_level: int
    score_handshape: Optional[int]
    score_palm_orientation: Optional[int]
    score_location: Optional[int]
    score_movement: Optional[int]
    score_overall: Optional[float]
    passed: bool
    streak: int
    xp_earned: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True