from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
from passlib.context import CryptContext

from app.database.connection import get_db
from app.models.user import User, UserRole
from app.schemas.auth import StudentCreate, AdultCreate
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(tags=["User Management"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/users/students", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_student(data: StudentCreate, db: AsyncSession = Depends(get_db)):
    grade = data.grade_level or 1

    # Find highest sequence number in this grade level to auto-generate G{grade}-{seq:02d}
    max_num_res = await db.execute(
        select(func.coalesce(func.max(User.student_number), 0))
        .where(User.role == UserRole.student, User.grade_level == grade)
    )
    next_num = (max_num_res.scalar() or 0) + 1
    code = f"G{grade}-{next_num:02d}"

    student = User(
        id=uuid.uuid4(),
        name=data.name,
        role=UserRole.student,
        pin=data.pin,
        color=data.color or "#3B82F6",
        emoji=data.emoji or "👦",
        grade_level=grade,
        student_number=next_num,
        student_code=code,
        parent_id=data.parent_id
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student

@router.post("/users/adults", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_adult(data: AdultCreate, db: AsyncSession = Depends(get_db)):
    # Check if username already exists
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
        
    user = User(
        id=uuid.uuid4(),
        name=data.name,
        role=data.role,
        username=data.username,
        password_hash=pwd_context.hash(data.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/students", response_model=List[dict])
async def get_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .where(User.role == UserRole.student, User.is_active == True)
        .order_by(User.grade_level.asc(), User.student_number.asc(), User.created_at.asc())
    )
    students = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "color": s.color,
            "emoji": s.emoji,
            "grade_level": s.grade_level or 1,
            "student_number": s.student_number,
            "student_code": s.student_code or f"G{s.grade_level or 1}-01",
            "level": s.level,
            "streak": s.streak,
            "avg_score": s.avg_score
        }
        for s in students
    ]

@router.get("/users", response_model=List[UserResponse])
async def list_users(role: Optional[UserRole] = Query(None), db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.is_active == True)
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query)
    return result.scalars().all()

from sqlalchemy import select, func
from app.models.session import EvaluationAttempt
from app.models.minigame import MiniGameSession

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Compute live total XP across learning attempts and mini-games
    eval_xp_res = await db.execute(
        select(func.coalesce(func.sum(EvaluationAttempt.xp_earned), 0))
        .where(EvaluationAttempt.student_id == user_id)
    )
    total_eval_xp = eval_xp_res.scalar() or 0

    game_xp_res = await db.execute(
        select(func.coalesce(func.sum(MiniGameSession.score), 0))
        .where(MiniGameSession.student_id == user_id)
    )
    total_game_xp = game_xp_res.scalar() or 0

    user.total_xp = int(total_eval_xp + total_game_xp)
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: uuid.UUID, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if data.name is not None:
        user.name = data.name
    if data.pin is not None:
        user.pin = data.pin
    if data.color is not None:
        user.color = data.color
    if data.emoji is not None:
        user.emoji = data.emoji
    if data.is_active is not None:
        user.is_active = data.is_active
        
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_active = False
    await db.commit()
    return {"status": "deactivated", "user_id": str(user_id)}