from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
from app.models.user import UserRole

class UserUpdate(BaseModel):
    name: Optional[str] = None
    pin: Optional[str] = None
    color: Optional[str] = None
    emoji: Optional[str] = None
    grade_level: Optional[int] = None
    student_code: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    role: UserRole
    is_active: bool
    color: Optional[str] = None
    emoji: Optional[str] = None
    grade_level: Optional[int] = 1
    student_number: Optional[int] = None
    student_code: Optional[str] = None
    level: Optional[int] = 1
    streak: Optional[int] = 0
    avg_score: Optional[float] = 0.0
    signs_mastered: Optional[int] = 0
    stages_complete: Optional[int] = 0
    total_xp: Optional[int] = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True