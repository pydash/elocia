"use client";
import { useEffect, useState } from "react";
import { fetchCurriculums } from "@/services/curriculum";
import { fetchEducationalVideos } from "@/services/educational-videos";
import { fetchMiniGames } from "@/services/mini-games";
import type { Curriculum } from "@/interfaces/curriculum.interface";
import type { EducationalVideo } from "@/interfaces/educational-video.interface";
import type { MiniGameConfig } from "@/interfaces/mini-game.interface";

export function useGetLessonLibrary() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [videos, setVideos] = useState<EducationalVideo[]>([]);
  const [miniGames, setMiniGames] = useState<MiniGameConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getLessonLibrary = async () => {
    try {
      setLoading(true);
      setError(null);
      const curriculumData = await fetchCurriculums();
      const videosData = await fetchEducationalVideos();
      const miniGamesData = await fetchMiniGames();

      setCurriculums(curriculumData);
      setVideos(videosData);
      setMiniGames(miniGamesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLessonLibrary();
  }, []);

  return { curriculums, videos, miniGames, loading, error, refresh: getLessonLibrary };
}
