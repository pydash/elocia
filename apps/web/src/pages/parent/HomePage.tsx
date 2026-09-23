import TopHeaderBar from "@/components/parent/TopHeaderBar";
import StudentBanner from "@/components/parent/StudentBanner";
import { useParentDashboard } from "@/hooks/useParentDashboard";
import {
  Check,
  Lock,
  Zap,
  Award,
  Medal,
  Trophy,
  Flame,
} from "lucide-react";

export default function ParentHomePage() {
  const {
    parentName,
    children,
    selectedChild,
    setSelectedChild,
    stats,
    stagePath,
    achievements,
    loading,
    error,
  } = useParentDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopHeaderBar />
        <div className="p-8 flex items-center justify-center flex-1">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 border-4 border-[#FF8A00] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading parent dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopHeaderBar />
        <div className="p-8 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">No Student Linked</h2>
            <p className="text-sm text-gray-500 mt-2">
              {error || "There are no students linked to your parent account yet. Please ask your child's teacher to link your account."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      <TopHeaderBar />

      <main className="px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Greeting with parent's real name */}
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Hello there, {parentName || "parent"}!
        </h1>

        {/* Student's Profile Banner */}
        <StudentBanner
          name={selectedChild.name}
          grade={selectedChild.grade_level}
          emoji={selectedChild.emoji}
          color={selectedChild.color}
          allChildren={children}
          selectedChildId={selectedChild.id}
          onSelectChild={(child) => setSelectedChild(child)}
        />

        {/* 4 Stat Cards Matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: OVERALL PROGRESS */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Overall Progress
            </span>
            <div className="mt-4 space-y-2">
              <span className="block text-center text-sm font-semibold text-gray-700">
                {stats.overallProgress}%
              </span>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF8A00] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats.overallProgress))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: AVG. SCORE */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Avg. Score
            </span>
            <div className="mt-2 text-center">
              <span className="text-4xl font-extrabold text-[#16A34A] tracking-tight">
                {stats.avgScore}%
              </span>
            </div>
            <div className="h-2" />
          </div>

          {/* Card 3: UNITS COMPLETED */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Units Completed
            </span>
            <div className="mt-2 text-center">
              <span className="text-4xl font-extrabold text-gray-800 tracking-tight">
                {stats.unitsCompleted}
              </span>
            </div>
            <div className="h-2" />
          </div>

          {/* Card 4: STREAK */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Streak
            </span>
            <div className="mt-2 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-red-500">
                <Flame className="size-7 fill-red-500 text-red-500" />
                <span className="text-4xl font-extrabold tracking-tight">
                  {stats.streak}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-400 mt-1">Keep it up!</span>
            </div>
          </div>
        </div>

        {/* Lower Row: Learning Path Progress (Left) + Achievements (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Learning Path Progress */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold tracking-widest text-[#FF8A00] uppercase">
                Section 1
              </span>
              <span className="text-sm font-semibold text-gray-600">
                Learning Path Progress
              </span>
            </div>

            {/* Stages Flow */}
            <div className="flex items-center justify-between px-4 py-6">
              {stagePath.map((stage, idx) => (
                <div key={stage.stageNumber} className="flex items-center flex-1 last:flex-none">
                  {/* Stage Card */}
                  <div
                    className={`flex flex-col items-center justify-center w-24 h-32 rounded-2xl transition-all shadow-sm ${
                      stage.status === "completed"
                        ? "bg-[#E6F9EE] border border-[#A7F3D0] text-[#059669]"
                        : stage.status === "current"
                        ? "bg-white border-2 border-[#FF8A00] text-gray-800 shadow-md"
                        : "bg-white border border-gray-200 text-gray-400"
                    }`}
                  >
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-80">
                      Stage
                    </span>
                    <span
                      className={`text-2xl font-extrabold my-1 ${
                        stage.status === "completed"
                          ? "text-[#059669]"
                          : stage.status === "current"
                          ? "text-[#FF8A00]"
                          : "text-gray-400"
                      }`}
                    >
                      {stage.stageNumber}
                    </span>

                    {/* Status Icon or Mini Progress */}
                    {stage.status === "completed" ? (
                      <div className="size-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs mt-1">
                        <Check className="size-4 stroke-[3]" />
                      </div>
                    ) : stage.status === "current" ? (
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-[#FF8A00] rounded-full"
                          style={{ width: `${stage.progressPercentage || 60}%` }}
                        />
                      </div>
                    ) : (
                      <div className="size-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mt-1">
                        <Lock className="size-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Connector line between stages */}
                  {idx < stagePath.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded-full ${
                        stage.status === "completed" ? "bg-[#10B981]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="h-2" />
          </div>

          {/* Right Column: Achievements Grid Matching Figma */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <h2 className="text-base font-bold text-gray-700 mb-4">Achievements</h2>

            <div className="grid grid-cols-2 gap-4 py-2">
              {achievements.map((badge) => {
                const getBadgeIcon = () => {
                  switch (badge.iconType) {
                    case "lightning":
                      return <Zap className="size-5" />;
                    case "snake":
                      return <Award className="size-5" />;
                    case "medal":
                      return <Medal className="size-5" />;
                    case "trophy":
                      return <Trophy className="size-5" />;
                    default:
                      return <Award className="size-5" />;
                  }
                };

                return (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center justify-center text-center p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
                  >
                    <div
                      className={`size-14 rounded-full flex items-center justify-center shadow-xs mb-2 ${
                        badge.color === "orange"
                          ? "bg-orange-100 text-[#FF8A00]"
                          : badge.color === "green"
                          ? "bg-green-100 text-[#10B981]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {getBadgeIcon()}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-1" />
          </div>
        </div>
      </main>
    </div>
  );
}
