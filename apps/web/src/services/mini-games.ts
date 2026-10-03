const API_BASE_URL = "http://localhost:8000";

import type {
  MiniGameConfig,
  SeeItSignItItem,
  PuzzleSignItem,
  MagicFingersItem
} from "@/interfaces/mini-game.interface";

export type CreateMiniGamePayload = {
  game_type: "see_it_sign_it" | "puzzle_sign" | "magic_fingers" | string;
  title: string;
  description?: string;
  difficulty?: number;
  // Optional legacy fields
  target_sign?: string;
  prompt_image?: string;
  reference_video_url?: string;
  hint_text?: string;
  options?: string;
  // Relational round items
  see_it_sign_it_items?: SeeItSignItItem[];
  puzzle_sign_items?: PuzzleSignItem[];
  magic_fingers_items?: MagicFingersItem[];
};

export type MediaUploadResponse = {
  status: string;
  type: "image" | "video";
  url: string;
};

/**
 * Upload an image or video asset for a mini-game.
 */
export async function uploadMiniGameMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/minigames/upload/media`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to upload media file");
  }

  return response.json() as Promise<MediaUploadResponse>;
}

/**
 * Create a new mini-game activity with its child items.
 */
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

/**
 * Fetch all mini-game configs (with optional game_type filter).
 */
export async function fetchMiniGames(gameType?: string): Promise<MiniGameConfig[]> {
  const url = gameType
    ? `${API_BASE_URL}/minigames/config?game_type=${encodeURIComponent(gameType)}`
    : `${API_BASE_URL}/minigames/config`;

  const response = await fetch(url, {
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

/**
 * Fetch a single mini-game configuration with all nested items.
 */
export async function fetchMiniGameDetails(configId: string): Promise<MiniGameConfig> {
  const response = await fetch(`${API_BASE_URL}/minigames/config/${configId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to fetch mini-game details");
  }

  return response.json() as Promise<MiniGameConfig>;
}
