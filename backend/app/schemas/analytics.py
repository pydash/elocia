from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

class ParameterBreakdown(BaseModel):
    parameter: str
    average_score: float
    status: str

class ClassRadarAnalytics(BaseModel):
    total_students: int
    total_attempts: int
    overall_class_average: float
    parameters: List[ParameterBreakdown]

class Tier4FlagItem(BaseModel):
    attempt_id: uuid.UUID
    student_id: uuid.UUID
    student_name: str
    stage_id: Optional[int]
    score_overall: Optional[float]
    score_handshape: Optional[int]
    score_palm_orientation: Optional[int]
    score_location: Optional[int]
    score_movement: Optional[int]
    flagged_at: Optional[datetime]
    suggested_focus: str

class ParentProgressSummary(BaseModel):
    student_id: uuid.UUID
    student_name: str
    level: int
    streak: int
    avg_score: float
    total_practice_sessions: int
    strengths: List[str]
    areas_to_practice: List[str]
    home_practice_recommendation: str