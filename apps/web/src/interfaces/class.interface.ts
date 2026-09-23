import type { Student } from "./student.interface";

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  grade_level: number;
  school_year: string;
  created_at: string;
}

export interface Roster {
  class_id: string;
  students: Student[];
}
