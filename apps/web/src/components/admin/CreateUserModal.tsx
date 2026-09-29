import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { User, Lock, KeyRound, X, Search, UserCheck } from "lucide-react";
import {
  createAdultAccount,
  createStudentAccount,
  type CreateAdultPayload,
  type CreateStudentPayload,
} from "@/services/admin";
import { fetchParents, type ParentUser } from "@/services/students";

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

  // Parent selection for student creation
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  useEffect(() => {
    if (isOpen && role === "student" && parents.length === 0) {
      setIsLoadingParents(true);
      fetchParents()
        .then((data) => setParents(data || []))
        .catch((err) => console.error("Error loading parents:", err))
        .finally(() => setIsLoadingParents(false));
    }
  }, [isOpen, role, parents.length]);

  const filteredParents = parents.filter((p) => {
    if (!parentSearch.trim()) return true;
    const term = parentSearch.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.username && p.username.toLowerCase().includes(term))
    );
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation for adult passwords
    if (role !== "student") {
      if (password.trim().length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    }

    if (role === "student") {
      if (!/^\d{4}$/.test(pin.trim())) {
        setError("Student PIN must be exactly 4 digits.");
        return;
      }
    }

    setLoading(true);

    try {
      if (role === "teacher" || role === "parent") {
        const payload: CreateAdultPayload = {
          name: name.trim(),
          username: username.trim(),
          password,
          role,
        };
        await createAdultAccount(payload);
      } else {
        const payload: CreateStudentPayload = {
          name: name.trim(),
          pin: pin.trim(),
          grade_level: Number(gradeLevel),
          emoji,
          color,
          ...(selectedParent?.id ? { parent_id: selectedParent.id } : {}),
        };
        await createStudentAccount(payload);
      }

      // Reset form
      setName("");
      setUsername("");
      setPassword("");
      setPin("1234");
      setSelectedParent(null);
      setParentSearch("");
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
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Password must be at least 6 characters long.
                </p>
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

              {/* Optional Parent Assignment for Student */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Assign Parent (Optional)
                </label>
                {selectedParent ? (
                  <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <UserCheck className="size-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          {selectedParent.name}
                        </p>
                        {selectedParent.username && (
                          <p className="text-[10px] text-gray-500">
                            @{selectedParent.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedParent(null)}
                      className="rounded p-1 text-gray-400 hover:bg-white hover:text-red-500 transition-colors"
                      title="Remove assigned parent"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={parentSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setParentSearch(e.target.value);
                          setShowParentDropdown(true);
                        }}
                        onFocus={() => setShowParentDropdown(true)}
                        placeholder="Search parent by name or username..."
                        className="w-full rounded-md border border-gray-300 bg-white pl-3 pr-9 py-2 text-xs focus:border-(--primary) focus:outline-hidden"
                      />
                      <Search className="pointer-events-none absolute right-3 size-4 text-gray-400" />
                    </div>

                    {showParentDropdown && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {isLoadingParents ? (
                          <div className="p-2.5 text-center text-xs text-gray-500">
                            Loading parents...
                          </div>
                        ) : filteredParents.length === 0 ? (
                          <div className="p-2.5 text-center text-xs text-gray-500">
                            No parents found
                          </div>
                        ) : (
                          filteredParents.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedParent(p);
                                setShowParentDropdown(false);
                                setParentSearch("");
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-xs font-medium text-gray-900">
                                {p.name}
                              </span>
                              {p.username && (
                                <span className="text-[10px] text-gray-500">
                                  @{p.username}
                                </span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
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
