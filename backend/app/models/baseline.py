import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base

class CurriculumStage(Base):
    __tablename__ = "curriculum_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stage_number = Column(Integer, unique=True, nullable=False)
    section_number = Column(Integer, nullable=False, default=1)
    section_title = Column(String(100), nullable=False, default="Section 1")
    unit_number = Column(Integer, nullable=False, default=1)
    unit_title = Column(String(100), nullable=False, default="Unit 1")
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    baselines = relationship("FSLBaseline", back_populates="curriculum_stage")


class FSLBaseline(Base):
    __tablename__ = "fsl_baselines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Legacy stage_id column preserved (non-destructive)
    stage_id = Column(Integer, unique=True, index=True, nullable=False)
    sign_name = Column(String, nullable=False)
    video_filename = Column(String, nullable=False)
    total_frames = Column(Integer, default=0)
    hands_detected_frames = Column(Integer, default=0)
    fps = Column(Float, default=30.0)
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # New relational columns
    sign_id = Column(Integer, unique=True, nullable=True)
    stage_id_new = Column(Integer, ForeignKey("curriculum_stages.id", ondelete="SET NULL"), nullable=True)
    order_index = Column(Integer, nullable=True)

    # Relationships
    curriculum_stage = relationship("CurriculumStage", back_populates="baselines")
