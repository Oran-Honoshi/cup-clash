"use client";

import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PlayerDrawer } from "@/components/dashboard/player-drawer";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/components/ui/member-avatar";
import type { Member } from "@/lib/types";

interface LeaderboardProps {
  members: Member[];
  currentUserId?: string;
}

const RANK_COLORS = [
  "from-yellow-400 to-yellow-600",
  "from-slate-300 to-slate-500",
  "from-amber-600 to-amber-800",
];

const RANK_GLOWS = [
  "0 0 20px rgba(250, 204, 21, 0.4)",
  "0 0 20px rgba(148, 163, 184, 0.3)",
  "0 0 20px rgba(180, 83, 9, 0.35)",
];

export function Leaderboard({ members, currentUserId }: LeaderboardProps) {
  const [selected, setSelected] = useState<Member | null>(null);
  const sorted = [...members].sort((a, b) => b.points - a.points);

  return (
    <>
      <Card variant="glass" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Trophy size={18} style={{ color: "rgb(var(--accent-glow))" }} />
            <span className="font-display text-xl uppercase text-white tracking-tight">
              Leaderboard
            </span>
          </div>
          <span className="label-caps">{sorted.length} players</span>
        </div>

        {/* Hint */}
        <div className="px-5 py-2 border-b border-white/[0.04] text-[11px] text-pitch-500 italic">
          Tap any player to see their point breakdown
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {sorted.map((member, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            const isCurrentUser = member.id === currentUserId;

            return (
              <button
                key={member.id}
                onClick={() => setSelected(member)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-3.5 transition-all text-left",
                  "hover:bg-white/[0.03] group",
                  isCurrentUser && "bg-white/[0.03]"
                )}
                style={
                  isCurrentUser
                    ? { borderLeft: "2px solid rgb(var(--accent))" }
                    : undefined
                }
              >
                {/* Rank */}
                <div className="w-8 shrink-0 flex justify-center">
                  {isTop3 ? (
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-b",
                        RANK_COLORS[i]
                      )}
                      style={{ boxShadow: RANK_GLOWS[i] }}
                    >
                      {rank}
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-pitch-500 tabular">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <MemberAvatar
                  name={member.name}
                  avatarUrl={member.avatarUrl}
                  size="md"
                  dim={!isCurrentUser}
                />

                {/* Name + country */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-bold truncate",
                        isCurrentUser ? "text-white" : "text-pitch-200"
                      )}
                    >
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-pitch-300 shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-pitch-500 truncate">
                    {member.country}
                  </div>
                </div>

                {/* Delta */}
                <div className="shrink-0">
                  <Minus size={14} className="text-pitch-600" />
                </div>

                {/* Points */}
                <div className="shrink-0 text-right">
                  <div
                    className="font-display text-2xl tabular leading-none"
                    style={isTop3 ? { color: "rgb(var(--accent-glow))" } : undefined}
                  >
                    {member.points}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-pitch-500">
                    pts
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={14}
                  className="shrink-0 text-pitch-600 group-hover:text-pitch-300 transition-colors"
                />
              </button>
            );
          })}
        </div>
      </Card>

      {/* Player drawer */}
      <PlayerDrawer member={selected} onClose={() => setSelected(null)} />
    </>
  );
}
