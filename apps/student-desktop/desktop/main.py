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

def resolve_baseline_file(stage_id, activity_type="evaluation"):
    """
    Resolves the baseline JSON file from organized directories:
    1. Minigames: baselines/minigames/<activity_type>/baseline_<id>.json
    2. Lessons: baselines/lessons/baseline_<id>.json
    3. Root fallback & backend storage fallback for complete compatibility
    """
    base_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), 'baselines')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend', 'storage', 'baselines'))
    ]

    # Map raw numbers (1-10) to sign IDs (101-110) if needed
    alt_ids = [str(stage_id)]
    if isinstance(stage_id, str):
        cleaned = stage_id.strip()
        alt_ids.extend([cleaned, cleaned.lower(), cleaned.upper(), cleaned.capitalize()])
    try:
        num = int(stage_id)
        if 1 <= num <= 26:
            # Map 1 -> A, 2 -> B etc.
            alt_ids.append(chr(64 + num))
        if 1 <= num <= 10:
            alt_ids.append(str(100 + num))
        elif 101 <= num <= 110:
            alt_ids.append(str(num - 100))
    except (ValueError, TypeError):
        # stage_id might already be a letter string like 'A'
        if isinstance(stage_id, str) and len(stage_id) == 1 and stage_id.isalpha():
            letter_num = ord(stage_id.upper()) - 64
            alt_ids.append(str(letter_num))
            alt_ids.append(stage_id.upper())

    # Remove duplicates preserving order
    alt_ids = list(dict.fromkeys(alt_ids))

    # Build prioritized candidate relative paths
    candidate_paths = []
    if activity_type == "magic_fingers":
        # Alphabet game: prioritize letter representations (e.g. baseline_A.json, baseline_1.json inside magic_fingers)
        # 1. Exact game folder
        for sid in alt_ids:
            candidate_paths.append(os.path.join("minigames", activity_type, f"baseline_{sid}.json"))
        # 2. General minigames folder
        for sid in alt_ids:
            candidate_paths.append(os.path.join("minigames", f"baseline_{sid}.json"))
        # Never fall back to lessons or root numeric signs for magic_fingers
    elif activity_type in ["puzzle_sign", "see_it_sign_it"]:
        # 1. Exact game folder
        for sid in alt_ids:
            candidate_paths.append(os.path.join("minigames", activity_type, f"baseline_{sid}.json"))
        # 2. General minigames folder
        for sid in alt_ids:
            candidate_paths.append(os.path.join("minigames", f"baseline_{sid}.json"))
        # 3. Lessons fallback
        for sid in alt_ids:
            candidate_paths.append(os.path.join("lessons", f"baseline_{sid}.json"))
        for sid in alt_ids:
            candidate_paths.append(f"baseline_{sid}.json")
    else:
        # Lesson proper
        for sid in alt_ids:
            candidate_paths.append(os.path.join("lessons", f"baseline_{sid}.json"))
        for sid in alt_ids:
            candidate_paths.append(f"baseline_{sid}.json")

    # Search candidates across desktop baselines and backend storage baselines
    for bdir in base_dirs:
        for rel in candidate_paths:
            full_path = os.path.abspath(os.path.join(bdir, rel))
            if os.path.exists(full_path):
                return full_path

    return None

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
                activity_type = payload.get('activityType', "evaluation")
                baseline_file = resolve_baseline_file(stage_id, activity_type)
                if baseline_file and os.path.exists(baseline_file):
                    with open(baseline_file, 'r', encoding='utf-8') as f:
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

                # Resolve baseline from organized folders (minigames vs lessons)
                baseline_file = resolve_baseline_file(stage_id, activity_type)
                
                if not baseline_file or not os.path.exists(baseline_file):
                    await websocket.send_json({
                        "action": "error",
                        "error": f"Baseline reference not found for {activity_type} sign {stage_id}."
                    })
                    student_sequence = []
                    frame_timestamps = []
                    continue
                    
                with open(baseline_file, 'r', encoding='utf-8') as f:
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

                # Hardware camera capture rate per thesis manuscript specification: 30.0 FPS
                fps = 30.0

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
            
            # ADVISER VALIDATION: Background Person Filtering
            # Ensure the detected person is the centered foreground student, not a person in the background.
            if not results.pose_landmarks:
                # If no student pose is detected, ignore stray background hands
                continue

            ls = results.pose_landmarks.landmark[11]
            rs = results.pose_landmarks.landmark[12]
            shoulder_width = abs(ls.x - rs.x)

            # Minimum shoulder width threshold: tuned for Grade 1-3 elementary learners (width >= 0.12)
            # Background adults standing far behind typically have width < 0.10
            if shoulder_width < 0.12:
                # Discard frame: person is too far in background
                continue

            # Check if active hand belongs to the foreground student's signing space
            # Covers forehead down to upper torso, bounded within the shoulder signing corridor.
            # Hands held high at the ear or off-screen (phone calls) are excluded.
            min_x = min(ls.x, rs.x) - 0.22
            max_x = max(ls.x, rs.x) + 0.22
            min_y = min(ls.y, rs.y) - 0.40
            max_y = max(ls.y, rs.y) + 0.50

            # Check candidate hands within foreground student's signing boundary
            rh_valid = None
            if results.right_hand_landmarks:
                wrist = results.right_hand_landmarks.landmark[0]
                if min_x <= wrist.x <= max_x and min_y <= wrist.y <= max_y:
                    rh_valid = results.right_hand_landmarks

            lh_valid = None
            if results.left_hand_landmarks:
                wrist = results.left_hand_landmarks.landmark[0]
                if min_x <= wrist.x <= max_x and min_y <= wrist.y <= max_y:
                    lh_valid = results.left_hand_landmarks

            active_hand = rh_valid or lh_valid

            frame_data = {
                "hand": [{"x": 0.0, "y": 0.0, "z": 0.0} for _ in range(21)],
                "right_hand": [{"x": 0.0, "y": 0.0, "z": 0.0} for _ in range(21)],
                "left_hand": [{"x": 0.0, "y": 0.0, "z": 0.0} for _ in range(21)],
                "has_right": False,
                "has_left": False,
                "pose": [{"x": 0.0, "y": 0.0, "z": 0.0} for _ in range(33)]
            }

            if rh_valid:
                frame_data["has_right"] = True
                for i, lm in enumerate(rh_valid.landmark):
                    frame_data["right_hand"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}

            if lh_valid:
                frame_data["has_left"] = True
                for i, lm in enumerate(lh_valid.landmark):
                    frame_data["left_hand"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}

            if active_hand:
                for i, lm in enumerate(active_hand.landmark):
                    frame_data["hand"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}
                    
            for i, lm in enumerate(results.pose_landmarks.landmark):
                frame_data["pose"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}
                
            student_sequence.append(frame_data)
            
            # Streaming presence / landmarks to frontend
            hand_detected = (rh_valid is not None or lh_valid is not None)
            if diag_state["on"] and diag_state["mid"] is not None:
                scores = diagnostic_frame_scores(frame_data, diag_state["mid"])
                await websocket.send_json({
                    "action": "landmarks",
                    "hand_detected": hand_detected,
                    "hand": frame_data["hand"],
                    "right_hand": frame_data["right_hand"] if frame_data["has_right"] else None,
                    "left_hand": frame_data["left_hand"] if frame_data["has_left"] else None,
                    "pose": {
                        "nose": frame_data["pose"][0],
                        "leftShoulder": frame_data["pose"][11],
                        "rightShoulder": frame_data["pose"][12]
                    },
                    "scores": scores,
                    "frames": len(student_sequence)
                })
            else:
                await websocket.send_json({
                    "action": "hand_status",
                    "hand_detected": hand_detected,
                    "hand": frame_data["hand"],
                    "right_hand": frame_data["right_hand"] if frame_data["has_right"] else None,
                    "left_hand": frame_data["left_hand"] if frame_data["has_left"] else None,
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