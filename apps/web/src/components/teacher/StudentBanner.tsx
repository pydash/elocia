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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border-t-4 border-(--primary) bg-(--white) p-4 sm:p-6 shadow-md">
      <div className="flex items-center gap-4 min-w-0">
        <Avatar emoji={student.emoji} color={student.color} />

        <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
          <h2 className="heading-2 text-(--black) truncate">{student.name}</h2>
          <div className="flex items-center gap-2 text-(--ghost)">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <p className="paragraph-2 text-(--ghost)">
              Grade {student.grade_level}
            </p>
          </div>
        </div>
      </div>

      <div className="self-end sm:self-auto">
        <EditStudentDialog student={student} onSave={onSave} />
      </div>
    </div>
  );
}
