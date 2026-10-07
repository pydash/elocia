from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime
from app.models.user import UserRole

class ParentRef(BaseModel):
    id: uuid.UUID
    name: str
    username: Optional[str] = None
    relationship: Optional[str] = "Parent"

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    pin: Optional[str] = None
    color: Optional[str] = None
    emoji: Optional[str] = None
    grade_level: Optional[int] = None
    student_code: Optional[str] = None
    parent_ids: Optional[List[uuid.UUID]] = None
    parent_id: Optional[uuid.UUID] = None
    remove_parent: Optional[bool] = False
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    role: UserRole
    is_active: bool
    username: Optional[str] = None
    color: Optional[str] = None
    emoji: Optional[str] = None
    grade_level: Optional[int] = None
    student_number: Optional[int] = None
    student_code: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    parent_name: Optional[str] = None
    parents: Optional[List[ParentRef]] = None
    parent_summary: Optional[str] = None
    children_summary: Optional[str] = None
    class_name: Optional[str] = None
    level: Optional[int] = None
    streak: Optional[int] = None
    avg_score: Optional[float] = None
    signs_mastered: Optional[int] = None
    stages_complete: Optional[int] = None
    total_xp: Optional[int] = None
    has_tier4_flag: Optional[bool] = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True