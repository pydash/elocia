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
from services.analytics_logger import log_evaluation_attempt, init_analytics_log
import time

app = FastAPI()

# Initialize analytics log on startup
init_analytics_log()

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
    
    student_sequence = []
    frame_timestamps = []

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get('action') == 'clear':
                student_sequence = []
                frame_timestamps = []
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
                stage_name = payload.get('stageName', f"Stage {stage_id}")
                student_id = payload.get('studentId', "")
                student_name = payload.get('studentName', "Student")
                attempt_num = payload.get('attemptNumber', 1)
                tier_level = payload.get('tierLevel', 1)
                activity_type = payload.get('activityType', "evaluation")

                baseline_file = os.path.abspath(os.path.join(os.path.dirname(__file__), 'baselines', f'baseline_{stage_id}.json'))
                
                if not os.path.exists(baseline_file):
                    await websocket.send_json({"error": f"Baseline not found for stage {stage_id}"})
                    student_sequence = []
                    frame_timestamps = []
                    continue
                    
                with open(baseline_file, 'r') as f:
                    baseline_sequence = json.load(f)
                
                eval_t0 = time.time()
                # Use our mathematical scoring engine!
                scores = evaluate_sign(student_sequence, baseline_sequence)
                latency_ms = (time.time() - eval_t0) * 1000.0

                overall = (scores['handshape'] * 0.25) + (scores['palmOrientation'] * 0.25) + (scores['location'] * 0.25) + (scores['movement'] * 0.25)
                
                # Veto Rule check
                has_failed_parameter = (
                    scores['handshape'] < 60 or
                    scores['palmOrientation'] < 60 or
                    scores['location'] < 60 or
                    scores['movement'] < 60
                )
                passed = (overall >= 60) and (not has_failed_parameter)

                # Compute FPS over the recording duration
                fps = 0.0
                if len(frame_timestamps) > 1:
                    duration = frame_timestamps[-1] - frame_timestamps[0]
                    if duration > 0:
                        fps = len(frame_timestamps) / duration

                # Log directly to Automated System Analytics Log CSV
                log_evaluation_attempt(
                    student_id=student_id,
                    student_name=student_name,
                    activity_type=activity_type,
                    stage_id=stage_id,
                    stage_name=stage_name,
                    attempt_number=attempt_num,
                    tier_level=tier_level,
                    scores=scores,
                    composite_score=overall,
                    passed=passed,
                    fps=fps,
                    frames_processed=len(student_sequence),
                    latency_ms=latency_ms
                )

                await websocket.send_json({
                    "action": "result",
                    "scores": scores,
                    "overall": overall,
                    "fps": round(fps, 1),
                    "latency_ms": round(latency_ms, 1),
                    "frames_processed": len(student_sequence)
                })
                
                student_sequence = []
                frame_timestamps = []
                continue

            image_data = payload.get("image", "")
            if not image_data:
                continue

            frame_timestamps.append(time.time())

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
    print("Starting Desktop API on port 8001...")
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="info")

if __name__ == '__main__':
    # Check if user wants server-only mode (ideal for browser testing)
    server_only = "--server" in sys.argv or "--no-window" in sys.argv or os.environ.get("ELOCIA_SERVER_ONLY") == "1"

    if server_only:
        print("Running ELOCIA CV Server in standalone mode (no desktop window)...")
        run_api()
    else:
        api_thread = Thread(target=run_api, daemon=True)
        api_thread.start()

        import time
        time.sleep(1)

        try:
            webview.create_window(
                "ELOCIA",
                "http://localhost:5173",
                width=1920,
                height=1080,
                resizable=False,
            )
            webview.start()
        except Exception as e:
            print(f"PyWebView window error: {e}")
            print("Falling back to standalone API server...")
            api_thread.join()