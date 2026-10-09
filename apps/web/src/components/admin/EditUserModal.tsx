import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { User, Lock, KeyRound, X, Search, Users, ShieldCheck, Eye, EyeOff } from "lucide-react";
import {
  updateUserAccount,
  type AdminUser,
  type UpdateUserPayload,
} from "@/services/admin";
import { fetchParents, type ParentUser } from "@/services/students";

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
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [gradeLevel, setGradeLevel] = useState(1);
  const [studentCode, setStudentCode] = useState("");
  const [emoji, setEmoji] = useState("👦");
  const [color, setColor] = useState("#3B82F6");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-parent Linking State for Students (supports multiple parents, e.g. Mother & Father)
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [selectedParents, setSelectedParents] = useState<ParentUser[]>([]);
  const [parentSearch, setParentSearch] = useState("");
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPassword("");
      setPin("");
      setGradeLevel(user.grade_level || 1);
      setStudentCode(user.student_code || "");
      setEmoji(user.emoji || "👦");
      setColor(user.color || "#3B82F6");
      setIsActive(user.role === "admin" ? true : (user.is_active ?? true));
      setError(null);
      setParentSearch("");
      setShowParentDropdown(false);

      if (user.role === "student") {
        if (user.parents && user.parents.length > 0) {
          setSelectedParents(
            user.parents.map((p) => ({
              id: p.id,
              name: p.name,
              username: p.username,
            }))
          );
        } else if (user.parent_id && user.parent_name) {
          setSelectedParents([
            {
              id: user.parent_id,
              name: user.parent_name,
            },
          ]);
        } else {
          setSelectedParents([]);
        }

        // Fetch parent accounts to allow linking
        setIsLoadingParents(true);
        fetchParents()
          .then((data) => setParents(data))
          .catch((err) => console.error("Failed to fetch parents:", err))
          .finally(() => setIsLoadingParents(false));
      } else {
        setSelectedParents([]);
      }
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const filteredParents = parents.filter((p) => {
    if (!parentSearch.trim()) return true;
    const term = parentSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.username && p.username.toLowerCase().includes(term))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: UpdateUserPayload = {
        name,
        is_active: user.role === "admin" ? true : isActive,
      };

      if (user.role === "student") {
        payload.grade_level = Number(gradeLevel);
        payload.student_code = studentCode;
        payload.emoji = emoji;
        payload.color = color;
        if (pin.trim()) {
          payload.pin = pin.trim();
        }

        // Sync multiple parents
        payload.parent_ids = selectedParents.map((p) => p.id);
        if (selectedParents.length === 0) {
          payload.remove_parent = true;
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
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                  trailingIcon={showPassword ? EyeOff : Eye}
                  onTrailingIconClick={() => setShowPassword((prev) => !prev)}
                  type={showPassword ? "text" : "password"}
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
                  trailingIcon={showPin ? EyeOff : Eye}
                  onTrailingIconClick={() => setShowPin((prev) => !prev)}
                  type={showPin ? "text" : "password"}
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

              {/* Linked Parents Section (Supports Multiple Parents, e.g. Mother & Father) */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/75 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <Users className="size-4 text-(--primary)" />
                    <span>Linked Parents ({selectedParents.length})</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    (Supports multiple parents, e.g. Mother & Father)
                  </span>
                </div>

                {/* Badges for currently linked parents */}
                {selectedParents.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedParents.map((parent) => (
                      <div
                        key={parent.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs shadow-xs"
                      >
                        <div className="size-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {parent.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-indigo-950">
                          {parent.name}
                        </span>
                        {parent.username && (
                          <span className="text-[10px] text-indigo-600">
                            @{parent.username}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParents((prev) =>
                              prev.filter((p) => p.id !== parent.id)
                            );
                          }}
                          className="ml-1 rounded p-0.5 text-indigo-400 hover:bg-white hover:text-red-500 transition-colors"
                          title="Remove this parent"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-700">
                    ⚠️ No parents linked yet to this student. Search below to add parents.
                  </div>
                )}

                {/* Add Parent Search Bar */}
                <div className="relative pt-1 border-t border-gray-200/60">
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    + Add a Parent Account:
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={parentSearch}
                      onChange={(e) => {
                        setParentSearch(e.target.value);
                        setShowParentDropdown(true);
                      }}
                      onFocus={() => setShowParentDropdown(true)}
                      placeholder="Type name or username to search and link..."
                      className="w-full rounded-md border border-gray-300 bg-white pl-3 pr-9 py-2 text-xs focus:border-(--primary) focus:outline-hidden"
                    />
                    <Search className="pointer-events-none absolute right-3 size-4 text-gray-400" />
                  </div>

                  {showParentDropdown && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                      {isLoadingParents ? (
                        <div className="p-3 text-center text-xs text-gray-500">
                          Loading parents...
                        </div>
                      ) : filteredParents.filter((p) => !selectedParents.some((sp) => sp.id === p.id)).length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-500">
                          {parents.length === 0
                            ? "No parent accounts found in system"
                            : "No other matching parents"}
                        </div>
                      ) : (
                        filteredParents
                          .filter((p) => !selectedParents.some((sp) => sp.id === p.id))
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedParents((prev) => [...prev, p]);
                                setShowParentDropdown(false);
                                setParentSearch("");
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-indigo-50/70 border-b border-gray-50 last:border-0 transition-colors"
                            >
                              <span className="text-xs font-semibold text-gray-900">
                                {p.name}
                              </span>
                              {p.username && (
                                <span className="text-[10px] text-gray-500 font-mono">
                                  @{p.username}
                                </span>
                              )}
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Account Status Toggle (Protected for Admins) */}
          {user.role !== "admin" ? (
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
          ) : (
            <div className="pt-2 flex items-center gap-2 text-xs text-purple-700 bg-purple-50 p-2.5 rounded-lg border border-purple-200">
              <ShieldCheck className="size-4 text-purple-600 shrink-0" />
              <span>Admin accounts are permanently protected and cannot be deactivated.</span>
            </div>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
