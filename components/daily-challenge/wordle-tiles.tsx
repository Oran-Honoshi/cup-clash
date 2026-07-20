"use client";

import { cn } from "@/lib/utils";
import type { LetterTile } from "@/lib/services/wordle-feedback";

// Shared Wordle-tile row for both Daily Challenge games (Guess the
// Footballer / Guess the Club) — one component so the two games can never
// visually drift. Colors are fixed hex (not theme tokens), matching this
// codebase's existing convention for semantic status colors (the win-green
// and error-red used elsewhere in daily-challenge-client.tsx are hardcoded
// the same way), so they read correctly against every theme's surface.
const STATUS_BG: Record<"green" | "orange" | "red", string> = {
  green: "#00c46a",
  orange: "#f5a524",
  red: "#f87171",
};

export type LetterStatusLabels = { correct: string; present: string; absent: string };

export function WordleTileRow({
  letters,
  labels,
}: {
  letters: LetterTile[];
  labels?: LetterStatusLabels;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {letters.map((tile, i) => {
        if (tile.status === "separator") {
          const isSpace = /\s/.test(tile.char);
          return (
            <span
              key={i}
              aria-hidden="true"
              className={cn("flex items-center justify-center h-8 shrink-0 text-sm font-bold", isSpace ? "w-2" : "w-3")}
              style={{ color: "var(--t2)" }}
            >
              {isSpace ? "" : tile.char}
            </span>
          );
        }

        const label = tile.status === "green" ? labels?.correct : tile.status === "orange" ? labels?.present : labels?.absent;

        return (
          <span
            key={i}
            aria-label={label}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-sm font-black uppercase shrink-0"
            style={{ background: STATUS_BG[tile.status], color: "#ffffff" }}
          >
            {tile.char}
          </span>
        );
      })}
    </div>
  );
}
