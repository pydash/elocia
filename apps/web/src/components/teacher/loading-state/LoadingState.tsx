import TopHeaderBar from "@/components/teacher/TopHeaderBar";

const SKELETON_CLASS_COUNT = 4;
const SKELETON_LESSON_COUNT = 4;

export function ClassesLoadingPage() {
  return (
    <div aria-busy="true" aria-label="Loading classes">
      <TopHeaderBar />
      <main className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-(--gray-100)" />
          <div className="flex w-full gap-4 sm:w-auto">
            <div className="h-10 w-full animate-pulse rounded-lg bg-(--gray-100) sm:w-64" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-(--gray-100)" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: SKELETON_CLASS_COUNT }, (_, index) => (
            <div
              key={index}
              className="min-h-52 animate-pulse rounded-2xl border border-(--border) bg-(--gray-100)"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export const StudentsLoadingPage = ClassesLoadingPage;

export function LessonsLoadingPage() {
  return (
    <div aria-busy="true" aria-label="Loading lessons">
      <TopHeaderBar />
      <main className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-pulse rounded bg-(--gray-100)" />
          <div className="h-4 w-28 animate-pulse rounded bg-(--gray-100)" />
        </div>

        <div className="mt-3 h-10 w-56 animate-pulse rounded-lg bg-(--gray-100)" />

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="h-10 w-full animate-pulse rounded-lg bg-(--gray-100) sm:w-1/2" />
          <div className="h-10 w-36 animate-pulse rounded-lg bg-(--gray-100)" />
        </div>

        <LessonSkeletonSection titleWidth="w-28" />
      </main>
    </div>
  );
}

function LessonSkeletonSection({ titleWidth }: { titleWidth: string }) {
  return (
    <section className="mt-10">
      <div className="h-10 w-fit pb-4">
        <div
          className={`h-7 animate-pulse rounded-lg bg-(--gray-100) ${titleWidth}`}
        />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: SKELETON_LESSON_COUNT }, (_, index) => (
          <div
            key={index}
            className="min-h-52 animate-pulse rounded-2xl border border-(--border) bg-(--gray-100)"
          />
        ))}
      </div>
    </section>
  );
}

export function SectionsLoadingPage() {
  return (
    <div aria-busy="true" aria-label="Loading sections">
      <TopHeaderBar />
      <main className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-(--gray-100)" />
          <div className="flex w-full gap-4 sm:w-auto">
            <div className="h-10 w-full animate-pulse rounded-lg bg-(--gray-100) sm:w-64" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-(--gray-100)" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_CLASS_COUNT }, (_, index) => (
            <div
              key={index}
              className="min-h-52 animate-pulse rounded-2xl border border-(--border) bg-(--gray-100)"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export function UnitsLoadingPage() {
  return (
    <div aria-busy="true" aria-label="Loading units">
      <TopHeaderBar />
      <main className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-(--gray-100)" />
          <div className="flex w-full gap-4 sm:w-auto">
            <div className="h-10 w-full animate-pulse rounded-lg bg-(--gray-100) sm:w-64" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-(--gray-100)" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_CLASS_COUNT }, (_, index) => (
            <div
              key={index}
              className="min-h-52 animate-pulse rounded-2xl border border-(--border) bg-(--gray-100)"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
