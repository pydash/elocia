import { Link } from "react-router-dom";
import TopNavbar from "../../components/teacher/TopHeaderBar";
import LessonCard from "../../components/teacher/LessonCard";
import Input from "../../components/Input ";
import Button from "../../components/Button";
import { Search, SquareLibrary, Plus } from "lucide-react";
import { useGetLessonLibrary } from "@/hooks/useLessonLibrary";
import MiniGameCard from "@/components/teacher/MiniGameCard";
import { useMemo, useState } from "react";

const matchesSearch = (query: string, values: unknown[]) =>
  !query ||
  values.some((value) =>
    String(value ?? "").toLowerCase().includes(query),
  );

export default function TeacherLessonsPage() {
  const { curriculum, videos, miniGames, loading, error } =
    useGetLessonLibrary();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSections = useMemo(
    () =>
      curriculum?.sections
        .map((section) => ({
          ...section,
          units: section.units
            .map((unit) => ({
              ...unit,
              stages: unit.stages.filter((stage) =>
                matchesSearch(normalizedQuery, [
                  section.title,
                  unit.title,
                  stage.title,
                  stage.description,
                  ...stage.items.map((item) => item.name),
                ]),
              ),
            }))
            .filter((unit) => unit.stages.length > 0),
        }))
        .filter((section) => section.units.length > 0) ?? [],
    [curriculum, normalizedQuery],
  );

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) =>
        matchesSearch(normalizedQuery, [
          video.title,
          video.description,
          video.subject,
        ]),
      ),
    [videos, normalizedQuery],
  );

  const filteredMiniGames = useMemo(
    () =>
      miniGames.filter((game) =>
        matchesSearch(normalizedQuery, [
          game.title,
          game.game_type,
          game.target_sign,
          game.hint_text,
        ]),
      ),
    [miniGames, normalizedQuery],
  );

  const hasResults =
    filteredSections.length > 0 ||
    filteredVideos.length > 0 ||
    filteredMiniGames.length > 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <TopNavbar />

      <section className="p-6">
        <div className="flex gap-2 items-center text-(--info)">
          <SquareLibrary />
          <p className="uppercase paragraph-2">Curriculum</p>
        </div>
        <div>
          <h1 className="heading-2 text-(--black)">Lesson Library</h1>
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="flex w-1/2 items-center gap-4">
            <Input
              placeholder="Search curriculum, videos, or games..."
              leadingIcon={Search}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search curriculum, videos, or mini games"
            />
          </div>

          <div>
            <Link
              to="/teacher/lessons/new/step-1"
              className="flex items-center gap-2"
            >
              <Button variant="default" className="gap-2">
                <Plus />
                <span>Add new stage</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Lesson Cards */}
        <div className="mt-8 space-y-10">
          <div className="flex items-center justify-center gap-4 bg-(--primary) p-4 rounded-2xl">
            <h2 className="heading-3 text-center text-(--white)">
              Curriculum Lessons
            </h2>
          </div>
          {filteredSections?.map((section) => (
            <section key={section.id} className="space-y-6">
              <div className="space-y-8">
                {section.units.map((unit) => (
                  <div key={unit.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-1 rounded-full bg-(--info)" />
                      <h3 className="heading-3">{unit.title}</h3>
                    </div>
                    <div className="grid gap-6 grid-cols-4">
                      {unit.stages.map((stage) => (
                        <div key={stage.id}>
                          <LessonCard
                            id={stage.id}
                            imageUrl="/path/to/image.jpg"
                            title={stage.title}
                            description={
                              stage.description || "Lesson description"
                            }
                            status="published"
                            onEdit={() => {}}
                            onToggleVisibility={() => {}}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Video Content */}
        <div className="mt-12">
          <div className="flex items-center justify-center gap-4 bg-(--primary) p-4 rounded-2xl">
            <h2 className="heading-3 text-center text-(--white)">
              Educational Videos
            </h2>
          </div>
          <div className="grid gap-6 grid-cols-4 mt-8">
            {filteredVideos.length ? (
              filteredVideos.map((video) => (
                <div key={video.id}>
                  <LessonCard
                    id={video.id}
                    imageUrl={video.thumbnailUrl || "/path/to/image.jpg"}
                    title={video.title}
                    description={video.description || "Video description"}
                    status="published"
                    onEdit={() => {}}
                    onToggleVisibility={() => {}}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-(--gray)">No videos available.</p>
            )}
          </div>
        </div>

        {/* Mini Games Content */}
        <div className="mt-12">
          <div className="flex items-center justify-center gap-4 bg-(--primary) p-4 rounded-2xl">
            <h2 className="heading-3 text-center text-(--white)">Mini Games</h2>
          </div>
          <div className="grid gap-6 grid-cols-4 mt-8">
            {filteredMiniGames.length ? (
              filteredMiniGames.map((game) => (
                <div key={game.id}>
                  <MiniGameCard miniGame={game} />
                </div>
              ))
            ) : (
              <p className="text-center text-(--gray)">
                No mini games available.
              </p>
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
