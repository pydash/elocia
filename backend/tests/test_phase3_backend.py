import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_get_curriculum():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/curriculum")
        assert r.status_code == 200
        data = r.json()
        assert "sections" in data
        assert len(data["sections"]) >= 1
        sec1 = data["sections"][0]
        assert sec1["title"] == "Section 1"
        assert len(sec1["units"]) >= 1
        unit1 = sec1["units"][0]
        # Should have Stage 1 (Numbers 1-10) and Stage 2 (Numbers 11-20)
        stages = unit1["stages"]
        assert len(stages) >= 2
        stage1 = stages[0]
        assert stage1["id"] == 1
        assert len(stage1["items"]) == 10
        assert stage1["items"][0]["globalId"] == 1
        assert stage1["items"][0]["name"] == "1"

@pytest.mark.asyncio
async def test_student_profiles_in_students_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/students")
        assert r.status_code == 200
        students = r.json()
        assert len(students) == 4
        # Verify student profiles data fields
        names = [s["name"] for s in students]
        assert "Ethan" in names
        assert "Leo" in names
        ethan = next(s for s in students if s["name"] == "Ethan")
        assert ethan["level"] == 7
        assert ethan["streak"] == 1
        assert ethan["student_code"] == "G1-03"

@pytest.mark.asyncio
async def test_student_progress_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Get Ethan's ID
        r = await client.get("/students")
        students = r.json()
        ethan = next(s for s in students if s["name"] == "Ethan")
        
        # Query progress
        prog_r = await client.get(f"/users/{ethan['id']}/progress")
        assert prog_r.status_code == 200
        prog = prog_r.json()
        assert prog["student_name"] == "Ethan"
        assert prog["unlocked_stages"] == [1]
        assert len(prog["stages"]) == 3
        # Stage 1 should be unlocked, not yet passed (requires 10 distinct signs passed)
        stage1 = next(s for s in prog["stages"] if s["stage_id"] == 1)
        assert stage1["unlocked"] is True
        assert stage1["best_score"] == 79.8
        assert stage1["stars"] == 4
        # Stage 2 and 3 should be locked
        stage2 = next(s for s in prog["stages"] if s["stage_id"] == 2)
        assert stage2["unlocked"] is False

@pytest.mark.asyncio
async def test_student_auth_with_pin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Successful login
        r = await client.post("/auth/student/login", json={"student_name": "Ethan", "pin": "1234"})
        assert r.status_code == 200
        assert "access_token" in r.json()

        # Invalid PIN
        r_fail = await client.post("/auth/student/login", json={"student_name": "Ethan", "pin": "9999"})
        assert r_fail.status_code == 401

@pytest.mark.asyncio
async def test_baselines_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/baselines")
        assert r.status_code == 200
        baselines = r.json()
        assert len(baselines) == 31
        # Check first sign (sign_id 0) and sign 1
        sign0 = next(b for b in baselines if b["sign_id"] == 0)
        assert sign0["sign_id"] == 0
        assert sign0["stage_id_new"] is None

        sign1 = next(b for b in baselines if b["sign_id"] == 1)
        assert sign1["sign_id"] == 1
        assert sign1["stage_id_new"] == 1
        assert sign1["order_index"] == 1
        assert sign1["sign_name"] == "1"

@pytest.mark.asyncio
async def test_tier4_flags_with_sign_names():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/analytics/tier4-flags")
        assert r.status_code == 200
        flags = r.json()
        # Verify each flag has sign_id and student_name
        for flag in flags:
            assert "student_name" in flag
            assert "sign_id" in flag

@pytest.mark.asyncio
async def test_single_sign_pass_does_not_unlock_stage2():
    """Verify that passing only 1 sign in Stage 1 does NOT unlock Stage 2 (requires all 10 signs)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/students")
        students = r.json()
        alex = next(s for s in students if s["name"] == "Alex")

        # Check Alex's progress: only Stage 1 should be unlocked
        prog_before = (await client.get(f"/users/{alex['id']}/progress")).json()
        assert prog_before["unlocked_stages"] == [1]

        attempt_id = None
        try:
            # Save a score for Alex passing Sign 1
            save_res = await client.post(
                f"/scores/save?student_id={alex['id']}&activity_type=evaluation&stage_id=1&sign_id=1&attempt_number=1&tier_level=1&score_handshape=85&score_palm_orientation=90&score_location=88&score_movement=82&score_overall=86.25&passed=true&streak=1&xp_earned=50"
            )
            attempt_data = save_res.json()
            attempt_id = attempt_data.get("attempt_id") or attempt_data.get("id")

            # Check Alex's progress after passing Sign 1: Stage 2 must STILL be locked!
            prog_after = (await client.get(f"/users/{alex['id']}/progress")).json()
            assert prog_after["unlocked_stages"] == [1]
            assert 2 not in prog_after["unlocked_stages"]
        finally:
            if attempt_id:
                from app.database.connection import AsyncSessionLocal
                from sqlalchemy import text
                async with AsyncSessionLocal() as session:
                    await session.execute(text("DELETE FROM evaluation_attempts WHERE id = :id"), {"id": attempt_id})
                    await session.commit()


