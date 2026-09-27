from datetime import datetime, timezone, timedelta
from typing import Optional
from app.models.user import StudentProfile

# Philippine Standard Time (PST / PHT: UTC+8)
PHT = timezone(timedelta(hours=8))

def get_today_date():
    return datetime.now(PHT).date()

def get_effective_streak(profile: Optional[StudentProfile]) -> int:
    """
    Returns the student's active streak.
    If the student missed yesterday (last qualifying activity was before yesterday)
    or has no qualifying activity recorded, their active streak is 0.
    """
    if not profile or not profile.streak:
        return 0
    if not profile.last_streak_date:
        return 0
    today = get_today_date()
    yesterday = today - timedelta(days=1)
    if profile.last_streak_date >= yesterday:
        return profile.streak
    return 0

def record_streak_activity(profile: StudentProfile) -> int:
    """
    Called ONLY upon completing a qualifying activity:
    - Signing stage passed (Evaluation)
    - Completed a mini-game session
    - Passed a practice session
    
    Rules (as specified by adviser/requirements):
    - Login ONLY -> INVALID (does NOT call this)
    - Educational videos ONLY -> INVALID (does NOT call this)
    - If already completed an activity today: streak preserved (no double-incrementing on the same day).
    - If last qualifying activity was yesterday: streak increments by 1.
    - If last qualifying activity was before yesterday or None: streak resets to 1 (starts fresh today).
    """
    today = get_today_date()
    yesterday = today - timedelta(days=1)
    last = profile.last_streak_date

    if last == today:
        # Already signed or played today, keep streak active
        return profile.streak or 1
    elif last == yesterday:
        # Consecutive day streak!
        profile.streak = (profile.streak or 0) + 1
        profile.last_streak_date = today
    else:
        # Missed at least one day or first activity ever -> start streak at 1
        profile.streak = 1
        profile.last_streak_date = today

    return profile.streak
