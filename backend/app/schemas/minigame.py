from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
from app.models.minigame import GameType

class MiniGameConfigCreate(BaseModel):
    game_type: GameType
    title: str
    target_sign: str
    prompt_image: Optional[str] = None
    hint_text: Optional[str] = None
    options: Optional[str] = None
    difficulty: Optional[int] = 1

class MiniGameConfigResponse(BaseModel):
    id: uuid.UUID
    game_type: GameType
    title: str
    target_sign: str
    prompt_image: Optional[str] = None
    hint_text: Optional[str] = None
    options: Optional[str] = None
    difficulty: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MiniGameScoreSubmit(BaseModel):
    student_id: uuid.UUID
    game_type: GameType
    score: float
    streak: int
    rounds_completed: int

class MiniGameScoreResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    game_type: GameType
    score: float
    highest_score: float
    streak: int
    rounds_completed: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True