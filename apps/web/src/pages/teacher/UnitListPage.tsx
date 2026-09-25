import Button from "@/components/Button";
import Input from "@/components/Input ";
import CreateUnitDialog from "@/components/teacher/CreateUnitDialog";
import { UnitsLoadingPage } from "@/components/teacher/loading-state/LoadingState";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { useGetUnits } from "@/hooks/useCurriculums";
import type { Unit } from "@/interfaces/curriculum.interface";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function TeacherUnitListPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { units, loading, error } = useGetUnits(sectionId ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUnits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return units;
    }

    return units.filter((unit) =>
      [unit.title].some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [units, searchQuery]);

  if (loading) {
    return <UnitsLoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <TopHeaderBar />

      <section className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold">Units</h1>

          <div className="flex gap-4">
            <Input
              className="w-full"
              type="search"
              placeholder="Search units..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search units"
            />

            <CreateUnitDialog />
          </div>
        </div>

        <UnitContent units={units} filteredUnits={filteredUnits} />
      </section>
    </div>
  );
}

function UnitContent({
  units,
  filteredUnits,
}: {
  units: Unit[];
  filteredUnits: Unit[];
}) {
  if (units.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border-3 border-dashed border-(--border) bg-(--gray-50) px-6 py-12 text-center">
        <h2 className="heading-3 text-(--black)">No units yet</h2>
        <p className="paragraph-2 mt-2 text-(--ghost)">
          Create a unit to start organizing this section.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredUnits.map((unit) => (
        <UnitCard key={unit.id} unit={unit} />
      ))}
    </div>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  return (
    <article className="flex min-h-52 p-4 flex-col overflow-hidden rounded-2xl border border-(--border) shadow-sm transition hover:border-(--primary) hover:shadow-lg">
      <div className="flex items-center gap-3 mb-8">
        <span className="h-8 w-1 rounded-full bg-(--primary)" />
        <h2 className="heading-3 text-(--black)">{unit.title}</h2>
      </div>
      <div className="mt-auto pt-4">
        <Link
          to={`units/${unit.id}`}
          className="text-sm font-medium text-(--primary) hover:underline"
        >
          <Button className="w-fit">View Details</Button>
        </Link>
      </div>
    </article>
  );
}
