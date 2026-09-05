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
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    role: UserRole
    is_active: bool
    color: Optional[str] = None
    emoji: Optional[str] = None
    level: Optional[int] = 1
    streak: Optional[int] = 0
    avg_score: Optional[float] = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True