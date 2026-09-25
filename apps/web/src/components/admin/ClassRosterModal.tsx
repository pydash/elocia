import { useState, useEffect } from "react";
import { X, Users, Calendar, Award } from "lucide-react";
import { fetchClassRoster, type AdminClassroom, type EnrolledStudent } from "@/services/admin";

interface ClassRosterModalProps {
  isOpen: boolean;
  classroom: AdminClassroom | null;
  onClose: () => void;
}

export default function ClassRosterModal({
  isOpen,
  classroom,
  onClose,
}: ClassRosterModalProps) {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && classroom) {
      setLoading(true);
      setError(null);
      fetchClassRoster(classroom.id)
        .then((roster) => setStudents(roster))
        .catch((err) => {
          console.error("Failed to load roster:", err);
          setError("Failed to load enrolled students roster.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, classroom]);

  if (!isOpen || !classroom) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
              <Users className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {classroom.name} Roster
                </h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  Grade {classroom.grade_level}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Lead Teacher: <span className="font-medium text-gray-700">{classroom.teacher_name || "Unassigned"}</span> &bull; {classroom.school_year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading student roster...
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                <Users className="size-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No students enrolled yet</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                The lead teacher can enroll students into this classroom section from their dashboard.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-gray-500 px-1">
                <span>Total Enrolled: <strong className="text-gray-800">{students.length}</strong></span>
              </div>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-xs overflow-hidden">
                {students.map((student, idx) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3.5 hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400 w-5 text-center">
                        {idx + 1}
                      </span>
                      <div
                        className="flex size-9 items-center justify-center rounded-full text-base shadow-xs"
                        style={{ backgroundColor: (student.color || "#3B82F6") + "20" }}
                      >
                        {student.emoji || "👦"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>Code: <code className="font-mono text-gray-600 bg-gray-100 px-1 py-0.5 rounded">{student.student_code || "N/A"}</code></span>
                          {student.student_number && (
                            <span>&bull; #{student.student_number}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <Award className="size-3" />
                        Grade {student.grade_level || classroom.grade_level}
                      </span>
                      {student.enrolled_at && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Calendar className="size-3" />
                          {new Date(student.enrolled_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
