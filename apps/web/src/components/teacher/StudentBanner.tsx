import { GraduationCap } from "lucide-react";
import Avatar from "../Avatar";
import EditStudentDialog from "./EditStudentDialog";
import type { Student } from "@/interfaces/student.interface";
import type { UpdateStudentPayload } from "@/services/students";

type StudentBannerProps = {
  student: Student;
  onSave: (payload: UpdateStudentPayload) => Promise<unknown>;
};

export default function StudentBanner({ student, onSave }: StudentBannerProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border-t-4 border-(--primary) bg-(--white) p-6 shadow-md">
      <Avatar emoji={student.emoji} color={student.color} />

      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="heading-2 text-(--black)">{student.name}</h2>
        <div className="flex items-center gap-2 text-(--ghost)">
          <GraduationCap />
          <p className="paragraph-2 text-(--ghost)">
            Grade {student.grade_level}
          </p>
        </div>
      </div>

      <EditStudentDialog student={student} onSave={onSave} />
    </div>
  );
}
