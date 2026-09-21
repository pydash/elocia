import Separator from "@/components/Separator";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { useGetClasses } from "@/hooks/useClasses";
import { Link } from "react-router-dom";

export default function TeacherClassesPage() {
  const { classes, loading, error } = useGetClasses();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <TopHeaderBar />
      <section className="p-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((classItem) => (
            <li
              key={classItem.id}
              className="flex min-h-52 flex-col overflow-hidden rounded-2xl border border-(--border) bg-white shadow-sm hover:border-(--primary) hover:shadow-lg transition"
            >
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="rounded-full bg-(--gray-100) px-3 py-1 text-xs font-semibold text-(--ghost)">
                    {classItem.school_year}
                  </span>
                </div>

                <h2 className="heading-3 line-clamp-2 text-(--black)">
                  {classItem.name}
                </h2>
                <p className="mt-2 paragraph-1 text-(--ghost)">
                  Grade {classItem.grade_level}
                </p>

                <div className="mt-auto pt-5">
                  <Separator className="mb-4" />
                  <Link
                    to={`/teacher/classes/${classItem.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border-b-4 border-(--primary-shadow) bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-(--primary-hover)"
                  >
                    View Class
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
