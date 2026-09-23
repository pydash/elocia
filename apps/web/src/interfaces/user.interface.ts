export interface User {
  id: string;
  name: string;
  role: "student" | "teacher" | "parent" | "admin";
  is_active: boolean;
  username?: string;
  password_hash?: string;
  created_at: string;
  updated_at: string;
}
