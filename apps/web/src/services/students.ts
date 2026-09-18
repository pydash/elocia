import type { Student } from "@/interfaces/student.interface";

const API_BASE_URL = "http://localhost:8000";

export type CreateStudentPayload = {
  name: string;
  pin: string;
  color?: string;
  emoji?: string;
  grade_level?: number;
  parent_id?: string;
};

export type UpdateStudentPayload = {
  name?: string;
  pin?: string;
  color?: string;
  emoji?: string;
  grade_level?: number;
  student_code?: string;
  is_active?: boolean;
};

export async function fetchStudents(): Promise<Student[]> {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to fetch students");
  }

  const data = await response.json();
  return data;
}

export async function createStudent(
  payload: CreateStudentPayload,
): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/users/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to create student");
  }

  return response.json();
}

export async function fetchStudentById(id: string): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? `Failed to fetch student with ID: ${id}`);
  }

  const data = await response.json();
  return data;
}

export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? `Failed to update student with ID: ${id}`);
  }

  return response.json();
}
