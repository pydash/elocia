import { useState, type FormEvent } from "react";
import Button from "../Button";
import Field from "../Field";
import Input from "../Input ";

export type NewStudent = {
  name: string;
  grade: string;
  username: string;
  pin: string;
};

type AddStudentDialogProps = {
  onSave?: (student: NewStudent) => void;
};

const initialStudent: NewStudent = {
  name: "",
  grade: "",
  username: "",
  pin: "",
};

export default function AddStudentDialog({ onSave }: AddStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [student, setStudent] = useState(initialStudent);

  const closeDialog = () => {
    setIsOpen(false);
    setStudent(initialStudent);
  };

  const updateStudent = (field: keyof NewStudent, value: string) => {
    setStudent((currentStudent) => ({
      ...currentStudent,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave?.(student);
    closeDialog();
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
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
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
              <div>
                <label
                  className="caption mb-2 block text-(--black)"
                  htmlFor="student-name"
                >
                  Name
                </label>
                <Input
                  id="student-name"
                  value={student.name}
                  onChange={(event) =>
                    updateStudent("name", event.target.value)
                  }
                  placeholder="Student name"
                  required
                />
              </div>

              <div>
                <label
                  className="caption mb-2 block text-(--black)"
                  htmlFor="student-grade"
                >
                  Grade level
                </label>
                <Input
                  id="student-grade"
                  type="number"
                  min="1"
                  max="12"
                  value={student.grade}
                  onChange={(event) =>
                    updateStudent("grade", event.target.value)
                  }
                  placeholder="Grade level"
                  required
                />
              </div>

              <div>
                <label
                  className="caption mb-2 block text-(--black)"
                  htmlFor="student-username"
                >
                  Username
                </label>
                <Input
                  id="student-username"
                  value={student.username}
                  onChange={(event) =>
                    updateStudent("username", event.target.value)
                  }
                  placeholder="Username"
                  required
                />
              </div>

              <div>
                <label
                  className="caption mb-2 block text-(--black)"
                  htmlFor="student-pin"
                >
                  Code PIN
                </label>
                <Input
                  id="student-pin"
                  type="password"
                  inputMode="numeric"
                  value={student.pin}
                  onChange={(event) => updateStudent("pin", event.target.value)}
                  placeholder="Code PIN"
                  required
                />
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
