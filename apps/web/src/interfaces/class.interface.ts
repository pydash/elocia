import type { Student } from "./student.interface";

export interface Class {
  id: string;
  teacher_id: string;
  teacher_name?: string;
  name: string;
  grade_level: number;
  school_year: string;
  student_count?: number;
  created_at: string;
}

export interface Roster {
  class_id: string;
  students: Student[];
}
