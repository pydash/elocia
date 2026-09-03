const API_BASE = 'http://127.0.0.1:8000';
export async function saveScore(payload: {
  student_id: string;
  activity_type: string;
  stage_id: number;
  attempt_number: number;
  tier_level: number;
  score_handshape: number;
  score_palm_orientation: number;
  score_location: number;
  score_movement: number;
  score_overall: number;
  passed: boolean;
  streak?: number;
  xp_earned?: number;
}) {
  try {
    const params = new URLSearchParams({
      student_id: payload.student_id,
      activity_type: payload.activity_type,
      stage_id: String(payload.stage_id),
      attempt_number: String(payload.attempt_number),
      tier_level: String(payload.tier_level),
      score_handshape: String(payload.score_handshape),
      score_palm_orientation: String(payload.score_palm_orientation),
      score_location: String(payload.score_location),
      score_movement: String(payload.score_movement),
      score_overall: String(payload.score_overall),
      passed: String(payload.passed),
      streak: String(payload.streak ?? 0),
      xp_earned: String(payload.xp_earned ?? 0),
    });
    await fetch(`${API_BASE}/scores/save?${params}`, { method: 'POST' });
  } catch (err) {
    console.warn('Score save failed (offline?):', err);
  }
}

