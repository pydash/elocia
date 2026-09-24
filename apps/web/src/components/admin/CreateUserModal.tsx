import { useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { User, Lock, KeyRound, X } from "lucide-react";
import {
  createAdultAccount,
  createStudentAccount,
  type CreateAdultPayload,
  type CreateStudentPayload,
} from "@/services/admin";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreated,
}: CreateUserModalProps) {
  const [role, setRole] = useState<"teacher" | "parent" | "student">("teacher");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("1234");
  const [gradeLevel, setGradeLevel] = useState(1);
  const [emoji, setEmoji] = useState("👦");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (role === "teacher" || role === "parent") {
        const payload: CreateAdultPayload = {
          name,
          username,
          password,
          role,
        };
        await createAdultAccount(payload);
      } else {
        const payload: CreateStudentPayload = {
          name,
          pin,
          grade_level: Number(gradeLevel),
          emoji,
          color,
        };
        await createStudentAccount(payload);
      }

      // Reset form
      setName("");
      setUsername("");
      setPassword("");
      setPin("1234");
      onCreated();
    } catch (err: any) {
      console.error("Account creation failed:", err);
      setError(err?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create New Account</h3>
            <p className="text-xs text-gray-500">
              Provision a new user for the ELOCIA system
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
          {(["teacher", "parent", "student"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-md transition-all ${
                role === r
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {r}
            </button>
          ))}
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
              placeholder="e.g. Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {role !== "student" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Field
                  leadingIcon={User}
                  type="text"
                  placeholder="e.g. msantos"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <Field
                  leadingIcon={Lock}
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Student PIN (4 Digits)
                  </label>
                  <Field
                    leadingIcon={KeyRound}
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                  />
                </div>
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : `Create ${role}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
