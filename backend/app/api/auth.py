from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from app.database.connection import get_db
from app.models.user import User, UserRole
from app.schemas.auth import StudentLogin, AdultLogin, Token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/student/login", response_model=Token)
async def student_login(data: StudentLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.name == data.student_name, User.role == UserRole.student, User.is_active == True)
    )
    student = result.scalar_one_or_none()
    if not student or student.pin != data.pin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid student name or PIN")
    
    token = jwt.encode(
        {
            "sub": str(student.id),
            "name": student.name,
            "role": student.role,
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def adult_login(data: AdultLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    token = jwt.encode(
        {
            "sub": str(user.id),
            "name": user.name,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}