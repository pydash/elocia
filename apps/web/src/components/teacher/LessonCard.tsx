import { Eye, Pencil } from "lucide-react";
import Button from "../Button";
import Separator from "../Separator";
import { Link } from "react-router";

type LessonCardProps = {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  status: "published" | "drafted";
  onEdit?: () => void;
  onToggleVisibility?: () => void;
};

export default function LessonCard({
  id,
  imageUrl,
  title,
  description,
  onEdit,
}: LessonCardProps) {
  return (
    <Link to={`/teacher/lessons/${id}`}>
      <article className="overflow-hidden rounded-3xl border-3 border-(--border) bg-(--white) shadow-[0_6px_0_0_#BDC8D2]">
        <div className="aspect-video w-full overflow-hidden bg-(--surface)">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold! text-(--primary) heading-4">{title}</h2>
            <p className="paragraph-2 text-(--ghost)">{description}</p>
          </div>

          <Separator />

          <Button type="button" onClick={onEdit} className="gap-2 w-fit">
            <Pencil className="size-4" />
            <span>Edit</span>
          </Button>
        </div>
      </article>
    </Link>
  );
}
