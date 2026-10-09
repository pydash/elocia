import { tokenManager, getNameFromToken, getRoleFromToken } from "@/helpers/jwt";
import { ShieldCheck, Info, School, Users, KeyRound } from "lucide-react";

export default function AdminSettingsPage() {
  const token = tokenManager.getAccessToken() || "";
  const name = getNameFromToken(token) || "Administrator";
  const role = getRoleFromToken(token) || "admin";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        <div>
          <h1 className="heading-2 text-(--black)">Administrator Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your administrative permissions and school management responsibilities.
          </p>
        </div>

        {/* Admin Profile Card */}
        <div className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF8A00]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">School Administrator</h2>
              <p className="text-xs text-gray-500">Authorized school coordinator account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Account Name
              </span>
              <p className="text-base font-bold text-gray-900">{name}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Account Type
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-700 capitalize">
                  {role}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Practical School Duties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-[#FF8A00] font-bold text-xs">
                <Users className="h-4 w-4" />
                <span>User Accounts</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Add and manage Teachers, Parents, and Students in the User Directory.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <KeyRound className="h-4 w-4" />
                <span>Password & PIN Resets</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Reset forgotten adult passwords or student 4-digit PINs anytime.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <School className="h-4 w-4" />
                <span>Class Sections</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Assign teachers to classroom sections and school grade levels.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-4 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              To change your own administrator password or create new accounts, use the <strong>User Directory</strong> tab.
            </p>
          </div>
        </div>

        {/* School System Information */}
        <div className="rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-2xs text-xs text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-gray-700">ELOCIA: FSL Learning System</p>
            <p className="text-gray-400">Special Education (SPED) Department</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 font-mono text-[11px] font-semibold text-gray-600">
            System v1.0
          </span>
        </div>
      </main>
    </div>
  );
}
