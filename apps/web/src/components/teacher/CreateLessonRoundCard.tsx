import { Clapperboard, Flag, ImagePlus } from "lucide-react";

type CreateLessonRoundCardProps = {
  roundNumber: number;
  onObjectiveImageChange?: (file: File | undefined) => void;
  onMediaChange?: (file: File | undefined) => void;
};

export default function CreateLessonRoundCard({
  roundNumber,
  onObjectiveImageChange,
  onMediaChange,
}: CreateLessonRoundCardProps) {
  return (
    <section className="rounded-[2.5rem] border border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2] md:p-10">
      <h1 className="heading-2 text-(--black)">Round {roundNumber}</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
        <div className="flex flex-col gap-6 md:col-span-1 md:border-r md:border-(--border) md:pr-10">
          <div className="flex items-center gap-3">
            <Flag className="size-7 text-(--black)" />
            <h2 className="heading-3 text-(--black)">Round Objective</h2>
          </div>

          <label
            htmlFor="round-objective-image"
            className="flex min-h-60 cursor-pointer flex-col items-center justify-center gap-4 rounded-4xl border-2 border-dashed border-(--primary) bg-(--primary-light) p-6 text-center transition-colors hover:bg-(--primary-500)"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-(--primary) text-white">
              <ImagePlus className="size-7" />
            </span>
            <span className="paragraph-2 font-semibold text-(--primary)">
              Click to upload or drag & drop
            </span>
            <span className="caption text-(--ghost)">
              PNG, JPG up to 10MB (16:9 recommended)
            </span>
            <input
              id="round-objective-image"
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={(event) =>
                onObjectiveImageChange?.(event.target.files?.[0])
              }
            />
          </label>

          <textarea
            aria-label="What image is this?"
            placeholder="What image is this"
            className="paragraph-1 min-h-30 resize-none rounded-xl border-2 border-(--border) bg-(--gray-50) px-6 py-5 text-(--ghost) outline-none focus:border-(--primary)"
          />
        </div>

        <div className="flex flex-col gap-6 md:col-span-2">
          <div className="flex items-center gap-3">
            <Clapperboard className="size-7 text-(--black)" />
            <h2 className="heading-3 text-(--black)">Instructional Media</h2>
          </div>

          <label
            htmlFor="instructional-media"
            className="flex min-h-60 cursor-pointer flex-col items-center justify-center gap-4 rounded-4xl border-2 border-dashed border-(--primary) bg-(--primary-light) p-6 text-center transition-colors hover:bg-(--primary-500)"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-(--primary) text-white">
              <ImagePlus className="size-7" />
            </span>
            <span className="paragraph-2 font-semibold text-(--primary)">
              Click to upload or drag & drop
            </span>
            <span className="caption text-(--ghost)">
              PNG, JPG up to 10MB (16:9 recommended)
            </span>
            <input
              id="instructional-media"
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={(event) => onMediaChange?.(event.target.files?.[0])}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
