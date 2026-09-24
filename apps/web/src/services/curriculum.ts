import type { Curriculum } from "@/interfaces/curriculum.interface";

const API_BASE_URL = "http://localhost:8000";

export async function fetchCurriculums(): Promise<Curriculum[]> {
  const response: Response = await fetch(`${API_BASE_URL}/curriculums`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to fetch curriculums");
  }

  const data: Curriculum[] = await response.json();

  return data;
}
