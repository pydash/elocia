import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Input from "@/components/Input";
import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import { createStage, uploadStageBaseline } from "@/services/curriculum";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UploadCloud, ArrowUp, ArrowDown } from "lucide-react";

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
  const stagePath = `/teacher/lessons/curriculum/${curriculumId}/sections/${sectionId}/units/${unitId}`;
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
                  Add sign demonstration videos. You can upload in batch and re-order them anytime.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDraft({ ...draft, rounds: [...draft.rounds, newRound()] })
                  }
                >
                  + Add 1 round
                </Button>
              </div>
            </div>

            {/* Batch Video Dropzone */}
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-(--primary) bg-(--primary-light)/40 p-6 text-center transition-colors hover:bg-(--primary-light)">
              <UploadCloud className="size-8 text-(--primary)" />
              <span className="paragraph-2 font-semibold text-(--primary)">
                ⚡ Batch Upload Videos (Auto-Generates Rounds)
              </span>
              <span className="caption text-(--ghost)">
                Drop multiple .mp4 / .webm videos at once — words will be auto-named from filenames!
              </span>
              <input
                type="file"
                multiple
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  const newBatchRounds: Round[] = files.map((file) => {
                    const cleanName = file.name
                      .replace(/\.[^/.]+$/, "")
                      .replace(/[-_]/g, " ")
                      .trim();
                    const capitalized = cleanName
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                      .join(" ");
                    return {
                      signName: capitalized || "Sign",
                      video: file,
                    };
                  });
                  setDraft((prev) => ({
                    ...prev,
                    rounds: [...prev.rounds, ...newBatchRounds],
                  }));
                  // Clear input so re-selecting same files works
                  e.target.value = "";
                }}
              />
            </label>

            {draft.rounds.map((round, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-(--border) bg-(--gray-50) p-4 transition-all"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-(--primary) text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="heading-4 text-(--black)">
                      Round {index + 1}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Move Up */}
                    <Button
                      type="button"
                      variant="outline"
                      className="px-2.5 py-1 text-xs"
                      disabled={index === 0}
                      onClick={() => {
                        if (index === 0) return;
                        setDraft((prev) => {
                          const updated = [...prev.rounds];
                          const temp = updated[index - 1];
                          updated[index - 1] = updated[index];
                          updated[index] = temp;
                          return { ...prev, rounds: updated };
                        });
                      }}
                      title="Move up"
                    >
                      <ArrowUp className="size-4" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      type="button"
                      variant="outline"
                      className="px-2.5 py-1 text-xs"
                      disabled={index === draft.rounds.length - 1}
                      onClick={() => {
                        if (index >= draft.rounds.length - 1) return;
                        setDraft((prev) => {
                          const updated = [...prev.rounds];
                          const temp = updated[index + 1];
                          updated[index + 1] = updated[index];
                          updated[index] = temp;
                          return { ...prev, rounds: updated };
                        });
                      }}
                      title="Move down"
                    >
                      <ArrowDown className="size-4" />
                    </Button>

                    {/* Remove */}
                    <Button
                      type="button"
                      variant="destructive"
                      className="px-2.5 py-1 text-xs"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          rounds: draft.rounds.filter(
                            (_, roundIndex) => roundIndex !== index,
                          ),
                        })
                      }
                      title="Remove round"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="caption text-(--black)">
                    Sign name
                    <Input
                      className="mt-2"
                      value={round.signName}
                      placeholder="e.g. Apple or Good Morning"
                      onChange={(event) =>
                        updateRound(index, { signName: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="caption block text-(--black)">
                    Video
                    {round.video ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-800">
                          <span className="truncate font-semibold">🎬 {round.video.name}</span>
                          <label className="ml-2 cursor-pointer font-bold underline hover:text-green-950">
                            Change
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                              className="sr-only"
                              onChange={(event) =>
                                updateRound(index, {
                                  video: event.target.files?.[0] ?? round.video,
                                })
                              }
                            />
                          </label>
                        </div>
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-gray-200">
                          <video
                            src={URL.createObjectURL(round.video)}
                            controls
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </label>
                </div>
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
  const stagePath = `/teacher/lessons/curriculum/${curriculumId}/sections/${sectionId}/units/${unitId}`;
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
      // Upload all round baseline videos in parallel for 5x faster stage publishing
      const roundUploads = draft.rounds
        .filter((round) => Boolean(round.video))
        .map((round) =>
          uploadStageBaseline(
            stage.id,
            round.signName.trim(),
            round.video!,
            Number(draft.gradeLevel),
            draft.description.trim(),
          )
        );
      await Promise.all(roundUploads);
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
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {draft.rounds.map((round, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-(--border) bg-(--gray-50) p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="caption text-(--ghost)">Round {index + 1}</p>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Ready
                    </span>
                  </div>
                  <h3 className="heading-4 mt-1 text-(--black)">
                    {round.signName}
                  </h3>
                </div>

                {round.video && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-gray-200">
                    <video
                      src={URL.createObjectURL(round.video)}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}

                <p className="caption text-(--ghost) truncate">
                  🎬 {round.video?.name}
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
