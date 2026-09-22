import { ArrowLeft } from "lucide-react";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { useGetClassRoster } from "@/hooks/useClasses";
import { Link, useParams } from "react-router-dom";
import Input from "@/components/Input ";
import EnrollStudentDialog from "@/components/teacher/EnrollStudentDialog";

export default function TeacherClassPage() {
  const { id } = useParams<{ id: string }>();
  const { roster, loading, error } = useGetClassRoster(id);

  if (loading) {
    return (
      <div>
        <TopHeaderBar />
        <main className="p-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-(--gray-100)" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl bg-(--gray-100)"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TopHeaderBar />
        <main className="p-6">
          <div
            className="rounded-2xl border border-(--danger) bg-(--danger-light) p-5 text-(--danger)"
            role="alert"
          >
            Error: {error}
          </div>
        </main>
      </div>
    );
  }

  if (!roster) {
    return (
      <div>
        <TopHeaderBar />
        <main className="p-6">
          <p className="rounded-2xl border border-(--border) bg-white p-6 text-(--ghost)">
            No roster data available.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopHeaderBar />
      <main className="bg-(--gray-50) p-6">
        <Link
          to=".."
          relative="path"
          aria-label="Back to classes"
          title="Back to classes"
          className="inline-flex size-10 items-center justify-center rounded-full bg-(--primary) text-white transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div className="flex items-center justify-between my-4">
          <div>
            <h1 className="mt-3 text-3xl font-bold text-(--black)">
              Class Roster
            </h1>
          </div>
          <div className="flex gap-4 items-center">
            <Input placeholder="Search students..." />
            {/* <AddStudentDialog /> */}
            <EnrollStudentDialog
              studentIds={roster.students.map((student) => student.id)}
            />
          </div>
        </div>

        {roster.students.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roster.students.map((student) => (
              <li
                key={student.id}
                className="rounded-2xl border border-(--border) bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-(--primary) hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex size-14 shrink-0 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: student.color }}
                  >
                    {student.emoji}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-(--black)">
                      {student.name}
                    </h2>
                    <p className="mt-1 text-sm text-(--ghost)">
                      Grade {student.grade_level}
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-(--border) pt-4 text-sm text-(--ghost)">
                  {student.student_code}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-(--border) bg-white px-6 py-12 text-center">
            <p className="text-lg font-semibold text-(--black)">
              No students in this class.
            </p>
            <p className="mt-2 text-(--ghost)">
              Students added to this class will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
