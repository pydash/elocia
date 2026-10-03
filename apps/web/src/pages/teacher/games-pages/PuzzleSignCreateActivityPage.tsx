import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/Button";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  ImagePlus,
  Plus,
  Upload,
  X,
} from "lucide-react";
import StepIndicator from "../../../components/StepIndicator";
import Separator from "../../../components/Separator";
import Input from "../../../components/Input";
import Dropdown from "../../../components/Dropdown";
import { useState, type FormEvent } from "react";
import { createPuzzleSignActivity, uploadMiniGameMedia } from "@/services/mini-games";
import type { PuzzleSignItem } from "@/interfaces/mini-game.interface";

const steps = [
  {
    number: 1,
    label: "Basic Info",
  },
  {
    number: 2,
    label: "Add Content",
  },
  {
    number: 3,
    label: "Preview & Publish",
  },
];

const DRAFT_KEY = "teacher-puzzle-sign-draft";
const API_BASE_URL = "http://localhost:8000";

type PuzzleSignPayload = {
  game_type: "puzzle_sign";
  title: string;
  description: string;
  difficulty: number;
  items: PuzzleSignItem[];
};

const initialGame: PuzzleSignPayload = {
  game_type: "puzzle_sign",
  title: "",
  description: "",
  difficulty: 1,
  items: [
    {
      word_one: "",
      word_two: "",
      hidden_word: "",
      word_form: "",
      word_one_image_url: "",
      word_two_image_url: "",
      word_form_image_url: "",
      reference_video_url: "",
      index_order: 0,
    },
  ],
};

function readDraft(): PuzzleSignPayload {
  const draft = sessionStorage.getItem(DRAFT_KEY);
  return draft ? { ...initialGame, ...JSON.parse(draft) } : initialGame;
}

