import TopHeaderBar from "../../components/teacher/TopHeaderBar";
import Input from "../../components/Input ";
import Button from "../../components/Button";
import StudentCard from "../../components/teacher/StudentCard";
import AddStudentDialog from "../../components/teacher/AddStudentDialog";
import { Search } from "lucide-react";

const students = [
  {
    name: "John Doe",
    grade: "10",
    username: "johndoe",
    gender: "male",
  },
  {
    name: "Jane Smith",
    grade: "11",
    username: "janesmith",
    gender: "female",
  },
  {
    name: "Alex Johnson",
    grade: "9",
    username: "alexjohnson",
    gender: "other",
  },
  {
    name: "Sarah Williams",
    grade: "12",
    username: "sarahwilliams",
    gender: "female",
  },
];

const onResetPin = (username: string) => {
  console.log(`Resetting PIN for ${username}`);
};

const onDeactivate = (username: string) => {
  console.log(`Deactivating account for ${username}`);
};

export default function TeacherStudentsPage() {
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
              key={student.username}
              name={student.name}
              grade={student.grade}
              username={student.username}
              onResetPin={() => onResetPin(student.username)}
              onDeactivate={() => onDeactivate(student.username)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
