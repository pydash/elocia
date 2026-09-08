import cv2
import mediapipe as mp
import json
import os

print("Extracting baseline landmarks using MediaPipe Holistic...")
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Set the path to where the individual videos are stored (the React public folder)
video_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'videos'))

success_count = 0

for i in range(1, 21):
    video_path = os.path.join(video_dir, f"{i}.mp4")
    
    if not os.path.exists(video_path):
        print(f"Skipping {i}.mp4 (Not found in {video_dir})")
        continue

    cap = cv2.VideoCapture(video_path)
    baseline_data = []
    frame_count = 0

    while cap.isOpened():
        ret, image = cap.read()
        if not ret:
            break
            
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        results = holistic.process(image)
        
        # Extract hand and pose landmarks
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
            for j, lm in enumerate(active_hand.landmark):
                frame_data["hand"][j] = {"x": lm.x, "y": lm.y, "z": lm.z}
                
        if results.pose_landmarks:
            for j, lm in enumerate(results.pose_landmarks.landmark):
                frame_data["pose"][j] = {"x": lm.x, "y": lm.y, "z": lm.z}
                
        baseline_data.append(frame_data)
        frame_count += 1
        
    cap.release()

    # Save the JSON baseline in the backend folder
    output_file = f"baseline_{i}.json"
    with open(output_file, 'w') as f:
        json.dump(baseline_data, f)
        
    print(f"Generated {output_file} from {i}.mp4 ({frame_count} frames)")
    success_count += 1

print(f"\nSuccess! Generated {success_count} baseline files.")
