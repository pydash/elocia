import cv2
import mediapipe as mp
import json
import time

mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def record_baseline(stage_id, duration=3):
    cap = cv2.VideoCapture(0)
    baseline_data = []
    
    print(f"\n--- RECORDING BASELINE FOR STAGE {stage_id} ---")
    print("Get ready! Recording starts in...")
    for i in range(3, 0, -1):
        print(i)
        time.sleep(1)
        
    print("RECORDING NOW! DO THE SIGN!")
    
    start_time = time.time()
    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret: break
        
        results = holistic.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        frame_data = {
            "hand": [{"x": 0, "y": 0, "z": 0} for _ in range(21)],
            "pose": [{"x": 0, "y": 0, "z": 0} for _ in range(33)]
        }
        
        if results.right_hand_landmarks:
            for i, lm in enumerate(results.right_hand_landmarks.landmark):
                frame_data["hand"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}
                
        if results.pose_landmarks:
            for i, lm in enumerate(results.pose_landmarks.landmark):
                frame_data["pose"][i] = {"x": lm.x, "y": lm.y, "z": lm.z}
            
        baseline_data.append(frame_data)
        
    cap.release()
    
    filename = f"baseline_{stage_id}.json"
    with open(filename, 'w') as f:
        json.dump(baseline_data, f)
        
    print(f"Saved {filename} with {len(baseline_data)} frames of your exact movement!")

if __name__ == "__main__":
    record_baseline(1)

