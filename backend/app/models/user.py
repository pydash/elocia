from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base
import uuid
import enum

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    parent = "parent"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    pin = Column(String, nullable=True)
    color = Column(String, nullable=True)
    emoji = Column(String, nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    streak = Column(Integer, default=0)
    level = Column(Integer, default=1)
    signs_mastered = Column(Integer, default=0)
    avg_score = Column(Float, default=0.0)
    stages_complete = Column(Integer, default=0)

    username = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=True)
