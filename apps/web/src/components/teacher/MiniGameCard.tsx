import { useState } from "react";
import { Link } from "react-router-dom";
import type { MiniGameConfig } from "@/interfaces/mini-game.interface";
import { snakeCaseToTitleCase } from "@/helpers/string";
import { resolveMediaUrl } from "@/services/mini-games";
import { Eye, Pencil, Trash2 } from "lucide-react";
import EditMiniGameDialog from "./EditMiniGameDialog";
import DeleteMiniGameDialog from "./DeleteMiniGameDialog";

interface MiniGameCardProps {
  miniGame: MiniGameConfig;
  onRefresh?: () => void;
}

export default function MiniGameCard({ miniGame, onRefresh }: MiniGameCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const gameTypeStyles: Record<string, string> = {
    see_it_sign_it: "bg-blue-600 text-white",
    puzzle_sign: "bg-emerald-600 text-white",
    magic_fingers: "bg-purple-600 text-white",
  };

  const defaultBanners: Record<string, string> = {
    see_it_sign_it: "/see_it_sign_it.png",
    puzzle_sign: "/puzzle_sign.png",
    magic_fingers: "/magic_fingers.png",
  };

  // Derive thumbnail from round items or fallback banner
  const getThumbnailUrl = () => {
    if (miniGame.prompt_image) {
      return resolveMediaUrl(miniGame.prompt_image);
    }
    if (
      miniGame.game_type === "see_it_sign_it" &&
      miniGame.see_it_sign_it_items &&
      miniGame.see_it_sign_it_items[0]?.objective_image_url
    ) {
      return resolveMediaUrl(miniGame.see_it_sign_it_items[0].objective_image_url);
    }
    if (
      miniGame.game_type === "puzzle_sign" &&
      miniGame.puzzle_sign_items &&
      (miniGame.puzzle_sign_items[0]?.word_form_image_url ||
        miniGame.puzzle_sign_items[0]?.word_one_image_url)
    ) {
      return resolveMediaUrl(
        miniGame.puzzle_sign_items[0].word_form_image_url ||
          miniGame.puzzle_sign_items[0].word_one_image_url,
      );
    }
    if (
      miniGame.game_type === "magic_fingers" &&
      miniGame.magic_fingers_items &&
      miniGame.magic_fingers_items[0]?.objective_image_url
    ) {
      return resolveMediaUrl(miniGame.magic_fingers_items[0].objective_image_url);
    }
    return defaultBanners[miniGame.game_type] || "/see_it_sign_it.png";
  };

  // Compute round count
  const getRoundCount = () => {
    if (miniGame.see_it_sign_it_items) return miniGame.see_it_sign_it_items.length;
    if (miniGame.puzzle_sign_items) return miniGame.puzzle_sign_items.length;
    if (miniGame.magic_fingers_items) return miniGame.magic_fingers_items.length;
    return 1;
  };

  const difficultyLabels: Record<number, string> = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
  };

  const finalThumb = imgError
    ? defaultBanners[miniGame.game_type] || "/see_it_sign_it.png"
    : getThumbnailUrl();

  return (
    <>
      <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-3 border-(--border) bg-(--white) shadow-[0_6px_0_0_#BDC8D2] transition-all hover:-translate-y-1 hover:shadow-[0_10px_0_0_#BDC8D2]">
        {/* Thumbnail with overlay badges */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={finalThumb}
            alt={miniGame.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span
              className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm ${
                gameTypeStyles[miniGame.game_type] || "bg-gray-800 text-white"
              }`}
            >
              {snakeCaseToTitleCase(miniGame.game_type)}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-[11px] font-bold bg-white/90 backdrop-blur-xs text-gray-800 px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
              {difficultyLabels[miniGame.difficulty || 1] || "Easy"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 justify-between p-5 gap-4">
          <div className="space-y-1.5">
            <h2 className="heading-4 font-bold text-gray-900 line-clamp-1">
              {miniGame.title}
            </h2>
            <p className="caption text-gray-500 line-clamp-2">
              {miniGame.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100">
            <span>{getRoundCount()} {getRoundCount() === 1 ? "Round" : "Rounds"}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Link
              to={`/teacher/mini-games/${miniGame.id}`}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors cursor-pointer text-center"
              title="View Activity Details"
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-(--primary-light) hover:bg-(--primary)/20 text-xs font-bold text-(--primary) transition-colors cursor-pointer"
              title="Edit Activity & Replace Media"
            >
              <Pencil className="size-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 transition-colors cursor-pointer"
              title="Delete Activity"
            >
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </article>

      {/* Edit Modal */}
      <EditMiniGameDialog
        isOpen={isEditOpen}
        miniGame={miniGame}
        onClose={() => setIsEditOpen(false)}
        onUpdated={() => {
          if (onRefresh) onRefresh();
        }}
      />

      {/* Delete Modal */}
      <DeleteMiniGameDialog
        isOpen={isDeleteOpen}
        gameId={miniGame.id}
        gameTitle={miniGame.title}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}

