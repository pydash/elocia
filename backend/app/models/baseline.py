import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.user import Base

class FSLBaseline(Base):
    __tablename__ = "fsl_baselines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stage_id = Column(Integer, unique=True, index=True, nullable=False)
    sign_name = Column(String, nullable=False)
    video_filename = Column(String, nullable=False)
    total_frames = Column(Integer, default=0)
    hands_detected_frames = Column(Integer, default=0)
    fps = Column(Float, default=30.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

