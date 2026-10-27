import os
import csv
import time
from datetime import datetime

LOGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs"))
CSV_FILE = os.path.join(LOGS_DIR, "system_analytics_log.csv")

# Root directories of the repository for easy access by SPED teachers (root folder and repo root)
ROOT_DIR_PARENT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".."))
ROOT_DIR_REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
HUMAN_BENCHMARK_SHEETS = [
    os.path.join(ROOT_DIR_PARENT, "Human_Benchmark_Evaluation_Sheet.csv"),
    os.path.join(ROOT_DIR_REPO, "Human_Benchmark_Evaluation_Sheet.csv")
]
HUMAN_BENCHMARK_SHEET = HUMAN_BENCHMARK_SHEETS[0]

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

BENCHMARK_SHEET_HEADERS = [
    "Row_No",
    "Timestamp",
    "Student_Name",
    "Activity",
    "Target_Sign",
    "Attempt_No",
    "Tier",
    "Handshape_H",
    "Palm_Orientation_P",
    "Location_L",
    "Movement_M",
    "ELOCIA_AI_Score",
    "System_Result",
    "HUMAN_BENCHMARK_SCORE",  # <-- SPED teacher inputs 0-100 score here
    "Score_Difference",       # <-- |ELOCIA_AI_Score - HUMAN_BENCHMARK_SCORE|
    "Teacher_Evaluator_Notes"
]

def format_activity_name(act: str) -> str:
    m = {
        "evaluation": "Lesson Evaluation",
        "practice": "Lesson Practice",
        "puzzle_sign": "Puzzle Sign",
        "see_it_sign_it": "See It Sign It",
        "magic_fingers": "Magic Fingers",
        "lessons": "Lesson Proper"
    }
    return m.get(act, str(act).replace("_", " ").title())

def init_analytics_log():
    """Ensure logs directory and CSV files with headers exist."""
    os.makedirs(LOGS_DIR, exist_ok=True)
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(CSV_HEADERS)
    
    if not os.path.exists(HUMAN_BENCHMARK_SHEET):
        export_clean_benchmark_sheet()

def export_clean_benchmark_sheet():
    """
    Exports a clean, teacher-friendly Human Benchmark Evaluation Sheet.
    Preserves any existing teacher scores while cleaning up formatting.
    """
    existing_scores = {}
    if os.path.exists(HUMAN_BENCHMARK_SHEET):
        try:
            with open(HUMAN_BENCHMARK_SHEET, mode="r", encoding="utf-8", errors="ignore") as f:
                r = csv.DictReader(f)
                for row in r:
                    key = (row.get("Timestamp", ""), row.get("Student_Name", ""), row.get("Target_Sign", ""))
                    score = row.get("HUMAN_BENCHMARK_SCORE", "").strip()
                    notes = row.get("Teacher_Evaluator_Notes", "").strip()
                    if score or notes:
                        existing_scores[key] = (score, notes)
        except Exception:
            pass

    if not os.path.exists(CSV_FILE):
        with open(HUMAN_BENCHMARK_SHEET, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(BENCHMARK_SHEET_HEADERS)
        return

    with open(CSV_FILE, mode="r", encoding="utf-8", errors="ignore") as f:
        r = csv.DictReader(f)
        raw_rows = list(r)

    with open(HUMAN_BENCHMARK_SHEET, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(BENCHMARK_SHEET_HEADERS)
        for idx, row in enumerate(raw_rows, 1):
            ts = row.get("timestamp", "")
            s_name = row.get("student_name", "Student")
            act = format_activity_name(row.get("activity_type", "evaluation"))
            s_sign = row.get("stage_name", "")
            comp = row.get("composite_score", "0")

            key = (ts, s_name, s_sign)
            human_score, notes = existing_scores.get(key, ("", ""))

            # Calculate difference if human score entered
            diff_str = ""
            if human_score:
                try:
                    diff_str = str(round(abs(float(comp) - float(human_score)), 2))
                except Exception:
                    diff_str = ""

            writer.writerow([
                idx,
                ts,
                s_name,
                act,
                s_sign,
                row.get("attempt_number", 1),
                row.get("tier_level", 1),
                row.get("score_handshape", 0),
                row.get("score_palm_orientation", 0),
                row.get("score_location", 0),
                row.get("score_movement", 0),
                comp,
                row.get("passed", "FAIL"),
                human_score,
                diff_str,
                notes
            ])

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
    Also appends to the teacher-friendly Human Benchmark Evaluation Sheet.
    """
    try:
        init_analytics_log()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        clean_student = student_name if student_name and student_name not in ["anonymous", ""] else "Student"
        clean_sign = stage_name or f"Stage {stage_id}"
        comp_round = round(composite_score, 2)
        pass_str = "PASS" if passed else "FAIL"

        # 1. Log to system analytics log
        raw_row = [
            now_str,
            student_id or "anonymous",
            clean_student,
            activity_type or "evaluation",
            stage_id,
            clean_sign,
            attempt_number,
            tier_level,
            scores.get("handshape", 0),
            scores.get("palmOrientation", 0),
            scores.get("location", 0),
            scores.get("movement", 0),
            comp_round,
            pass_str,
            round(fps, 1),
            frames_processed,
            round(latency_ms, 1),
            "",  # Blank for teacher to enter
            ""   # Blank for calculated difference
        ]
        with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(raw_row)

        # 2. Also append row to the clean teacher Human Benchmark Sheet
        try:
            # Count current rows for Row_No
            current_row_count = 1
            if os.path.exists(HUMAN_BENCHMARK_SHEET):
                with open(HUMAN_BENCHMARK_SHEET, "r", encoding="utf-8", errors="ignore") as f:
                    current_row_count = sum(1 for _ in f)

            teacher_row = [
                current_row_count,
                now_str,
                clean_student,
                format_activity_name(activity_type),
                clean_sign,
                attempt_number,
                tier_level,
                scores.get("handshape", 0),
                scores.get("palmOrientation", 0),
                scores.get("location", 0),
                scores.get("movement", 0),
                comp_round,
                pass_str,
                "",  # Blank for teacher to enter
                "",  # Difference
                ""   # Notes
            ]
            for sheet_path in HUMAN_BENCHMARK_SHEETS:
                try:
                    with open(sheet_path, mode="a", newline="", encoding="utf-8") as f:
                        writer = csv.writer(f)
                        writer.writerow(teacher_row)
                except Exception as e_s:
                    print(f"[AnalyticsLog] Sheet sync note ({sheet_path}): {e_s}")
        except Exception as e_sheet:
            print(f"[AnalyticsLog] Sheet sync note: {e_sheet}")

        print(f"[AnalyticsLog] Attempt logged: {clean_student} | {clean_sign} | Score: {comp_round}% | FPS: {fps:.1f}")
    except Exception as e:
        print(f"[AnalyticsLog] Error writing log: {e}")
