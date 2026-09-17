from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class BaselineResponse(BaseModel):
    id: UUID
    stage_id: int
    sign_id: Optional[int] = None
    stage_id_new: Optional[int] = None
    order_index: Optional[int] = None
    sign_name: str
    video_filename: str
    total_frames: Optional[int] = 0
    hands_detected_frames: Optional[int] = 0
    fps: Optional[float] = 30.0
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BaselineUploadResult(BaseModel):
    success: bool
    message: str
    stage_id: int
    sign_id: Optional[int] = None
    stage_id_new: Optional[int] = None
    sign_name: str
    total_frames: Optional[int] = 0
    hands_detected_frames: Optional[int] = 0
    fps: Optional[float] = 30.0

class CurriculumStageResponse(BaseModel):
    id: int
    stage_number: int
    section_number: int
    section_title: str
    unit_number: int
    unit_title: str
    title: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
