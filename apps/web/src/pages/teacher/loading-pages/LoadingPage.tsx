import TopHeaderBar from "@/components/teacher/TopHeaderBar";

const SKELETON_CLASS_COUNT = 8;

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
