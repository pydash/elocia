from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import uuid
from passlib.context import CryptContext

from app.database.connection import get_db
from app.models.user import User, UserRole, StudentProfile, ParentStudent
from app.models.session import EvaluationAttempt
from app.models.minigame import MiniGameSession
from app.schemas.auth import StudentCreate, AdultCreate
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(tags=["User Management"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/users/students", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_student(data: StudentCreate, db: AsyncSession = Depends(get_db)):
    grade = data.grade_level or 1

    # Find highest sequence number in this grade level from student_profiles
    max_num_res = await db.execute(
        select(func.coalesce(func.max(StudentProfile.student_number), 0))
        .where(StudentProfile.grade_level == grade)
    )
    next_num = (max_num_res.scalar() or 0) + 1
    code = f"G{grade}-{next_num:02d}"

    stud_id = uuid.uuid4()
    # 1. Create User identity
    student = User(
        id=stud_id,
        name=data.name,
        role=UserRole.student,
        # Legacy columns populated for backward-compatibility
        pin=data.pin,
        color=data.color or "#3B82F6",
        emoji=data.emoji or "👦",
        grade_level=grade,
        student_number=next_num,
        student_code=code,
        parent_id=data.parent_id
    )
    db.add(student)

    # 2. Create StudentProfile as primary source of truth
    profile = StudentProfile(
        student_id=stud_id,
        student_code=code,
        student_number=next_num,
        pin=data.pin,
        grade_level=grade,
        color=data.color or "#3B82F6",
        emoji=data.emoji or "👦",
        total_xp=0,
        level=1,
        streak=0
    )
    db.add(profile)

    if data.parent_id:
        parent_rel = ParentStudent(
            parent_id=data.parent_id,
            student_id=stud_id,
            relationship="Parent"
        )
        db.add(parent_rel)

    await db.commit()
    await db.refresh(student)

    # Return structured UserResponse populated from profile
    return UserResponse(
        id=student.id,
        name=student.name,
        role=student.role,
        is_active=student.is_active,
        color=profile.color,
        emoji=profile.emoji,
        grade_level=profile.grade_level,
        student_number=profile.student_number,
        student_code=profile.student_code,
        level=profile.level,
        streak=profile.streak,
        avg_score=0.0,
        signs_mastered=0,
        stages_complete=0,
        total_xp=profile.total_xp,
        created_at=student.created_at
    )

@router.post("/users/adults", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_adult(data: AdultCreate, db: AsyncSession = Depends(get_db)):
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
        select(User, StudentProfile)
        .join(StudentProfile, User.id == StudentProfile.student_id)
        .where(User.role == UserRole.student, User.is_active == True)
        .order_by(StudentProfile.grade_level.asc(), StudentProfile.student_number.asc(), User.created_at.asc())
    )
    rows = result.all()
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "color": sp.color,
            "emoji": sp.emoji,
            "grade_level": sp.grade_level or 1,
            "student_number": sp.student_number,
            "student_code": sp.student_code or f"G{sp.grade_level or 1}-01",
            "level": sp.level,
            "streak": sp.streak,
            "avg_score": u.avg_score
        }
        for u, sp in rows
    ]

@router.get("/users", response_model=List[UserResponse])
async def list_users(role: Optional[UserRole] = Query(None), db: AsyncSession = Depends(get_db)):
    query = (
        select(User, StudentProfile)
        .outerjoin(StudentProfile, User.id == StudentProfile.student_id)
        .where(User.is_active == True)
    )
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query)
    rows = result.all()

    responses = []
    for u, sp in rows:
        responses.append(
            UserResponse(
                id=u.id,
                name=u.name,
                role=u.role,
                is_active=u.is_active,
                color=sp.color if sp else u.color,
                emoji=sp.emoji if sp else u.emoji,
                grade_level=sp.grade_level if sp else (u.grade_level or 1),
                student_number=sp.student_number if sp else u.student_number,
                student_code=sp.student_code if sp else u.student_code,
                level=sp.level if sp else u.level,
                streak=sp.streak if sp else u.streak,
                avg_score=u.avg_score or 0.0,
                signs_mastered=u.signs_mastered or 0,
                stages_complete=u.stages_complete or 0,
                total_xp=sp.total_xp if sp else 0,
                created_at=u.created_at
            )
        )
    return responses

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User, StudentProfile)
        .outerjoin(StudentProfile, User.id == StudentProfile.student_id)
        .where(User.id == user_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user, profile = row

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

    computed_xp = int(total_eval_xp + total_game_xp)

    return UserResponse(
        id=user.id,
        name=user.name,
        role=user.role,
        is_active=user.is_active,
        color=profile.color if profile else user.color,
        emoji=profile.emoji if profile else user.emoji,
        grade_level=profile.grade_level if profile else (user.grade_level or 1),
        student_number=profile.student_number if profile else user.student_number,
        student_code=profile.student_code if profile else user.student_code,
        level=profile.level if profile else user.level,
        streak=profile.streak if profile else user.streak,
        avg_score=user.avg_score or 0.0,
        signs_mastered=user.signs_mastered or 0,
        stages_complete=user.stages_complete or 0,
        total_xp=profile.total_xp if profile else computed_xp,
        created_at=user.created_at
    )

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: uuid.UUID, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User, StudentProfile)
        .outerjoin(StudentProfile, User.id == StudentProfile.student_id)
        .where(User.id == user_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user, profile = row

    if data.name is not None:
        user.name = data.name
    if data.is_active is not None:
        user.is_active = data.is_active

    if profile:
        if data.pin is not None:
            profile.pin = data.pin
            user.pin = data.pin
        if data.color is not None:
            profile.color = data.color
            user.color = data.color
        if data.emoji is not None:
            profile.emoji = data.emoji
            user.emoji = data.emoji
        if data.grade_level is not None:
            profile.grade_level = data.grade_level
            user.grade_level = data.grade_level
        if data.student_code is not None:
            profile.student_code = data.student_code
            user.student_code = data.student_code
    else:
        if data.pin is not None:
            user.pin = data.pin
        if data.color is not None:
            user.color = data.color
        if data.emoji is not None:
            user.emoji = data.emoji

    await db.commit()
    await db.refresh(user)
    if profile:
        await db.refresh(profile)

    return UserResponse(
        id=user.id,
        name=user.name,
        role=user.role,
        is_active=user.is_active,
        color=profile.color if profile else user.color,
        emoji=profile.emoji if profile else user.emoji,
        grade_level=profile.grade_level if profile else (user.grade_level or 1),
        student_number=profile.student_number if profile else user.student_number,
        student_code=profile.student_code if profile else user.student_code,
        level=profile.level if profile else user.level,
        streak=profile.streak if profile else user.streak,
        avg_score=user.avg_score or 0.0,
        signs_mastered=user.signs_mastered or 0,
        stages_complete=user.stages_complete or 0,
        total_xp=profile.total_xp if profile else 0,
        created_at=user.created_at
    )

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_active = False
    await db.commit()
    return {"status": "deactivated", "user_id": str(user_id)}