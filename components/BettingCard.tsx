"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { formatMatchTime } from "@/lib/formatMatchTime";
import { isMatchLocked } from "@/lib/isMatchLocked";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

interface BettingCardProps {
  match:    Match;
  onSubmit: (homeScore: number, awayScore: number) => void;
  defaultHome?: number;
  defaultAway?: number;
}

export function BettingCard({ match, onSubmit, defaultHome, defaultAway }: BettingCardProps) {
  const locked = isMatchLocked(match.time);
  const localTime = formatMatchTime(match.time, { showDate: true });

  const [home, setHome] = useState<string>(defaultHome !== undefined ? String(defaultHome) : "");
  const [away, setAway] = useState<string>(defaultAway !== undefined ? String(defaultAway) : "");

  const homeVal = home === "" ? null : parseInt(home, 10);
  const awayVal = away === "" ? null : parseInt(away, 10);
  const canSubmit =
    !locked &&
    homeVal !== null && awayVal !== null &&
    !isNaN(homeVal) && !isNaN(awayVal) &&
    homeVal >= 0 && awayVal >= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(homeVal!, awayVal!);
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border transition-all duration-normal",
        "bg-[rgba(18,14,38,0.5)] backdrop-blur-[20px]",
        locked
          ? "border-white/10 opacity-70"
          : "border-white/14 hover:border-white/25"
      )}
    >
      {locked && (
        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-sm z-10">
          <Lock size={28} className="text-white/50" />
          <p className="text-sm text-white/50 font-bold uppercase tracking-widest">
            Predictions locked
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        {/* time */}
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 text-center">
          {localTime}
        </p>

        {/* teams + score inputs */}
        <div className="flex items-center gap-3">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-white/90 truncate max-w-full text-center">
              {match.home}
            </span>
            <input
              type="number"
              min={0}
              max={99}
              value={home}
              onChange={e => setHome(e.target.value)}
              disabled={locked}
              aria-label={`${match.home} score`}
              className="w-full h-16 sm:h-20 text-center text-3xl sm:text-4xl font-black
                         bg-white/5 border border-white/14 rounded-xl text-white
                         focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent,0_255_136))]
                         disabled:cursor-not-allowed appearance-none [-moz-appearance:textfield]
                         [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* separator */}
          <span className="text-2xl font-black text-white/30 pb-6">—</span>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-white/90 truncate max-w-full text-center">
              {match.away}
            </span>
            <input
              type="number"
              min={0}
              max={99}
              value={away}
              onChange={e => setAway(e.target.value)}
              disabled={locked}
              aria-label={`${match.away} score`}
              className="w-full h-16 sm:h-20 text-center text-3xl sm:text-4xl font-black
                         bg-white/5 border border-white/14 rounded-xl text-white
                         focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent,0_255_136))]
                         disabled:cursor-not-allowed appearance-none [-moz-appearance:textfield]
                         [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* submit */}
        {!locked && (
          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 w-full h-12 rounded-full font-bold uppercase tracking-widest text-sm
                       transition-all duration-fast active:scale-[0.97]
                       disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit
                ? "linear-gradient(135deg,#00FF88,#00D4FF)"
                : "rgba(255,255,255,0.08)",
              color: canSubmit ? "#0B141B" : "rgba(255,255,255,0.4)",
            }}
          >
            Submit prediction
          </button>
        )}
      </form>
    </div>
  );
}
