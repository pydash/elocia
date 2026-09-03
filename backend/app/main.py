from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import uuid

load_dotenv()

from app.database.connection import get_db, init_db
from app.models.user import User, UserRole
from app.models.session import EvaluationAttempt
from app.schemas.auth import StudentLogin, AdultLogin, Token, StudentCreate, AdultCreate
from app.core.config import settings

app = FastAPI(title="ELOCIA Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/")
async def root():
    return {"status": "ELOCIA backend is running"}

@app.post("/auth/student/login", response_model=Token)
async def student_login(data: StudentLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.name == data.student_name, User.role == UserRole.student)
    )
    student = result.scalar_one_or_none()
    if not student or student.pin != data.pin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid name or PIN")
    token = jwt.encode(
        {"sub": str(student.id), "role": student.role, "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)},
        settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def adult_login(data: AdultLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = jwt.encode(
        {"sub": str(user.id), "role": user.role, "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)},
        settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}

@app.post("/users/students", status_code=201)
async def create_student(data: StudentCreate, db: AsyncSession = Depends(get_db)):
    student = User(
        id=uuid.uuid4(), name=data.name, role=UserRole.student,
        pin=data.pin, color=data.color, emoji=data.emoji, parent_id=data.parent_id
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return {"id": str(student.id), "name": student.name, "color": student.color, "emoji": student.emoji}

@app.post("/users/adults", status_code=201)
async def create_adult(data: AdultCreate, db: AsyncSession = Depends(get_db)):
    user = User(
        id=uuid.uuid4(), name=data.name, role=data.role,
        username=data.username, password_hash=pwd_context.hash(data.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": str(user.id), "name": user.name, "role": user.role}

@app.get("/students")
async def get_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == UserRole.student, User.is_active == True))
    students = result.scalars().all()
    return [{"id": str(s.id), "name": s.name, "color": s.color, "emoji": s.emoji, "level": s.level, "streak": s.streak, "avg_score": s.avg_score} for s in students]

@app.post("/scores/save", status_code=201)
async def save_score(
    student_id: str, activity_type: str, stage_id: int, attempt_number: int,
    tier_level: int, score_handshape: int, score_palm_orientation: int,
    score_location: int, score_movement: int, score_overall: float,
    passed: bool, streak: int = 0, xp_earned: int = 0,
    db: AsyncSession = Depends(get_db)
):
    attempt = EvaluationAttempt(
        student_id=uuid.UUID(student_id), activity_type=activity_type,
        stage_id=stage_id, attempt_number=attempt_number, tier_level=tier_level,
        score_handshape=score_handshape, score_palm_orientation=score_palm_orientation,
        score_location=score_location, score_movement=score_movement,
        score_overall=score_overall, passed=passed, streak=streak, xp_earned=xp_earned
    )
    db.add(attempt)
    await db.commit()
    return {"status": "saved"}

@app.get("/scores/{student_id}")
async def get_scores(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EvaluationAttempt).where(EvaluationAttempt.student_id == uuid.UUID(student_id))
    )
    attempts = result.scalars().all()
    return [{"activity_type": a.activity_type, "stage_id": a.stage_id, "score_overall": a.score_overall, "passed": a.passed, "tier_level": a.tier_level, "created_at": str(a.created_at)} for a in attempts]
