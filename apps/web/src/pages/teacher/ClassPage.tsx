import { ArrowLeft } from "lucide-react";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { useGetClassRoster } from "@/hooks/useClasses";
import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import Input from "@/components/Input ";
import EnrollStudentDialog from "@/components/teacher/EnrollStudentDialog";
import StudentCard from "@/components/teacher/StudentCard";

export default function TeacherClassPage() {
  const { id } = useParams<{ id: string }>();
  const { roster, loading, error } = useGetClassRoster(id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const students = roster?.students ?? [];

    if (!normalizedQuery) {
      return students;
    }

    return students.filter((student) =>
      [
        student.name,
        student.student_code,
        student.student_number,
        student.grade_level,
      ].some((value) =>
        String(value).toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [roster, searchQuery]);

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
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search students"
            />
            <EnrollStudentDialog
              studentIds={roster.students.map((student) => student.id)}
            />
          </div>
        </div>

        {filteredStudents.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                id={student.id}
                name={student.name}
                color={student.color}
                emoji={student.emoji}
                grade_level={student.grade_level}
                student_code={student.student_code}
                student_number={student.student_number}
              />
            ))}
          </ul>
        ) : roster.students.length > 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border) bg-white px-6 py-12 text-center">
            <p className="text-lg font-semibold text-(--black)">
              No students match your search.
            </p>
            <p className="mt-2 text-(--ghost)">
              Try searching by name, student code, number, or grade.
            </p>
          </div>
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
