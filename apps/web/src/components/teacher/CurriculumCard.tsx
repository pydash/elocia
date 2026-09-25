import type { Curriculum } from "@/interfaces/curriculum.interface";
import Separator from "../Separator";
import Button from "../Button";
import { Link } from "react-router-dom";

type CurriculumCardProps = {
  curriculum: Curriculum;
};

export default function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const isActive = curriculum.is_active;

  return (
    <article
      className={`flex min-h-52 flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:border-(--primary) hover:shadow-lg ${
        isActive
          ? "border-(--border) bg-(--white)"
          : "border-(--danger) bg-(--danger-light)"
      }`}
    >
      <div className="flex flex-col gap-3 p-4">
        <span className="w-fit rounded-full bg-(--gray-100) px-3 py-1 caption text-(--ghost)">
          Grade {curriculum.grade_level}
        </span>
        <h3 className="heading-3 text-(--black)">{curriculum.title}</h3>
        <p className="paragraph-2 leading-6 text-(--ghost)">
          {curriculum.description}
        </p>
        <Separator />
        <div className="self-end">
          <Link
            to={`/teacher/lessons/${curriculum.id}`}
            className="flex items-center gap-2"
          >
            <Button className="w-fit">
              <span>View Sections</span>
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
