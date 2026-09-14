import asyncio, os
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from urllib.parse import urlparse, urlunparse

target_id = "745b6fbc-0f27-4d4f-a117-9d47112ce474"

db_url = os.getenv("DATABASE_URL")
parsed = urlparse(db_url)
clean_url = urlunparse(parsed._replace(query=""))
engine = create_async_engine(clean_url)

async def delete_test_artifact():
    async with engine.begin() as conn:
        # 1. Verify record exists and matches exact criteria
        res = await conn.execute(text("SELECT id, student_id, score_overall, xp_earned FROM evaluation_attempts WHERE id = :id"), {"id": target_id})
        row = res.fetchone()
        if not row:
            raise ValueError(f"Target record {target_id} not found!")
        
        print(f"Verified target record: id={row[0]}, student_id={row[1]}, score={row[2]}, xp={row[3]}")
        
        # 2. Delete the record inside transaction
        del_res = await conn.execute(text("DELETE FROM evaluation_attempts WHERE id = :id"), {"id": target_id})
        print(f"Deleted rows: {del_res.rowcount}")
        if del_res.rowcount != 1:
            raise ValueError(f"Expected 1 deleted row, got {del_res.rowcount}. Rolling back.")

    await engine.dispose()

asyncio.run(delete_test_artifact())

