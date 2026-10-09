import {
  HelpCircle,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function ParentHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 text-[#FF8A00] font-bold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="h-4 w-4" />
            <span>Parent Support & Guidance</span>
          </div>
          <h1 className="heading-2 text-(--black)">Parent Guide & FAQ</h1>
          <p className="text-sm text-gray-500 mt-1">
            Learn how to support your child’s Filipino Sign Language (FSL) journey using ELOCIA.
          </p>
        </div>

        {/* Section 1: Understanding Progress Metrics */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF8A00]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Understanding Your Child's Progress
              </h2>
              <p className="text-xs text-gray-500">
                How accuracy scores and parameter mastery work
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <span className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">
                Average Score
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Calculated across all completed FSL evaluation stages. Scores above 75% show solid foundational mastery.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Practice Streak
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tracks consecutive active days of signing. Consistent 10–15 minute daily practice builds motor memory.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Stage Badges
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Earned when completing full stages on the horizontal path. Badges reward persistence and growth.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1.5">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                4 Signing Parameters
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Breaks down accuracy into Handshape, Palm Orientation, Position, and Movement for clear feedback.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Supporting Practice at Home */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Tips for Supporting Practice at Home
              </h2>
              <p className="text-xs text-gray-500">Creating an effective signing environment</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <Calendar className="h-5 w-5 text-[#FF8A00] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">Establish Short Daily Routines</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Young learners retain gestures best with 10–15 minutes of regular daily signing rather than long weekly sessions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <BookOpen className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">Sign Together</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Watch the lesson videos together in the desktop app and practice fingerspelling family names and daily objects.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <Award className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">Celebrate Small Improvements</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Praise effort and streak milestones rather than only perfect 100% scores.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Parent FAQ */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-500">Common questions about the parent portal</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <h3 className="font-bold text-gray-900">
                What does a red dot or flag on my child's progress mean?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                It indicates a specific sign where the student had difficulty and triggered extra guidance. Their teacher receives this notification and can dispatch a tailored practice drill.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <h3 className="font-bold text-gray-900">
                Can I reset my password or my child's 4-digit PIN?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                For student privacy and security, password and PIN resets are handled by your school administrator. Simply reach out to your school's ELOCIA coordinator.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

