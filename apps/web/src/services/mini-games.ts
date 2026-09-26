const API_BASE_URL = "http://localhost:8000";

import type { MiniGameConfig } from "@/interfaces/mini-game.interface";

export type CreateMiniGamePayload = {
  game_type: "see_it_sign_it" | "puzzle_sign" | "magic_fingers";
  title: string;
  target_sign: string;
  prompt_image: string;
  hint_text: string;
  options: string;
  difficulty: number;
};

export async function createMiniGame(
  payload: CreateMiniGamePayload,
): Promise<MiniGameConfig> {
  const response = await fetch(`${API_BASE_URL}/minigames/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to create mini-game");
  }

  return response.json() as Promise<MiniGameConfig>;
}

export async function fetchMiniGames(): Promise<MiniGameConfig[]> {
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

  return response.json() as Promise<MiniGameConfig[]>;
}
