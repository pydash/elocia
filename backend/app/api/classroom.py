from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
import uuid

from app.database.connection import get_db
from app.models.classroom import Class, ClassStudent, EducationalVideo
from app.models.user import User

router = APIRouter(prefix="/classes", tags=["Classes & Rosters"])
videos_router = APIRouter(prefix="/educational-videos", tags=["Educational Videos"])

# ── Schemas ──────────────────────────────────────────────────────────────────
class ClassCreate(BaseModel):
    teacher_id: uuid.UUID
    name: str
    grade_level: int = 1
    school_year: str = "2026-2027"

class AddStudentToClass(BaseModel):
    student_id: uuid.UUID

class EducationalVideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str = "Science"
    grade_level: int = 1
    duration_minutes: int = 10
    video_url: str
    thumbnail_url: Optional[str] = None
    created_by: Optional[uuid.UUID] = None

# ── Endpoints: Classes ────────────────────────────────────────────────────────
@router.get("/")
async def list_classes(teacher_id: Optional[uuid.UUID] = None, db: AsyncSession = Depends(get_db)):
    query = select(Class)
    if teacher_id:
        query = query.where(Class.teacher_id == teacher_id)
    res = await db.execute(query)
    classes = res.scalars().all()
    return [
        {
            "id": str(c.id),
            "teacher_id": str(c.teacher_id),
            "name": c.name,
            "grade_level": c.grade_level,
            "school_year": c.school_year,
            "created_at": c.created_at
        }
        for c in classes
    ]

@router.post("/")
async def create_class(payload: ClassCreate, db: AsyncSession = Depends(get_db)):
    new_class = Class(
        teacher_id=payload.teacher_id,
        name=payload.name,
        grade_level=payload.grade_level,
        school_year=payload.school_year
    )
    db.add(new_class)
    await db.commit()
    await db.refresh(new_class)
    return {"status": "created", "class_id": str(new_class.id), "name": new_class.name}

@router.post("/{class_id}/students")
async def enroll_student(class_id: uuid.UUID, payload: AddStudentToClass, db: AsyncSession = Depends(get_db)):
    # Check if student exists
    user_res = await db.execute(select(User).where(User.id == payload.student_id))
    if not user_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Student user not found")
        
    enrollment = ClassStudent(class_id=class_id, student_id=payload.student_id)
    db.add(enrollment)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        return {"status": "already_enrolled"}
    return {"status": "enrolled", "class_id": str(class_id), "student_id": str(payload.student_id)}

@router.get("/{class_id}/students")
async def get_class_roster(class_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(ClassStudent, User).join(User, ClassStudent.student_id == User.id).where(ClassStudent.class_id == class_id)
    res = await db.execute(query)
    roster = []
    for cs, u in res.all():
        roster.append({
            "student_id": str(u.id),
            "name": u.name,
            "enrolled_at": cs.enrolled_at
        })
    return {"class_id": str(class_id), "students": roster}

# ── Endpoints: Educational Videos ─────────────────────────────────────────────
@videos_router.get("/")
async def list_educational_videos(
    grade_level: Optional[int] = None,
    subject: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(EducationalVideo)
    if grade_level:
        query = query.where(EducationalVideo.grade_level == grade_level)
    if subject:
        query = query.where(EducationalVideo.subject == subject)
    res = await db.execute(query)
    videos = res.scalars().all()
    return [
        {
            "id": str(v.id),
            "title": v.title,
            "description": v.description,
            "subject": v.subject,
            "grade_level": v.grade_level,
            "duration_minutes": v.duration_minutes,
            "video_url": v.video_url,
            "thumbnail_url": v.thumbnail_url,
            "created_at": v.created_at
        }
        for v in videos
    ]

@videos_router.post("/")
async def upload_educational_video(payload: EducationalVideoCreate, db: AsyncSession = Depends(get_db)):
    video = EducationalVideo(
        title=payload.title,
        description=payload.description,
        subject=payload.subject,
        grade_level=payload.grade_level,
        duration_minutes=payload.duration_minutes,
        video_url=payload.video_url,
        thumbnail_url=payload.thumbnail_url,
        created_by=payload.created_by
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)
    return {"status": "created", "video_id": str(video.id), "title": video.title}

