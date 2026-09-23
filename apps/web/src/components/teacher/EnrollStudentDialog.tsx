import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";

import { useGetStudents } from "@/hooks/useStudents";
import { enrollStudentInClass } from "@/services/classes";
import Button from "../Button";

type EnrollStudentDialogProps = {
  studentIds: string[];
};

export default function EnrollStudentDialog({
  studentIds,
}: EnrollStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");

  const { id: classId } = useParams<{ id: string }>();
  const { students, loading: studentsLoading } = useGetStudents();

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const availableStudents = students.filter(
      (student) => !studentIds.includes(student.id),
    );

    if (!query) {
      return availableStudents;
    }

    return availableStudents.filter((student) =>
      student.name.toLowerCase().includes(query),
    );
  }, [searchQuery, studentIds, students]);

  const resetDialog = () => {
    setSearchQuery("");
    setSelectedStudentIds([]);
    setError("");
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((currentIds) =>
      currentIds.includes(studentId)
        ? currentIds.filter((id) => id !== studentId)
        : [...currentIds, studentId],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEnrolling(true);
    setError("");

    try {
      const results = await Promise.allSettled(
        selectedStudentIds.map((studentId) =>
          enrollStudentInClass(classId, studentId),
        ),
      );
      const failedCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failedCount > 0) {
        throw new Error(
          `Failed to enroll ${failedCount} student${failedCount === 1 ? "" : "s"}.`,
        );
      }

      setIsOpen(false);
      resetDialog();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll students",
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="shrink-0">
        Enroll Students
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isEnrolling) {
              setIsOpen(false);
              resetDialog();
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enroll-student-title"
          >
            <h2 id="enroll-student-title" className="mb-4 text-xl font-bold">
              Enroll Students
            </h2>
            <form onSubmit={handleSubmit}>
              <label
                className="mb-2 block font-medium"
                htmlFor="student-search"
              >
                Search students
              </label>
              <input
                id="student-search"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by student name..."
                className="mb-4 w-full rounded border px-3 py-2"
              />

              <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-(--border)">
                {studentsLoading ? (
                  <p className="p-4 text-center text-sm text-(--ghost)">
                    Loading students...
                  </p>
                ) : filteredStudents.length === 0 ? (
                  <p className="p-4 text-center text-sm text-(--ghost)">
                    No students found.
                  </p>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id);

                    return (
                      <label
                        key={student.id}
                        className="flex cursor-pointer items-center gap-3 border-b border-(--border) p-3 last:border-b-0 hover:bg-(--gray-50)"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudent(student.id)}
                        />

                        <div className="flex flex-col gap-2">
                          <span className="paragraph-2 text-(--black)">
                            {student.name}
                          </span>
                          <span className="item-label text-(--ghost)">
                            {student.student_code}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <p className="mb-4 text-sm text-(--ghost)">
                {selectedStudentIds.length} student
                {selectedStudentIds.length === 1 ? "" : "s"} selected
              </p>

              {error && (
                <p className="mb-4 text-red-500" role="alert">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isEnrolling}
                  onClick={() => {
                    setIsOpen(false);
                    resetDialog();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEnrolling || selectedStudentIds.length === 0}
                  className="rounded-lg bg-(--primary) px-4 py-2 text-white hover:bg-(--primary-dark)"
                >
                  {isEnrolling ? "Enrolling..." : "Enroll Selected"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
