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
    student = User(
        id=uuid.uuid4(),
        name=data.name,
        role=UserRole.student,
        pin=data.pin,
        color=data.color or "#3B82F6",
        emoji=data.emoji or "👦",
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
        select(User).where(User.role == UserRole.student, User.is_active == True)
    )
    students = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "color": s.color,
            "emoji": s.emoji,
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

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
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