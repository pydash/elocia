import TopHeaderBar from "../../components/teacher/TopHeaderBar";
import Input from "../../components/Input ";
import StudentCard from "../../components/teacher/StudentCard";
import AddStudentDialog from "../../components/teacher/AddStudentDialog";
import { Search } from "lucide-react";
import { useGetStudents } from "@/hooks/useStudents";

export default function TeacherStudentsPage() {
  const { students, loading, error } = useGetStudents();

  if (loading) {
    return <div>Loading...</div>;
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
            <Input leadingIcon={Search} placeholder="Search students..." />
            <AddStudentDialog
              onSave={(newStudent) =>
                console.log("New student added:", newStudent)
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {students.map((student) => (
            <StudentCard
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
      </section>
    </div>
  );
}
