import asyncio
import httpx
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app
from app.database.connection import init_db

async def run_test():
    print("1. Initializing database tables (including fsl_baselines)...")
    await init_db()
    print("Database tables initialized successfully!")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test GET /baselines
        print("\n2. Testing GET /baselines...")
        res = await client.get("/baselines")
        print(f"Status: {res.status_code}, Current baselines count: {len(res.json())}")

        # 2. Test POST /baselines/upload with 1.mp4
        video_path = r"D:\Elocia\elocia\apps\student-desktop\frontend\public\videos\1.mp4"
        if os.path.exists(video_path):
            print(f"\n3. Testing POST /baselines/upload with '{video_path}'...")
            with open(video_path, "rb") as f:
                files = {"video": ("1.mp4", f, "video/mp4")}
                data = {"stage_id": "1", "sign_name": "Number 1"}
                res = await client.post("/baselines/upload", data=data, files=files)
                print(f"Upload Status: {res.status_code}")
                print(f"Response: {res.json()}")

            # 3. Test GET /baselines/1
            print("\n4. Testing GET /baselines/1...")
            res = await client.get("/baselines/1")
            print(f"Status: {res.status_code}")
            landmarks = res.json()
            print(f"Loaded landmark sequence: {len(landmarks)} frames")
            print(f"Frame 0 has {len(landmarks[0]['hand'])} hand points and {len(landmarks[0]['pose'])} pose points.")

        print("\nAll baseline tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_test())
