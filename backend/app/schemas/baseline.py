from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class BaselineResponse(BaseModel):
    id: UUID
    stage_id: int
    sign_name: str
    video_filename: str
    total_frames: int
    hands_detected_frames: int
    fps: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class BaselineUploadResult(BaseModel):
    success: bool
    message: str
    stage_id: int
    sign_name: str
    total_frames: int
    hands_detected_frames: int
    fps: float