export function PuzzleSignCreateActivityStepOnePage() {
  const [game, setGame] = useState<PuzzleSignPayload>(readDraft);
  const saveDraft = () =>
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(game));

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={1} />

      <article className="flex flex-col p-6 gap-6 bg-(--white) rounded-4xl shadow-lg/5">
        <div className="space-y-4">
          <h1 className="heading-3">Let's start with the basics</h1>
          <div>
            <label htmlFor="activity-title">Activity Title</label>
            <Input
              type="text"
              id="activity-title"
              placeholder="Enter activity title (e.g. Addition Signs, Animal Puzzles)"
              value={game.title}
              onChange={(event) =>
                setGame({ ...game, title: event.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter a brief description of the activity"
              value={game.description}
              onChange={(event) =>
                setGame({ ...game, description: event.target.value })
              }
              className="resize-none p-4 w-full rounded-md border-2 border-(--border) bg-(--gray-50) paragraph-2 text-(--ghost) outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="difficulty">Difficulty</label>
          <Dropdown
            value={String(game.difficulty)}
            onChange={(value) =>
              setGame({ ...game, difficulty: Number(value) })
            }
            className=""
            options={[
              { label: "Easy", value: "1" },
              { label: "Medium", value: "2" },
              { label: "Hard", value: "3" },
            ]}
          />
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <Link to="/teacher/tasks">
            <Button variant="destructive">
              Cancel <X />
            </Button>
          </Link>
          <Link to="../step-2" onClick={saveDraft}>
            <Button className="gap-2">
              Next Step
              <ChevronRight className="size-5" />
            </Button>
          </Link>
        </div>
      </article>
    </section>
  );
}

export function PuzzleSignCreateActivityStepTwoPage() {
  const [game, setGame] = useState<PuzzleSignPayload>(readDraft);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const saveDraft = () =>
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(game));

  const updateItem = (index: number, update: Partial<PuzzleSignItem>) => {
    setGame((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...update } : item,
      ),
    }));
  };

  const handleMediaFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "word_one_image_url" | "word_two_image_url" | "word_form_image_url" | "reference_video_url",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    try {
      const res = await uploadMiniGameMedia(file);
      updateItem(index, { [field]: `${API_BASE_URL}${res.url}` });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload media",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const addRound = () =>
    setGame((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          word_one: "",
          word_two: "",
          hidden_word: "",
          word_form: "",
          word_one_image_url: "",
          word_two_image_url: "",
          word_form_image_url: "",
          reference_video_url: "",
          index_order: prev.items.length,
        },
      ],
    }));

  const deleteRound = (index: number) =>
    setGame((prev) => ({
      ...prev,
      items: prev.items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, index_order: itemIndex })),
    }));

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={2} />

      {uploadError && (
        <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm">
          {uploadError}
        </div>
      )}

      {game.items.map((item, index) => (
        <article
          key={item.index_order ?? index}
          className="flex flex-col gap-6 p-6 bg-(--white) rounded-4xl shadow-lg/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="size-5" />
              <h1 className="heading-3">Round {index + 1}</h1>
            </div>
            {game.items.length > 1 && (
              <Button variant="destructive" onClick={() => deleteRound(index)}>
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Word / Item */}
            <div className="space-y-3">
              <span className="paragraph-2 font-semibold">Word 1 (Left Item)</span>
              <Input
                type="text"
                placeholder="e.g. 1 or Sun"
                value={item.word_one}
                onChange={(e) => updateItem(index, { word_one: e.target.value })}
                required
              />
              <label className="flex flex-col min-h-40 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-4 text-center hover:border-(--primary) hover:bg-(--primary-light)">
                {item.word_one_image_url ? (
                  <img
                    src={item.word_one_image_url}
                    alt="Word 1"
                    className="max-h-28 max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-8 text-(--primary)" />
                    <span className="caption font-semibold">Upload Image 1</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleMediaFileChange(e, index, "word_one_image_url")}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Hidden Target Sign (Answer) */}
            <div className="space-y-3">
              <span className="paragraph-2 font-semibold text-(--primary)">Target Sign Answer (Missing)</span>
              <Input
                type="text"
                placeholder="e.g. 1 or Cloud"
                value={item.hidden_word}
                onChange={(e) => updateItem(index, { hidden_word: e.target.value })}
                required
              />
              <div className="p-3 bg-(--primary-light) rounded-xl text-xs text-(--primary) font-medium">
                This is what the student must sign to complete: "{item.word_one || 'Word 1'} + [Target Sign] = {item.word_form || 'Result'}"
              </div>
            </div>

            {/* Result Word / Item */}
            <div className="space-y-3">
              <span className="paragraph-2 font-semibold">Result (Combined Form)</span>
              <Input
                type="text"
                placeholder="e.g. 2 or Sun behind cloud"
                value={item.word_form}
                onChange={(e) => updateItem(index, { word_form: e.target.value })}
                required
              />
              <label className="flex flex-col min-h-40 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-4 text-center hover:border-(--primary) hover:bg-(--primary-light)">
                {item.word_form_image_url ? (
                  <img
                    src={item.word_form_image_url}
                    alt="Result"
                    className="max-h-28 max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-8 text-(--primary)" />
                    <span className="caption font-semibold">Upload Result Image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleMediaFileChange(e, index, "word_form_image_url")}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Reference Video Upload */}
          <div className="space-y-3 pt-2">
            <label className="paragraph-2 font-semibold">Reference Video (Sign Demonstration)</label>
            <label className="flex flex-col min-h-48 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
              {item.reference_video_url ? (
                <div className="space-y-2">
                  <video
                    src={item.reference_video_url}
                    controls
                    className="max-h-40 max-w-full rounded-xl"
                  />
                  <span className="caption text-green-600 font-semibold block">
                    ✓ Video uploaded. Click to change.
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="size-10 text-(--primary)" />
                  <span className="paragraph-2 font-semibold text-(--black)">
                    {isUploading ? "Uploading video..." : "Click to upload demonstration video"}
                  </span>
                  <span className="caption text-(--ghost)">
                    MP4, WebM, or MOV up to 100MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                onChange={(event) =>
                  handleMediaFileChange(event, index, "reference_video_url")
                }
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          </div>
        </article>
      ))}

      <button
        type="button"
        onClick={addRound}
        className="w-full flex flex-col bg-white border-2 border-dashed border-(--border) rounded-2xl p-6 items-center justify-center gap-2 transition-colors hover:border-(--primary) hover:bg-(--primary-light)"
      >
        <div className="w-fit rounded-full bg-(--primary) p-2 text-(--white)">
          <Plus className="size-4" />
        </div>
        <span className="paragraph-2 font-semibold text-(--primary)">
          Add another round
        </span>
      </button>

      <Separator />

      <div className="flex items-center justify-between">
        <Link to="../step-1">
          <Button>
            <ChevronLeft className="size-5" />
            Back
          </Button>
        </Link>
        <Link to="../step-3" onClick={saveDraft}>
          <Button className="gap-2">
            Next Step
            <ChevronRight className="size-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function PuzzleSignCreateActivityStepThreePage() {
  const [game] = useState<PuzzleSignPayload>(readDraft);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault();
    setIsPublishing(true);
    setError("");

    try {
      await createPuzzleSignActivity({
        title: game.title || "Puzzle Sign Activity",
        description: game.description,
        difficulty: game.difficulty,
        items: game.items.map((item, idx) => ({
          word_one: item.word_one,
          word_two: item.word_two || "+",
          hidden_word: item.hidden_word,
          word_form: item.word_form,
          word_one_image_url: item.word_one_image_url || undefined,
          word_two_image_url: item.word_two_image_url || undefined,
          word_form_image_url: item.word_form_image_url || undefined,
          reference_video_url: item.reference_video_url || undefined,
          index_order: idx,
        })),
      });

      sessionStorage.removeItem(DRAFT_KEY);
      navigate("/teacher/tasks");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish activity",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={3} />

      <article className="space-y-6 rounded-4xl border-2 border-dashed border-(--primary) bg-(--white) p-6 shadow-lg/5">
        <header className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="caption font-semibold uppercase tracking-wide text-(--primary)">
              Puzzle Sign Activity
            </p>
            <h1 className="heading-2 text-(--black)">
              {game.title || "Untitled Activity"}
            </h1>
            <p className="paragraph-2 whitespace-pre-wrap text-(--ghost)">
              {game.description || "No description provided."}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 md:min-w-56 md:grid-cols-1">
            <div className="rounded-2xl bg-(--gray-50) p-4">
              <dt className="caption text-(--black)/50">Difficulty</dt>
              <dd className="paragraph-1 font-semibold text-(--black)">
                {game.difficulty === 1
                  ? "Easy"
                  : game.difficulty === 2
                    ? "Medium"
                    : "Hard"}
              </dd>
            </div>
            <div className="rounded-2xl bg-(--gray-50) p-4">
              <dt className="caption text-(--black)/50">Rounds</dt>
              <dd className="paragraph-1 font-semibold text-(--black)">
                {game.items.length}
              </dd>
            </div>
          </dl>
        </header>

        <Separator />

        <div className="space-y-4">
          <h2 className="heading-3">Rounds Preview</h2>
          <div className="space-y-4">
            {game.items.map((item, index) => (
              <article
                key={index}
                className="grid gap-5 rounded-2xl border-2 border-(--border) bg-(--gray-50) p-5 lg:grid-cols-2"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-(--primary) font-semibold text-(--white)">
                      {index + 1}
                    </span>
                    <h3 className="heading-4">Round {index + 1}</h3>
                  </div>
                  <div className="rounded-xl bg-(--white) p-4 flex items-center justify-between">
                    <div>
                      <p className="caption text-(--black)/50">Equation</p>
                      <p className="paragraph-1 font-bold text-(--black)">
                        {item.word_one || "?"} + <span className="text-(--primary)">[{item.hidden_word || "?"}]</span> = {item.word_form || "?"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {item.word_one_image_url && (
                      <img
                        src={item.word_one_image_url}
                        alt="Word 1"
                        className="size-20 rounded-xl object-contain bg-white p-1 border"
                      />
                    )}
                    {item.word_form_image_url && (
                      <img
                        src={item.word_form_image_url}
                        alt="Result"
                        className="size-20 rounded-xl object-contain bg-white p-1 border"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="paragraph-2 font-semibold text-(--black)">
                    Reference Video
                  </p>
                  {item.reference_video_url ? (
                    <video
                      src={item.reference_video_url}
                      controls
                      className="max-h-52 w-full rounded-xl bg-black"
                    />
                  ) : (
                    <div className="flex min-h-36 items-center justify-center rounded-xl border-2 border-dashed border-(--border) bg-(--white) p-6 text-center">
                      <p className="caption text-(--ghost)">
                        No reference video uploaded for this round.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </article>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Link to="../step-2">
            <Button>
              <ChevronLeft className="size-5" />
              Back
            </Button>
          </Link>
          <Link to="/teacher/tasks">
            <Button variant="destructive">
              Cancel <X />
            </Button>
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          {error && (
            <p className="paragraph-2 text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
          <Button
            className="gap-2"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish"}{" "}
            <Upload className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
