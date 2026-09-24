import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import {
  Search,
  UserPlus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import {
  fetchAllUsers,
  deactivateUserAccount,
  type AdminUser,
} from "@/services/admin";
import CreateUserModal from "@/components/admin/CreateUserModal";
import EditUserModal from "@/components/admin/EditUserModal";

type RoleFilter = "all" | "teacher" | "parent" | "student" | "admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RoleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeactivate = async (user: AdminUser) => {
    const confirm = window.confirm(
      `Are you sure you want to deactivate account for ${user.name}?`
    );
    if (!confirm) return;

    try {
      await deactivateUserAccount(user.id);
      setActionMessage(`Account for ${user.name} has been deactivated.`);
      loadUsers();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error("Error deactivating user:", err);
      alert("Failed to deactivate user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    // Role filter
    if (activeTab !== "all" && u.role !== activeTab) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchUsername = u.username?.toLowerCase().includes(q);
      const matchCode = u.student_code?.toLowerCase().includes(q);
      return matchName || matchUsername || matchCode;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-2 text-gray-900">User Directory</h2>
          <p className="text-sm text-gray-500">
            Manage teacher, parent, and student accounts across the system.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={loadUsers}
            className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-(--primary) text-white hover:bg-(--primary-hover)"
          >
            <UserPlus className="size-4" />
            <span>+ Add Account</span>
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(["all", "teacher", "parent", "student", "admin"] as RoleFilter[]).map(
            (tab) => {
              const count =
                tab === "all"
                  ? users.length
                  : users.filter((u) => u.role === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                    activeTab === tab
                      ? "bg-(--primary) text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{tab === "all" ? "All Users" : `${tab}s`}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeTab === tab
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="w-full sm:w-72">
          <Field
            leadingIcon={Search}
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Master Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            {loading ? "Loading users..." : "No users match your criteria."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Username / Code</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      {user.emoji ? (
                        <span className="size-8 flex items-center justify-center rounded-full bg-gray-100 text-base">
                          {user.emoji}
                        </span>
                      ) : (
                        <span className="size-8 flex items-center justify-center rounded-full bg-(--primary-light) text-(--primary) font-bold text-xs uppercase">
                          {user.name.charAt(0)}
                        </span>
                      )}
                      <div>
                        <div>{user.name}</div>
                        {user.role === "student" && user.grade_level && (
                          <div className="text-xs text-(--primary) font-semibold">
                            Grade {user.grade_level}
                          </div>
                        )}
                        {user.role === "parent" && user.children_summary && (
                          <div className="text-xs text-indigo-600 font-medium">
                            Child: {user.children_summary}
                          </div>
                        )}
                        {user.role === "teacher" && user.class_name && (
                          <div className="text-xs text-emerald-600 font-medium">
                            Teaches: {user.class_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "teacher"
                            ? "bg-emerald-100 text-emerald-700"
                            : user.role === "parent"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {user.username || user.student_code || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          user.is_active ? "text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            user.is_active ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        />
                        {user.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedUserForEdit(user)}
                        title="Edit account details"
                        className="text-gray-400 hover:text-(--primary) p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="size-4" />
                      </button>
                      {user.role !== "admin" && user.is_active && (
                        <button
                          onClick={() => handleDeactivate(user)}
                          title="Deactivate account"
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          loadUsers();
          setActionMessage("New account created successfully!");
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={Boolean(selectedUserForEdit)}
        user={selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        onUpdated={() => {
          setSelectedUserForEdit(null);
          loadUsers();
          setActionMessage("Account details updated successfully!");
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />
    </div>
  );
}
