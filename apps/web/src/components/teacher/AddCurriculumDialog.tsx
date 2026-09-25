import { useState, type FormEvent } from "react";

import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Input from "@/components/Input ";

import { createCurriculum } from "@/services/curriculum";

const initialCurriculum = {
  grade_level: 1,
  title: "",
  description: "",
  is_active: true,
};

const gradeOptions = [
  { label: "Grade 1", value: "1" },
  { label: "Grade 2", value: "2" },
  { label: "Grade 3", value: "3" },
];

export default function AddCurriculumDialog() {
  const [curriculum, setCurriculum] = useState(initialCurriculum);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const closeDialog = () => {
    setIsOpen(false);
    setCurriculum(initialCurriculum);
  };

  const resetForm = () => {
    setCurriculum(initialCurriculum);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createCurriculum(curriculum);
      resetForm();
      closeDialog();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="shrink-0"
      >
        Add Curriculum
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-curriculum-title"
          >
            <div className="mb-6">
              <h2
                id="add-curriculum-title"
                className="heading-3 text-(--black)"
              >
                Add Curriculum
              </h2>
              <p className="paragraph-2 mt-2 text-(--ghost)">
                Create a curriculum for your students.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label
                className="caption text-(--black)"
                htmlFor="curriculum-grade-level"
              >
                Grade level
                <Dropdown
                  className="mt-2"
                  value={String(curriculum.grade_level)}
                  onChange={(value) =>
                    setCurriculum((current) => ({
                      ...current,
                      grade_level: Number(value),
                    }))
                  }
                  options={gradeOptions}
                />
              </label>

              <label
                className="caption text-(--black)"
                htmlFor="curriculum-title"
              >
                Title
                <Input
                  id="curriculum-title"
                  className="mt-2"
                  value={curriculum.title}
                  onChange={(event) =>
                    setCurriculum((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label
                className="caption text-(--black)"
                htmlFor="curriculum-description"
              >
                Description
                <textarea
                  id="curriculum-description"
                  className="mt-2 min-h-32 w-full resize-y rounded-md border-2 border-(--border) bg-(--gray-50) px-4 py-3 paragraph-2 text-(--ghost) outline-none"
                  value={curriculum.description}
                  onChange={(event) =>
                    setCurriculum((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="flex items-center gap-3 caption text-(--black)">
                <input
                  type="checkbox"
                  checked={curriculum.is_active}
                  onChange={(event) =>
                    setCurriculum((current) => ({
                      ...current,
                      is_active: event.target.checked,
                    }))
                  }
                  className="size-4 accent-(--primary)"
                />
                Active curriculum
              </label>

              {error && (
                <p className="paragraph-2 text-(--danger)" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Add Curriculum"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
