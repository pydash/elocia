from pydantic import AliasPath, BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime
from app.models.minigame import GameType

class MiniGameItemCreate(BaseModel):
    objective_image_url: Optional[str] = None
    objective_answer: str
    reference_video_url: Optional[str] = None
    index_order: int = 0

class MiniGameItemResponse(MiniGameItemCreate):
    id: uuid.UUID
    config_id: uuid.UUID

    class Config:
        from_attributes = True

class PuzzleSignItemCreate(BaseModel):
    word_one: str = ""
    word_two: str = ""
    hidden_word: str
    word_form: str = ""
    word_one_image_url: Optional[str] = None
    word_two_image_url: Optional[str] = None
    word_form_image_url: Optional[str] = None
    reference_video_url: Optional[str] = None
    index_order: int = 0

class PuzzleSignItemResponse(PuzzleSignItemCreate):
    id: uuid.UUID
    config_id: uuid.UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MiniGameConfigCreate(BaseModel):
    game_type: GameType
    title: str
    target_sign: str
    description: Optional[str] = None
    prompt_image: Optional[str] = None
    reference_video_url: Optional[str] = None
    hint_text: Optional[str] = None
    options: Optional[str] = None
    difficulty: Optional[int] = 1
    see_it_sign_it_items: list[MiniGameItemCreate] = Field(default_factory=list)
    puzzle_sign_items: list[PuzzleSignItemCreate] = Field(default_factory=list)

class MiniGameConfigResponse(BaseModel):
    id: uuid.UUID
    game_type: GameType
    title: str
    description: Optional[str] = None
    target_sign: str
    prompt_image: Optional[str] = None
    reference_video_url: Optional[str] = None
    hint_text: Optional[str] = None
    options: Optional[str] = None
    difficulty: int
    is_active: bool
    created_at: Optional[datetime] = None
    see_it_sign_it_items: list[MiniGameItemResponse] = Field(
        default_factory=list,
        validation_alias=AliasPath("items"),
    )
    puzzle_sign_items: list[PuzzleSignItemResponse] = Field(default_factory=list)

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