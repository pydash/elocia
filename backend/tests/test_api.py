import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def test_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        # 1. Root
        r = await client.get('/')
        print('GET /:', r.status_code, r.json())
        
        # 2. Students
        r = await client.get('/students')
        print('GET /students:', r.status_code, 'Count:', len(r.json()))
        first_student = r.json()[0] if r.json() else None
        
        # 3. MiniGame Configs
        r = await client.get('/minigames/config/see_it_sign_it')
        print('GET /minigames/config/see_it_sign_it:', r.status_code, 'Items:', len(r.json()))
        
        # 4. Class Radar
        r = await client.get('/analytics/class-radar')
        print('GET /analytics/class-radar:', r.status_code, r.json())

        # 5. Parent Summary
        if first_student:
            s_id = first_student['id']
            r = await client.get(f'/analytics/parent/{s_id}')
            print('GET /analytics/parent/{id}:', r.status_code, r.json())

if __name__ == '__main__':
    asyncio.run(test_endpoints())