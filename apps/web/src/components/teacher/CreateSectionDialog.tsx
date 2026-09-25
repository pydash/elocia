import { createSection } from "@/services/curriculum";
import { useState, type FormEvent } from "react";
import Button from "../Button";
import Input from "../Input ";

export default function CreateSectionDialog({
  lessonId,
}: {
  lessonId: string | undefined;
}) {
  const [section, setSection] = useState({
    title: "",
    description: "",
    is_active: true,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const closeDialog = () => {
    setIsOpen(false);
    setSection({
      title: "",
      description: "",
      is_active: true,
    });
  };

  const resetForm = () => {
    setSection({
      title: "",
      description: "",
      is_active: true,
    });
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createSection(lessonId ?? "", section);
      resetForm();
      closeDialog();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Create Section
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
          >
            <h2 className="mb-4 text-xl font-bold text-(--black)">
              Create Section
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium text-(--black)"
                >
                  Title
                </label>
                <Input
                  id="title"
                  type="text"
                  value={section.title}
                  onChange={(e) =>
                    setSection({ ...section, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-(--black)"
                >
                  Description
                </label>
                <Input
                  id="description"
                  type="text"
                  value={section.description}
                  onChange={(e) =>
                    setSection({ ...section, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={section.is_active}
                  onChange={(e) =>
                    setSection({ ...section, is_active: e.target.checked })
                  }
                />
                <label htmlFor="is_active" className="text-sm text-(--black)">
                  Active
                </label>
              </div>

              {error && <p className="text-sm text-(--danger)">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Create Section"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
