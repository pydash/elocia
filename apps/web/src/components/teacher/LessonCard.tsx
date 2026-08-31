import { Eye, Pencil } from "lucide-react";
import Button from "../Button";

type LessonCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  status: "published" | "drafted";
  onEdit?: () => void;
  onToggleVisibility?: () => void;
};

export default function LessonCard({
  imageUrl,
  title,
  description,
  status,
  onEdit,
  onToggleVisibility,
}: LessonCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border-3 border-(--border) bg-(--white) shadow-[0_6px_0_0_#BDC8D2]">
      <div className="aspect-video w-full overflow-hidden bg-(--surface)">
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-col gap-4 p-6">
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            status === "published"
              ? "bg-(--success-light) text-(--success)"
              : "bg-(--gray-100) text-(--ghost)"
          }`}
        >
          {status}
        </span>

        <div className="flex flex-col gap-2">
          <h2 className="heading-4 text-(--black)">{title}</h2>
          <p className="paragraph-2 text-(--ghost)">{description}</p>
        </div>

        <div className="h-px w-full bg-(--border)" aria-hidden="true" />

        <div className="flex items-center justify-between gap-3">
          <Button type="button" onClick={onEdit} className="gap-2">
            <Pencil className="size-4" />
            <span>Edit</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onToggleVisibility}
            className=""
            aria-label={`${status === "published" ? "Hide" : "Publish"} lesson`}
            title={`${status === "published" ? "Hide" : "Publish"} lesson`}
          >
            <Eye className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
