import { tokenManager } from "@/helpers/jwt";

const API_BASE_URL = "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  const token = tokenManager.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AdminUser {
  id: string;
  name: string;
  role: "admin" | "teacher" | "parent" | "student";
  username?: string;
  is_active: boolean;
  color?: string;
  emoji?: string;
  grade_level?: number;
  student_number?: number;
  student_code?: string;
  children_summary?: string;
  class_name?: string;
  level?: number;
  streak?: number;
  avg_score?: number;
  total_xp?: number;
  created_at: string;
}

export interface AdminSummaryMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
}

export interface CreateAdultPayload {
  name: string;
  username: string;
  password: string;
  role: "teacher" | "parent" | "admin";
}

export interface CreateStudentPayload {
  name: string;
  pin: string;
  grade_level: number;
  color?: string;
  emoji?: string;
  parent_id?: string;
}

export async function fetchAllUsers(role?: string): Promise<AdminUser[]> {
  const url = role
    ? `${API_BASE_URL}/users?role=${role}`
    : `${API_BASE_URL}/users`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function fetchAdminMetrics(): Promise<AdminSummaryMetrics> {
  try {
    const [students, teachers, parents, classroomsRes] = await Promise.all([
      fetchAllUsers("student"),
      fetchAllUsers("teacher"),
      fetchAllUsers("parent"),
      fetch(`${API_BASE_URL}/classrooms`, {
        headers: getAuthHeaders(),
      }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]);

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalParents: parents.length,
      totalClasses: Array.isArray(classroomsRes) ? classroomsRes.length : 0,
    };
  } catch (err) {
    console.error("Error fetching admin metrics:", err);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalParents: 0,
      totalClasses: 0,
    };
  }
}

export async function createAdultAccount(payload: CreateAdultPayload): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/users/adults`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Failed to create user account");
  }

  return response.json();
}

export async function createStudentAccount(payload: CreateStudentPayload): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/users/students`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Failed to create student account");
  }

  return response.json();
}

export async function deactivateUserAccount(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to deactivate user");
  }
}

export interface UpdateUserPayload {
  name?: string;
  password?: string;
  pin?: string;
  color?: string;
  emoji?: string;
  grade_level?: number;
  student_code?: string;
  is_active?: boolean;
}

export async function updateUserAccount(
  userId: string,
  payload: UpdateUserPayload
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Failed to update user account");
  }

  return response.json();
}

