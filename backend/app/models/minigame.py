from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    game_type = Column(String, nullable=False, index=True)  # "see_it_sign_it", "puzzle_sign", "magic_fingers"
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    difficulty = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships to game-specific child items
    see_it_sign_it_items = relationship(
        "SeeItSignItItem",
        back_populates="config",
        cascade="all, delete-orphan",
        order_by="SeeItSignItItem.index_order"
    )
    puzzle_sign_items = relationship(
        "PuzzleSignItem",
        back_populates="config",
        cascade="all, delete-orphan",
        order_by="PuzzleSignItem.index_order"
    )
    magic_fingers_items = relationship(
        "MagicFingersItem",
        back_populates="config",
        cascade="all, delete-orphan",
        order_by="MagicFingersItem.index_order"
    )


class SeeItSignItItem(Base):
    __tablename__ = "see_it_sign_it_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(UUID(as_uuid=True), ForeignKey("mini_games_config.id", ondelete="CASCADE"), nullable=False, index=True)
    objective_image_url = Column(String, nullable=True)
    objective_answer = Column(String, nullable=False)
    reference_video_url = Column(String, nullable=True)
    index_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    config = relationship("MiniGameConfig", back_populates="see_it_sign_it_items")


class PuzzleSignItem(Base):
    __tablename__ = "puzzle_sign_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(UUID(as_uuid=True), ForeignKey("mini_games_config.id", ondelete="CASCADE"), nullable=False, index=True)
    word_one = Column(String, nullable=False)
    word_two = Column(String, nullable=False)
    hidden_word = Column(String, nullable=False)
    word_form = Column(String, nullable=False)
    word_one_image_url = Column(String, nullable=True)
    word_two_image_url = Column(String, nullable=True)
    word_form_image_url = Column(String, nullable=True)
    reference_video_url = Column(String, nullable=True)
    index_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    config = relationship("MiniGameConfig", back_populates="puzzle_sign_items")


class MagicFingersItem(Base):
    __tablename__ = "magic_fingers_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(UUID(as_uuid=True), ForeignKey("mini_games_config.id", ondelete="CASCADE"), nullable=False, index=True)
    word = Column(String, nullable=False)
    hidden_positions = Column(JSON, nullable=False, default=list)  # e.g. [1, 2]
    objective_image_url = Column(String, nullable=True)
    reference_video_url = Column(String, nullable=True)
    reference_video_url_2 = Column(String, nullable=True)
    index_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    config = relationship("MiniGameConfig", back_populates="magic_fingers_items")


class MiniGameSession(Base):
    __tablename__ = "minigame_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    game_type = Column(String, nullable=False, index=True)
    score = Column(Float, default=0.0)
    highest_score = Column(Float, default=0.0)
    streak = Column(Integer, default=0)
    rounds_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())