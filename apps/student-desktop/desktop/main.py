import webview
import uvicorn
import cv2
import numpy as np
import base64
import json
import sys
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from threading import Thread

from inference import evaluate_sign
from services.camera_check import analyze_camera_frame

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


student_sequence = []
diag_state = {
    "on": False,
    "baseline": None,
    "mid": None,
    "stage_id": None
}

@app.websocket("/ws/evaluate")
async def evaluate_endpoint(websocket: WebSocket):
    global student_sequence, diag_state
    await websocket.accept()
    
    # We must initialize mediapipe here since we moved it from backend
    import mediapipe as mp
    from inference import get_diagnostic_baseline, diagnostic_frame_scores
    mp_holistic = mp.solutions.holistic
    holistic = mp_holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get('action') == 'clear':
                student_sequence = []
                continue
                
            if payload.get('action') == 'start_diagnostic':
                stage_id = payload.get('stageId', 1)
                baseline_file = os.path.abspath(os.path.join(os.path.dirname(__file__), 'baselines', f'baseline_{stage_id}.json'))
                if os.path.exists(baseline_file):
                    with open(baseline_file, 'r') as f:
                        b_seq = json.load(f)
                        diag_state["baseline"] = b_seq
                        diag_state["mid"] = get_diagnostic_baseline(b_seq)
                        diag_state["on"] = True
                        diag_state["stage_id"] = stage_id
                continue

            if payload.get('action') == 'stop_diagnostic':
                diag_state["on"] = False
                continue

            if payload.get('action') == 'evaluate':
                stage_id = payload.get('stageId', 1)
                baseline_file = os.path.abspath(os.path.join(os.path.dirname(__file__), 'baselines', f'baseline_{stage_id}.json'))
                
                if not os.path.exists(baseline_file):
                    await websocket.send_json({"error": f"Baseline not found for stage {stage_id}"})
                    student_sequence = []
                    continue
                    
                with open(baseline_file, 'r') as f:
                    baseline_sequence = json.load(f)
                
                # Use our new mathematical scoring engine!
                scores = evaluate_sign(student_sequence, baseline_sequence)
                
                overall = (scores['handshape'] * 0.25) + (scores['palmOrientation'] * 0.25) + (scores['location'] * 0.25) + (scores['movement'] * 0.25)
                
                await websocket.send_json({
                    "action": "result",
                    "scores": scores,
                    "overall": overall
                })
                
                student_sequence = []
                continue

            image_data = payload.get("image", "")
            if not image_data:
                continue

            header, encoded = image_data.split(",", 1) if "," in image_data else ("", image_data)
            nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            results = holistic.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            frame_data = {
                "hand": [{"x": 0, "y": 0, "z": 0} for _ in range(21)],
                "pose": [{"x": 0, "y": 0, "z": 0} for _ in range(33)]
            }
            
            # Extract the dominant active hand (allows mirrored videos to work)
            active_hand = None
            if results.right_hand_landmarks:
                active_hand = results.right_hand_landmarks
            elif results.left_hand_landmarks:
                active_hand = results.left_hand_landmarks
                
            if active_hand:
                for i, lm in enumerate(active_hand.landmark):
                    frame_data["hand"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}
                    
            if results.pose_landmarks:
                for i, lm in enumerate(results.pose_landmarks.landmark):
                    frame_data["pose"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}
                
            student_sequence.append(frame_data)
            
            # Diagnostic streaming
            if diag_state["on"] and diag_state["mid"] is not None:
                scores = diagnostic_frame_scores(frame_data, diag_state["mid"])
                await websocket.send_json({
                    "action": "landmarks",
                    "hand": frame_data["hand"],
                    "pose": {
                        "nose": frame_data["pose"][0],
                        "leftShoulder": frame_data["pose"][11],
                        "rightShoulder": frame_data["pose"][12]
                    },
                    "scores": scores,
                    "frames": len(student_sequence)
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