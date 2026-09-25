import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { School, Calendar, X } from "lucide-react";
import {
  createClassroom,
  updateClassroom,
  fetchAllUsers,
  type AdminClassroom,
  type AdminUser,
  type CreateClassPayload,
  type UpdateClassPayload,
} from "@/services/admin";

interface CreateClassModalProps {
  isOpen: boolean;
  classToEdit?: AdminClassroom | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CreateClassModal({
  isOpen,
  classToEdit,
  onClose,
  onSaved,
}: CreateClassModalProps) {
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState(1);
  const [teacherId, setTeacherId] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026-2027");
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch active teachers for dropdown
      fetchAllUsers("teacher")
        .then((data) => {
          setTeachers(data.filter((t) => t.is_active));
          if (!classToEdit && data.length > 0 && !teacherId) {
            setTeacherId(data[0].id);
          }
        })
        .catch((err) => console.error("Error fetching teachers:", err));

      if (classToEdit) {
        setName(classToEdit.name);
        setGradeLevel(classToEdit.grade_level);
        setTeacherId(classToEdit.teacher_id);
        setSchoolYear(classToEdit.school_year || "2026-2027");
      } else {
        setName("");
        setGradeLevel(1);
        setSchoolYear("2026-2027");
      }
      setError(null);
    }
  }, [isOpen, classToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) {
      setError("Please select an assigned teacher for this class.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (classToEdit) {
        const payload: UpdateClassPayload = {
          name,
          grade_level: Number(gradeLevel),
          teacher_id: teacherId,
          school_year: schoolYear,
        };
        await updateClassroom(classToEdit.id, payload);
      } else {
        const payload: CreateClassPayload = {
          name,
          grade_level: Number(gradeLevel),
          teacher_id: teacherId,
          school_year: schoolYear,
        };
        await createClassroom(payload);
      }
      onSaved();
    } catch (err: any) {
      console.error("Failed to save classroom:", err);
      setError(err?.message || "Failed to save classroom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {classToEdit ? "Edit Classroom" : "Create New Classroom"}
            </h3>
            <p className="text-xs text-gray-500">
              Configure classroom section and assign teacher
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Class Section Name
            </label>
            <Field
              leadingIcon={School}
              type="text"
              placeholder="e.g. Diamond, Sunflower, Ruby"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-(--primary) focus:outline-hidden"
              >
                <option value={1}>Grade 1</option>
                <option value={2}>Grade 2</option>
                <option value={3}>Grade 3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                School Year
              </label>
              <Field
                leadingIcon={Calendar}
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Lead / Assigned Teacher
            </label>
            {teachers.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-md border border-amber-200">
                No active teachers found. Please add a teacher account first in the User Directory.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-(--primary) focus:outline-hidden"
                  required
                >
                  <option value="" disabled>
                    -- Select Teacher --
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (@{t.username || "teacher"})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : classToEdit
                ? "Save Changes"
                : "Create Classroom"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
