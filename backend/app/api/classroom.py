from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from pydantic import BaseModel
import uuid
import os
import shutil

from app.database.connection import get_db
from app.models.classroom import Class, ClassStudent, EducationalVideo
from app.models.user import User, StudentProfile

router = APIRouter(prefix="/classes", tags=["Classes & Rosters"])
videos_router = APIRouter(prefix="/educational-videos", tags=["Educational Videos"])

# ── Schemas ──────────────────────────────────────────────────────────────────
class ClassCreate(BaseModel):
    teacher_id: uuid.UUID
    name: str
    grade_level: int = 1
    school_year: str = "2026-2027"

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    teacher_id: Optional[uuid.UUID] = None
    grade_level: Optional[int] = None
    school_year: Optional[str] = None

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
    query = (
        select(Class, User.name.label("teacher_name"), func.count(ClassStudent.id).label("student_count"))
        .outerjoin(User, Class.teacher_id == User.id)
        .outerjoin(ClassStudent, Class.id == ClassStudent.class_id)
        .group_by(Class.id, User.name)
        .order_by(Class.grade_level.asc(), Class.name.asc())
    )
    if teacher_id:
        query = query.where(Class.teacher_id == teacher_id)
    res = await db.execute(query)
    classes = res.all()
    return [
        {
            "id": str(c.id),
            "teacher_id": str(c.teacher_id),
            "teacher_name": teacher_name or "Unassigned",
            "name": c.name,
            "grade_level": c.grade_level,
            "school_year": c.school_year,
            "student_count": student_count or 0,
            "created_at": c.created_at
        }
        for c, teacher_name, student_count in classes
    ]

@router.put("/{class_id}")
async def update_class(class_id: uuid.UUID, payload: ClassUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Class).where(Class.id == class_id))
    cls = res.scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=404, detail="Classroom not found")
    if payload.name is not None:
        cls.name = payload.name
    if payload.teacher_id is not None:
        cls.teacher_id = payload.teacher_id
    if payload.grade_level is not None:
        cls.grade_level = payload.grade_level
    if payload.school_year is not None:
        cls.school_year = payload.school_year
    await db.commit()
    await db.refresh(cls)
    return {"status": "updated", "class_id": str(cls.id), "name": cls.name}

@router.delete("/{class_id}")
async def delete_class(class_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Class).where(Class.id == class_id))
    cls = res.scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=404, detail="Classroom not found")
    await db.delete(cls)
    await db.commit()
    return {"status": "deleted", "class_id": str(class_id)}

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
    query = (
        select(ClassStudent, User, StudentProfile)
        .join(User, ClassStudent.student_id == User.id)
        .outerjoin(StudentProfile, User.id == StudentProfile.student_id)
        .where(ClassStudent.class_id == class_id)
        .order_by(StudentProfile.grade_level.asc(), StudentProfile.student_number.asc(), User.name.asc())
    )
    res = await db.execute(query)
    roster = []
    for cs, u, sp in res.all():
        roster.append({
            "id": str(u.id),
            "name": u.name,
            "student_code": sp.student_code if sp else None,
            "student_number": sp.student_number if sp else None,
            "grade_level": sp.grade_level if sp else 1,
            "color": sp.color if sp else "#3B82F6",
            "emoji": sp.emoji if sp else "👦",
            "enrolled_at": cs.enrolled_at
        })
    return {"class_id": str(class_id), "students": roster}

# ── Endpoints: Educational Videos ─────────────────────────────────────────────
@videos_router.get("", include_in_schema=False)
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

@videos_router.post("", include_in_schema=False)
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

@videos_router.post("/upload-file")
async def upload_educational_video_file(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    subject: str = Form(...),
    grade_level: int = Form(1),
    duration_minutes: int = Form(5),
    thumbnail_url: Optional[str] = Form(None),
    video: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    ext = os.path.splitext(video.filename)[1].lower()
    if ext not in [".mp4", ".webm", ".mov", ".mkv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported video format. Please upload an .mp4, .webm, or .mov file."
        )

    clean_title = "".join(c for c in title if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    video_filename = f"edu_{uuid.uuid4().hex[:8]}_{clean_title}{ext}"

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    public_dir = os.path.join(project_root, "apps", "student-desktop", "frontend", "public", "videos")
    storage_dir = os.path.join(project_root, "backend", "storage", "videos")
    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(storage_dir, exist_ok=True)

    pub_path = os.path.join(public_dir, video_filename)
    stor_path = os.path.join(storage_dir, video_filename)

    with open(pub_path, "wb") as f_pub:
        shutil.copyfileobj(video.file, f_pub)
    shutil.copyfile(pub_path, stor_path)

    # Transcode to universal web-standard H.264 (AVC) so HEVC/MOV videos play in all browsers
    try:
        import imageio_ffmpeg, subprocess
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        h264_filename = f"edu_{uuid.uuid4().hex[:8]}_{clean_title}_web.mp4"
        h264_pub_path = os.path.join(public_dir, h264_filename)
        cmd = [
            ffmpeg_exe, "-y", "-i", pub_path,
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-preset", "veryfast", "-crf", "23",
            "-c:a", "aac", "-movflags", "+faststart",
            h264_pub_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode == 0:
            if os.path.exists(pub_path):
                try:
                    os.remove(pub_path)
                except Exception:
                    pass
            pub_path = h264_pub_path
            video_filename = h264_filename
            stor_path = os.path.join(storage_dir, video_filename)
            shutil.copyfile(pub_path, stor_path)
    except Exception as transcode_err:
        print(f"Web video transcode skipped: {transcode_err}")

    new_vid = EducationalVideo(
        title=title,
        description=description,
        subject=subject,
        grade_level=grade_level,
        duration_minutes=duration_minutes,
        video_url=f"/videos/{video_filename}",
        thumbnail_url=thumbnail_url
    )
    db.add(new_vid)
    await db.commit()
    await db.refresh(new_vid)
    return {
        "status": "created",
        "video_id": str(new_vid.id),
        "title": new_vid.title,
        "video_url": new_vid.video_url
    }

