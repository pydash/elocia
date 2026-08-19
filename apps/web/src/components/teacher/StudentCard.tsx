import Button from "../Button";
import { Link } from "react-router-dom";
import type { MouseEvent } from "react";

type StudentCardProps = {
  name: string;
  grade: string;
  username: string;
  gender: "male" | "female" | "other";
  onResetPin?: () => void;
  onDeactivate?: () => void;
};

export default function StudentCard({
  name,
  grade,
  username,
  gender,
  onResetPin,
  onDeactivate,
}: StudentCardProps) {
  return (
    <Link
      to={`/teacher/students/${encodeURIComponent(name)}`}
      className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-(--border) bg-white p-6 shadow-md transition-all hover:scale-101 hover:bg-(--gray-50)"
    >
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-(--primary) text-white"
        aria-label={`${gender} student`}
      >
        <span className="text-2xl font-bold">A</span>
      </div>
      <div className="flex flex-col gap-0 items-center">
        <h3 className="heading-4 text-(--black)">{name}</h3>
        <div className="bg-(--info-light) p-3 rounded-full">
          <p className="paragraph-2 text-(--ghost) font-bold!">Grade {grade}</p>
        </div>
      </div>
      <p className="paragraph-2 text-(--ghost)">
        <strong>Username:</strong> {username}
      </p>
      <div className="flex w-full items-center justify-around gap-3">
        <Button
          className="whitespace-nowrap rounded-full! px-3!"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onResetPin?.();
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
            onDeactivate?.();
          }}
        >
          Deactivate
        </Button>
      </div>
    </Link>
  );
}
