import {
  HelpCircle,
  Users,
  School,
  KeyRound,
  CheckCircle2,
  Shield,
  FileQuestion,
} from "lucide-react";

export default function AdminHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 text-[#FF8A00] font-bold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="h-4 w-4" />
            <span>Administrator Documentation</span>
          </div>
          <h1 className="heading-2 text-(--black)">Admin Manual & Operations Guide</h1>
          <p className="text-sm text-gray-500 mt-1">
            Guidelines for user provisioning, classroom roster allocation, and PIN management.
          </p>
        </div>

        {/* Section 1: Provisioning Rules */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF8A00]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                User Provisioning & Roles
              </h2>
              <p className="text-xs text-gray-500">Managing accounts across the school</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Teachers
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Log into Teacher Portal using username and password. Have full authority to manage sections, view radar analytics, and dispatch focus drills.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Parents
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Log into Parent Portal using username and password. Access is strictly scoped to their linked children.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Students
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Log into Desktop App via visual 4-digit PIN selection and avatar emoji. Passwordless login tailored for elementary DHH learners.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Administrative Procedures */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Standard Administrative Procedures
              </h2>
              <p className="text-xs text-gray-500">Common administrative workflows</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <KeyRound className="h-5 w-5 text-[#FF8A00] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">Resetting a Forgotten Password or PIN</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Navigate to <strong>User Directory</strong>, click the <em>Edit</em> icon next to the user. For adults, enter a new password in "Reset Password". For students, enter a new 4-digit PIN.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <School className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">Assigning Class Sections</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  In <strong>Classrooms</strong>, create grade sections and allocate the lead SPED teacher. Students are subsequently enrolled into sections by their assigned teacher.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">Deactivating Inactive Accounts</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Rather than hard-deleting records (which preserves evaluation attempt histories for research integrity), toggle the account status to Inactive in the Edit User modal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Admin FAQ */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <FileQuestion className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Operations FAQ</h2>
              <p className="text-xs text-gray-500">Security and environment information</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <h3 className="font-bold text-gray-900">
                Are student passwords or PINs stored in plain text?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Adult passwords are encrypted using bcrypt password hashing. Student 4-digit PINs are securely managed in the student profile table to support elementary visual keypad entry.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

