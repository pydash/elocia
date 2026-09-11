import Button from "../Button";
import Avatar from "@/components/Avatar";
import { Link } from "react-router-dom";
import type { MouseEvent } from "react";

type StudentCardProps = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  grade_level: number;
  student_number: number;
  student_code: string;
  onResetPin?: () => void;
  onDeactivate?: () => void;
};

const onResetPin = (id: string) => {
  console.log(`Reset PIN for student with ID: ${id}`);
};

const onDeactivate = (id: string) => {
  console.log(`Deactivate student with ID: ${id}`);
};

export default function StudentCard({
  id,
  name,
  color,
  emoji,
  grade_level,
  student_number,
  student_code,
}: StudentCardProps) {
  return (
    <Link
      key={id}
      to={`/teacher/students/${encodeURIComponent(id)}`}
      className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-(--border) bg-white p-6 shadow-md transition-all hover:scale-101 hover:bg-(--gray-50)"
    >
      <Avatar emoji={emoji} color={color} />
      <div className="flex flex-col gap-0 items-center">
        <h3 className="heading-4 text-(--black)">{name}</h3>
        <div className="bg-(--info-light) p-2 rounded-full">
          <p className="caption text-(--ghost)">
            Grade {grade_level} | Student No: {student_number}
          </p>
        </div>
      </div>
      <p className="paragraph-2 text-(--ghost)">
        <strong>Student Code:</strong> {student_code}
      </p>
      <div className="flex w-full items-center justify-around gap-3">
        <Button
          className="whitespace-nowrap rounded-full! px-3!"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onResetPin?.(id);
          }}
        >
          Reset PIN
        </Button>
        <Button
          className="whitespace-nowrap rounded-full! px-3!"
          variant="destructive"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onDeactivate?.(id);
          }}
        >
          Deactivate
        </Button>
      </div>
    </Link>
  );
}
