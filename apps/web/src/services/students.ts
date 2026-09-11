import type { Student } from "@/interfaces/student.interface";

const API_BASE_URL = "http://localhost:8000";

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

const students = await fetchStudents();
console.log(students);
