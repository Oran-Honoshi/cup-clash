"use client";

import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Ghost } from "lucide-react";
import { PlayerDrawer } from "@/components/dashboard/player-drawer";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

interface LeaderboardProps {
  members: Member[];
  currentUserId?: string;
  showGhost?: boolean;
}

const RANK_LABELS = ["1st", "2nd", "3rd"];
const RANK_COLORS = ["#d97706", "#64748b", "#b45309"];

function buildGhostPlayer(members: Member[]): Member {
  const avg = members.length
    ? Math.round(members.reduce((s, m) => s + m.points, 0) / members.length)
    : 0;
  return { id: "__ghost__", name: "The Expert", points: avg, paid: false, country: "Global Average", avatarUrl: null, isGhost: true, rankDelta: 0 };
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <Minus size={12} style={{ color: "#cbd5e1" }} />;
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#059669" }}>
      <TrendingUp size={11} />+{delta}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#dc2626" }}>
      <TrendingDown size={11} />{delta}
    </span>
  );
}

export function Leaderboard({ members, currentUserId, showGhost = true }: LeaderboardProps) {
  const [selected, setSelected] = useState<Member | null>(null);

  const sorted = [...members].sort((a, b) => b.points - a.points);
  const ghost  = buildGhostPlayer(members);

  let display: Member[] = sorted;
  if (showGhost && sorted.length > 0) {
    const insertAt = sorted.findIndex(m => m.points <= ghost.points);
    display = insertAt === -1
      ? [...sorted, ghost]
      : [...sorted.slice(0, insertAt), ghost, ...sorted.slice(insertAt)];
  }

  return (
    <>
      {/* Full-width white table */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Trophy size={18} strokeWidth={1.5} style={{ color: "#d97706" }} />
            <span className="font-display text-xl uppercase" style={{ color: "#0F172A" }}>Leaderboard</span>
          </div>
          <div className="flex items-center gap-3">
            {showGhost && (
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: "#94a3b8" }}>
                <Ghost size={11} /> Benchmark
              </span>
            )}
            <span className="text-xs" style={{ color: "#94a3b8" }}>{members.length} players</span>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[2rem_2.5rem_1fr_3rem_4rem_1.5rem] gap-2 items-center px-5 py-2 border-b border-slate-50"
          style={{ background: "#f8fafc" }}>
          <div />
          <div />
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Player</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: "#94a3b8" }}>Δ</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: "#94a3b8" }}>Pts</div>
          <div />
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {display.map((member, i) => {
            const isCurrentUser = member.id === currentUserId;
            const isGhost       = member.isGhost;
            const top3          = i < 3 && !isGhost;

            return (
              <div key={member.id}
                onClick={() => !isGhost && setSelected(member)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 transition-all",
                  !isGhost && "cursor-pointer hover:bg-slate-50 group",
                  isGhost && "opacity-60",
                )}
                style={isCurrentUser ? {
                  background: "rgba(0,255,136,0.06)",
                  borderLeft: "3px solid #00FF88",
                  paddingLeft: "calc(1.25rem - 3px)",
                } : undefined}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {top3 ? (
                    <span className="text-xs font-black" style={{ color: RANK_COLORS[i] }}>
                      {RANK_LABELS[i]}
                    </span>
                  ) : (
                    <span className="text-xs font-bold" style={{ color: isCurrentUser ? "#0891B2" : "#94a3b8" }}>
                      {isGhost ? "—" : i + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative w-10 shrink-0">
                  {isGhost ? (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center border border-dashed border-slate-200 bg-slate-50">
                      <Ghost size={15} style={{ color: "#cbd5e1" }} />
                    </div>
                  ) : (
                    <>
                      <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="md" />
                      {top3 && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                          style={{ background: RANK_COLORS[i], fontSize: "8px" }}>
                          {i + 1}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Name + country */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate" style={{ color: isCurrentUser ? "#0F172A" : isGhost ? "#94a3b8" : "#334155" }}>
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(0,255,136,0.15)", color: "#059669" }}>You</span>
                    )}
                    {isGhost && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "#f1f5f9", color: "#94a3b8" }}>Benchmark</span>
                    )}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: "#94a3b8" }}>{member.country}</div>
                </div>

                {/* Delta */}
                <div className="w-12 flex justify-center shrink-0">
                  {!isGhost && <DeltaBadge delta={member.rankDelta ?? 0} />}
                </div>

                {/* Points — monospace, cyan */}
                <div className="w-16 text-right shrink-0">
                  <span className="font-mono font-black text-2xl leading-none"
                    style={{ color: isCurrentUser ? "#0891B2" : isGhost ? "#94a3b8" : "#0F172A" }}>
                    {member.points}
                  </span>
                </div>

                {/* Chevron */}
                {!isGhost && (
                  <ChevronRight size={14} className="shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: "#cbd5e1" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Ghost footer */}
        {showGhost && (
          <div className="px-5 py-2.5 border-t border-slate-50 flex items-center gap-2 text-[10px]"
            style={{ background: "#f8fafc", color: "#94a3b8" }}>
            <Ghost size={11} />
            <span><strong style={{ color: "#64748b" }}>The Expert</strong> shows the group average — a benchmark to beat.</span>
          </div>
        )}
      </div>

      {selected && <PlayerDrawer member={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
