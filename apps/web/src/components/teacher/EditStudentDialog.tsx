import { useEffect, useState, type FormEvent } from "react";

import Button from "../Button";
import Dropdown from "../Dropdown";
import Input from "../Input ";
import type { Student } from "@/interfaces/student.interface";
import type { UpdateStudentPayload } from "@/services/students";

type EditStudentDialogProps = {
  student: Student;
  onSave: (payload: UpdateStudentPayload) => Promise<unknown>;
};

type StudentForm = {
  name: string;
  pin: string;
  color: string;
  emoji: string;
  grade_level: number;
  student_code: string;
  is_active: boolean;
};

const avatarColors = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
];

const avatarEmojis = [
  "🐱",
  "🐶",
  "🦊",
  "🐼",
  "🐸",
  "🦁",
  "🐯",
  "🐨",
  "🐰",
  "🐻",
  "🐵",
  "🦄",
  "🐧",
  "🦉",
  "🐙",
  "🐬",
  "🦖",
  "🐢",
  "🦋",
  "🐝",
  "🚀",
  "⭐",
  "🌈",
  "🎨",
];

const getInitialForm = (student: Student): StudentForm => ({
  name: student.name,
  pin: "",
  color: student.color,
  emoji: student.emoji,
  grade_level: student.grade_level,
  student_code: student.student_code,
  is_active: student.is_active ?? true,
});

export default function EditStudentDialog({
  student,
  onSave,
}: EditStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(() => getInitialForm(student));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(student));
  }, [student]);

  const closeDialog = () => {
    if (isSaving) return;
    setIsOpen(false);
    setError("");
  };

  const updateField = <K extends keyof StudentForm>(
    field: K,
    value: StudentForm[K],
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const { pin, ...studentDetails } = form;
      await onSave(pin ? { ...studentDetails, pin } : studentDetails);
      setIsOpen(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update student");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        className="shrink-0 gap-2"
        onClick={() => setIsOpen(true)}
      >
        Edit Profile
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
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-student-title"
          >
            <div className="mb-6">
              <h2 id="edit-student-title" className="heading-3 text-(--black)">
                Edit Profile
              </h2>
              <p className="paragraph-2 mt-2 text-(--ghost)">
                Update the student profile details.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="caption text-(--black)" htmlFor="edit-name">
                Name
                <Input
                  id="edit-name"
                  className="mt-2"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </label>

              <label className="caption text-(--black)" htmlFor="edit-pin">
                New PIN
                <Input
                  id="edit-pin"
                  className="mt-2"
                  type="password"
                  inputMode="numeric"
                  value={form.pin}
                  onChange={(event) => updateField("pin", event.target.value)}
                  placeholder="Leave blank to keep current PIN"
                />
              </label>

              <fieldset className="caption text-(--black)">
                <legend>Avatar color</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {avatarColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      aria-label={`${color.name} avatar color`}
                      aria-pressed={form.color === color.value}
                      className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-105 ${
                        form.color === color.value
                          ? "border-(--black) ring-2 ring-(--black) ring-offset-2"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => updateField("color", color.value)}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset className="caption text-(--black)">
                <legend>Avatar emoji</legend>
                <div className="mt-2 grid grid-cols-8 gap-2">
                  {avatarEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Select ${emoji} avatar`}
                      aria-pressed={form.emoji === emoji}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-2xl transition-colors ${
                        form.emoji === emoji
                          ? "border-(--primary) bg-(--primary-light) ring-2 ring-(--primary)"
                          : "border-(--border) bg-white hover:bg-(--gray-50)"
                      }`}
                      onClick={() => updateField("emoji", emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="caption text-(--black)" htmlFor="edit-grade">
                Grade level
                <Dropdown
                  className="mt-2"
                  value={String(form.grade_level)}
                  onChange={(value) =>
                    updateField("grade_level", Number(value))
                  }
                  options={[
                    { label: "Grade 1", value: "grade-1" },
                    { label: "Grade 2", value: "grade-2" },
                    { label: "Grade 3", value: "grade-3" },
                  ]}
                />
              </label>

              <label className="caption text-(--black)" htmlFor="edit-code">
                Student code
                <Input
                  id="edit-code"
                  className="mt-2"
                  value={form.student_code}
                  onChange={(event) =>
                    updateField("student_code", event.target.value)
                  }
                  required
                />
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-colors ${
                  form.is_active
                    ? "border-(--success) bg-(--success-light)"
                    : "border-(--border) bg-(--gray-50)"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold text-(--black)">
                    Active student
                  </span>
                  <span className="mt-1 block text-xs text-(--ghost)">
                    {form.is_active
                      ? "This student can access the platform."
                      : "This student is inactive and cannot access the platform."}
                  </span>
                </span>
                <span className="relative ml-4 inline-flex shrink-0 items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.is_active}
                    onChange={(event) =>
                      updateField("is_active", event.target.checked)
                    }
                  />
                  <span className="h-6 w-11 rounded-full bg-(--gray-300) transition-colors peer-checked:bg-(--success)" />
                  <span className="absolute left-1 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                </span>
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
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
