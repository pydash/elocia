import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { User, Lock, KeyRound, X } from "lucide-react";
import {
  updateUserAccount,
  type AdminUser,
  type UpdateUserPayload,
} from "@/services/admin";

interface EditUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onUpdated,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [gradeLevel, setGradeLevel] = useState(1);
  const [studentCode, setStudentCode] = useState("");
  const [emoji, setEmoji] = useState("👦");
  const [color, setColor] = useState("#3B82F6");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPassword("");
      setPin("");
      setGradeLevel(user.grade_level || 1);
      setStudentCode(user.student_code || "");
      setEmoji(user.emoji || "👦");
      setColor(user.color || "#3B82F6");
      setIsActive(user.is_active ?? true);
      setError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: UpdateUserPayload = {
        name,
        is_active: isActive,
      };

      if (user.role === "student") {
        payload.grade_level = Number(gradeLevel);
        payload.student_code = studentCode;
        payload.emoji = emoji;
        payload.color = color;
        if (pin.trim()) {
          payload.pin = pin.trim();
        }
      } else {
        // Teacher, Parent, Admin password reset
        if (password.trim()) {
          payload.password = password.trim();
        }
      }

      await updateUserAccount(user.id, payload);
      onUpdated();
    } catch (err: any) {
      console.error("Account update failed:", err);
      setError(err?.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit User Account</h3>
              <p className="text-xs text-gray-500">
                Updating details for <span className="font-semibold text-gray-700">{user.name}</span>{" "}
                <span className="capitalize text-xs font-semibold text-(--primary)">({user.role})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Field
              leadingIcon={User}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {user.role !== "student" ? (
            <>
              {user.username && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.username}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed font-mono text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reset Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <Field
                  leadingIcon={Lock}
                  type="password"
                  placeholder="Enter new password to reset"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Student Code
                  </label>
                  <Field
                    type="text"
                    placeholder="e.g. G1-01"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-(--primary) focus:outline-hidden"
                  >
                    <option value={1}>Grade 1</option>
                    <option value={2}>Grade 2</option>
                    <option value={3}>Grade 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reset Student PIN <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <Field
                  leadingIcon={KeyRound}
                  type="text"
                  maxLength={4}
                  placeholder="Enter new 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Avatar Emoji
                  </label>
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-(--primary) focus:outline-hidden"
                  >
                    <option value="👦">👦 Boy</option>
                    <option value="👧">👧 Girl</option>
                    <option value="🦊">🦊 Fox</option>
                    <option value="🦁">🦁 Lion</option>
                    <option value="🐼">🐼 Panda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Profile Color
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 p-1 cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {/* Account Status Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded text-(--primary) focus:ring-(--primary)"
              />
              <span className="text-xs font-medium text-gray-700">
                Account Active (uncheck to deactivate user)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
