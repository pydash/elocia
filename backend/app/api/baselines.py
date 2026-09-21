import os
import sys
import json
import subprocess
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.connection import get_db
from app.models.baseline import FSLBaseline, CurriculumStage
from app.models.session import StudentStageProgress
from app.models.user import User, UserRole
from app.models.classroom import EducationalVideo
from app.schemas.baseline import BaselineResponse, BaselineUploadResult

router = APIRouter()

# Directories for videos and baselines
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DESKTOP_PYTHON = sys.executable
EXTRACTOR_SCRIPT = os.path.join(PROJECT_ROOT, "apps", "student-desktop", "desktop", "baselines", "extract_baseline.py")

PUBLIC_VIDEOS_DIR = os.path.join(PROJECT_ROOT, "apps", "student-desktop", "frontend", "public", "videos")
BASELINES_DIR = os.path.join(PROJECT_ROOT, "apps", "student-desktop", "desktop", "baselines")
STORAGE_VIDEOS_DIR = os.path.join(PROJECT_ROOT, "backend", "storage", "videos")
STORAGE_BASELINES_DIR = os.path.join(PROJECT_ROOT, "backend", "storage", "baselines")

# Ensure required directories exist
for d in [PUBLIC_VIDEOS_DIR, BASELINES_DIR, STORAGE_VIDEOS_DIR, STORAGE_BASELINES_DIR]:
    os.makedirs(d, exist_ok=True)

