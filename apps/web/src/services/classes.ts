import { getIdFromToken, tokenManager } from "@/helpers/jwt";
import type { Class } from "@/interfaces/class.interface";

const API_BASE_URL = "http://localhost:8000";

export async function fetchTeacherClasses(): Promise<Class[]> {
  const token = tokenManager.getAccessToken();
  if (!token) {
    throw new Error("No access token found");
  }
  const response = await fetch(
    `${API_BASE_URL}/classes/?teacher_id=${getIdFromToken(token)}`,
  );
  if (!response.ok) {
    throw new Error(`Error fetching classes: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
