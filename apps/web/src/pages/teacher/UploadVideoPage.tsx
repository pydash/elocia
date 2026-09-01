import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Input from "@/components/Input ";
import Separator from "@/components/Separator";
import StepIndicator from "@/components/StepIndicator";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ImagePlus,
  Lightbulb,
  Save,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { number: 1, label: "Upload Video" },
  { number: 2, label: "Add Details" },
  { number: 3, label: "Review & Submit" },
];
export function TeacherUploadVideoStepOnePage() {
  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={1} />

      <article className="w-full flex flex-col p-6 gap-y-8 rounded-4xl gap-4 bg-(--white) shadow-lg/5">
        <h1 className="heading-3">Let's start with the basics</h1>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-4 col-span-3">
            <div className="space-y-4">
              <label>Title</label>
              <Input type="text" placeholder="e.g. Adventures in Addition" />
            </div>
            <div>
              <label>Grade Level</label>
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
            <div className="flex flex-col">
              <label>Brief Description</label>
              <textarea
                className="min-h-56 resize-none rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none"
                placeholder="What will the students learn in this lesson? (e.g. Students will learn how to add numbers up to 100.)"
              />
            </div>
          </div>
          <div className="space-y-4 col-span-2">
            <label className="flex flex-col min-h-56 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
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
            <div className="flex gap-2 p-4 items-center rounded-full bg-(--info-light) text-(--info)">
              <Lightbulb />
              <span>
                A bright, colorful image help students find their lessons
                faster!
              </span>
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
      </article>
    </section>
  );
}

export function TeacherUploadVideoStepTwoPage() {
  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={2} />

      <div className="space-y-2 text-(--black)">
        <h1 className="heading-2">Step 2: Content & Media</h1>
        <p>Upload educational videos for the students.</p>
      </div>

      <article className="w-full flex flex-col p-6 gap-y-4 rounded-4xl gap-4 bg-(--white) shadow-lg/5">
        <div className="flex items-center gap-2">
          <Clapperboard />
          <h3>Instructional Video</h3>
        </div>
        <label className="flex flex-col min-h-56 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
          <ImagePlus className="size-10 text-(--primary)" />
          <span className="paragraph-2 font-semibold text-(--black)">
            Click to upload an image
          </span>
          <span className="caption text-(--ghost)">PNG or JPG up to 10MB</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
          />
        </label>
      </article>

      <Separator />

      <div className="flex justify-between items-center">
        <Link to="../step-1">
          <Button className="gap-2">
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

export function TeacherUploadVideoStepThreePage() {
  return (
    <>
      <section className="space-y-6 mt-6">
        <StepIndicator steps={steps} step={3} />

        <article className="w-full grid grid-cols-5 p-8 rounded-4xl gap-6 bg-(--white) shadow-lg/5 border-2 border-dashed border-(--primary)">
          <div className="col-span-2">
            <div className="flex flex-col overflow-hidden border-2 rounded-2xl border-(--border) bg-(--white) shadow-[0_6px_0_0_#BDC8D2]">
              <div className="aspect-video bg-gray-200 hover:bg-gray-300">
                <img
                  src="https://example.com/image.jpg"
                  alt="Description"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-6 p-4 rounded-b-2xl">
                {/* Badge */}
                <span className="w-fit bg-(--success) text-(--white) shadow-[0_5px_0_0_#1e7f3a] px-4 py-1 rounded-full text-sm">
                  Grade 1
                </span>
                <div className="space-y-2">
                  <h3 className="heading-3 text-(--black)">Some Video Title</h3>
                  <p className="paragraph-2 text-(--ghost) line-clamp-2 leading-tight!">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Ducimus, esse autem vitae sed soluta eos doloribus aliquid
                    debitis sint reiciendis distinctio neque nulla, quibusdam
                    iste doloremque praesentium minima fugit magnam quam.
                  </p>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Timer className="text-(--primary)" />
                  <span className="text-(--black)">5 min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-3 space-y-6">
            <div className="space-y-2">
              <h3 className="heading-3 text-(--info)">Preview</h3>
              <p className="paragraph-2 text-(--ghost)">
                This is how your lesson will appear to students.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="paragraph-2 text-(--ghost)">Title</h3>
              <p className="heading-3 text-(--black)">Some Video Title</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="paragraph-2 text-(--ghost)">Grade Level</h3>
              <p className="heading-3 text-(--black)">Grade 1</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="paragraph-2 text-(--ghost)">Description</h3>
              <p className="paragraph-1 text-(--black)">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Libero, maiores et ipsa enim architecto accusantium error
                excepturi odit quas quasi.
              </p>
            </div>
          </div>
        </article>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Link to="../step-2">
              <Button>
                <ChevronLeft className="size-5" />
                Back
              </Button>
            </Link>
            <Button variant="destructive">
              Cancel <X />
            </Button>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="gap-2">
              Save as Draft <Save className="size-4" />
            </Button>
            <Button className="gap-2">
              Publish <Upload className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
