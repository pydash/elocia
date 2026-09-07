import Avatar from "@/components/Avatar";
import { Pencil, GraduationCap } from "lucide-react";
import Button from "../Button";
import Separator from "../Separator";

type StudentBannerProps = {
  name: string;
  grade: string;
};

export default function StudentBanner({ name, grade }: StudentBannerProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border-t-6 border-(--primary) bg-(--white) p-6 shadow-md">
      <span className="w-fit px-3 py-2 bg-(--primary) rounded-lg paragraph-2 font-semibold! text-(--white)">
        Student's Profile
      </span>
      <Separator />
      <div className="flex items-center gap-4">
        <Avatar gender="male" />

        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="heading-2 text-(--black)">{name}</h2>
          <div className="flex items-center gap-2 text-(--ghost)">
            <GraduationCap className="size-6" />
            <p className="paragraph-2 text-(--ghost)">Grade {grade}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