@router.post("/upload", response_model=BaselineUploadResult)
async def upload_baseline_video(
    sign_name: str = Form(...),
    stage_id: Optional[int] = Form(None),
    grade_level: Optional[int] = Form(1),
    description: Optional[str] = Form(None),
    sign_id: Optional[int] = Form(None),
    stage_id_new: Optional[int] = Form(None),
    order_index: Optional[int] = Form(None),
    video: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Module 3: Dynamic FSL Baseline Generation Engine (Teacher Upload Pipeline).
    Receives an FSL demonstration video, executes MediaPipe Holistic 3D landmark
    extraction, and stores the baseline coordinate model in the database and local cache.
    """
    # 1. Validate file extension
    ext = os.path.splitext(video.filename)[1].lower()
    if ext not in [".mp4", ".webm", ".mov", ".mkv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video format '{ext}'. Please upload an .mp4, .webm, or .mov file."
        )

    # 2. Auto-resolve stage_id if not provided
    if stage_id is None:
        max_stage_res = await db.execute(select(func.coalesce(func.max(FSLBaseline.stage_id), 0)))
        max_stage = max_stage_res.scalar() or 0
        stage_id = max(max_stage + 1, 101)

    resolved_sign_id = sign_id if sign_id is not None else stage_id

    # 3. Save video file to public videos and storage
    video_filename = f"{stage_id}{ext}"
    target_video_path = os.path.join(PUBLIC_VIDEOS_DIR, video_filename)
    backup_video_path = os.path.join(STORAGE_VIDEOS_DIR, video_filename)

    with open(target_video_path, "wb") as f_out:
        shutil.copyfileobj(video.file, f_out)
    shutil.copyfile(target_video_path, backup_video_path)

    # 4. Output baseline JSON target paths
    target_json_filename = f"baseline_{stage_id}.json"
    desktop_json_path = os.path.join(BASELINES_DIR, target_json_filename)
    backup_json_path = os.path.join(STORAGE_BASELINES_DIR, target_json_filename)

    # 5. Execute extraction subprocess using Python with MediaPipe
    cmd = [
        DESKTOP_PYTHON,
        EXTRACTOR_SCRIPT,
        "--video", target_video_path,
        "--output", desktop_json_path,
        "--stage", str(stage_id)
    ]

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode != 0:
            err_msg = proc.stderr.strip() or proc.stdout.strip()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Landmark extraction failed: {err_msg}"
            )

        # Parse JSON output from the worker
        last_line = proc.stdout.strip().split("\n")[-1]
        extract_result = json.loads(last_line)
        if not extract_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=extract_result.get("error", "Unknown extraction error")
            )

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Video extraction timed out (exceeded 120 seconds)."
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Subprocess execution error: {str(e)}"
        )

    # Copy generated baseline to backend storage backup
    if os.path.exists(desktop_json_path):
        shutil.copyfile(desktop_json_path, backup_json_path)

    total_frames = extract_result.get("total_frames", 0)
    hands_detected = extract_result.get("hands_detected_frames", 0)
    fps = extract_result.get("fps", 30.0)

    # 6. Find or create CurriculumStage for this grade level and stage
    curr_stage = None
    if stage_id_new is not None:
        curr_stage_res = await db.execute(select(CurriculumStage).where(CurriculumStage.id == stage_id_new))
        curr_stage = curr_stage_res.scalar_one_or_none()

    if not curr_stage:
        curr_stage_res = await db.execute(select(CurriculumStage).where(CurriculumStage.stage_number == stage_id))
        curr_stage = curr_stage_res.scalar_one_or_none()

    if not curr_stage:
        grade_sec_title = f"Grade {grade_level} Lessons" if grade_level else "Teacher Lessons"
        curr_stage = CurriculumStage(
            stage_number=stage_id,
            section_number=grade_level or 1,
            section_title=grade_sec_title,
            unit_number=1,
            unit_title="FSL Practice Signs",
            title=sign_name,
            description=description or f"Learn to sign {sign_name}",
            is_active=True
        )
        db.add(curr_stage)
        await db.flush()
        await db.refresh(curr_stage)

    # 7. Upsert baseline record in the database
    existing = await db.execute(select(FSLBaseline).where(FSLBaseline.stage_id == stage_id))
    baseline_record = existing.scalar_one_or_none()

    if baseline_record:
        baseline_record.sign_name = sign_name
        baseline_record.video_filename = video_filename
        baseline_record.total_frames = total_frames
        baseline_record.hands_detected_frames = hands_detected
        baseline_record.fps = fps
        baseline_record.is_active = True
        baseline_record.sign_id = resolved_sign_id
        baseline_record.stage_id_new = curr_stage.id
        if order_index is not None:
            baseline_record.order_index = order_index
    else:
        baseline_record = FSLBaseline(
            stage_id=stage_id,
            sign_id=resolved_sign_id,
            stage_id_new=curr_stage.id,
            order_index=order_index,
            sign_name=sign_name,
            video_filename=video_filename,
            total_frames=total_frames,
            hands_detected_frames=hands_detected,
            fps=fps,
            is_active=True
        )
        db.add(baseline_record)

    # 8. Unlock this stage for all students matching the grade level!
    stud_query = select(User).where(User.role == UserRole.student, User.is_active == True)
    if grade_level is not None:
        stud_query = stud_query.where(User.grade_level == grade_level)
    students_res = await db.execute(stud_query)
    students = students_res.scalars().all()

    for stud in students:
        ssp_res = await db.execute(
            select(StudentStageProgress).where(
                StudentStageProgress.student_id == stud.id,
                StudentStageProgress.stage_id == curr_stage.id
            )
        )
        ssp = ssp_res.scalar_one_or_none()
        if not ssp:
            ssp = StudentStageProgress(
                student_id=stud.id,
                stage_id=curr_stage.id,
                unlocked=True,
                passed=False,
                best_score=0.0,
                stars=0
            )
            db.add(ssp)
        else:
            ssp.unlocked = True

    # 9. Also record an EducationalVideo entry so it appears in both Practice and Lesson Navigation
    try:
        edu_vid = EducationalVideo(
            title=sign_name,
            description=description or f"Learn to sign {sign_name}",
            subject="FSL Demonstration",
            grade_level=grade_level or 1,
            duration_minutes=5,
            video_url=f"/videos/{video_filename}",
            thumbnail_url=None
        )
        db.add(edu_vid)
    except Exception:
        pass

    await db.commit()

    return BaselineUploadResult(
        success=True,
        message=f"Successfully extracted {total_frames} frames from '{video_filename}'.",
        stage_id=stage_id,
        sign_id=baseline_record.sign_id,
        stage_id_new=baseline_record.stage_id_new,
        sign_name=sign_name,
        total_frames=total_frames,
        hands_detected_frames=hands_detected,
        fps=fps
    )

@router.get("", response_model=List[BaselineResponse])
async def list_baselines(db: AsyncSession = Depends(get_db)):
    """List all registered FSL sign baselines."""
    result = await db.execute(
        select(FSLBaseline).where(FSLBaseline.is_active == True).order_by(FSLBaseline.sign_id.asc().nulls_last(), FSLBaseline.stage_id.asc())
    )
    return result.scalars().all()

@router.get("/{stage_id}")
async def get_baseline_landmarks(stage_id: int):
    """
    Returns the raw 3D landmark sequence JSON for a specific stage,
    used by the Computer Vision evaluation engine.
    """
    json_path = os.path.join(BASELINES_DIR, f"baseline_{stage_id}.json")
    if not os.path.exists(json_path):
        json_path = os.path.join(STORAGE_BASELINES_DIR, f"baseline_{stage_id}.json")

    if not os.path.exists(json_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Baseline landmarks not found for stage {stage_id}."
        )

    with open(json_path, "r") as f:
        data = json.load(f)

    return JSONResponse(content=data)

