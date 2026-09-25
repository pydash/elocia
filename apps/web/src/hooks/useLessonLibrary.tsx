"use client";
import { useEffect, useState } from "react";
import { fetchCurriculum } from "@/services/curriculum";
import { fetchEducationalVideos } from "@/services/educational-videos";
import { fetchMiniGames } from "@/services/mini-games";
import type { Curriculum } from "@/interfaces/curriculum.interface";
import type { EducationalVideo } from "@/interfaces/educational-video.interface";
import type { MiniGameConfig } from "@/interfaces/mini-game.interface";

export function useGetLessonLibrary() {
  const [curriculum, setCurriculum] = useState<Curriculum>();
  const [videos, setVideos] = useState<EducationalVideo[]>([]);
  const [miniGames, setMiniGames] = useState<MiniGameConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLessonLibrary = async () => {
      try {
        const curriculumData = await fetchCurriculum();
        const videosData = await fetchEducationalVideos();
        const miniGamesData = await fetchMiniGames();

        setCurriculum(curriculumData);
        setVideos(videosData);
        setMiniGames(miniGamesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    getLessonLibrary();
  }, []);

  return { curriculum, videos, miniGames, loading, error };
}
