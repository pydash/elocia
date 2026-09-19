import type { Curriculum } from "@/interfaces/curriculum.interface";

const API_BASE_URL = "http://localhost:8000";

export async function fetchCurriculum(): Promise<Curriculum> {
  const response = await fetch(`${API_BASE_URL}/curriculum`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to fetch curriculum");
  }

  return response.json() as Promise<Curriculum>;
}
