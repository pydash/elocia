export interface Curriculum {
  id: string;
  grade_level: number;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface Section {
  id: number;
  curriculum_id: string;
  title: string;
  units: Unit[];
}

export interface Unit {
  id: number;
  section_id: string;
  title: string;
  stages: Stage[];
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
  items: StageItem[];
}

interface StageItem {
  globalId: number;
  name: string;
}
