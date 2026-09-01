import cv2
import numpy as np

# Load OpenCV's face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def analyze_camera_frame(frame):
    """
    Evaluates upper-body framing with automatic low-light compensation.
    Tuple-safe version.
    """
    if frame is None:
        return "not-detected", "No camera feed received!"

    h, w, _ = frame.shape
    
    # 1. Low-Light Compensation Pipeline
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
    
    # FIX: Unpack the tuple safely into individual color channels
    y, cr, cb = cv2.split(ycrcb)
    
    # Apply CLAHE to the Brightness (Y) channel only
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    y_enhanced = clahe.apply(y)
    
    # Safely merge the newly enhanced Y channel with the old Cr and Cb channels
    enhanced_ycrcb = cv2.merge((y_enhanced, cr, cb))
    enhanced_bgr = cv2.cvtColor(enhanced_ycrcb, cv2.COLOR_YCrCb2BGR)
    gray = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2GRAY)

    # 2. Detect faces using the enhanced image
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=3,
        minSize=(25, 25)
    )

    if len(faces) == 0:
        return "not-detected", "Dim light detected: Please center your face in the guide!"

    # Find the primary face
    (fx, fy, fw, fh) = max(faces, key=lambda f: f[2] * f[3])
    face_ratio = fw / float(w)
    face_center_x = (fx + fw / 2.0) / float(w)

    # 3. Distance & Framing Validations
    if face_ratio > 0.42 or fy < int(h * 0.02):
        return "too-close", "Step back a bit so your upper body fits!"

    if face_ratio < 0.07:
        return "too-far", "Step closer to the camera!"

    if face_center_x < 0.20 or face_center_x > 0.80:
        return "too-far", "Center your body in the frame!"

    return "perfect", "Framing & Lighting Verified! Click Start."