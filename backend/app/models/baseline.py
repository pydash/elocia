import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base

class Curriculum(Base):
    __tablename__ = "curriculums"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grade_level = Column(Integer, nullable=False, default=1)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    sections = relationship("CurriculumSection", back_populates="curriculum", cascade="all, delete-orphan", order_by="CurriculumSection.section_number")


class CurriculumSection(Base):
    __tablename__ = "curriculum_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    curriculum_id = Column(UUID(as_uuid=True), ForeignKey("curriculums.id", ondelete="CASCADE"), nullable=False)
    section_number = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    curriculum = relationship("Curriculum", back_populates="sections")
    units = relationship("CurriculumUnit", back_populates="section", cascade="all, delete-orphan", order_by="CurriculumUnit.unit_number")


class CurriculumUnit(Base):
    __tablename__ = "curriculum_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("curriculum_sections.id", ondelete="CASCADE"), nullable=False)
    unit_number = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    section = relationship("CurriculumSection", back_populates="units")
    stages = relationship("CurriculumStage", back_populates="unit", cascade="all, delete-orphan", order_by="CurriculumStage.stage_number")


class CurriculumStage(Base):
    __tablename__ = "curriculum_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("curriculum_units.id", ondelete="CASCADE"), nullable=True)
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
    unit = relationship("CurriculumUnit", back_populates="stages")
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
