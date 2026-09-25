import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import {
  School,
  Plus,
  RefreshCw,
  Search,
  Users,
  GraduationCap,
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  fetchClassroomsList,
  deleteClassroom,
  type AdminClassroom,
} from "@/services/admin";
import CreateClassModal from "@/components/admin/CreateClassModal";
import ClassRosterModal from "@/components/admin/ClassRosterModal";

type GradeFilter = "all" | "1" | "2" | "3";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<AdminClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<AdminClassroom | null>(null);
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<AdminClassroom | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await fetchClassroomsList();
      setClasses(data);
    } catch (err) {
      console.error("Failed to load classrooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleDelete = async (cls: AdminClassroom) => {
    const confirm = window.confirm(
      `Are you sure you want to delete classroom "${cls.name}" (Grade ${cls.grade_level})? Enrolled students will be unlinked.`
    );
    if (!confirm) return;

    try {
      await deleteClassroom(cls.id);
      setActionMessage(`Classroom "${cls.name}" was successfully removed.`);
      loadClasses();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error("Error deleting classroom:", err);
      alert("Failed to delete classroom.");
    }
  };

  const filteredClasses = classes.filter((c) => {
    if (gradeFilter !== "all" && String(c.grade_level) !== gradeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchTeacher = c.teacher_name?.toLowerCase().includes(q);
      return matchName || matchTeacher;
    }
    return true;
  });

  const getGradeBadge = (grade: number) => {
    switch (grade) {
      case 1:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 2:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case 3:
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Action Message */}
      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200 animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <School className="size-7 text-(--primary)" />
            Classrooms &amp; Rosters
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Create class sections, assign lead teachers, and view enrolled student rosters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadClasses}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Button
            onClick={() => {
              setSelectedClassForEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            Create Classroom
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
        {/* Grade Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {(
            [
              { id: "all", label: "All Grades" },
              { id: "1", label: "Grade 1" },
              { id: "2", label: "Grade 2" },
              { id: "3", label: "Grade 3" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setGradeFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                gradeFilter === tab.id
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <Field
            leadingIcon={Search}
            type="text"
            placeholder="Search class or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Classroom Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-500">
          Loading classrooms...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-(--primary) mb-3">
            <School className="size-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No classrooms found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No classrooms match your search for "${searchQuery}".`
              : "Get started by creating your first grade section and assigning a teacher."}
          </p>
          {!searchQuery && (
            <div className="mt-5">
              <Button
                onClick={() => {
                  setSelectedClassForEdit(null);
                  setIsModalOpen(true);
                }}
              >
                Create First Classroom
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div>
                {/* Header Row: Grade Badge + Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getGradeBadge(
                      cls.grade_level
                    )}`}
                  >
                    Grade {cls.grade_level}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedClassForEdit(cls);
                        setIsModalOpen(true);
                      }}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      title="Edit Classroom"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete Classroom"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Class Section Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {cls.name}
                </h3>

                {/* Details List */}
                <div className="space-y-2 mt-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-purple-600 shrink-0" />
                    <span>
                      Teacher:{" "}
                      <strong className="text-gray-800">
                        {cls.teacher_name || "Unassigned"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-blue-600 shrink-0" />
                    <span>
                      Students:{" "}
                      <strong className="text-gray-800">
                        {cls.student_count || 0} enrolled
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-amber-600 shrink-0" />
                    <span>
                      School Year:{" "}
                      <strong className="text-gray-800">
                        {cls.school_year || "2026-2027"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: View Roster CTA */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedClassForRoster(cls)}
                  className="flex items-center gap-1.5 text-xs font-bold text-(--primary) hover:underline"
                >
                  <Users className="size-3.5" />
                  View Enrolled Roster &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Classroom Modal */}
      <CreateClassModal
        isOpen={isModalOpen}
        classToEdit={selectedClassForEdit}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => {
          setIsModalOpen(false);
          loadClasses();
          setActionMessage(
            selectedClassForEdit
              ? "Classroom updated successfully."
              : "Classroom created successfully."
          );
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

      {/* Class Roster Modal */}
      <ClassRosterModal
        isOpen={Boolean(selectedClassForRoster)}
        classroom={selectedClassForRoster}
        onClose={() => setSelectedClassForRoster(null)}
      />
    </div>
  );
}
