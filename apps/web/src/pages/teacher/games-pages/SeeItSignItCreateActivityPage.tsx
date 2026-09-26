import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/Button";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  ImagePlus,
  Plus,
  Save,
  Upload,
  X,
} from "lucide-react";
import StepIndicator from "../../../components/StepIndicator";
import Separator from "../../../components/Separator";
import Input from "../../../components/Input ";
import Dropdown from "../../../components/Dropdown";
import { useState, type FormEvent } from "react";
import {
  createMiniGame,
  type CreateMiniGamePayload,
} from "@/services/mini-games";

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

const DRAFT_KEY = "teacher-see-it-sign-it-draft";
const initialGame: CreateMiniGamePayload = {
  game_type: "see_it_sign_it",
  title: "",
  target_sign: "",
  prompt_image: "",
  hint_text: "",
  options: "",
  difficulty: 1,
};

function readDraft(): CreateMiniGamePayload {
  const draft = sessionStorage.getItem(DRAFT_KEY);
  return draft ? { ...initialGame, ...JSON.parse(draft) } : initialGame;
}

export function SeeItSignItCreateActivityStepOnePage() {
  const [game, setGame] = useState(readDraft);
  const saveDraft = () =>
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(game));

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={1} />

      <article className="flex flex-col p-6 gap-6 bg-(--white) rounded-4xl shadow-lg/5">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-200 hover:bg-gray-300">
              <img
                src="https://example.com/image.jpg"
                alt="Description"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="heading-3">Let's start with the basics</h1>
            <div>
              <label htmlFor="activity-title">Activity Title</label>
              <Input
                type="text"
                id="activity-title"
                placeholder="Enter activity title"
                value={game.title}
                onChange={(event) =>
                  setGame({ ...game, title: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label htmlFor="grade-level">Grade Level</label>
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
            <div>
              <label htmlFor="target-sign">Target Sign</label>
              <Input
                id="target-sign"
                value={game.target_sign}
                onChange={(event) =>
                  setGame({ ...game, target_sign: event.target.value })
                }
                required
              />
            </div>
          </div>
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

export function SeeItSignItCreateActivityStepTwoPage() {
  const [game, setGame] = useState(readDraft);
  const saveDraft = () =>
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(game));

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={2} />

      <article className="flex flex-col gap-6 p-6 bg-(--white) rounded-4xl shadow-lg/5">
        <h1 className="heading-3">Round 1</h1>
        <div className="flex items-center gap-2">
          <Flag className="size-5" />
          <p>Round Objective</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col min-h-56 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border) bg-(--gray-50) p-6 text-center transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
            <ImagePlus className="size-10 text-(--primary)" />
            <span className="paragraph-2 font-semibold text-(--black)">
              Click to upload an image
            </span>
            <span className="caption text-(--ghost)">
              PNG or JPG up to 10MB
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
            />
          </label>
          <textarea
            value={game.hint_text}
            onChange={(event) =>
              setGame({ ...game, hint_text: event.target.value })
            }
            className="resize-none rounded-2xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 outline-none"
            placeholder="Add a hint for students"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            Prompt image URL
            <Input
              type="url"
              value={game.prompt_image}
              onChange={(event) =>
                setGame({ ...game, prompt_image: event.target.value })
              }
              placeholder="https://example.com/prompt.png"
            />
          </label>
          <label>
            Options
            <Input
              value={game.options}
              onChange={(event) =>
                setGame({ ...game, options: event.target.value })
              }
              placeholder="A, B, C"
            />
          </label>
        </div>
      </article>

      <button className="w-full flex flex-col bg-white border-2 border-dashed border-(--border) rounded-2xl p-6 items-center justify-center gap-2 transition-colors hover:border-(--primary) hover:bg-(--primary-light)">
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

export function SeeItSignItCreateActivityStepThreePage() {
  const [game] = useState(readDraft);
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const navigate = useNavigate();

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!game.title.trim() || !game.target_sign.trim()) {
      setError("Title and target sign are required.");
      return;
    }

    setIsPublishing(true);
    setError("");
    try {
      await createMiniGame({
        ...game,
        title: game.title.trim(),
        target_sign: game.target_sign.trim(),
        prompt_image: game.prompt_image.trim(),
        hint_text: game.hint_text.trim(),
        options: game.options.trim(),
      });
      sessionStorage.removeItem(DRAFT_KEY);
      navigate("/teacher/tasks");
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish mini-game",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <section className="space-y-6 mt-6">
      <StepIndicator steps={steps} step={3} />

      <article className="grid grid-cols-2 gap-6 p-6 bg-(--white) rounded-4xl shadow-lg/5 border-2 border-dashed border-(--primary)">
        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-200 hover:bg-gray-300">
            <img
              src="https://example.com/image.jpg"
              alt="Description"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="paragraph-1 font-medium! text-(--black)/50">
              Activity Title
            </h3>
            <p className="heading-3 text-(--black)">
              {game.title || "Untitled activity"}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="paragraph-1 font-medium! text-(--black)/50">
              Grade Level
            </h3>
            <p className="heading-3 text-(--black)">
              Difficulty {game.difficulty}
            </p>
          </div>
          <div className="flex gap-4 heading-3 items-center bg-(--primary-light) p-4 rounded-2xl border-b-4 border-(--primary)">
            <div className="flex items-center justify-center size-8 bg-(--primary) p-2 rounded-full">
              <span className="text-(--white)">1</span>
            </div>
            <h3 className="text-(--primary)">
              {game.target_sign || "No target sign"}
            </h3>
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
          <Button variant="destructive">
            Cancel <X />
          </Button>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="gap-2">
            Save as Draft <Save className="size-4" />
          </Button>
          <form onSubmit={handlePublish}>
            <Button className="gap-2" type="submit" disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}{" "}
              <Upload className="size-4" />
            </Button>
          </form>
        </div>
        {error && (
          <p className="paragraph-2 text-(--danger)" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
