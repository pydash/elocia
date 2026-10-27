import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

# Supabase Transaction Pooler (port 6543) avoids EMAXCONNSESSION (port 5432 session pool limit 15)
DEFAULT_DATABASE_URL = "postgresql+asyncpg://postgres.ovffqxjrokyuvlkmccup:Elocia.51326@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Ensure transaction mode on pooler (port 6543) rather than session mode (port 5432)
if "pooler.supabase.com:5432" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    poolclass=NullPool,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "command_timeout": 30,
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
        await conn.execute(
            text(
                "ALTER TABLE classes "
                "ALTER COLUMN teacher_id DROP NOT NULL"
            )
        )
