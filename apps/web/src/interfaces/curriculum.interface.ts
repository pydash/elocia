export interface Curriculum {
  id: string;
  grade_level: number;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  curriculum_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  section_id: string;
  unit_number: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: number;
  stage_number: number;
  section_number: number;
  section_title: string;
  unit_number: number;
  unit_title: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  unit_id?: string;
}

export interface StageItem {
  globalId: number;
  name: string;
}
