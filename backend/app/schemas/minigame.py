from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

# ── See It Sign It ──────────────────────────────────────────
class SeeItSignItItemCreate(BaseModel):
    objective_image_url: Optional[str] = None
    objective_answer: str
    reference_video_url: Optional[str] = None
    index_order: Optional[int] = 0

class SeeItSignItItemResponse(BaseModel):
    id: uuid.UUID
    config_id: uuid.UUID
    objective_image_url: Optional[str] = None
    objective_answer: str
    reference_video_url: Optional[str] = None
    index_order: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Puzzle Sign ─────────────────────────────────────────────
class PuzzleSignItemCreate(BaseModel):
    word_one: str
    word_two: str
    hidden_word: str
    word_form: str
    word_one_image_url: Optional[str] = None
    word_two_image_url: Optional[str] = None
    word_form_image_url: Optional[str] = None
    reference_video_url: Optional[str] = None
    index_order: Optional[int] = 0

class PuzzleSignItemResponse(BaseModel):
    id: uuid.UUID
    config_id: uuid.UUID
    word_one: str
    word_two: str
    hidden_word: str
    word_form: str
    word_one_image_url: Optional[str] = None
    word_two_image_url: Optional[str] = None
    word_form_image_url: Optional[str] = None
    reference_video_url: Optional[str] = None
    index_order: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Magic Fingers ───────────────────────────────────────────
class MagicFingersItemCreate(BaseModel):
    word: str
    hidden_positions: List[int] = []
    objective_image_url: Optional[str] = None
    reference_video_url: Optional[str] = None
    reference_video_url_2: Optional[str] = None
    index_order: Optional[int] = 0

class MagicFingersItemResponse(BaseModel):
    id: uuid.UUID
    config_id: uuid.UUID
    word: str
    hidden_positions: List[int]
    objective_image_url: Optional[str] = None
    reference_video_url: Optional[str] = None
    reference_video_url_2: Optional[str] = None
    index_order: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Config Schemas ──────────────────────────────────────────
class SeeItSignItActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: Optional[int] = 1
    items: List[SeeItSignItItemCreate] = []

class PuzzleSignActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: Optional[int] = 1
    items: List[PuzzleSignItemCreate] = []

class MagicFingersActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: Optional[int] = 1
    items: List[MagicFingersItemCreate] = []

class MiniGameConfigCreate(BaseModel):
    game_type: str  # "see_it_sign_it" | "puzzle_sign" | "magic_fingers"
    title: str
    description: Optional[str] = None
    difficulty: Optional[int] = 1
    # Specific items (can be provided on creation)
    see_it_sign_it_items: Optional[List[SeeItSignItItemCreate]] = None
    puzzle_sign_items: Optional[List[PuzzleSignItemCreate]] = None
    magic_fingers_items: Optional[List[MagicFingersItemCreate]] = None
    # Flexible alias for dedicated creation
    items: Optional[List[dict]] = None

class MiniGameConfigUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[int] = None
    is_active: Optional[bool] = None
    see_it_sign_it_items: Optional[List[SeeItSignItItemCreate]] = None
    puzzle_sign_items: Optional[List[PuzzleSignItemCreate]] = None
    magic_fingers_items: Optional[List[MagicFingersItemCreate]] = None

class MiniGameConfigResponse(BaseModel):
    id: uuid.UUID
    game_type: str
    title: str
    description: Optional[str] = None
    difficulty: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MiniGameConfigDetailResponse(MiniGameConfigResponse):
    see_it_sign_it_items: List[SeeItSignItItemResponse] = []
    puzzle_sign_items: List[PuzzleSignItemResponse] = []
    magic_fingers_items: List[MagicFingersItemResponse] = []

    class Config:
        from_attributes = True


# ── Score Schemas ───────────────────────────────────────────
class MiniGameScoreSubmit(BaseModel):
    student_id: uuid.UUID
    game_type: str
    score: float
    streak: int
    rounds_completed: int

class MiniGameScoreResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    game_type: str
    score: float
    highest_score: float
    streak: int
    rounds_completed: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True