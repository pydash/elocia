import type { EducationalVideo } from "@/interfaces/educational-video.interface";

const API_BASE_URL = "http://localhost:8000";

export type CreateEducationalVideoPayload = {
  title: string;
  description: string;
  subject: string;
  grade_level: number;
  duration_minutes: number;
  video_url: string;
  thumbnail_url: string;
  created_by?: string;
};

export async function createEducationalVideo(
  payload: CreateEducationalVideoPayload,
): Promise<EducationalVideo> {
  const response = await fetch(`${API_BASE_URL}/educational-videos/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to upload educational video");
  }

  return response.json();
}

export async function fetchEducationalVideos(): Promise<EducationalVideo[]> {
  const response = await fetch(`${API_BASE_URL}/educational-videos/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to fetch educational videos");
  }

  return response.json() as Promise<EducationalVideo[]>;
}

export async function uploadBaselineVideo(payload: {
  sign_name: string;
  grade_level: number;
  description?: string;
  video: File;
}): Promise<any> {
  const formData = new FormData();
  formData.append("sign_name", payload.sign_name);
  formData.append("grade_level", String(payload.grade_level));
  if (payload.description) {
    formData.append("description", payload.description);
  }
  formData.append("video", payload.video);

  const response = await fetch(`${API_BASE_URL}/baselines/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to upload video for evaluation");
  }

  return response.json();
}
