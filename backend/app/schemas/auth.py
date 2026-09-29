from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any
from app.models.user import UserRole
import uuid

class StudentLogin(BaseModel):
    student_name: str
    pin: str = Field(..., min_length=4, max_length=4)

class AdultLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[UserRole] = None

class StudentCreate(BaseModel):
    name: str
    pin: str = Field(..., min_length=4, max_length=4)
    color: Optional[str] = "#3B82F6"
    emoji: Optional[str] = "👦"
    grade_level: Optional[int] = 1
    parent_id: Optional[uuid.UUID] = None

    @field_validator("parent_id", mode="before")
    @classmethod
    def sanitize_parent_id(cls, v: Any):
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v

class AdultCreate(BaseModel):
    name: str
    username: str
    password: str = Field(..., min_length=6)
    role: UserRole

