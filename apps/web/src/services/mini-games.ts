const API_BASE_URL = "http://localhost:8000";

export async function fetchMiniGames(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/minigames/config`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to fetch mini-games");
  }

  return response.json() as Promise<any[]>;
}
