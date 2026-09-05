from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database.connection import init_db
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.scores import router as scores_router
from app.api.minigames import router as minigames_router
from app.api.analytics import router as analytics_router
from app.api.baselines import router as baselines_router

app = FastAPI(
    title="ELOCIA Backend API",
    description="Educational Motion Analysis & FSL Assessment System - Manuscript v4.1 Backend",
    version="4.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

# Include Modular Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scores_router)
app.include_router(minigames_router)
app.include_router(analytics_router)
app.include_router(baselines_router, prefix="/baselines", tags=["Baselines & Content Management"])

@app.get("/")
async def root():
    return {
        "status": "ELOCIA Backend is running",
        "version": "4.1.0",
        "docs_url": "/docs"
    }