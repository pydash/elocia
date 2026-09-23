export interface ParentStudent {
  id: string;
  student_id: string;
  name: string;
  student_code?: string | null;
  student_number?: number | null;
  grade_level: number;
  color: string;
  emoji: string;
  relationship: string;
  total_xp: number;
  level: number;
  streak: number;
}

export interface ParentProgressSummary {
  student_id: string;
  student_name: string;
  level: number;
  streak: number;
  avg_score: number;
  total_practice_sessions: number;
  strengths: string[];
  areas_to_practice: string[];
  home_practice_recommendation: string;
}

export interface EvaluationAttemptItem {
  id: string;
  activity_type: string;
  stage_id?: number | null;
  stage_id_new?: number | null;
  sign_id?: number | null;
  score_overall: number;
  score_handshape: number;
  score_palm_orientation: number;
  score_location: number;
  score_movement: number;
  passed: boolean;
  created_at: string;
}

export interface ParameterMasteryItem {
  name: string;
  key: "handshape" | "palm_orientation" | "location" | "movement";
  value: number; // 0 to 100
}

export interface PerformanceTrendItem {
  label: string;
  score: number;
  isCurrent?: boolean;
}

export interface StagePathItem {
  stageNumber: number;
  title: string;
  status: "completed" | "current" | "locked";
  progressPercentage?: number;
}

export interface AchievementItem {
  id: string;
  name: string;
  description: string;
  iconType: "lightning" | "snake" | "medal" | "trophy";
  unlocked: boolean;
  color: "orange" | "green" | "gray";
}

