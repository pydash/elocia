import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TopHeaderBar from "../../components/teacher/TopHeaderBar";
import StudentBanner from "../../components/teacher/StudentBanner";
import StatCard from "../../components/StatCard";
import { ArrowLeft, Flame } from "lucide-react";
import { useGetStudentById } from "@/hooks/useStudents";
import { getStreakMessage } from "@/helpers/streak";
import { fetchStudentScores } from "@/services/parent-progress";
import type { EvaluationAttemptItem } from "@/interfaces/parent.interface";

export default function TeacherStudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { student, loading, error, editStudent } = useGetStudentById(id || "");
  const [recentAttempts, setRecentAttempts] = useState<EvaluationAttemptItem[]>([]);
  const streakMessage = getStreakMessage(student?.streak || 0);

  useEffect(() => {
    if (id) {
      fetchStudentScores(id)
        .then((scores) => setRecentAttempts(scores || []))
        .catch(() => setRecentAttempts([]));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <TopHeaderBar />
        <div className="p-12 text-center text-(--ghost)">Loading student profile...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col gap-4">
        <TopHeaderBar />
        <div className="p-12 text-center text-(--danger)">Error: {error || "Student not found"}</div>
      </div>
    );
  }

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
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex w-full flex-col items-center gap-3 mt-4">
                <h3 className="heading-3 text-(--primary)">
                  {student.signs_mastered ?? 0}
                </h3>
              </div>
            </div>
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
            <p className="paragraph-2 text-center">{streakMessage}</p>
          </StatCard>
        </div>

        {/* Learning Path & Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Path Progress */}
          <div className="lg:col-span-2 min-h-60 flex flex-col justify-between rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
            <div className="w-full flex items-center justify-between">
              <h3 className="heading-3 text-(--primary)">Learning Path Progress</h3>
              <span className="text-sm font-semibold text-(--ghost)">
                {student.stages_complete ?? 0} Stages Completed
              </span>
            </div>

            <div className="flex items-center justify-around gap-3 py-6 overflow-x-auto">
              {[1, 2, 3, 4].map((stageNum) => {
                const isPassed = (student.stages_complete ?? 0) >= stageNum;
                const isCurrent = (student.stages_complete ?? 0) === stageNum - 1;

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
                    <span className="text-xs font-bold uppercase tracking-wider">Stage</span>
                    <span className="text-3xl font-extrabold my-1">{stageNum}</span>
                    <span className="text-xs font-semibold">
                      {isPassed ? "Completed" : isCurrent ? "Current" : "Locked"}
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
                <span className="text-[10px] font-medium">{recentAttempts.length > 0 ? "Unlocked" : "Locked"}</span>
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
                <span className="text-[10px] font-medium">{(student.avg_score ?? 0) >= 80 ? "Unlocked" : "Locked"}</span>
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
                <span className="text-[10px] font-medium">{(student.streak ?? 0) >= 3 ? "Unlocked" : "Locked"}</span>
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
                <span className="text-[10px] font-medium">{(student.stages_complete ?? 0) >= 1 ? "Unlocked" : "Locked"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments & Evaluation Sessions */}
        <div className="mb-12 w-full rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
          <h3 className="heading-3 text-(--primary)">Recent Assignments & Evaluation Sessions</h3>

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
                  </tr>
                </thead>

                <tbody>
                  {recentAttempts.map((assignment, index) => (
                    <tr key={assignment.id || index}>
                      <td className="paragraph-2 border-b border-(--border) px-4 py-4 text-(--black)">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex rounded-full bg-(--primary-light) px-3 py-1 font-semibold text-(--primary)">
                            #{index + 1}
                          </span>
                          <span>Stage {assignment.stage_id} Sign Practice</span>
                        </div>
                      </td>
                      <td className="paragraph-2 border-b border-(--border) px-4 py-4 text-(--ghost)">
                        {assignment.created_at
                          ? new Date(assignment.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recent"}
                      </td>
                      <td className="paragraph-2 border-b border-(--border) px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            assignment.passed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {assignment.passed ? "Passed" : "Needs Practice"}
                        </span>
                      </td>
                      <td className="paragraph-2 border-b border-(--border) px-4 py-4 font-semibold text-(--primary)">
                        {Math.round(assignment.score_overall)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-8 paragraph-2 text-(--ghost)">
                No evaluation sessions or assignments recorded yet for this student.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
