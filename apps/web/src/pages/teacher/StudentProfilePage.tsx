import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useGetStudentById } from "@/hooks/useStudents";

import { fetchStudentScores } from "@/services/parent-progress";

import { ArrowLeft, Flame } from "lucide-react";

import { getStreakMessage } from "@/helpers/streak";

import type { EvaluationAttemptItem } from "@/interfaces/parent.interface";

import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import StudentBanner from "@/components/teacher/StudentBanner";
import StatCard from "@/components/StatCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import UnitAnalyticsModal from "@/components/teacher/UnitAnalyticsModal";

export default function TeacherStudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { student, loading, error, editStudent } = useGetStudentById(id || "");
  const [recentAttempts, setRecentAttempts] = useState<EvaluationAttemptItem[]>(
    [],
  );
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const streakMessage = getStreakMessage(student?.streak || 0);

  useEffect(() => {
    if (id) {
      fetchStudentScores(id)
        .then((scores) => setRecentAttempts(scores || []))
        .catch(() => setRecentAttempts([]));
    }
  }, [id]);

  if (loading) return <LoadingState />;

  if (error || !student)
    return <ErrorState message={error || "Student not found."} />;

  return (
    <div className="flex flex-col gap-4">
      <TopHeaderBar />
      <section className="flex flex-col gap-8 p-4 max-w-7xl mx-auto w-full">
        <Link
          to="/teacher/students"
          className="bg-(--primary) w-fit p-2 rounded-full text-(--white) hover:bg-(--primary-hover)"
        >
          <ArrowLeft />
        </Link>
        <StudentBanner student={student} onSave={editStudent} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Signs Mastered Card */}
          <StatCard label="Signs Mastered">
            <h3 className="heading-2 text-(--primary)">
              {student.signs_mastered ?? 0}
            </h3>
          </StatCard>

          {/* Average Score Card */}
          <StatCard label="Average Score">
            <h3 className="heading-2 text-(--success)">
              {student.avg_score ?? 0}%
            </h3>
          </StatCard>

          {/* Stages Completed Card */}
          <StatCard label="Stages Completed">
            <h3 className="heading-2 text-[#b07311]">
              {student.stages_complete ?? 0}
            </h3>
          </StatCard>

          {/* Streak Card */}
          <StatCard label="Streak">
            <div className="flex items-center gap-2 text-(--danger)">
              <Flame className="size-6 fill-(--danger-light)" />
              <h3 className="heading-2">{student.streak ?? 0}</h3>
            </div>
            <p className="paragraph-3 text-center">{streakMessage}</p>
          </StatCard>
        </div>

        {/* Learning Path & Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Path Progress */}
          <div className="lg:col-span-2 min-h-60 flex flex-col justify-between rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
            <div className="w-full flex items-center justify-between">
              <h3 className="heading-3 text-(--primary)">
                Learning Path Progress
              </h3>
              <span className="text-sm font-semibold text-(--ghost)">
                {student.stages_complete ?? 0} Stages Completed
              </span>
            </div>

            <div className="flex items-center justify-around gap-3 py-6 overflow-x-auto">
              {[1, 2, 3, 4].map((stageNum) => {
                const isPassed = (student.stages_complete ?? 0) >= stageNum;
                const isCurrent =
                  (student.stages_complete ?? 0) === stageNum - 1;

                return (
                  <div
                    key={stageNum}
                    className={`flex flex-col items-center justify-center w-28 h-32 rounded-2xl border-2 transition-all ${
                      isPassed
                        ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm"
                        : isCurrent
                          ? "bg-orange-50 border-(--primary) text-(--primary) shadow-sm"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Stage
                    </span>
                    <span className="text-3xl font-extrabold my-1">
                      {stageNum}
                    </span>
                    <span className="text-xs font-semibold">
                      {isPassed
                        ? "Completed"
                        : isCurrent
                          ? "Current"
                          : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Achievements */}
          <div className="flex min-h-60 flex-col justify-between rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
            <h3 className="heading-3 text-(--primary)">Achievements</h3>

            <div className="grid grid-cols-2 gap-3 py-2">
              <div
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  recentAttempts.length > 0
                    ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs"
                    : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                }`}
              >
                <span className="text-2xl">⚡</span>
                <span className="text-xs font-bold mt-1">Fast Learner</span>
                <span className="text-[10px] font-medium">
                  {recentAttempts.length > 0 ? "Unlocked" : "Locked"}
                </span>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  (student.avg_score ?? 0) >= 80
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                    : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                }`}
              >
                <span className="text-2xl">🏆</span>
                <span className="text-xs font-bold mt-1">Sign Master</span>
                <span className="text-[10px] font-medium">
                  {(student.avg_score ?? 0) >= 80 ? "Unlocked" : "Locked"}
                </span>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  (student.streak ?? 0) >= 3
                    ? "bg-orange-50 border-orange-300 text-orange-800 shadow-xs"
                    : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                }`}
              >
                <span className="text-2xl">🔥</span>
                <span className="text-xs font-bold mt-1">Dedicated</span>
                <span className="text-[10px] font-medium">
                  {(student.streak ?? 0) >= 3 ? "Unlocked" : "Locked"}
                </span>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  (student.stages_complete ?? 0) >= 1
                    ? "bg-blue-50 border-blue-300 text-blue-800 shadow-xs"
                    : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                }`}
              >
                <span className="text-2xl">🎖️</span>
                <span className="text-xs font-bold mt-1">Stage Champ</span>
                <span className="text-[10px] font-medium">
                  {(student.stages_complete ?? 0) >= 1 ? "Unlocked" : "Locked"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments & Evaluation Sessions */}
        <div className="mb-12 w-full rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
          <h3 className="heading-3 text-(--primary)">
            Recent Assignments & Evaluation Sessions
          </h3>

          <div className="mt-5 overflow-x-auto">
            {recentAttempts.length > 0 ? (
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-left">
                    <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black)">
                      Activity / Sign
                    </th>
                    <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black)">
                      Date
                    </th>
                    <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black)">
                      Status
                    </th>
                    <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black)">
                      Score
                    </th>
                    <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black) text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentAttempts.map((assignment, index) => {
                    const isFlagged = !assignment.passed || assignment.tier_level === 4;
                    const stageNum = assignment.stage_id || assignment.stage_id_new || 1;

                    return (
                      <tr key={assignment.id || index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="paragraph-2 border-b border-(--border) px-4 py-4 text-(--black)">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex rounded-full bg-(--primary-light) px-3 py-1 font-semibold text-(--primary)">
                              #{index + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <span>Stage {stageNum} Sign Practice</span>
                              {isFlagged && (
                                <span
                                  className="flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200 animate-pulse"
                                  title="Flagged (Tier 4 / Needs Focus)"
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="paragraph-2 border-b border-(--border) px-4 py-4 text-(--ghost)">
                          {assignment.created_at
                            ? new Date(assignment.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "Recent"}
                        </td>
                        <td className="paragraph-2 border-b border-(--border) px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              assignment.passed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {!assignment.passed && (
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            )}
                            {assignment.passed ? "Passed" : "Needs Practice"}
                          </span>
                        </td>
                        <td className="paragraph-2 border-b border-(--border) px-4 py-4 font-semibold text-(--primary)">
                          {Math.round(assignment.score_overall)}%
                        </td>
                        <td className="paragraph-2 border-b border-(--border) px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStageId(stageNum);
                              setIsAnalyticsOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#FF8A00] border border-orange-200 hover:bg-[#FF8A00] hover:text-white transition-all shadow-2xs cursor-pointer"
                          >
                            <span>Analytics</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-8 paragraph-2 text-(--ghost)">
                No evaluation sessions or assignments recorded yet for this
                student.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Unit Analytics Modal */}
      {id && (
        <UnitAnalyticsModal
          studentId={id}
          studentName={student.name}
          stageId={selectedStageId}
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
        />
      )}
    </div>
  );
}
