import Avatar from "@/components/Avatar";
import { Link } from "react-router-dom";

type StudentCardProps = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  grade_level: number;
  student_number: number;
  student_code: string;
};

export default function StudentCard({
  id,
  name,
  color,
  emoji,
  grade_level,
  student_number,
  student_code,
}: StudentCardProps) {
  return (
    <Link
      to={`/teacher/students/${encodeURIComponent(id)}`}
      className="group flex flex-col items-center rounded-3xl border border-(--border) bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-(--primary) hover:shadow-lg"
    >
      <Avatar emoji={emoji} color={color} />
      <div className="mt-5 flex w-full flex-col items-center">
        <h3 className="heading-4 text-center text-(--black)">{name}</h3>
        <span className="mt-2 rounded-full bg-(--info-light) px-3 py-1 text-sm font-semibold text-(--ghost)">
          Grade {grade_level}
        </span>
      </div>

      <dl className="mt-5 grid w-full grid-cols-2 divide-x divide-(--border) rounded-xl bg-(--gray-50) py-3 text-center">
        <div className="px-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-(--ghost)">
            Student code
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-(--black)">
            {student_code}
          </dd>
        </div>
        <div className="px-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-(--ghost)">
            Student number
          </dt>
          <dd className="mt-1 text-sm font-semibold text-(--black)">
            #{student_number}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
