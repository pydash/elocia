from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base
import uuid

class EvaluationAttempt(Base):
    __tablename__ = "evaluation_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(String, nullable=False)
    stage_id = Column(Integer, nullable=True)
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
