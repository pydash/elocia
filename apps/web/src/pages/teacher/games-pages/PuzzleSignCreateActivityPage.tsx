import { Link } from "react-router-dom";
import Dropdown from "../../../components/Dropdown";
import Input from "../../../components/Input ";
import Separator from "../../../components/Separator";
import StepIndicator from "../../../components/StepIndicator";
import Button from "../../../components/Button";
import {
  ChevronRight,
  ImagePlus,
  X,
  Equal,
  Plus,
  ChevronLeft,
} from "lucide-react";

const steps = [
  {
    number: 1,
    label: "Basic Info",
  },
  {
    number: 2,
    label: "Add Content",
  },
  {
    number: 3,
    label: "Preview & Publish",
  },
];

export function PuzzleSignCreateActivityStepOnePage() {
  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={1} />

      <div className="flex flex-col p-6 gap-6 bg-(--white) rounded-4xl">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-200 hover:bg-gray-300">
              <img
                src="https://example.com/image.jpg"
                alt="Description"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="heading-3">Let's start with the basics</h1>
            <div>
              <label htmlFor="activity-title">Activity Title</label>
              <Input
                type="text"
                id="activity-title"
                placeholder="Enter activity title"
              />
            </div>
            <div>
              <label htmlFor="grade-level">Grade Level</label>
              <Dropdown
                value="grade-1"
                onChange={() => {}}
                className=""
                options={[
                  { label: "Grade 1", value: "grade-1" },
                  { label: "Grade 2", value: "grade-2" },
                  { label: "Grade 3", value: "grade-3" },
                ]}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <Link to="/teacher/tasks">
            <Button variant="destructive">
              Cancel <X />
            </Button>
          </Link>
          <Link to="../step-2">
            <Button className="gap-2">
              Next Step
              <ChevronRight className="size-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PuzzleSignCreateActivityStepTwoPage() {
  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={2} />

      <article className="w-full flex flex-col gap-6 p-6 bg-(--white) rounded-4xl shadow-lg/5 items-center">
        <div className="w-full flex items-center gap-6">
          <label className="flex flex-col flex-1 min-w-0 min-h-56 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
            <ImagePlus className="size-10 text-(--primary)" />
            <span className="paragraph-2 font-semibold text-(--black)">
              Click to upload an image
            </span>
            <span className="caption text-(--ghost)">
              PNG or JPG up to 10MB
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
            />
          </label>
          <label className="flex flex-col flex-1 min-w-0 min-h-56 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
            <ImagePlus className="size-10 text-(--primary)" />
            <span className="paragraph-2 font-semibold text-(--black)">
              Click to upload an image
            </span>
            <span className="caption text-(--ghost)">
              PNG or JPG up to 10MB
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
            />
          </label>

          <Equal className="size-10 text-(--ghost)" />

          <label className="flex flex-col flex-1 min-w-0 min-h-56 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
            <ImagePlus className="size-10 text-(--primary)" />
            <span className="paragraph-2 font-semibold text-(--black)">
              Click to upload an image
            </span>
            <span className="caption text-(--ghost)">
              PNG or JPG up to 10MB
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
            />
          </label>
        </div>
        <Separator />

        <div className="flex w-full gap-4">
          <textarea
            className="w-full flex-1 min-h-56 resize-none rounded-2xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none"
            placeholder="Write some description"
          />
          <textarea
            className="w-full flex-1 min-h-56 resize-none rounded-2xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none"
            placeholder="What is the correct answer for this image?"
          />
        </div>
      </article>

      <button className="w-full flex flex-col bg-white border-2 border-dashed border-(--border) rounded-2xl p-6 items-center justify-center gap-2 transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
        <div className="w-fit rounded-full bg-(--primary) p-2 text-(--white)">
          <Plus className="size-4" />
        </div>
        <span className="paragraph-2 font-semibold text-(--primary)">
          Add another round
        </span>
      </button>

      <Separator />

      <div className="flex items-center justify-between">
        <Link to="../step-1">
          <Button>
            <ChevronLeft className="size-5" />
            Back
          </Button>
        </Link>
        <Link to="../step-3">
          <Button className="gap-2">
            Next Step
            <ChevronRight className="size-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function PuzzleSignCreateActivityStepThreePage() {
  return (
    <>
      <h1>Puzzle Sign Activity Creation Step Three</h1>
    </>
  );
}
