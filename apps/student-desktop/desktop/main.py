import webview
import uvicorn
import cv2
import numpy as np
import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from threading import Thread

# Import our dedicated modular services
from services.camera_check import analyze_camera_frame
from services.fsl_evaluator import calculate_component_scores
from services.fsl_evaluator import extract_landmarks, evaluate_fsl_parameters

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/camera-check")
async def camera_check_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            image_data = payload.get("image", "")

            if not image_data:
                continue

            header, encoded = image_data.split(",", 1) if "," in image_data else ("", image_data)
            nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            status, message = analyze_camera_frame(frame)

            await websocket.send_json({
                "status": status,
                "message": message
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Alignment WebSocket error: {e}")


# In apps/student-desktop/desktop/main.py
from services.fsl_evaluator import extract_landmarks, evaluate_fsl_parameters

@app.websocket("/ws/evaluate")
async def evaluate_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            image_data = payload.get("image", "")

            if not image_data:
                continue

            header, encoded = image_data.split(",", 1) if "," in image_data else ("", image_data)
            nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            # Process frame with MediaPipe Holistic
            pose_lm, lh_lm, rh_lm = extract_landmarks(frame)
            scores = evaluate_fsl_parameters(pose_lm, lh_lm, rh_lm)

            await websocket.send_json({
                "pose": pose_lm,
                "left_hand": lh_lm,
                "right_hand": rh_lm,
                "scores": scores
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Evaluation WS error: {e}")


def run_api():
    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == '__main__':
    api_thread = Thread(target=run_api, daemon=True)
    api_thread.start()

    import time
    time.sleep(1)

    webview.create_window(
        "ELOCIA",
        "http://localhost:5173",
        width=1920,
        height=1080,
        resizable=False,
    )
    webview.start()