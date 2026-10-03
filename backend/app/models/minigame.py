from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base
import uuid
import enum

class GameType(str, enum.Enum):
    see_it_sign_it = "see_it_sign_it"
    puzzle_sign = "puzzle_sign"
    magic_fingers = "magic_fingers"

class MiniGameConfig(Base):
    __tablename__ = "mini_games_config"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_type = Column(Enum(GameType), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    target_sign = Column(String, nullable=False)
    prompt_image = Column(String, nullable=True)
    reference_video_url = Column(String, nullable=True)
    hint_text = Column(String, nullable=True)
    options = Column(String, nullable=True)
    difficulty = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    items = relationship(
        "MiniGameItem",
        back_populates="config",
        cascade="all, delete-orphan",
        order_by="MiniGameItem.index_order",
    )
    puzzle_sign_items = relationship(
        "PuzzleSignItem",
        back_populates="config",
        cascade="all, delete-orphan",
        order_by="PuzzleSignItem.index_order",
    )


class MiniGameItem(Base):
    __tablename__ = "minigame_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(UUID(as_uuid=True), ForeignKey("mini_games_config.id"), nullable=False, index=True)
    objective_image_url = Column(String, nullable=True)
    objective_answer = Column(String, nullable=False)
    reference_video_url = Column(String, nullable=True)
    index_order = Column(Integer, nullable=False, default=0)
    config = relationship("MiniGameConfig", back_populates="items")


class PuzzleSignItem(Base):
    __tablename__ = "puzzle_sign_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(
        UUID(as_uuid=True),
        ForeignKey("mini_games_config.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    word_one = Column(String, nullable=False)
    word_two = Column(String, nullable=False)
    hidden_word = Column(String, nullable=False)
    word_form = Column(String, nullable=False)
    word_one_image_url = Column(String, nullable=True)
    word_two_image_url = Column(String, nullable=True)
    word_form_image_url = Column(String, nullable=True)
    reference_video_url = Column(String, nullable=True)
    index_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    config = relationship("MiniGameConfig", back_populates="puzzle_sign_items")


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