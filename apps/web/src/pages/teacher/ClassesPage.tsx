import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useGetClasses } from "@/hooks/useClasses";

import type { Class } from "@/interfaces/class.interface";

import Input from "@/components/Input";
import Separator from "@/components/Separator";
import CreateClassDialog from "@/components/teacher/CreateClassDialog";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function TeacherClassesPage() {
  const { classes: classList, loading, error } = useGetClasses();
  const [searchQuery, setSearchQuery] = useState("");

  const classes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return classList;
    }

    return classList.filter((classItem) =>
      [classItem.name, classItem.grade_level].some((value) =>
        String(value).toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [classList, searchQuery]);

  if (loading) return <LoadingState />;

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <TopHeaderBar />
      <section className="p-6">
        <div className="flex flex-col justify-between my-4 gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <h1 className="heading-2 text-(--black)">Classes</h1>
            <p className="text-sm text-gray-500">
              View and manage your classes.
            </p>
          </div>
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

        <Separator />

        {classes.length > 0 ? (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {classes.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No classes found."
            message="Create a class to get started."
          />
        )}
      </section>
    </div>
  );
}

function ClassCard({ classItem }: { classItem: Class }) {
  return (
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
  );
}
