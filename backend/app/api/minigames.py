from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
import uuid

from app.database.connection import get_db
from app.models.minigame import MiniGameConfig, MiniGameSession, GameType
from app.schemas.minigame import (
    MiniGameConfigCreate,
    MiniGameConfigResponse,
    MiniGameScoreSubmit,
    MiniGameScoreResponse
)

router = APIRouter(prefix="/minigames", tags=["Mini-Games (Modules 7, 8, 9)"])

@router.post("/config", status_code=status.HTTP_201_CREATED, response_model=MiniGameConfigResponse)
async def create_minigame_config(data: MiniGameConfigCreate, db: AsyncSession = Depends(get_db)):
    config = MiniGameConfig(
        id=uuid.uuid4(),
        game_type=data.game_type,
        title=data.title,
        target_sign=data.target_sign,
        prompt_image=data.prompt_image,
        hint_text=data.hint_text,
        options=data.options,
        difficulty=data.difficulty or 1
    )
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return config

@router.get("/config/{game_type}", response_model=List[MiniGameConfigResponse])
async def get_minigame_configs(game_type: GameType, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MiniGameConfig)
        .where(MiniGameConfig.game_type == game_type, MiniGameConfig.is_active == True)
        .order_by(MiniGameConfig.difficulty.asc(), MiniGameConfig.created_at.asc())
    )
    return result.scalars().all()

@router.delete("/config/{config_id}", status_code=status.HTTP_200_OK)
async def delete_minigame_config(config_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MiniGameConfig).where(MiniGameConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game configuration not found")
    
    config.is_active = False
    await db.commit()
    return {"status": "deactivated", "config_id": str(config_id)}

@router.post("/scores", status_code=status.HTTP_201_CREATED, response_model=MiniGameScoreResponse)
async def submit_minigame_score(data: MiniGameScoreSubmit, db: AsyncSession = Depends(get_db)):
    # Look up previous highest score for this student and game type
    prev_highest_res = await db.execute(
        select(func.max(MiniGameSession.highest_score))
        .where(
            MiniGameSession.student_id == data.student_id,
            MiniGameSession.game_type == data.game_type
        )
    )
    prev_highest = prev_highest_res.scalar() or 0.0
    highest = max(prev_highest, data.score)

    session = MiniGameSession(
        id=uuid.uuid4(),
        student_id=data.student_id,
        game_type=data.game_type,
        score=data.score,
        highest_score=highest,
        streak=data.streak,
        rounds_completed=data.rounds_completed
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/scores/{student_id}", response_model=List[dict])
async def get_student_minigame_stats(student_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Returns the highest score, latest score, and streak for each of the 3 mini-games
    stats = []
    for gtype in GameType:
        res = await db.execute(
            select(MiniGameSession)
            .where(
                MiniGameSession.student_id == student_id,
                MiniGameSession.game_type == gtype
            )
            .order_by(MiniGameSession.created_at.desc())
            .limit(1)
        )
        latest = res.scalar_one_or_none()
        
        highest_res = await db.execute(
            select(func.max(MiniGameSession.highest_score))
            .where(
                MiniGameSession.student_id == student_id,
                MiniGameSession.game_type == gtype
            )
        )
        highest_score = highest_res.scalar() or 0.0

        stats.append({
            "game_type": gtype.value,
            "highest_score": highest_score,
            "latest_score": latest.score if latest else 0.0,
            "streak": latest.streak if latest else 0,
            "rounds_completed": latest.rounds_completed if latest else 0
        })
    return stats