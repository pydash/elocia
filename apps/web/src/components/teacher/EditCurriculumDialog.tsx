import { useEffect, useId, useState, type FormEvent } from "react";
import { Pencil, X } from "lucide-react";

import { useCurriculum } from "@/hooks/useCurriculums";

import type { Curriculum } from "@/interfaces/curriculum.interface";

import Button from "@/components/Button";
import Input from "@/components/Input";
import Dropdown from "@/components/Dropdown";

type CurriculumForm = Pick<
  Curriculum,
  "title" | "description" | "grade_level" | "is_active"
>;

const getInitialForm = (curriculum: Curriculum): CurriculumForm => ({
  title: curriculum.title,
  description: curriculum.description,
  grade_level: curriculum.grade_level,
  is_active: curriculum.is_active,
});

export default function EditCurriculumDialog({
  curriculum,
}: {
  curriculum: Curriculum;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CurriculumForm>(() =>
    getInitialForm(curriculum),
  );

  const titleId = useId();
  const descriptionId = useId();

  const { updateCurriculum, loading, error } = useCurriculum(curriculum.id);

  // Keep the form synchronized if the curriculum changes while
  // this component is mounted.
  useEffect(() => {
    if (!isOpen) {
      setForm(getInitialForm(curriculum));
    }
  }, [curriculum, isOpen]);

  const openDialog = () => {
    setForm(getInitialForm(curriculum));
    setIsOpen(true);
  };

  const closeDialog = () => {
    if (loading) return;

    setIsOpen(false);
  };

  const updateField = <K extends keyof CurriculumForm>(
    field: K,
    value: CurriculumForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await updateCurriculum({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });

      setIsOpen(false);
      window.location.reload(); // Refresh the page to reflect the updated curriculum
    } catch {
      // Keep the dialog open so the user can see the error
      // and retry.
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        type="button"
        className="shrink-0 gap-2"
        onClick={openDialog}
        aria-label={`Edit ${curriculum.title}`}
        title={`Edit ${curriculum.title}`}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit curriculum</span>
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeDialog();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-(--black)">
              Edit Curriculum
            </h2>

            <p id={descriptionId} className="mt-1 text-sm text-(--ghost)">
              Update the curriculum details below.
            </p>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            disabled={loading}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-(--ghost) transition-colors hover:bg-(--gray-50) hover:text-(--black) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-(--black)"
                htmlFor="curriculum-title"
              >
                Title
              </label>

              <Input
                id="curriculum-title"
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="w-full"
                placeholder="Enter curriculum title"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-(--black)"
                htmlFor="curriculum-description"
              >
                Description
              </label>

              <textarea
                id="curriculum-description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="min-h-28 w-full resize-none rounded-lg border-2 border-(--border) bg-(--gray-50) px-3 py-2 text-sm text-(--black) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Describe this curriculum..."
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-(--black)"
                htmlFor="curriculum-grade-level"
              >
                Grade Level
              </label>

              <Dropdown
                id="curriculum-grade-level"
                className="mt-1"
                value={String(form.grade_level)}
                onChange={(value) => updateField("grade_level", Number(value))}
                options={[
                  { label: "Grade 1", value: "1" },
                  { label: "Grade 2", value: "2" },
                  { label: "Grade 3", value: "3" },
                ]}
              />
            </div>

            <label
              htmlFor="curriculum-is-active"
              className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-colors ${
                form.is_active
                  ? "border-(--success) bg-(--success-light)"
                  : "border-(--border) bg-(--gray-50)"
              } ${loading ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-(--black)">
                  Active curriculum
                </span>

                <span className="mt-1 block text-xs text-(--ghost)">
                  {form.is_active
                    ? "This curriculum is visible and available to students."
                    : "This curriculum is hidden from students."}
                </span>
              </span>

              <span className="relative ml-4 inline-flex shrink-0 items-center">
                <input
                  id="curriculum-is-active"
                  type="checkbox"
                  className="peer sr-only"
                  checked={form.is_active}
                  onChange={(event) =>
                    updateField("is_active", event.target.checked)
                  }
                  disabled={loading}
                />

                <span className="h-6 w-11 rounded-full bg-(--gray-300) transition-colors peer-checked:bg-(--success)" />

                <span className="absolute left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={closeDialog}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
