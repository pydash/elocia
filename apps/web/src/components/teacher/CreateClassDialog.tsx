import { useState, type FormEvent } from "react";

import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Input from "@/components/Input ";
import type { CreateClassPayload } from "@/services/classes";

type CreateClassDialogProps = {
  onSave: (classDetails: CreateClassPayload) => Promise<unknown>;
};

const initialClass: CreateClassPayload = {
  name: "",
  grade_level: 1,
  school_year: "2026-2027",
};

const gradeOptions = [
  { label: "Grade 1", value: "1" },
  { label: "Grade 2", value: "2" },
  { label: "Grade 3", value: "3" },
];

export default function CreateClassDialog({ onSave }: CreateClassDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [classDetails, setClassDetails] = useState(initialClass);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const updateClass = <K extends keyof CreateClassPayload>(
    field: K,
    value: CreateClassPayload[K],
  ) => {
    setClassDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const closeDialog = () => {
    if (isSaving) return;
    setIsOpen(false);
    setClassDetails(initialClass);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await onSave(classDetails);
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        className="shrink-0"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Create Class
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-class-title"
          >
            <div className="mb-6">
              <h2 id="create-class-title" className="heading-3 text-(--black)">
                Create Class
              </h2>
              <p className="paragraph-2 mt-2 text-(--ghost)">
                Add a class for your students.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="caption text-(--black)" htmlFor="class-name">
                Class name
                <Input
                  id="class-name"
                  className="mt-2"
                  value={classDetails.name}
                  onChange={(event) => updateClass("name", event.target.value)}
                  required
                />
              </label>

              <label
                className="caption text-(--black)"
                htmlFor="class-grade-level"
              >
                Grade level
                <Dropdown
                  className="mt-2"
                  value={classDetails.grade_level.toString()}
                  onChange={(value) =>
                    updateClass("grade_level", parseInt(value, 10))
                  }
                  options={gradeOptions}
                />
              </label>

              <label
                className="caption text-(--black)"
                htmlFor="class-school-year"
              >
                School year
                <Input
                  id="class-school-year"
                  className="mt-2"
                  placeholder="2026-2027"
                  value={classDetails.school_year}
                  onChange={(event) =>
                    updateClass("school_year", event.target.value)
                  }
                  required
                />
              </label>

              {error && (
                <p className="paragraph-2 text-(--danger)" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Create Class"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
