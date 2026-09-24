import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Input from "@/components/Input ";
import Separator from "@/components/Separator";
import CreateClassDialog from "@/components/teacher/CreateClassDialog";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { useGetClasses } from "@/hooks/useClasses";

// Loading State
import { ClassesLoadingPage } from "../../components/teacher/loading-state/LoadingState";

// Empty State
import { ClassesEmptyState } from "@/components/teacher/empty-state/EmptyState";
import type { Class } from "@/interfaces/class.interface";

export default function TeacherClassesPage() {
  const { classes, loading, error } = useGetClasses();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return classes;
    }

    return classes.filter((classItem) =>
      [classItem.name, classItem.grade_level].some((value) =>
        String(value).toLowerCase().includes(query),
      ),
    );
  }, [classes, searchQuery]);

  if (loading) {
    return <ClassesLoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <TopHeaderBar />

      <section className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold">Classes</h1>

          <div className="flex gap-4">
            <Input
              className="w-full"
              type="search"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search classes"
            />

            <CreateClassDialog />
          </div>
        </div>

        <ClassContent classes={classes} filteredClasses={filteredClasses} />
      </section>
    </div>
  );
}

function ClassContent({
  classes,
  filteredClasses,
}: {
  classes: Class[];
  filteredClasses: Class[];
}) {
  if (classes.length === 0) {
    return <ClassesEmptyState />;
  }

  if (filteredClasses.length === 0) {
    return (
      <p className="mt-8 text-center paragraph-2 text-(--ghost)">
        No classes match your search.
      </p>
    );
  }

  return (
    <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {filteredClasses.map((classItem) => (
        <li
          key={classItem.id}
          className="flex min-h-52 flex-col overflow-hidden rounded-2xl border border-(--border) bg-white shadow-sm transition hover:border-(--primary) hover:shadow-lg"
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
  );
}
