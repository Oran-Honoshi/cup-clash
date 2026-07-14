import Link from "next/link";
import { ChevronRight, Gamepad2, Flame } from "lucide-react";
import type { GameType } from "@/lib/services/daily-challenge";
import { ZONES } from "@/lib/zones";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";

interface DailyChallengeTeaserProps {
  gameType: GameType;
  groupStreak?: number | null;
}

const GAME_ACCENT = ZONES.find(z => z.key === "game")!.accent;

const GAME_LABEL: Record<GameType, string> = {
  guess_footballer: "Guess the Footballer",
  guess_club: "Guess the Club",
};

export function DailyChallengeTeaser({ gameType, groupStreak }: DailyChallengeTeaserProps) {
  return (
    <Link
      href="/daily-challenge"
      className={`flex items-center gap-3 rounded-xl ${zoneFontVars}`}
      style={{ padding: 14, background: "var(--sf)", border: "1px solid var(--br)", textDecoration: "none" }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-xl"
        style={{ width: 44, height: 44, background: `color-mix(in srgb, ${GAME_ACCENT} 16%, transparent)`, color: GAME_ACCENT }}
      >
        <Gamepad2 size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-zone-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: GAME_ACCENT }}>
          Today's Daily Challenge
        </div>
        <div style={{ fontFamily: "var(--font-zone-display)", fontSize: 15, fontWeight: 700, color: "var(--tx)", marginTop: 2 }}>
          {GAME_LABEL[gameType]}
        </div>
        {!!groupStreak && groupStreak > 0 && (
          <div className="flex items-center gap-1" style={{ fontFamily: "var(--font-zone-body)", fontSize: 11, color: "var(--mt)", marginTop: 2 }}>
            <Flame size={11} style={{ color: "#f59e0b" }} /> {groupStreak}-day group streak
          </div>
        )}
      </div>
      <ChevronRight size={16} style={{ color: "var(--mt)" }} />
    </Link>
  );
}
