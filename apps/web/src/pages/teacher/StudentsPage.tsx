import TopHeaderBar from "../../components/teacher/TopHeaderBar";
import Input from "../../components/Input ";
import StudentCard from "../../components/teacher/StudentCard";
import AddStudentDialog from "../../components/teacher/AddStudentDialog";
import { StudentsLoadingPage } from "../../components/teacher/loading-state/LoadingState";
import { Search } from "lucide-react";
import { useGetStudents } from "@/hooks/useStudents";
import { useMemo, useState } from "react";

export default function TeacherStudentsPage() {
  const { students, loading, error } = useGetStudents();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return students;
    }

    return students.filter((student) =>
      [
        student.name,
        student.student_code,
        student.student_number,
        student.grade_level,
      ].some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery, students]);

  if (loading) {
    return <StudentsLoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <TopHeaderBar />
      <section className="p-6">
        <div className="flex justify-between items-center">
          <h2 className="heading-2 text-(--black)">Student Roster</h2>
          <div className="flex gap-2">
            <Input
              leadingIcon={Search}
              placeholder="Search students..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search students"
            />
            <AddStudentDialog />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              id={student.id}
              name={student.name}
              color={student.color}
              emoji={student.emoji}
              grade_level={student.grade_level}
              student_number={student.student_number}
              student_code={student.student_code}
            />
          ))}
        </div>
        {filteredStudents.length === 0 && (
          <p className="mt-8 text-center paragraph-2 text-(--ghost)">
            No students found.
          </p>
        )}
      </section>
    </div>
  );
}
