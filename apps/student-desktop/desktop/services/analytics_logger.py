import os
import csv
import time
from datetime import datetime

LOGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs"))
CSV_FILE = os.path.join(LOGS_DIR, "system_analytics_log.csv")

CSV_HEADERS = [
    "timestamp",
    "student_id",
    "student_name",
    "activity_type",
    "stage_id",
    "stage_name",
    "attempt_number",
    "tier_level",
    "score_handshape",
    "score_palm_orientation",
    "score_location",
    "score_movement",
    "composite_score",
    "passed",
    "fps",
    "frames_processed",
    "latency_ms",
    "expert_benchmark_score",  # Column for SPED teachers to enter in Pearson's r calibration
    "expert_match_diff"
]

def init_analytics_log():
    """Ensure logs directory and CSV file with headers exist."""
    os.makedirs(LOGS_DIR, exist_ok=True)
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(CSV_HEADERS)

def log_evaluation_attempt(
    student_id: str,
    student_name: str,
    activity_type: str,
    stage_id: int,
    stage_name: str,
    attempt_number: int,
    tier_level: int,
    scores: dict,
    composite_score: float,
    passed: bool,
    fps: float,
    frames_processed: int,
    latency_ms: float
):
    """
    Append an evaluation attempt to the Automated System Analytics Log CSV.
    Matches the data collection tools in Chapter 3/4 of the Thesis Manuscript:
    - Phonological sub-scores (H, P, L, M)
    - Composite score S = (H*0.25 + P*0.25 + L*0.25 + M*0.25)
    - FPS and latency for Cross-Device Success Rate (CDSR)
    - Ready column for Expert Human Benchmark Sheet correlation (Pearson's r)
    """
    try:
        init_analytics_log()
        row = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            student_id or "anonymous",
            student_name or "Student",
            activity_type or "evaluation",
            stage_id,
            stage_name or f"Stage {stage_id}",
            attempt_number,
            tier_level,
            scores.get("handshape", 0),
            scores.get("palmOrientation", 0),
            scores.get("location", 0),
            scores.get("movement", 0),
            round(composite_score, 2),
            "PASS" if passed else "FAIL",
            round(fps, 1),
            frames_processed,
            round(latency_ms, 1),
            "",  # Blank for teacher to enter
            ""   # Blank for calculated difference
        ]
        with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(row)
        print(f"[AnalyticsLog] Attempt logged: {student_name} | Stage {stage_id} | Score: {composite_score:.1f}% | FPS: {fps:.1f}")
    except Exception as e:
        print(f"[AnalyticsLog] Error writing log: {e}")
