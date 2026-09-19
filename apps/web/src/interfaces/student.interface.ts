export interface Student {
  id: string;
  name: string;
  color: string;
  emoji: string;
  grade_level: number;
  student_number: number;
  student_code: string;
  is_active?: boolean;
  level: number;
  streak: number;
  avg_score: number;
  signs_mastered: number;
  stages_complete: number;
  total_xp: number;
  created_at: string;
}
