"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { flagUrl, countryFlagCode } from "@/lib/countries";
import type { Member } from "@/lib/types";

interface PointHistoryEntry {
  match:  string;
  type:   string;
  points: number;
}

interface LeaderboardProps {
  members:      Member[];
  pointHistory?: Record<string, PointHistoryEntry[]>;
}

const RANK_ACCENTS: Record<number, string> = {
  1: "text-yellow-400  border-yellow-400/30  bg-yellow-400/10",
  2: "text-slate-300   border-slate-300/30   bg-slate-300/10",
  3: "text-amber-600   border-amber-600/30   bg-amber-600/10",
};

const RANK_LABELS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const MOCK_HISTORY: PointHistoryEntry[] = [
  { match: "Israel vs France",    type: "Exact score",     points: 25 },
  { match: "Argentina vs Brazil", type: "Correct outcome", points: 10 },
  { match: "England vs Spain",    type: "Exact score",     points: 25 },
];

export function Leaderboard({ members, pointHistory = {} }: LeaderboardProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const sorted = [...members].sort((a, b) => b.points - a.points);
  const history = selectedMember
    ? (pointHistory[selectedMember.id] ?? MOCK_HISTORY)
    : [];

  return (
    <>
      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="w-full rounded-2xl border border-white/14 overflow-hidden bg-[rgba(18,14,38,0.5)] backdrop-blur-[20px]">
        {/* header */}
        <div className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_auto_auto] gap-x-3 px-4 py-3 border-b border-white/10">
          <span className="text-label text-white/40 uppercase tracking-widest">#</span>
          <span className="text-label text-white/40 uppercase tracking-widest">Player</span>
          <span className="text-label text-white/40 uppercase tracking-widest hidden sm:block">Country</span>
          <span className="text-label text-white/40 uppercase tracking-widest text-right">Pts</span>
        </div>

        {sorted.map((m, i) => {
          const rank = i + 1;
          const accent = RANK_ACCENTS[rank];
          const flag = countryFlagCode(m.country);

          return (
            <button
              key={m.id}
              onClick={() => setSelectedMember(m)}
              className={cn(
                "w-full grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_auto_auto] gap-x-3",
                "px-4 py-3 border-b border-white/6 last:border-0",
                "hover:bg-white/5 transition-colors duration-fast text-left",
                rank <= 3 && "bg-white/[0.02]"
              )}
            >
              {/* rank */}
              <span className={cn(
                "text-sm font-black w-8 h-8 rounded-full flex items-center justify-center border",
                rank <= 3 ? accent : "text-white/40 border-white/10"
              )}>
                {rank <= 3 ? RANK_LABELS[rank] : rank}
              </span>

              {/* name */}
              <span className={cn(
                "text-sm font-semibold self-center",
                rank === 1 ? "text-yellow-300" : "text-white/90"
              )}>
                {m.name}
              </span>

              {/* flag */}
              <span className="hidden sm:flex items-center self-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flagUrl(flag)}
                  alt={m.country}
                  width={20}
                  height={14}
                  className="rounded-sm object-cover"
                />
              </span>

              {/* points */}
              <span className={cn(
                "text-sm font-black self-center text-right",
                rank === 1 ? "text-yellow-300" : "text-white/80"
              )}>
                {m.points}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Point-history drawer ──────────────────────────────────────── */}
      {selectedMember && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          />

          {/* sheet */}
          <div className="fixed bottom-0 inset-x-0 z-50 max-w-lg mx-auto rounded-t-3xl
                          bg-[#080510] border border-white/14 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]
                          animate-slideDown">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-0.5">
                  Point history
                </p>
                <p className="text-base font-bold text-white">{selectedMember.name}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                           hover:bg-white/15 transition-colors"
                aria-label="Close"
              >
                <X size={15} className="text-white/70" />
              </button>
            </div>

            <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-4">No predictions recorded yet.</p>
              ) : (
                history.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-white/6 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/90">{h.match}</p>
                      <p className="text-xs text-white/40">{h.type}</p>
                    </div>
                    <span className={cn(
                      "text-sm font-black",
                      h.points > 0 ? "text-[#00FF88]" : "text-white/30"
                    )}>
                      {h.points > 0 ? `+${h.points}` : h.points}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Total</span>
              <span className="text-lg font-black text-white">{selectedMember.points} pts</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
