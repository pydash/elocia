import type { MiniGameConfig } from "@/interfaces/mini-game.interface";
import { snakeCaseToTitleCase } from "@/helpers/string";

export default function MiniGameCard({
  miniGame,
}: {
  miniGame: MiniGameConfig;
}) {
  const gameTypeStyles: Record<string, string> = {
    see_it_sign_it: "bg-blue-500 text-blue-200",
    puzzle_sign: "bg-green-500 text-green-200",
    magic_fingers: "bg-purple-500 text-purple-200",
  };

  return (
    <article className="overflow-hidden rounded-3xl border-3 border-(--border) bg-(--white) shadow-[0_6px_0_0_#BDC8D2]">
      <div className="aspect-video w-full overflow-hidden bg-(--surface)">
        <img
          src={miniGame.prompt_image}
          alt={miniGame.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-4 p-4">
        <span
          className={`w-fit caption p-2 rounded-lg ${gameTypeStyles[miniGame.game_type] || "bg-gray-500 border-gray-700"}`}
        >
          {snakeCaseToTitleCase(miniGame.game_type)}
        </span>
        <h2 className="font-bold! text-(--primary) heading-4">
          Title: {miniGame.title}
        </h2>
      </div>
    </article>
  );
}
