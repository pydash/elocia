import { Link } from "react-router-dom";
import Button from "../../components/Button";
import TopHeaderBar from "../../components/teacher/TopHeaderBar";
import { Plus } from "lucide-react";

export default function TeacherTasksPage() {
  return (
    <div className="bg-(--primary-light) h-full">
      <TopHeaderBar variant="light" />

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10">
        <section className="flex flex-col items-center gap-6">
          <h1 className="mb-6 heading-2 text-(--primary) text-center">
            Choose a game, to create an activity
          </h1>

          <div className="w-full flex items-center justify-center gap-6">
            <Link
              to="/teacher/tasks/see-it-sign-it/step-1"
              className="w-full overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src="/games/see-it-sign-it.png"
                alt="See It Sign It game"
                className="h-44 w-full object-cover"
              />
            </Link>
            <Link
              to="/teacher/tasks/puzzle-sign/step-1"
              className="w-full overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src="/games/puzzle-sign.png"
                alt="Puzzle game"
                className="h-44 w-full object-cover"
              />
            </Link>
            <Link
              to="/teacher/tasks/magic-fingers/step-1"
              className="w-full overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src="/games/magic-fingers.png"
                alt="Magic Fingers game"
                className="h-44 w-full object-cover"
              />
            </Link>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6">
          <h1 className="mb-6 heading-2 text-(--primary) text-center">
            Upload videos for students to study lessons
          </h1>
          <Link to="/teacher/tasks/upload/step-1">
            <Button type="button" className="gap-2">
              Add Video
              <Plus size={20} />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
