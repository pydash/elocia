from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import time
from collections import defaultdict
from jose import jwt
from passlib.context import CryptContext

from app.database.connection import get_db
from app.models.user import User, UserRole, StudentProfile
from app.schemas.auth import StudentLogin, AdultLogin, Token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── IN-MEMORY RATE LIMITER & BRUTE FORCE PROTECTION ──────────────────────────
# Tracks: key -> list of failed attempt timestamps (floats)
_failed_attempts = defaultdict(list)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 60  # 1 minute lockout

def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

def _check_rate_limit(key: str):
    now = time.time()
    # Filter attempts within the lockout window
    recent_attempts = [t for t in _failed_attempts[key] if now - t < LOCKOUT_DURATION_SECONDS]
    _failed_attempts[key] = recent_attempts

    if len(recent_attempts) >= MAX_FAILED_ATTEMPTS:
        retry_after = int(LOCKOUT_DURATION_SECONDS - (now - recent_attempts[0]))
        retry_after = max(1, retry_after)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {retry_after} seconds before trying again."
        )

def _record_failed_attempt(key: str):
    _failed_attempts[key].append(time.time())

def _clear_failed_attempts(key: str):
    if key in _failed_attempts:
        del _failed_attempts[key]


# ── ENDPOINTS ────────────────────────────────────────────────────────────────
@router.post("/student/login", response_model=Token)
async def student_login(data: StudentLogin, request: Request, db: AsyncSession = Depends(get_db)):
    ip = _get_client_ip(request)
    rate_key = f"student:{ip}:{data.student_name.lower().strip()}"
    _check_rate_limit(rate_key)

    result = await db.execute(
        select(User, StudentProfile)
        .outerjoin(StudentProfile, User.id == StudentProfile.student_id)
        .where(User.name == data.student_name, User.role == UserRole.student, User.is_active == True)
    )
    row = result.first()
    if not row:
        _record_failed_attempt(rate_key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid student name or PIN")
    
    student, profile = row
    profile_pin = profile.pin if profile else None
    if profile_pin != data.pin:
        _record_failed_attempt(rate_key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid student name or PIN")
    
    # Success -> Clear failed attempt counter
    _clear_failed_attempts(rate_key)

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
async def adult_login(data: AdultLogin, request: Request, db: AsyncSession = Depends(get_db)):
    ip = _get_client_ip(request)
    rate_key = f"adult:{ip}:{data.username.lower().strip()}"
    _check_rate_limit(rate_key)

    result = await db.execute(select(User).where(User.username == data.username, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not pwd_context.verify(data.password, user.password_hash):
        _record_failed_attempt(rate_key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    # Success -> Clear failed attempt counter
    _clear_failed_attempts(rate_key)

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