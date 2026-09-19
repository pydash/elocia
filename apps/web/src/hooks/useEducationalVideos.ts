import { useState } from "react";
import {
  createEducationalVideo,
  type CreateEducationalVideoPayload,
} from "@/services/educational-videos";

export function useCreateEducationalVideo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (payload: CreateEducationalVideoPayload) => {
    setLoading(true);
    setError(null);

    try {
      return await createEducationalVideo(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload educational video";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadVideo, loading, error };
}
