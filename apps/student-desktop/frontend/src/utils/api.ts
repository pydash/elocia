const API_BASE = 'http://127.0.0.1:8000';

export interface MiniGameConfigItem {
  id: string;
  game_type: string;
  title: string;
  target_sign: string;
  prompt_image: string | null;
  hint_text: string | null;
  options: string | null;
  difficulty: number;
}

export async function fetchMiniGameConfigs(gameType: string): Promise<MiniGameConfigItem[]> {
  try {
    const res = await fetch(`${API_BASE}/minigames/config/${gameType}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch mini-game configs (offline?):', err);
    return [];
  }
}

export async function saveMiniGameScore(payload: {
  student_id: string;
  game_type: string;
  score: number;
  streak: number;
  rounds_completed: number;
}) {
  try {
    await fetch(`${API_BASE}/minigames/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Mini-game score save failed (offline?):', err);
  }
}

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
