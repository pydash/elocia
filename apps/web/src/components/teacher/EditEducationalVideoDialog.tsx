import { useState, useEffect, type FormEvent } from "react";
import { X, Loader2, Save } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Dropdown from "@/components/Dropdown";
import type { EducationalVideo } from "@/interfaces/educational-video.interface";
import { updateEducationalVideo } from "@/services/educational-videos";

interface EditEducationalVideoDialogProps {
  isOpen: boolean;
  video: EducationalVideo;
  onClose: () => void;
  onUpdated: () => void;
}

const gradeOptions = [
  { label: "Grade 1", value: "1" },
  { label: "Grade 2", value: "2" },
  { label: "Grade 3", value: "3" },
];

export default function EditEducationalVideoDialog({
  isOpen,
  video,
  onClose,
  onUpdated,
}: EditEducationalVideoDialogProps) {
  const [title, setTitle] = useState(video.title || "");
  const [description, setDescription] = useState(video.description || "");
  const [subject, setSubject] = useState(video.subject || "Sign Language");
  const [gradeLevel, setGradeLevel] = useState<number>(video.gradeLevel || 1);
  const [durationMinutes, setDurationMinutes] = useState<number>(video.durationMinutes || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(video.title || "");
      setDescription(video.description || "");
      setSubject(video.subject || "Sign Language");
      setGradeLevel(video.gradeLevel || 1);
      setDurationMinutes(video.durationMinutes || 5);
      setError(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, video]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateEducationalVideo(video.id, {
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        grade_level: gradeLevel,
        duration_minutes: durationMinutes,
      });
      onUpdated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 space-y-5 text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900">Edit Educational Video</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Video Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FSL Greetings and Basics"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Sign Language, Math, Science"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Grade Level</label>
              <Dropdown
                value={String(gradeLevel)}
                onChange={(val) => setGradeLevel(Number(val))}
                options={gradeOptions}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary of the lesson video..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-(--primary) focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Duration (Minutes)</label>
            <Input
              type="number"
              min={1}
              max={120}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

