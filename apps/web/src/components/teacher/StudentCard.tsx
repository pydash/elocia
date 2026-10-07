import Avatar from "@/components/Avatar";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";

type StudentCardProps = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  grade_level: number;
  student_number: number;
  student_code: string;
  is_active?: boolean;
  has_tier4_flag?: boolean;
  onReactivate?: (id: string, name: string) => void;
};

export default function StudentCard({
  id,
  name,
  color,
  emoji,
  grade_level,
  student_number,
  student_code,
  is_active = true,
  has_tier4_flag = false,
  onReactivate,
}: StudentCardProps) {
  return (
    <div
      className={`group relative flex flex-col items-center rounded-3xl border p-6 transition-all ${
        is_active
          ? "border-(--border) bg-white shadow-sm hover:-translate-y-1 hover:border-(--primary) hover:shadow-lg"
          : "border-gray-200 bg-gray-50/70 shadow-xs"
      }`}
    >
      <Link
        to={`/teacher/students/${encodeURIComponent(id)}`}
        className="flex w-full flex-col items-center"
      >
        <div className="relative">
          <Avatar emoji={emoji} color={color} isActive={is_active} />
          {has_tier4_flag && (
            <span
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 ring-4 ring-white"
              title="Tier 4 Flag / Struggling with recent signs"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </span>
          )}
        </div>
        <div className="mt-5 flex w-full flex-col items-center">
          <h3 className={`heading-4 text-center ${is_active ? "text-(--black)" : "text-gray-500"}`}>
            {name}
          </h3>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                is_active
                  ? "bg-(--info-light) text-(--ghost)"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              Grade {grade_level}
            </span>
            {!is_active && (
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 border border-rose-200">
                Deactivated
              </span>
            )}
          </div>
        </div>

        <dl className="mt-5 grid w-full grid-cols-2 divide-x divide-(--border) rounded-xl bg-(--gray-50) py-3 text-center">
          <div className="px-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-(--ghost)">
              Student code
            </dt>
            <dd className={`mt-1 truncate text-sm font-semibold ${is_active ? "text-(--black)" : "text-gray-500"}`}>
              {student_code}
            </dd>
          </div>
          <div className="px-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-(--ghost)">
              Student number
            </dt>
            <dd className={`mt-1 text-sm font-semibold ${is_active ? "text-(--black)" : "text-gray-500"}`}>
              #{student_number}
            </dd>
          </div>
        </dl>
      </Link>

      {!is_active && onReactivate && (
        <div className="mt-4 w-full pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReactivate(id, name);
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reactivate Student</span>
          </button>
        </div>
      )}
    </div>
  );
}
