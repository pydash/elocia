import { useState, useRef, type FormEvent } from "react";
import { Upload, X, Loader2, Video } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { uploadStageBaseline } from "@/services/curriculum";

interface AddSignDialogProps {
  stageId: number;
  gradeLevel?: number;
  onAdded: () => void;
}

export default function AddSignDialog({ stageId, gradeLevel = 1, onAdded }: AddSignDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signName, setSignName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setSignName("");
    setSelectedFile(null);
    setError(null);
    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!signName.trim()) {
      setError("Please enter a sign name.");
      return;
    }
    if (!selectedFile) {
      setError("Please select a video file (.mp4, .webm, .mov).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await uploadStageBaseline(
        stageId,
        signName.trim(),
        selectedFile,
        gradeLevel,
        `Demonstration video for ${signName.trim()}`
      );
      setIsOpen(false);
      onAdded();
    } catch (err: any) {
      setError(err.message || "Failed to upload sign video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        className="gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
        onClick={handleOpen}
      >
        <Upload className="size-3.5" />
        <span>Add Sign Video</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Video className="size-5 text-(--primary)" />
                <h3 className="text-lg font-bold text-gray-900">Add Demonstration Sign</h3>
              </div>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Sign Name
                </label>
                <Input
                  type="text"
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  placeholder="e.g. Black, Brown, Hello"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Demonstration Video
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/mkv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-(--primary) rounded-xl p-5 text-center cursor-pointer transition bg-gray-50 hover:bg-gray-100/50 flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="size-6 text-gray-400" />
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{selectedFile.name}</p>
                      <p className="text-[11px] text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-gray-700">Click to upload video</p>
                      <p className="text-[11px] text-gray-400">MP4, WebM, or MOV format</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? "Extracting & Saving..." : "Upload & Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
