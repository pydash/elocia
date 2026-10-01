import { useState, type FormEvent } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { updateUnit, deleteUnit } from "@/services/curriculum";
import type { Unit } from "@/interfaces/curriculum.interface";

interface EditUnitDialogProps {
  unit: Unit;
  onUpdated: () => void;
  onDeleted?: () => void;
}

export default function EditUnitDialog({ unit, onUpdated, onDeleted }: EditUnitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [title, setTitle] = useState(unit.title);
  const [unitNumber, setUnitNumber] = useState(unit.unit_number);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setTitle(unit.title);
    setUnitNumber(unit.unit_number);
    setError(null);
    setIsOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Unit title is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUnit(unit.id, {
        title: title.trim(),
        unit_number: Number(unitNumber) || 1,
      });
      setIsOpen(false);
      onUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to update unit.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteUnit(unit.id);
      setIsDeleteModalOpen(false);
      setIsOpen(false);
      if (onDeleted) onDeleted();
      else onUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to delete unit.");
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
        title="Edit Unit"
      >
        <Pencil className="size-3.5" />
        <span>Edit</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Unit</h3>
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
                  Unit Number
                </label>
                <Input
                  type="number"
                  min={1}
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Unit Title
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 1: Basic Colors"
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
                  <span>Delete Unit</span>
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
            <h4 className="text-base font-bold text-gray-900">Delete Unit?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">{unit.title}</strong>? All stages and sign rounds under this unit will be removed.
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
