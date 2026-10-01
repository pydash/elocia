import { useState, type FormEvent } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { updateSection, deleteSection } from "@/services/curriculum";
import type { Section } from "@/interfaces/curriculum.interface";

interface EditSectionDialogProps {
  section: Section;
  onUpdated: () => void;
  onDeleted?: () => void;
}

export default function EditSectionDialog({ section, onUpdated, onDeleted }: EditSectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [sectionNumber, setSectionNumber] = useState(section.section_number);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setTitle(section.title);
    setSectionNumber(section.section_number);
    setError(null);
    setIsOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Section title is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateSection(section.id, {
        title: title.trim(),
        section_number: Number(sectionNumber) || 1,
      });
      setIsOpen(false);
      onUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to update section.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteSection(section.id);
      setIsDeleteModalOpen(false);
      setIsOpen(false);
      if (onDeleted) onDeleted();
      else onUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to delete section.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        type="button"
        className="gap-1 px-3 py-1.5 text-xs text-gray-700 hover:text-(--primary) cursor-pointer"
        onClick={handleOpen}
        title="Edit Section"
      >
        <Pencil className="size-3.5" />
        <span>Edit</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Section</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Section Number
                </label>
                <Input
                  type="number"
                  min={1}
                  value={sectionNumber}
                  onChange={(e) => setSectionNumber(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Section Title
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Greetings and Courtesies"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  <span>Delete Section</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4">
            <h4 className="text-base font-bold text-gray-900">Delete Section?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">{section.title}</strong>? All units, stages, and rounds under this section will also be deleted.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
