import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useGetClassRoster } from "@/hooks/useClasses";

import { ArrowLeft } from "lucide-react";

import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import Input from "@/components/Input ";
import EnrollStudentDialog from "@/components/teacher/EnrollStudentDialog";
import StudentCard from "@/components/teacher/StudentCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function TeacherClassPage() {
  const { id } = useParams<{ id: string }>();
  const { roster, loading, error } = useGetClassRoster(id);
  const [searchQuery, setSearchQuery] = useState("");

  const students = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const rosterStudents = roster?.students ?? [];

    if (!normalizedQuery) {
      return rosterStudents;
    }

    return rosterStudents.filter((student) =>
      [
        student.name,
        student.student_code,
        student.student_number,
        student.grade_level,
      ].some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [roster, searchQuery]);

  if (loading) return <LoadingState />;

  if (error) return <ErrorState message={error} />;

  if (roster === null)
    return (
      <EmptyState
        title="No students found."
        message="Enroll students to this class."
      />
    );

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

        {students.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {students.map((student) => (
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
        ) : (
          <EmptyState
            title="No students found."
            message="Enroll students to this class."
          />
        )}
      </main>
    </div>
  );
}
