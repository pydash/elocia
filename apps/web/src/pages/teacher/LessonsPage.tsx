import { useState } from "react";

import { useGetLessonLibrary } from "@/hooks/useLessonLibrary";

import TopNavbar from "@/components/teacher/TopHeaderBar";
import LessonCard from "@/components/teacher/LessonCard";
import Input from "@/components/Input";
import MiniGameCard from "@/components/teacher/MiniGameCard";
import CurriculumCard from "@/components/teacher/CurriculumCard";
import AddCurriculumDialog from "@/components/teacher/AddCurriculumDialog";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import Separator from "@/components/Separator";
import EmptyState from "@/components/EmptyState";

import { Search } from "lucide-react";

import type { Curriculum } from "@/interfaces/curriculum.interface";
import type { EducationalVideo } from "@/interfaces/educational-video.interface";
import type { MiniGameConfig } from "@/interfaces/mini-game.interface";

const matchesSearch = (query: string, ...values: unknown[]) => {
  if (!query) return true;

  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(query),
  );
};

export default function TeacherLessonsPage() {
  const { curriculums, videos, miniGames, loading, error, refresh } =
    useGetLessonLibrary();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCurriculum = (curriculums ?? []).filter((curriculum) =>
    matchesSearch(normalizedQuery, [
      curriculum.title,
      curriculum.description,
      curriculum.grade_level,
    ]),
  );

  const filteredVideos = (videos ?? []).filter((video) =>
    matchesSearch(normalizedQuery, [
      video.title,
      video.description,
      video.subject,
    ]),
  );

  const filteredMiniGames = (miniGames ?? []).filter((game) =>
    matchesSearch(normalizedQuery, [
      game.title,
      game.game_type,
      game.target_sign,
      game.hint_text,
    ]),
  );

  const hasResults =
    filteredCurriculum.length > 0 ||
    filteredVideos.length > 0 ||
    filteredMiniGames.length > 0;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      <TopNavbar />

      <section className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex flex-col justify-between my-4 gap-2">
            <h1 className="heading-2 text-(--black)">Lesson Library</h1>
            <p className="paragraph-2 mt-1 text-(--ghost)">
              Manage your curriculum, educational videos, and mini games.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search curriculum, videos, or games..."
              leadingIcon={Search}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search curriculum, videos, or mini games"
            />
            <AddCurriculumDialog onCreated={refresh} />
          </div>
        </div>

        <Separator />

        {/* Lesson Cards */}
        <div className="mt-8 space-y-10">
          <div className="flex flex-col gap-3">
            <h2 className="heading-3 text-(--black)">Curriculum</h2>
            <div className="h-1 w-36 bg-(--primary) rounded-full" />
          </div>
          <div className="mt-4">
            {filteredCurriculum.length ? (
              <CurriculumCardList curriculums={filteredCurriculum} />
            ) : (
              <EmptyState title="No Curriculum Found" />
            )}
          </div>
        </div>

        {/* Video Content */}
        <div className="mt-12">
          <div className="flex flex-col gap-3">
            <h2 className="heading-3 text-(--black)">Educational Videos</h2>
            <div className="h-1 w-36 bg-(--primary) rounded-full" />
          </div>
          <div className="mt-4">
            {filteredVideos.length ? (
              <EducationalVideoCardList videos={filteredVideos} />
            ) : (
              <EmptyState title="No Educational Videos Found" />
            )}
          </div>
        </div>

        {/* Mini Games Content */}
        <div className="mt-12">
          <div className="w-fit flex flex-col gap-3">
            <h2 className="heading-3 text-(--black)">Mini Games</h2>
            <div className="h-1 w-full bg-(--primary) rounded-full" />
          </div>
          <div className="mt-4">
            {filteredMiniGames.length ? (
              <MiniGameCardList miniGames={filteredMiniGames} />
            ) : (
              <EmptyState title="No Mini Games Found" />
            )}
          </div>
        </div>
        {!hasResults && normalizedQuery && (
          <p className="mt-8 text-center paragraph-2 text-(--ghost)">
            No curriculum, videos, or mini games found.
          </p>
        )}
      </section>
    </div>
  );
}

function CurriculumCardList({ curriculums }: { curriculums: Curriculum[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {curriculums.map((curriculum) => (
        <CurriculumCard key={curriculum.id} curriculum={curriculum} />
      ))}
    </div>
  );
}

function EducationalVideoCardList({ videos }: { videos: EducationalVideo[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {videos.map((video) => (
        <LessonCard
          key={video.id}
          id={video.id}
          imageUrl={video.thumbnailUrl || "/path/to/image.jpg"}
          title={video.title}
          description={video.description || "Video description"}
          status="published"
          onEdit={() => {}}
          onToggleVisibility={() => {}}
        />
      ))}
    </div>
  );
}

function MiniGameCardList({ miniGames }: { miniGames: MiniGameConfig[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {miniGames.map((game) => (
        <MiniGameCard key={game.id} miniGame={game} />
      ))}
    </div>
  );
}
