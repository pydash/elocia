import { tokenManager, getNameFromToken, getRoleFromToken } from "@/helpers/jwt";
import { User, Shield, Info, Heart } from "lucide-react";

export default function ParentSettingsPage() {
  const token = tokenManager.getAccessToken() || "";
  const name = getNameFromToken(token) || "Parent/Guardian";
  const role = getRoleFromToken(token) || "parent";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        <div>
          <h1 className="heading-2 text-(--black)">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your verified guardian profile linked to your child's learning account.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF8A00]">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Guardian Profile</h2>
              <p className="text-xs text-gray-500">Authorized parent/guardian access</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Guardian Name
              </span>
              <p className="text-base font-bold text-gray-900">{name}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Account Role
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-orange-700 capitalize">
                  {role}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1 flex items-start gap-3">
            <Heart className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Linked Access
              </span>
              <p className="text-sm font-bold text-gray-800">
                Authorized access to view enrolled child's FSL progress and achievement milestones.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-4 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              Student pairings and account updates are authorized by the school administration to ensure child data privacy and compliance.
            </p>
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-2xs text-xs text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-gray-700">ELOCIA Parent Portal</p>
            <p className="text-gray-400">Special Education (SPED) Department</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 font-mono text-[11px] font-semibold text-gray-600">
            Version 1.0
          </span>
        </div>
      </main>
    </div>
  );
}
