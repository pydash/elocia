from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from app.database.connection import get_db
from app.models.user import User, StudentProfile
from app.models.session import EvaluationAttempt
from app.models.minigame import (
    MiniGameConfig,
    MiniGameItem,
    PuzzleSignItem,
    MiniGameSession,
    GameType,
)
from app.schemas.minigame import (
    MiniGameConfigCreate,
    MiniGameConfigResponse,
    MiniGameScoreSubmit,
    MiniGameScoreResponse
)
from app.api.scores import compute_level_from_xp

router = APIRouter(prefix="/minigames", tags=["Mini-Games (Modules 7, 8, 9)"])

MEDIA_DIR = Path(__file__).resolve().parents[2] / "storage" / "minigames"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MEDIA_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}


@router.post("/upload/media")
async def upload_minigame_media(file: UploadFile = File(...)):
    content_type = file.content_type or ""
    extension = ALLOWED_MEDIA_TYPES.get(content_type)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported media format. Upload a JPG, PNG, WebP, MP4, WebM, or MOV file.",
        )

    target = MEDIA_DIR / f"{uuid4().hex}{extension}"
    try:
        with target.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                output.write(chunk)
    except OSError as exc:
        target.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save media file.",
        ) from exc
    finally:
        await file.close()

    return JSONResponse(
        content={
            "status": "uploaded",
            "type": "image" if content_type.startswith("image/") else "video",
            "url": f"/media/minigames/{target.name}",
        }
    )

@router.post("/config", status_code=status.HTTP_201_CREATED, response_model=MiniGameConfigResponse)
async def create_minigame_config(data: MiniGameConfigCreate, db: AsyncSession = Depends(get_db)):
    config = MiniGameConfig(
        id=uuid.uuid4(),
        game_type=data.game_type,
        title=data.title,
        description=data.description,
        target_sign=data.target_sign,
        prompt_image=data.prompt_image,
        reference_video_url=data.reference_video_url,
        hint_text=data.hint_text,
        options=data.options,
        difficulty=data.difficulty or 1
    )
    config.items = [
        MiniGameItem(
            objective_image_url=item.objective_image_url,
            objective_answer=item.objective_answer,
            reference_video_url=item.reference_video_url,
            index_order=item.index_order,
        )
        for item in data.see_it_sign_it_items
    ]
    config.puzzle_sign_items = [
        PuzzleSignItem(
            word_one=item.word_one,
            word_two=item.word_two,
            hidden_word=item.hidden_word,
            word_form=item.word_form,
            word_one_image_url=item.word_one_image_url,
            word_two_image_url=item.word_two_image_url,
            word_form_image_url=item.word_form_image_url,
            reference_video_url=item.reference_video_url,
            index_order=item.index_order,
        )
        for item in data.puzzle_sign_items
    ]
    db.add(config)
    await db.commit()
    await db.refresh(config, attribute_names=["items", "puzzle_sign_items"])
    return config

@router.get("/config", response_model=List[MiniGameConfigResponse])
async def list_all_minigame_configs(
    game_type: Optional[GameType] = Query(None, description="Optional filter by game type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all active mini-game configurations across all games.
    Used by the Teacher Lessons Web Portal to display all created games.
    """
    query = select(MiniGameConfig).options(
        selectinload(MiniGameConfig.items),
        selectinload(MiniGameConfig.puzzle_sign_items),
    ).where(MiniGameConfig.is_active == True)
    if game_type:
        query = query.where(MiniGameConfig.game_type == game_type)
    query = query.order_by(MiniGameConfig.game_type.asc(), MiniGameConfig.difficulty.asc(), MiniGameConfig.created_at.asc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/config/{game_type}", response_model=List[MiniGameConfigResponse])
async def get_minigame_configs(game_type: GameType, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MiniGameConfig).options(
            selectinload(MiniGameConfig.items),
            selectinload(MiniGameConfig.puzzle_sign_items),
        )
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

    # Automatically recalculate user total XP and level
    user_res = await db.execute(select(User).where(User.id == data.student_id))
    user = user_res.scalar_one_or_none()

    prof_res = await db.execute(select(StudentProfile).where(StudentProfile.student_id == data.student_id))
    profile = prof_res.scalar_one_or_none()

    if user or profile:
        eval_xp_res = await db.execute(
            select(func.coalesce(func.sum(EvaluationAttempt.xp_earned), 0))
            .where(EvaluationAttempt.student_id == data.student_id)
        )
        total_eval_xp = eval_xp_res.scalar() or 0

        game_xp_res = await db.execute(
            select(func.coalesce(func.sum(MiniGameSession.score), 0))
            .where(MiniGameSession.student_id == data.student_id)
        )
        # Note: data.score is being added in this transaction, include it
        total_game_xp = (game_xp_res.scalar() or 0) + data.score

        total_xp = int(total_eval_xp + total_game_xp)
        new_level = compute_level_from_xp(total_xp)

        if profile:
            profile.total_xp = total_xp
            profile.level = new_level
        if user:
            user.level = new_level

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