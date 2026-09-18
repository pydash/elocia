import { useEffect, useState, type FormEvent } from "react";
import Button from "../Button";
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

              <label className="caption text-(--black)" htmlFor="edit-color">
                Avatar color
                <Input
                  id="edit-color"
                  className="mt-2"
                  value={form.color}
                  onChange={(event) => updateField("color", event.target.value)}
                  required
                />
              </label>

              <label className="caption text-(--black)" htmlFor="edit-emoji">
                Avatar emoji
                <Input
                  id="edit-emoji"
                  className="mt-2"
                  value={form.emoji}
                  onChange={(event) => updateField("emoji", event.target.value)}
                  required
                />
              </label>

              <label className="caption text-(--black)" htmlFor="edit-grade">
                Grade level
                <Input
                  id="edit-grade"
                  className="mt-2"
                  type="number"
                  min="1"
                  max="12"
                  value={form.grade_level}
                  onChange={(event) =>
                    updateField("grade_level", Number(event.target.value))
                  }
                  required
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

              <label className="flex items-center gap-2 caption text-(--black)">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    updateField("is_active", event.target.checked)
                  }
                />
                Active student
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
