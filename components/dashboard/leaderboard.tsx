"use client";

import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Ghost } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PlayerDrawer } from "@/components/dashboard/player-drawer";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

interface LeaderboardProps {
  members: Member[];
  currentUserId?: string;
  showGhost?: boolean;   // show the Global Average ghost player
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_GLOWS = [
  "0 0 20px rgba(250,204,21,0.35)",
  "0 0 16px rgba(148,163,184,0.25)",
  "0 0 14px rgba(180,83,9,0.3)",
];

// Ghost player — represents the "global average" benchmark
function buildGhostPlayer(members: Member[]): Member {
  const avg = members.length
    ? Math.round(members.reduce((s, m) => s + m.points, 0) / members.length)
    : 0;
  return {
    id: "__ghost__",
    name: "The Expert",
    points: avg,
    paid: false,
    country: "🌍 Global Average",
    avatarUrl: null,
    isGhost: true,
    rankDelta: 0,
    exactScores: 0,
  };
}

// Delta indicator component
function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-pitch-600">
      <Minus size={9} />
    </span>
  );
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-success">
      <TrendingUp size={10} />+{delta}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-danger">
      <TrendingDown size={10} />{delta}
    </span>
  );
}

export function Leaderboard({ members, currentUserId, showGhost = true }: LeaderboardProps) {
  const [selected, setSelected] = useState<Member | null>(null);

  // Build display list — real members sorted, then optionally inject ghost
  const sorted = [...members].sort((a, b) => b.points - a.points);
  const ghost  = buildGhostPlayer(members);

  // Insert ghost at correct rank position
  let display: Member[] = sorted;
  if (showGhost && sorted.length > 0) {
    const insertAt = sorted.findIndex(m => m.points <= ghost.points);
    if (insertAt === -1) {
      display = [...sorted, ghost];
    } else {
      display = [...sorted.slice(0, insertAt), ghost, ...sorted.slice(insertAt)];
    }
  }

  const isTop3 = (i: number) => i < 3;

  return (
    <>
      <Card variant="glass" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Trophy size={18} style={{ color: "#D4AF37" }} />
            <span className="font-display text-xl uppercase text-white tracking-tight">Leaderboard</span>
          </div>
          <div className="flex items-center gap-3">
            {showGhost && (
              <div className="flex items-center gap-1 text-[10px] text-pitch-500 uppercase tracking-widest">
                <Ghost size={11} /> Global avg
              </div>
            )}
            <span className="text-xs text-pitch-500">{members.length} players</span>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden sm:flex items-center px-5 py-2 border-b border-white/[0.04]">
          <div className="w-8 shrink-0" />
          <div className="w-10 shrink-0" />
          <div className="flex-1 text-[10px] font-bold uppercase tracking-widest text-pitch-600">Player</div>
          <div className="w-12 text-center text-[10px] font-bold uppercase tracking-widest text-pitch-600">Δ</div>
          <div className="w-16 text-center text-[10px] font-bold uppercase tracking-widest text-pitch-600">Pts</div>
          <div className="w-6 shrink-0" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {display.map((member, i) => {
            const isCurrentUser = member.id === currentUserId;
            const isGhost       = member.isGhost;
            const top3          = isTop3(i);
            const rank          = i + 1;

            return (
              <div key={member.id}
                onClick={() => !isGhost && setSelected(member)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 transition-all",
                  !isGhost && "cursor-pointer hover:bg-white/[0.02] group",
                  isCurrentUser && "bg-white/[0.03]",
                  isGhost && "opacity-60",
                )}
                style={isCurrentUser ? { borderLeft: "2px solid rgb(var(--accent))" } : undefined}
              >
                {/* Rank number */}
                <div className="w-8 shrink-0 text-center">
                  {top3 && !isGhost ? (
                    <span className="font-display text-xl" style={{ filter: `drop-shadow(${RANK_GLOWS[i]})` }}>
                      {RANK_MEDALS[i]}
                    </span>
                  ) : (
                    <span className={cn("font-bold text-sm", isCurrentUser ? "text-white" : "text-pitch-600")}>
                      {isGhost ? "—" : rank}
                    </span>
                  )}
                </div>

                {/* Avatar with medal */}
                <div className="relative shrink-0">
                  {isGhost ? (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center border border-dashed border-white/20 bg-white/[0.03]">
                      <Ghost size={16} className="text-pitch-600" />
                    </div>
                  ) : (
                    <>
                      <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="md" dim={!isCurrentUser} />
                      {top3 && (
                        <span className="absolute -bottom-1 -right-1 text-sm leading-none">{RANK_MEDALS[i]}</span>
                      )}
                    </>
                  )}
                </div>

                {/* Name + country */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold truncate",
                      isCurrentUser ? "text-white" : isGhost ? "text-pitch-500 italic" : "text-pitch-200")}>
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-pitch-300 shrink-0">
                        You
                      </span>
                    )}
                    {isGhost && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(100,116,139,0.15)", color: "#64748b" }}>
                        Benchmark
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-pitch-600 truncate">{member.country}</div>
                </div>

                {/* Rank delta */}
                <div className="w-12 flex justify-center shrink-0">
                  {!isGhost && <DeltaBadge delta={member.rankDelta ?? 0} />}
                </div>

                {/* Points */}
                <div className="w-16 text-right shrink-0">
                  <span className={cn("font-display text-2xl leading-none",
                    isCurrentUser ? "text-white" : isGhost ? "text-pitch-600" : "text-pitch-200")}>
                    {member.points}
                  </span>
                </div>

                {/* Chevron */}
                {!isGhost && (
                  <ChevronRight size={15} className="text-pitch-700 group-hover:text-pitch-400 transition-colors shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Ghost explanation footer */}
        {showGhost && (
          <div className="px-5 py-2.5 border-t border-white/[0.04] flex items-center gap-2 text-[10px] text-pitch-600">
            <Ghost size={11} />
            <span><strong className="text-pitch-500">The Expert</strong> shows the group average — beat it to stay ahead of the field.</span>
          </div>
        )}
      </Card>

      {selected && (
        <PlayerDrawer member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
