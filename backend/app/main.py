from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from app.database.connection import init_db
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.scores import router as scores_router
from app.api.minigames import router as minigames_router
from app.api.analytics import router as analytics_router
from app.api.baselines import router as baselines_router
from app.api.curriculum import router as curriculum_router
from app.api.classroom import router as classes_router, videos_router

app = FastAPI(
    title="ELOCIA Backend API",
    description="Educational Motion Analysis & FSL Assessment System - Manuscript v4.1 Backend",
    version="4.1.0"
)

MEDIA_DIR = Path(__file__).resolve().parents[1] / "storage"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        await init_db()
        print("[INFO] Database schema initialized successfully.")
    except Exception as db_err:
        print(f"[WARNING] Database connection on startup failed: {db_err}")
        print("[INFO] Server is continuing to run. Endpoints will connect when network is available.")

# Include Modular Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scores_router)
app.include_router(minigames_router)
app.include_router(analytics_router)
app.include_router(curriculum_router)
app.include_router(classes_router)
app.include_router(videos_router)
app.include_router(baselines_router, prefix="/baselines", tags=["Baselines & Content Management"])
import os
from fastapi.staticfiles import StaticFiles

# Mount static videos directory
public_videos_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "apps", "student-desktop", "frontend", "public", "videos"))
storage_videos_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "videos"))

video_mount_dir = public_videos_dir if os.path.exists(public_videos_dir) else storage_videos_dir
if os.path.exists(video_mount_dir):
    app.mount("/videos", StaticFiles(directory=video_mount_dir), name="videos")

# Mount static thumbnails directory
storage_thumbnails_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "thumbnails"))
os.makedirs(storage_thumbnails_dir, exist_ok=True)
app.mount("/thumbnails", StaticFiles(directory=storage_thumbnails_dir), name="thumbnails")

# Mount static minigame images and videos directories
minigame_images_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "minigames", "images"))
minigame_videos_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "minigames", "videos"))
os.makedirs(minigame_images_dir, exist_ok=True)
os.makedirs(minigame_videos_dir, exist_ok=True)
app.mount("/minigames/images", StaticFiles(directory=minigame_images_dir), name="minigames_images")
app.mount("/minigames/videos", StaticFiles(directory=minigame_videos_dir), name="minigames_videos")


@app.get("/")
async def root():
    return {
        "status": "ELOCIA Backend is running",
        "version": "4.1.0",
        "docs_url": "/docs"
    }