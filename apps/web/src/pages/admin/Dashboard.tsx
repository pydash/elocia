import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import Button from "@/components/Button";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  School,
  Users,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  fetchAdminMetrics,
  fetchAllUsers,
  type AdminSummaryMetrics,
  type AdminUser,
} from "@/services/admin";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminSummaryMetrics>({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
  });
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, usersData] = await Promise.all([
        fetchAdminMetrics(),
        fetchAllUsers(),
      ]);
      setMetrics(metricsData);
      // Sort users by created_at desc, take top 6
      const sorted = [...usersData].sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      );
      setRecentUsers(sorted.slice(0, 6));
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-(--primary) p-8 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              System Console
            </span>
          </div>
          <h2 className="text-2xl font-bold">Platform Overview & Metrics</h2>
          <p className="mt-1 text-sm text-white/80 max-w-xl">
            Real-time telemetry and management controls for students, teachers,
            parents, and classroom allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={loadData}
            className="flex items-center gap-2 bg-white text-(--primary) hover:bg-white/90 border-0"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link to="/admin/users">
            <Button className="flex items-center gap-2 bg-amber-400 text-gray-900 hover:bg-amber-300 border-0 font-bold">
              <span>Manage Users</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Enrolled Students">
          <div className="flex items-baseline gap-2">
            <span className="heading-1 text-(--primary)">
              {metrics.totalStudents}
            </span>
            <GraduationCap className="size-6 text-(--primary) opacity-40" />
          </div>
        </StatCard>

        <StatCard label="Active Teachers">
          <div className="flex items-baseline gap-2">
            <span className="heading-1 text-emerald-600">
              {metrics.totalTeachers}
            </span>
            <Users className="size-6 text-emerald-600 opacity-40" />
          </div>
        </StatCard>

        <StatCard label="Connected Parents">
          <div className="flex items-baseline gap-2">
            <span className="heading-1 text-indigo-600">
              {metrics.totalParents}
            </span>
            <HeartHandshake className="size-6 text-indigo-600 opacity-40" />
          </div>
        </StatCard>

        <StatCard label="Classrooms">
          <div className="flex items-baseline gap-2">
            <span className="heading-1 text-orange-500">
              {metrics.totalClasses}
            </span>
            <School className="size-6 text-orange-500 opacity-40" />
          </div>
        </StatCard>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="heading-3 text-gray-900">Recently Registered Users</h3>
            <p className="text-xs text-gray-500">
              Latest additions across student, teacher, and parent accounts
            </p>
          </div>

          <Link
            to="/admin/users"
            className="text-sm font-semibold text-(--primary) hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {recentUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            {loading ? "Loading telemetry..." : "No registered users found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Identifier / Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-900 flex items-center gap-2">
                      {user.emoji && <span>{user.emoji}</span>}
                      <div>
                        <div>{user.name}</div>
                        {user.role === "student" && user.grade_level && (
                          <div className="text-[11px] text-(--primary) font-semibold">
                            Grade {user.grade_level}
                          </div>
                        )}
                        {user.role === "parent" && user.children_summary && (
                          <div className="text-[11px] text-indigo-600 font-medium">
                            Child: {user.children_summary}
                          </div>
                        )}
                        {user.role === "teacher" && user.class_name && (
                          <div className="text-[11px] text-emerald-600 font-medium">
                            Teaches: {user.class_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
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
                    <td className="px-4 py-3.5 text-gray-600">
                      {user.username || user.student_code || "—"}
                    </td>
                    <td className="px-4 py-3.5">
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
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}