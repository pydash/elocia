import { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import Button from "@/components/Button";
import { deleteMiniGame } from "@/services/mini-games";

interface DeleteMiniGameDialogProps {
  isOpen: boolean;
  gameId: string;
  gameTitle: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteMiniGameDialog({
  isOpen,
  gameId,
  gameTitle,
  onClose,
  onDeleted,
}: DeleteMiniGameDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteMiniGame(gameId, false);
      onDeleted();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete mini-game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="size-5" />
            <h3 className="text-base font-bold text-gray-900">Delete Mini Game?</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to delete activity <strong className="text-gray-900">"{gameTitle}"</strong>?
          It will be removed from the active games list.
        </p>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin mr-1.5" />}
            {loading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

