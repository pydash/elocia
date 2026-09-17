import asyncio, os, re, json
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from urllib.parse import urlparse, urlunparse

backup_path = r"D:\Elocia\supabase_backup\elocia_supabase_backup_20260913_105955.sql"
backup_rows = {}
with open(backup_path, "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("INSERT INTO public.evaluation_attempts VALUES"):
            m = re.search(r"VALUES \('([^']+)', '([^']+)', '([^']+)', (\d+), (\d+), (\d+), (\d+), (\d+), (\d+), (\d+), ([\d.]+), (true|false), (\d+), (\d+), '([^']+)'\);", line)
            if m:
                rid = m.group(1)
                backup_rows[rid] = {
                    "id": rid,
                    "student_id": m.group(2),
                    "activity_type": m.group(3),
                    "stage_id": int(m.group(4)),
                    "attempt_number": int(m.group(5)),
                    "tier_level": int(m.group(6)),
                    "score_handshape": int(m.group(7)),
                    "score_palm_orientation": int(m.group(8)),
                    "score_location": int(m.group(9)),
                    "score_movement": int(m.group(10)),
                    "score_overall": float(m.group(11)),
                    "passed": m.group(12) == "true",
                    "streak": int(m.group(13)),
                    "xp_earned": int(m.group(14)),
                    "created_at": m.group(15)
                }

print(f"Parsed {len(backup_rows)} backup evaluation_attempts rows.")

db_url = os.getenv("DATABASE_URL")
parsed = urlparse(db_url)
clean_url = urlunparse(parsed._replace(query=""))
engine = create_async_engine(clean_url)

async def compare():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT * FROM evaluation_attempts"))
        db_rows = {str(r._mapping["id"]): dict(r._mapping) for r in res.fetchall()}
        print(f"Live DB has {len(db_rows)} evaluation_attempts rows.")
        
        new_ids = set(db_rows.keys()) - set(backup_rows.keys())
        print(f"New records: {len(new_ids)}")
        for nid in new_ids:
            r = db_rows[nid]
            clean_r = {k: str(v) for k, v in r.items()}
            print("NEW RECORD:")
            print(json.dumps(clean_r, indent=2))
            
        missing_ids = set(backup_rows.keys()) - set(db_rows.keys())
        print(f"Missing records from backup: {len(missing_ids)}")
        
        diffs_count = 0
        for cid in set(backup_rows.keys()) & set(db_rows.keys()):
            b = backup_rows[cid]
            d = db_rows[cid]
            for field in ["student_id", "activity_type", "stage_id", "attempt_number", "tier_level",
                          "score_handshape", "score_palm_orientation", "score_location", "score_movement",
                          "passed", "streak", "xp_earned"]:
                if str(b[field]) != str(d[field]):
                    print(f"Diff in {cid} field {field}: backup={b[field]}, live={d[field]}")
                    diffs_count += 1
            if abs(float(b["score_overall"]) - float(d["score_overall"])) > 0.001:
                print(f"Diff in {cid} score_overall: backup={b['score_overall']}, live={d['score_overall']}")
                diffs_count += 1
        print(f"Total field differences across the 28 historical records: {diffs_count}")

    await engine.dispose()

asyncio.run(compare())
