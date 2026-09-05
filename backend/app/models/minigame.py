from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base
import uuid
import enum

class GameType(str, enum.Enum):
    see_it_sign_it = "see_it_sign_it"
    puzzle_sign = "puzzle_sign"
    magic_fingers = "magic_fingers"

class MiniGameConfig(Base):
    __tablename__ = "minigame_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_type = Column(Enum(GameType), nullable=False, index=True)
    title = Column(String, nullable=False)
    target_sign = Column(String, nullable=False)
    prompt_image = Column(String, nullable=True)
    hint_text = Column(String, nullable=True)
    options = Column(String, nullable=True)
    difficulty = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MiniGameSession(Base):
    __tablename__ = "minigame_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    game_type = Column(Enum(GameType), nullable=False, index=True)
    score = Column(Float, default=0.0)
    highest_score = Column(Float, default=0.0)
    streak = Column(Integer, default=0)
    rounds_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())