import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import Input from "../../components/Input ";
import CreateLessonRoundCard from "../../components/teacher/CreateLessonRoundCard";
import {
  ImagePlus,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  X,
  Clock3,
  Star,
  Save,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import Separator from "../../components/Separator";
import StepIndicator from "../../components/StepIndicator";

export function TeacherAddLessonStepOnePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Step Indicator */}
      <StepIndicator
        steps={[
          { number: 1, label: "Lesson Details" },
          { number: 2, label: "Add Content" },
          { number: 3, label: "Preview & Publish" },
        ]}
        step={1}
      />

      {/* Form */}
      <form className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2] lg:col-span-2">
          <div>
            <label
              className="caption mb-2 block text-(--black)"
              htmlFor="lesson-title"
            >
              Title
            </label>
            <Input
              id="lesson-title"
              placeholder="Enter lesson title"
              required
            />
          </div>

          <div>
            <label
              className="caption mb-2 block text-(--black)"
              htmlFor="lesson-grade"
            >
              Grade Level
            </label>
            <Dropdown
              value="grade-1"
              onChange={() => undefined}
              className=""
              options={[
                { label: "Grade 1", value: "grade-1" },
                { label: "Grade 2", value: "grade-2" },
                { label: "Grade 3", value: "grade-3" },
              ]}
            />
          </div>

          <div>
            <label
              className="caption mb-2 block text-(--black)"
              htmlFor="lesson-description"
            >
              Description
            </label>
            <textarea
              id="lesson-description"
              className="paragraph-2 min-h-32 w-full resize-y rounded-md border-2 border-(--border) bg-(--gray-50) px-4 py-3 text-(--ghost) outline-none"
              placeholder="Enter lesson description"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
          <div>
            <h2 className="heading-4 text-(--black)">Thumbnail</h2>
            <p className="caption mt-1 text-(--ghost)">
              Add an image for your lesson.
            </p>
          </div>

          <label
            htmlFor="lesson-thumbnail"
            className="flex min-h-56 cursor-pointer flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)"
          >
            <ImagePlus className="size-10 text-(--primary)" />
            <span className="paragraph-2 font-semibold text-(--black)">
              Upload thumbnail
            </span>
            <span className="caption text-(--ghost)">PNG or JPG</span>
            <input
              id="lesson-thumbnail"
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
            />
          </label>

          <div className="flex items-start gap-3 rounded-2xl bg-(--warning-light) p-3">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-(--warning)" />
            <p className="caption text-(--black)">
              Tip: Use a clear image that helps students recognize this lesson.
            </p>
          </div>
        </div>

        <Separator className="lg:col-span-3" />

        <div className="flex items-center justify-between lg:col-span-3">
          <Link to="/teacher/lessons">
            <Button variant="default" className="gap-2">
              <X />
              Cancel
            </Button>
          </Link>
          <Link to="/teacher/lessons/new/step-2">
            <Button variant="default" className="gap-2">
              Next Step
              <ChevronRight />
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export function TeacherAddLessonStepTwoPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <StepIndicator
        steps={[
          { number: 1, label: "Lesson Details" },
          { number: 2, label: "Add Content" },
          { number: 3, label: "Preview & Publish" },
        ]}
        step={2}
      />
      <CreateLessonRoundCard roundNumber={1} />
      <Separator />
      <div className="flex items-center justify-between lg:col-span-3">
        <Link to="/teacher/lessons/new/step-1">
          <Button variant="default" className="gap-2">
            <ChevronLeft />
            Back
          </Button>
        </Link>
        <Link to="/teacher/lessons/new/step-3">
          <Button variant="default" className="gap-2">
            Next Step
            <ChevronRight />
          </Button>
        </Link>
      </div>
    </div>
  );
}
export function TeacherAddLessonStepThreePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <StepIndicator
        steps={[
          { number: 1, label: "Lesson Details" },
          { number: 2, label: "Add Content" },
          { number: 3, label: "Preview & Publish" },
        ]}
        step={3}
      />

      <div className="rounded-4xl border-2 border-dashed border-(--primary) bg-(--white) p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-center">
          <article className="overflow-hidden rounded-3xl border-2 border-(--border) bg-(--white) shadow-[0_5px_0_0_#BDC8D2]">
            <div className="aspect-video overflow-hidden bg-(--surface)">
              <img
                src="/hero.png"
                alt="Alphabet Basics lesson thumbnail"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-4 p-5">
              <span className="w-fit rounded-full border-b-4 border-green-700 bg-green-500 px-5 py-1.5 text-sm font-semibold text-white">
                Grade 1
              </span>
              <div>
                <h2 className="heading-3 text-(--black)">Alphabet Basics</h2>
                <p className="paragraph-2 mt-2 text-(--ghost)">
                  Learn to identify and sound out the core vowels and
                  consonants...
                </p>
              </div>
              <div className="h-px w-full bg-(--border)" />
              <div className="flex items-center gap-6 text-(--black)">
                <span className="flex items-center gap-2 paragraph-2">
                  <Clock3 className="size-5 text-(--primary)" />
                  15 min
                </span>
                <span className="flex items-center gap-2 paragraph-2">
                  <Star className="size-5 text-(--primary)" />
                  120 pts
                </span>
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="heading-2 text-(--info)">Preview</h2>
              <p className="paragraph-1 mt-2 text-(--black)">
                This is what the students will see
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <p className="paragraph-2 font-semibold text-(--ghost)">Title</p>
              <p className="heading-3 text-(--black)">Alphabet Basics</p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <p className="paragraph-2 font-semibold text-(--ghost)">
                Grade Level
              </p>
              <p className="heading-3 text-(--black)">Grade 1</p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <p className="paragraph-2 font-semibold text-(--ghost)">
                Description
              </p>
              <p className="paragraph-1 text-(--black)">
                Learn to identify and sound out the core vowels and
                consonants...
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/teacher/lessons/new/step-2">
            <Button variant="default" className="gap-2">
              <ChevronLeft />
              Back
            </Button>
          </Link>
          <Link to="/teacher/lessons">
            <Button variant="destructive" className="gap-2">
              Cancel
              <X />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" className="gap-2">
            Save as draft
            <Save />
          </Button>
          <Button type="button" className="gap-2">
            Publish
            <Upload />
          </Button>
        </div>
      </div>
    </div>
  );
}
