import { useMemo, useState } from "react";

import { useGetStudents } from "@/hooks/useStudents";

import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import Input from "@/components/Input ";
import StudentCard from "@/components/teacher/StudentCard";
import AddStudentDialog from "@/components/teacher/AddStudentDialog";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

import { Search, CheckCircle2 } from "lucide-react";

export default function TeacherStudentsPage() {
  const { students, loading, error, addStudent, reactivateStudentById } =
    useGetStudents("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleReactivate = async (id: string, name: string) => {
    const confirm = window.confirm(
      `Are you sure you want to reactivate ${name}? Their profile color and login access will be restored.`,
    );
    if (!confirm) return;

    try {
      await reactivateStudentById(id);
      setActionMessage(`${name} has been reactivated successfully.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error("Failed to reactivate student:", err);
      alert("Failed to reactivate student.");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Status filter
      if (statusFilter === "active" && student.is_active === false) {
        return false;
      }
      if (statusFilter === "inactive" && student.is_active !== false) {
        return false;
      }

      // Search query
      const normalizedQuery = searchQuery.trim().toLowerCase();
      if (!normalizedQuery) {
        return true;
      }

      return [
        student.name,
        student.student_code,
        student.student_number,
        student.grade_level,
      ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [searchQuery, students, statusFilter]);
  const activeCount = students.filter((s) => s.is_active !== false).length;
  const inactiveCount = students.filter((s) => s.is_active === false).length;

  if (loading) return <LoadingState />;

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <TopHeaderBar />
      <section className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <h2 className="heading-2 text-(--black)">Student Roster</h2>
            <p className="text-sm text-gray-500">
              View and manage active and archived student profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              leadingIcon={Search}
              placeholder="Search students..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search students"
            />
            <AddStudentDialog onSave={addStudent} />
          </div>
        </div>

        {/* Status Toggle Sub-bar */}
        <div className="mt-4 flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setStatusFilter("active")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                statusFilter === "active"
                  ? "bg-white text-(--primary) shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active Students ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                statusFilter === "inactive"
                  ? "bg-white text-red-500 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Deactivated ({inactiveCount})
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                statusFilter === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({students.length})
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              id={student.id}
              name={student.name}
              color={student.color}
              emoji={student.emoji}
              grade_level={student.grade_level}
              student_number={student.student_number}
              student_code={student.student_code}
              is_active={student.is_active !== false}
              onReactivate={handleReactivate}
            />
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="mt-12 text-center">
            <p className="paragraph-2 text-(--ghost)">
              {statusFilter === "inactive"
                ? "No deactivated students found."
                : "No students found matching your criteria."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
