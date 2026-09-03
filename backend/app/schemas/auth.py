from pydantic import BaseModel, Field
from typing import Optional
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
    emoji: Optional[str] = "??"
    parent_id: Optional[uuid.UUID] = None

class AdultCreate(BaseModel):
    name: str
    username: str
    password: str = Field(..., min_length=8)
    role: UserRole
