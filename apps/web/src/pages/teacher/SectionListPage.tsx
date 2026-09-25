import Button from "@/components/Button";
import Separator from "@/components/Separator";
import CreateSectionDialog from "@/components/teacher/CreateSectionDialog";
import { SectionsLoadingPage } from "@/components/teacher/loading-state/LoadingState";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { useGetSections } from "@/hooks/useCurriculums";
import type { Section } from "@/interfaces/curriculum.interface";
import { Link, useParams } from "react-router-dom";

export default function TeacherSectionListPage() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const { sections, loading, error } = useGetSections(curriculumId ?? "");

  if (loading) {
    return <SectionsLoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <TopHeaderBar />

      <section className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2 text-(--black)">Sections</h1>
          <CreateSectionDialog lessonId={curriculumId} />
        </div>
        <SectionContent sections={sections} />
      </section>
    </div>
  );
}

function SectionContent({ sections }: { sections: Section[] }) {
  if (sections.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border-3 border-dashed border-(--border) bg-(--gray-50) px-6 py-12 text-center">
        <h2 className="heading-3 text-(--black)">No sections yet</h2>
        <p className="paragraph-2 mt-2 text-(--ghost)">
          Create a section to start organizing this curriculum.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionCard({ section }: { section: Section }) {
  return (
    <article className="flex min-h-52 p-4 flex-col overflow-hidden rounded-2xl border border-(--border) shadow-sm transition hover:border-(--primary) hover:shadow-lg">
      <div className="flex items-center gap-3 mb-18">
        <span className="h-8 w-1 rounded-full bg-(--primary)" />
        <h2 className="heading-3 text-(--black)">{section.title}</h2>
      </div>
      <div className="space-y-4">
        <Separator />
        <div>
          <Link to={`sections/${section.id}`}>
            <Button className="w-fit">View Units</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
