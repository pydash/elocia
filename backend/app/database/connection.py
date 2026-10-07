from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "postgresql+asyncpg://postgres.ovffqxjrokyuvlkmccup:Elocia.51326@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
    pool_pre_ping=False,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        from app.models import user, session, minigame, baseline
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(
            text(
                "ALTER TABLE mini_games_config "
                "ADD COLUMN IF NOT EXISTS target_sign VARCHAR"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE mini_games_config "
                "ADD COLUMN IF NOT EXISTS description VARCHAR"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE mini_games_config "
                "ADD COLUMN IF NOT EXISTS reference_video_url VARCHAR"
            )
        )
