import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Input from "@/components/Input ";
import Separator from "@/components/Separator";
import StepIndicator from "@/components/StepIndicator";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Lightbulb,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { uploadBaselineVideo, createEducationalVideo, type CreateEducationalVideoPayload } from "@/services/educational-videos";
import type { TeacherUploadVideoContext } from "@/layouts/TeacherUploadVideoLayout";

const steps = [
  { number: 1, label: "Upload Video" },
  { number: 2, label: "Add Details" },
  { number: 3, label: "Review & Submit" },
];

function updateDraftField<K extends keyof CreateEducationalVideoPayload>(
  draft: CreateEducationalVideoPayload,
  field: K,
  value: CreateEducationalVideoPayload[K],
) {
  return { ...draft, [field]: value };
}

export function TeacherUploadVideoStepOnePage() {
  const { video, setVideo } = useOutletContext<TeacherUploadVideoContext>();

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={1} />

      <article className="w-full flex flex-col p-6 gap-y-8 rounded-4xl gap-4 bg-(--white) shadow-lg/5">
        <h1 className="heading-3">Let's start with the basics</h1>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-4 col-span-3">
            <div className="space-y-4">
              <label>Title</label>
              <Input
                type="text"
                placeholder="e.g. Adventures in Addition"
                value={video.title}
                onChange={(event) =>
                  setVideo((current) =>
                    updateDraftField(current, "title", event.target.value),
                  )
                }
                required
              />
            </div>
            <div>
              <label>Grade Level</label>
              <Dropdown
                value={`grade-${video.grade_level}`}
                onChange={(value) =>
                  setVideo((current) =>
                    updateDraftField(
                      current,
                      "grade_level",
                      Number(value.replace("grade-", "")),
                    ),
                  )
                }
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
                value={video.description}
                onChange={(event) =>
                  setVideo((current) =>
                    updateDraftField(
                      current,
                      "description",
                      event.target.value,
                    ),
                  )
                }
                required
                className="min-h-56 resize-none rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none"
                placeholder="What will the students learn in this lesson? (e.g. Students will learn how to add numbers up to 100.)"
              />
            </div>
            <div className="space-y-4">
              <label>Subject</label>
              <Input
                value={video.subject}
                onChange={(event) =>
                  setVideo((current) =>
                    updateDraftField(current, "subject", event.target.value),
                  )
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Duration (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  value={video.duration_minutes}
                  onChange={(event) =>
                    setVideo((current) =>
                      updateDraftField(
                        current,
                        "duration_minutes",
                        Number(event.target.value),
                      ),
                    )
                  }
                  required
                />
              </div>
              <div>
                <label>Video URL</label>
                <Input
                  type="url"
                  value={video.video_url}
                  onChange={(event) =>
                    setVideo((current) =>
                      updateDraftField(
                        current,
                        "video_url",
                        event.target.value,
                      ),
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 col-span-2">
            <div>
              <label>Thumbnail URL</label>
              <Input
                type="url"
                value={video.thumbnail_url}
                onChange={(event) =>
                  setVideo((current) =>
                    updateDraftField(
                      current,
                      "thumbnail_url",
                      event.target.value,
                    ),
                  )
                }
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
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
  const { videoFile, setVideoFile } = useOutletContext<TeacherUploadVideoContext>();

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={2} />

      <div className="space-y-2 text-(--black)">
        <h1 className="heading-2">Step 2: Content & Media</h1>
        <p>Upload the demonstration video for this sign lesson.</p>
      </div>

      <article className="w-full flex flex-col p-6 gap-y-4 rounded-4xl gap-4 bg-(--white) shadow-lg/5">
        <div className="flex items-center gap-2">
          <Clapperboard className="text-(--primary)" />
          <h3>Demonstration Video (.mp4, .webm, .mov)</h3>
        </div>
        {videoFile ? (
          <div className="flex flex-col items-center gap-4 p-6 border-2 border-(--primary) rounded-2xl bg-(--primary-light)">
            <video
              src={URL.createObjectURL(videoFile)}
              controls
              className="max-h-72 w-auto rounded-xl shadow-md"
            />
            <div className="flex items-center justify-between w-full max-w-md">
              <span className="font-semibold text-(--black) truncate">{videoFile.name}</span>
              <span className="text-sm text-(--ghost)">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <label className="cursor-pointer text-sm font-semibold text-(--primary) underline hover:text-(--primary-dark)">
              Replace Video
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVideoFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        ) : (
          <label className="flex flex-col min-h-56 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
            <Upload className="size-10 text-(--primary)" />
            <span className="paragraph-2 font-semibold text-(--black)">
              Click to upload demonstration video
            </span>
            <span className="caption text-(--ghost)">MP4, WEBM or MOV up to 100MB</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setVideoFile(e.target.files[0]);
                }
              }}
            />
          </label>
        )}
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
          <Button className="gap-2" disabled={!videoFile}>
            Next Step
            <ChevronRight className="size-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function TeacherUploadVideoStepThreePage() {
  const { video, videoFile } = useOutletContext<TeacherUploadVideoContext>();
  const [publishing, setPublishing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState("");

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!video.title?.trim() || !video.description?.trim()) {
      setValidationError("Title and description are required before publishing.");
      return;
    }

    if (!videoFile && !video.video_url?.trim()) {
      setValidationError("Please provide a demonstration video file or video URL before publishing.");
      return;
    }

    setValidationError("");
    setPublishing(true);
    setErrorMsg(null);
    try {
      if (videoFile) {
        // Upload to Module 4 dynamic baseline engine & unlock for students in this grade level
        await uploadBaselineVideo({
          sign_name: video.title.trim(),
          grade_level: video.grade_level,
          description: video.description.trim(),
          video: videoFile,
        });
      } else if (video.video_url?.trim()) {
        await createEducationalVideo({
          ...video,
          title: video.title.trim(),
          description: video.description.trim(),
          subject: video.subject.trim(),
          video_url: video.video_url.trim(),
          thumbnail_url: video.thumbnail_url.trim(),
        });
      }
      navigate("/teacher/lessons");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to upload video");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <section className="space-y-6 mt-6">
        <StepIndicator steps={steps} step={3} />

        <article className="w-full grid grid-cols-5 p-8 rounded-4xl gap-6 bg-(--white) shadow-lg/5 border-2 border-dashed border-(--primary)">
          <div className="col-span-2">
            <div className="flex flex-col overflow-hidden border-2 rounded-2xl border-(--border) bg-(--white) shadow-[0_6px_0_0_#BDC8D2]">
              <div className="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                {videoFile ? (
                  <video
                    src={URL.createObjectURL(videoFile)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={video.thumbnail_url || "/path/to/image.jpg"}
                    alt={video.title || "Video thumbnail"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-6 p-4 rounded-b-2xl">
                <span className="w-fit bg-(--success) text-(--white) shadow-[0_5px_0_0_#1e7f3a] px-4 py-1 rounded-full text-sm">
                  Grade {video.grade_level}
                </span>
                <div className="space-y-2">
                  <h3 className="heading-3 text-(--black)">
                    {video.title || "Untitled video"}
                  </h3>
                  <p className="paragraph-2 text-(--ghost) line-clamp-2 leading-tight!">
                    {video.description || "No description provided."}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Timer className="text-(--primary)" />
                  <span className="text-(--black)">
                    {video.duration_minutes} min
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-3 space-y-6">
            <div className="space-y-2">
              <h3 className="heading-3 text-(--info)">Preview</h3>
              <p className="paragraph-2 text-(--ghost)">
                This lesson will automatically be unlocked for all Grade {video.grade_level} students on their Desktop Lesson Navigation map.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="paragraph-2 text-(--ghost)">Sign / Title</h3>
              <p className="heading-3 text-(--black)">
                {video.title || "Untitled video"}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="paragraph-2 text-(--ghost)">Target Audience</h3>
              <p className="heading-3 text-(--black)">
                Grade {video.grade_level} Students
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="paragraph-2 text-(--ghost)">Description</h3>
              <p className="paragraph-1 text-(--black)">
                {video.description || "No description provided."}
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
            <Link to="/teacher/tasks">
              <Button variant="destructive">
                Cancel <X />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <form onSubmit={handlePublish}>
              <Button className="gap-2" type="submit" disabled={publishing || (!videoFile && !video.video_url)}>
                {publishing ? "Extracting 3D Landmarks & Publishing..." : "Publish Lesson"}{" "}
                <Upload className="size-4" />
              </Button>
            </form>
          </div>
        </div>
        {(validationError || errorMsg) && (
          <p className="paragraph-2 text-(--danger)" role="alert">
            {validationError || errorMsg}
          </p>
        )}
      </section>
    </>
  );
}
