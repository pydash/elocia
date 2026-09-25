import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Input from "@/components/Input ";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { createStage, uploadStageBaseline } from "@/services/curriculum";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type Round = { signName: string; video: File | null };
type StageDraft = {
  stageNumber: number;
  title: string;
  description: string;
  gradeLevel: string;
  rounds: Round[];
};

const newRound = (): Round => ({ signName: "", video: null });

export function TeacherStageCreatePage() {
  const { curriculumId, sectionId, unitId } = useParams<{
    curriculumId: string;
    sectionId: string;
    unitId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stagePath = `/teacher/lessons/${curriculumId}/sections/${sectionId}/units/${unitId}`;
  const stageNumber =
    (location.state as { stageNumber?: number } | null)?.stageNumber ?? 1;
  const savedDraft = (location.state as { draft?: StageDraft } | null)?.draft;
  const [draft, setDraft] = useState<StageDraft>({
    stageNumber: savedDraft?.stageNumber ?? stageNumber,
    title: savedDraft?.title ?? "",
    description: savedDraft?.description ?? "",
    gradeLevel: savedDraft?.gradeLevel ?? "1",
    rounds: savedDraft?.rounds ?? [],
  });
  const [error, setError] = useState("");

  const updateRound = (index: number, changes: Partial<Round>) =>
    setDraft((current) => ({
      ...current,
      rounds: current.rounds.map((round, roundIndex) =>
        roundIndex === index ? { ...round, ...changes } : round,
      ),
    }));

  const next = () => {
    if (!draft.title.trim() || !draft.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (
      draft.rounds.length === 0 ||
      draft.rounds.some((round) => !round.signName.trim() || !round.video)
    ) {
      setError("Add at least one round with a sign name and video.");
      return;
    }
    navigate(`${stagePath}/preview`, { state: { draft } });
  };

  return (
    <div>
      <TopHeaderBar />
      <main className="p-6">
        <h1 className="heading-2 text-(--black)">Create Stage</h1>
        <div className="mt-6 grid max-w-4xl gap-6">
          <section className="flex flex-col gap-4 rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
            <label className="caption text-(--black)">
              Title
              <Input
                className="mt-2"
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
                required
              />
            </label>
            <label className="caption text-(--black)">
              Description
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-md border-2 border-(--border) bg-(--gray-50) px-4 py-3 paragraph-2 text-(--ghost) outline-none"
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
                required
              />
            </label>
            <label className="caption text-(--black)">
              Grade level
              <Dropdown
                className="mt-2"
                value={draft.gradeLevel}
                onChange={(gradeLevel) => setDraft({ ...draft, gradeLevel })}
                options={[
                  { label: "Grade 1", value: "1" },
                  { label: "Grade 2", value: "2" },
                  { label: "Grade 3", value: "3" },
                ]}
              />
            </label>
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="heading-3 text-(--black)">Rounds</h2>
                <p className="paragraph-2 mt-1 text-(--ghost)">
                  Add a sign and demonstration video for each round.
                </p>
              </div>
              <Button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, rounds: [...draft.rounds, newRound()] })
                }
              >
                Add round
              </Button>
            </div>

            {draft.rounds.map((round, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-(--border) bg-(--gray-50) p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="heading-4 text-(--black)">
                    Round {index + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        rounds: draft.rounds.filter(
                          (_, roundIndex) => roundIndex !== index,
                        ),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <label className="caption text-(--black)">
                  Sign name
                  <Input
                    className="mt-2"
                    value={round.signName}
                    onChange={(event) =>
                      updateRound(index, { signName: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="caption mt-4 block text-(--black)">
                  Video
                  <Input
                    className="mt-2"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                    onChange={(event) =>
                      updateRound(index, {
                        video: event.target.files?.[0] ?? null,
                      })
                    }
                    required
                  />
                </label>
              </div>
            ))}
          </section>

          {error && (
            <p className="paragraph-2 text-(--danger)" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(stagePath)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={next}>
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export function TeacherStagePreviewPage() {
  const { curriculumId, sectionId, unitId } = useParams<{
    curriculumId: string;
    sectionId: string;
    unitId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stagePath = `/teacher/lessons/${curriculumId}/sections/${sectionId}/units/${unitId}`;
  const draft = (location.state as { draft?: StageDraft } | null)?.draft;
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!draft) {
    return (
      <main className="p-6">
        <p className="paragraph-2 text-(--danger)">Stage draft not found.</p>
        <Button className="mt-4" onClick={() => navigate(`${stagePath}/new`)}>
          Back to stage form
        </Button>
      </main>
    );
  }

  const finish = async () => {
    if (!unitId) return;
    setIsSaving(true);
    setError("");
    try {
      const stage = await createStage(unitId, {
        stage_number: draft.stageNumber,
        title: draft.title.trim(),
        description: draft.description.trim(),
      });
      for (const round of draft.rounds) {
        if (!round.video) continue;
        await uploadStageBaseline(
          stage.id,
          round.signName.trim(),
          round.video,
          Number(draft.gradeLevel),
          draft.description.trim(),
        );
      }
      navigate(stagePath);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create stage",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <TopHeaderBar />
      <main className="p-6">
        <h1 className="heading-2 text-(--black)">Preview Stage</h1>
        <article className="mt-6 max-w-3xl rounded-3xl border-3 border-(--border) bg-(--white) p-6 shadow-[0_6px_0_0_#BDC8D2]">
          <span className="rounded-full bg-(--gray-100) px-3 py-1 caption text-(--ghost)">
            Grade {draft.gradeLevel}
          </span>
          <h2 className="heading-2 mt-5 text-(--black)">{draft.title}</h2>
          <p className="paragraph-2 mt-2 text-(--ghost)">{draft.description}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {draft.rounds.map((round, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-(--border) bg-(--gray-50) p-4"
              >
                <p className="caption text-(--ghost)">Round {index + 1}</p>
                <h3 className="heading-4 mt-1 text-(--black)">
                  {round.signName}
                </h3>
                <p className="caption mt-2 text-(--ghost)">
                  {round.video?.name}
                </p>
              </div>
            ))}
          </div>
        </article>
        {error && (
          <p className="mt-4 paragraph-2 text-(--danger)" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex max-w-3xl justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`${stagePath}/new`, { state: { draft } })}
          >
            Back
          </Button>
          <Button type="button" disabled={isSaving} onClick={finish}>
            {isSaving ? "Saving..." : "Finish"}
          </Button>
        </div>
      </main>
    </div>
  );
}
