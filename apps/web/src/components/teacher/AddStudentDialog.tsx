import { useState, useEffect, type FormEvent } from "react";
import Button from "../Button";
import Input from "../Input ";
import type { CreateStudentPayload } from "@/services/students";
import { fetchParents, type ParentUser } from "@/services/students";
import { Search, UserCheck, X } from "lucide-react";

type AddStudentDialogProps = {
  onSave: (student: CreateStudentPayload) => Promise<unknown>;
};

type StudentForm = {
  name: string;
  pin: string;
  color: string;
  emoji: string;
  grade_level: number;
  parent_id: string;
};

const initialStudent: StudentForm = {
  name: "",
  pin: "",
  color: "#3B82F6",
  emoji: "👦",
  grade_level: 1,
  parent_id: "",
};

export default function AddStudentDialog({ onSave }: AddStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [student, setStudent] = useState(initialStudent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Parent selection state
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingParents(true);
    fetchParents(parentSearch.trim() || undefined)
      .then((data) => {
        if (isMounted) setParents(data);
      })
      .catch((err) => console.error("Error fetching parents:", err))
      .finally(() => {
        if (isMounted) setIsLoadingParents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, parentSearch]);

  const closeDialog = () => {
    if (isSaving) return;
    setIsOpen(false);
    setStudent(initialStudent);
    setSelectedParent(null);
    setParentSearch("");
    setShowDropdown(false);
    setError("");
  };

  const updateStudent = <K extends keyof StudentForm>(
    field: K,
    value: StudentForm[K],
  ) => {
    setStudent((currentStudent) => ({
      ...currentStudent,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const { parent_id, ...studentDetails } = student;
      await onSave(
        parent_id ? { ...studentDetails, parent_id } : studentDetails,
      );
      setIsOpen(false);
      setStudent(initialStudent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        className="whitespace-nowrap"
        onClick={() => setIsOpen(true)}
      >
        Add Student
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
            aria-labelledby="add-student-title"
          >
            <div className="mb-6">
              <h2 id="add-student-title" className="heading-3 text-(--black)">
                Add Student
              </h2>
              <p className="paragraph-2 mt-2 text-(--ghost)">
                Create a student account.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="caption text-(--black)" htmlFor="student-name">
                Name
                <Input
                  id="student-name"
                  className="mt-2"
                  value={student.name}
                  onChange={(event) =>
                    updateStudent("name", event.target.value)
                  }
                  required
                />
              </label>

              <label className="caption text-(--black)" htmlFor="student-pin">
                PIN
                <Input
                  id="student-pin"
                  className="mt-2"
                  type="password"
                  inputMode="numeric"
                  minLength={4}
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={student.pin}
                  onChange={(event) => updateStudent("pin", event.target.value)}
                  required
                />
              </label>

              <label className="caption text-(--black)" htmlFor="student-color">
                Avatar color
                <Input
                  id="student-color"
                  className="mt-2"
                  type="color"
                  value={student.color}
                  onChange={(event) =>
                    updateStudent("color", event.target.value)
                  }
                  required
                />
              </label>

              <label className="caption text-(--black)" htmlFor="student-emoji">
                Avatar emoji
                <Input
                  id="student-emoji"
                  className="mt-2"
                  value={student.emoji}
                  onChange={(event) =>
                    updateStudent("emoji", event.target.value)
                  }
                  required
                />
              </label>

              <label className="caption text-(--black)" htmlFor="student-grade">
                Grade level
                <Input
                  id="student-grade"
                  className="mt-2"
                  type="number"
                  min="1"
                  max="12"
                  value={student.grade_level}
                  onChange={(event) =>
                    updateStudent("grade_level", Number(event.target.value))
                  }
                  required
                />
              </label>

              <div className="relative">
                <label className="caption text-(--black)" htmlFor="student-parent-search">
                  Assign Parent (optional)
                </label>

                {selectedParent ? (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <UserCheck className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-(--black)">{selectedParent.name}</p>
                        {selectedParent.username && (
                          <p className="text-xs text-(--ghost)">@{selectedParent.username}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParent(null);
                        updateStudent("parent_id", "");
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-white hover:text-red-500 transition-colors"
                      title="Remove assigned parent"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-2">
                    <div className="relative flex items-center">
                      <Input
                        id="student-parent-search"
                        value={parentSearch}
                        onChange={(event) => {
                          setParentSearch(event.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search parent by name or username..."
                      />
                      <Search className="pointer-events-none absolute right-3 size-4 text-(--ghost)" />
                    </div>

                    {showDropdown && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {isLoadingParents ? (
                          <div className="p-3 text-center text-xs text-(--ghost)">
                            Loading parents...
                          </div>
                        ) : parents.length === 0 ? (
                          <div className="p-3 text-center text-xs text-(--ghost)">
                            No parents found
                          </div>
                        ) : (
                          parents.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedParent(p);
                                updateStudent("parent_id", p.id);
                                setShowDropdown(false);
                                setParentSearch("");
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-sm font-medium text-(--black)">{p.name}</span>
                              {p.username && (
                                <span className="text-xs text-(--ghost)">@{p.username}</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
