import { Pencil, GraduationCap } from "lucide-react";
import Button from "../Button";

type StudentBannerProps = {
  name: string;
  grade: string;
};

export default function StudentBanner({ name, grade }: StudentBannerProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border-t-4 border-(--primary) bg-(--white) p-6 shadow-md">
      <div
        className="flex size-24 shrink-0 items-center justify-center rounded-full bg-(--primary) text-white"
        aria-label={`${name} avatar`}
      >
        <span className="text-2xl font-bold">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="heading-2 text-(--black)">{name}</h2>
        <div className="flex items-center gap-2 text-(--ghost)">
          <GraduationCap />
          <p className="paragraph-2 text-(--ghost)">Grade {grade}</p>
        </div>
      </div>

      <Button variant="default" className="shrink-0 gap-2">
        <Pencil className="size-4" />
        <span>Edit Profile</span>
      </Button>
    </div>
  );
}
