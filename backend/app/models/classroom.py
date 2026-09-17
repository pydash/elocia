from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base
import uuid

class Class(Base):
    __tablename__ = "classes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    grade_level = Column(Integer, nullable=False, default=1)
    school_year = Column(String(20), nullable=False, default="2026-2027")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id])
    roster = relationship("ClassStudent", back_populates="assigned_class", cascade="all, delete-orphan")


class ClassStudent(Base):
    __tablename__ = "class_students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    assigned_class = relationship("Class", back_populates="roster")
    student = relationship("User", foreign_keys=[student_id])


class EducationalVideo(Base):
    __tablename__ = "educational_videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(50), nullable=False, default="Science")
    grade_level = Column(Integer, nullable=False, default=1)
    duration_minutes = Column(Integer, default=10)
    video_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", foreign_keys=[created_by])

