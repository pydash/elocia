import { Link } from "react-router-dom";

import type { Curriculum } from "@/interfaces/curriculum.interface";

import Separator from "@/components/Separator";
import Button from "@/components/Button";
import EditCurriculumDialog from "@/components/teacher/EditCurriculumDialog";

type CurriculumCardProps = {
  curriculum: Curriculum;
};

export default function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const isActive = curriculum.is_active;

  return (
    <article
      className={`flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:border-(--primary) hover:shadow-lg ${
        isActive
          ? "border-(--border) bg-(--white)"
          : "border-(--danger) bg-(--danger-light)"
      }`}
    >
      <div className="flex h-full flex-col gap-3 p-4">
        <span className="w-fit rounded-full bg-(--gray-100) px-3 py-1 caption text-(--ghost)">
          Grade {curriculum.grade_level}
        </span>

        <h3 className="heading-3 text-(--black)">{curriculum.title}</h3>

        <p className="paragraph-2 line-clamp-2 min-h-8 leading-5! text-(--ghost)">
          {curriculum.description}
        </p>

        <Separator />

        <div className="flex justify-between">
          <Link
            to={`/teacher/lessons/curriculum/${curriculum.id}`}
            className="mt-auto flex items-center gap-2"
          >
            <Button className="w-full">
              <span>Open</span>
            </Button>
          </Link>
          <EditCurriculumDialog curriculum={curriculum} />
        </div>
      </div>
    </article>
  );
}
