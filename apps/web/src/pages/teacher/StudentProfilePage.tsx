import { Fragment } from "react";
import { Link, useParams } from "react-router-dom";
import TopHeaderBar from "../../components/teacher/TopHeaderBar";
import StudentBanner from "../../components/teacher/StudentBanner";
import ProgressBar from "../../components/ProgressBar";
import StatCard from "../../components/StatCard";
import { StageCard, StageConnector } from "../../components/teacher/StageCard";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Award,
  Flame,
  Info,
  Medal,
  ShieldCheck,
  Star,
} from "lucide-react";

type AchievementColor = "primary" | "success" | "warning" | "info";

type StudentData = {
  username: string;
  name: string;
  grade: string;
  overallProgress: number;
  averageScore: number;
  unitsCompleted: number;
  streak: number;
  currentStage: number;
  stageProgress: number;
  stages: Array<{
    stageNumber: number;
    variant: "completed" | "current" | "locked";
  }>;
  achievements: Array<{
    name: string;
    icon: LucideIcon;
    color: AchievementColor;
  }>;
  recentAssignments: Array<{
    title: string;
    date: string;
    score: number;
  }>;
};

const achievementStyles: Record<
  AchievementColor,
  { bg: string; text: string }
> = {
  primary: { bg: "bg-(--primary-light)", text: "text-(--primary)" },
  success: { bg: "bg-(--success-light)", text: "text-(--success)" },
  warning: { bg: "bg-(--warning-light)", text: "text-(--warning)" },
  info: { bg: "bg-(--info-light)", text: "text-(--info)" },
};

const studentData: StudentData = {
  username: "johndoe",
  name: "John Doe",
  grade: "10",
  overallProgress: 75,
  averageScore: 84,
  unitsCompleted: 12,
  streak: 5,
  currentStage: 1,
  stageProgress: 75,
  stages: [
    { stageNumber: 1, variant: "completed" },
    { stageNumber: 2, variant: "current" },
    { stageNumber: 3, variant: "locked" },
    { stageNumber: 4, variant: "locked" },
  ],
  achievements: [
    { name: "Quick Starter", icon: Award, color: "primary" },
    { name: "Top Scorer", icon: Medal, color: "success" },
    { name: "Consistent Learner", icon: Star, color: "warning" },
    { name: "Stage Master", icon: ShieldCheck, color: "info" },
  ],
  recentAssignments: [
    {
      title: "Section 1, Unit 1",
      date: "October 12, 2025",
      score: 75,
    },
    {
      title: "Section 1, Unit 2",
      date: "October 15, 2025",
      score: 88,
    },
    {
      title: "Section 2, Unit 1",
      date: "October 20, 2025",
      score: 92,
    },
  ],
};

export default function TeacherStudentProfilePage() {
  const { username } = useParams<{ username: string }>();
  const student = {
    ...studentData,
    username: username ?? studentData.username,
    name: username ? decodeURIComponent(username) : studentData.name,
  };

  return (
    <div className="flex flex-col gap-4">
      <TopHeaderBar />
      <section className="flex flex-col gap-8 p-4">
        <Link
          to="/teacher/students"
          className="bg-(--primary) w-fit p-2 rounded-full text-(--white) hover:bg-(--primary-hover)"
        >
          <ArrowLeft />
        </Link>
        <StudentBanner name={student.name} grade={student.grade} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Overall Progress Card */}
          <StatCard label="Overall Progress">
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex w-full flex-col items-center gap-3 mt-4">
                <h3 className="heading-3 text-(--primary)">
                  {student.overallProgress}%
                </h3>
                <ProgressBar percentage={student.overallProgress} />
              </div>
            </div>
          </StatCard>

          {/* Average Score Card */}
          <StatCard label="Average Score">
            <h3 className="heading-2 text-(--success)">
              {student.averageScore}%
            </h3>
          </StatCard>

          {/* Units Completed Card */}
          <StatCard label="Units Completed">
            <h3 className="heading-2 text-[#b07311]">
              {student.unitsCompleted}
            </h3>
          </StatCard>

          {/* Streak Card */}
          <StatCard label="Streak">
            <div className="flex items-center gap-2 text-(--danger)">
              <Flame className="size-6 fill-(--danger-light)" />
              <h3 className="heading-2">{student.streak}</h3>
            </div>
            <p className="paragraph-2">Keep it up!</p>
          </StatCard>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 min-h-80 flex flex-col items-center justify-around gap-2 rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
            <div className="w-full flex items-center justify-between">
              <h3 className="heading-3 text-(--primary)">
                Stage {student.currentStage}
              </h3>
              <p className="paragraph-1 text-(--black)">
                Learning Path Progress
              </p>
              <button>
                <Info className="size-6 text-(--ghost)" />
              </button>
            </div>
            <div className="flex col-span-1 items-center">
              {student.stages.map((stage, index) => (
                <Fragment key={stage.stageNumber}>
                  <StageCard
                    stageNumber={stage.stageNumber}
                    variant={stage.variant}
                    progress={
                      stage.variant === "current"
                        ? student.stageProgress
                        : undefined
                    }
                  />
                  {index < student.stages.length - 1 && (
                    <StageConnector completed={stage.variant === "completed"} />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="flex min-h-80 flex-col rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
            <h3 className="heading-3 text-(--primary)">Achievements</h3>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {student.achievements.map((achievement) => {
                const Icon = achievement.icon;
                const style = achievementStyles[achievement.color];

                return (
                  <div
                    key={achievement.name}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-all hover:shadow-[0_2px_0_0_#BDC8D2] ${style.bg}`}
                  >
                    <Icon className={`size-6 ${style.text}`} />
                    <p className="caption font-semibold text-(--black)">
                      {achievement.name}
                    </p>
                  </div>
                );
              })}
            </div>

            <Link
              to={
                "/teacher/students/" +
                encodeURIComponent(student.username) +
                "/badges"
              }
              className="text-center mt-12 text-(--primary) hover:underline"
            >
              View all badges
            </Link>
          </div>
        </div>
        <div className="mb-12 w-full rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
          <h3 className="heading-3 text-(--primary)">Recent Assignments</h3>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left">
                  <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black)">
                    Activity Title
                  </th>
                  <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black)">
                    Date
                  </th>
                  <th className="paragraph-2 border-b border-(--border) px-4 py-3 font-semibold text-(--black)">
                    Score
                  </th>
                </tr>
              </thead>

              <tbody>
                {student.recentAssignments.map((assignment, index) => (
                  <tr key={`${assignment.title}-${assignment.date}`}>
                    <td className="paragraph-2 border-b border-(--border) px-4 py-4 text-(--black)">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex rounded-full bg-(--primary-light) px-3 py-1 font-semibold text-(--primary)">
                          #{index + 1}
                        </span>
                        <span>{assignment.title}</span>
                      </div>
                    </td>
                    <td className="paragraph-2 border-b border-(--border) px-4 py-4 text-(--ghost)">
                      {assignment.date}
                    </td>
                    <td className="paragraph-2 border-b border-(--border) px-4 py-4 font-semibold text-(--primary)">
                      {assignment.score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
