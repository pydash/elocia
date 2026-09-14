from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base
import uuid

class EvaluationAttempt(Base):
    __tablename__ = "evaluation_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(String, nullable=False)
    # Legacy stage_id pointing to fsl_baselines.stage_id preserved (non-destructive)
    stage_id = Column(Integer, ForeignKey("fsl_baselines.stage_id", ondelete="SET NULL"), nullable=True, index=True)
    attempt_number = Column(Integer, default=1)
    tier_level = Column(Integer, default=1)
    score_handshape = Column(Integer, nullable=True)
    score_palm_orientation = Column(Integer, nullable=True)
    score_location = Column(Integer, nullable=True)
    score_movement = Column(Integer, nullable=True)
    score_overall = Column(Float, nullable=True)
    passed = Column(Boolean, default=False)
    streak = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # New relational columns
    sign_id = Column(Integer, ForeignKey("fsl_baselines.sign_id", ondelete="CASCADE"), nullable=True)
    stage_id_new = Column(Integer, ForeignKey("curriculum_stages.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    baseline = relationship("FSLBaseline", foreign_keys=[sign_id], primaryjoin="EvaluationAttempt.sign_id == FSLBaseline.sign_id")
    curriculum_stage = relationship("CurriculumStage", foreign_keys=[stage_id_new])


class StudentStageProgress(Base):
    __tablename__ = "student_stage_progress"
    __table_args__ = (
        UniqueConstraint("student_id", "stage_id", name="student_stage_progress_unique"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stage_id = Column(Integer, ForeignKey("curriculum_stages.id", ondelete="CASCADE"), nullable=False)
    unlocked = Column(Boolean, nullable=False, default=False)
    passed = Column(Boolean, nullable=False, default=False)
    best_score = Column(Float, nullable=False, default=0.0)
    stars = Column(Integer, nullable=False, default=0)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    stage = relationship("CurriculumStage", foreign_keys=[stage_id])
