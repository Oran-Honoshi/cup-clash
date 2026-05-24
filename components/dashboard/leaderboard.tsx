"use client";

import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Ghost } from "lucide-react";
import { PlayerDrawer } from "@/components/dashboard/player-drawer";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

interface LeaderboardProps {
  members:        Member[];
  currentUserId?: string;
  groupId?:       string;
  showGhost?:     boolean;
}

const RANK_LABELS = ["1st", "2nd", "3rd"];
const RANK_COLORS = ["#fbbf24", "#94a3b8", "#f97316"];

function buildGhostPlayer(members: Member[]): Member {
  const avg = members.length
    ? Math.round(members.reduce((s, m) => s + m.points, 0) / members.length)
    : 0;
  return { id: "__ghost__", name: "The Expert", points: avg, paid: false, country: "Global Average", avatarUrl: null, isGhost: true, rankDelta: 0 };
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <Minus size={12} style={{ color: "rgba(255,255,255,0.2)" }} />;
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#00FF88" }}>
      <TrendingUp size={11} />+{delta}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#f87171" }}>
      <TrendingDown size={11} />{delta}
    </span>
  );
}

export function Leaderboard({ members, currentUserId, groupId, showGhost = true }: LeaderboardProps) {
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
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12, 18, 32, 0.78)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
            <span className="font-display text-xl uppercase text-white tracking-wide">Leaderboard</span>
          </div>
          <div className="flex items-center gap-3">
            {showGhost && (
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                <Ghost size={11} /> Benchmark
              </span>
            )}
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{members.length} players</span>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[2rem_2.5rem_1fr_3rem_4rem_1.5rem] gap-2 items-center px-5 py-2 border-b"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)" }}>
          <div />
          <div />
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Player</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: "rgba(255,255,255,0.3)" }}>Δ</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: "rgba(255,255,255,0.3)" }}>Pts</div>
          <div />
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {display.map((member, i) => {
            const isCurrentUser = member.id === currentUserId;
            const isGhost       = member.isGhost;
            const top3          = i < 3 && !isGhost;

            return (
              <div key={member.id}
                onClick={() => !isGhost && setSelected(member)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 transition-all",
                  !isGhost && "cursor-pointer group",
                  isGhost && "opacity-50",
                )}
                style={isCurrentUser ? {
                  background: "rgba(0,255,136,0.08)",
                  borderLeft: "2px solid #00FF88",
                  paddingLeft: "calc(1.25rem - 2px)",
                } : undefined}
                onMouseEnter={e => { if (!isGhost && !isCurrentUser) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!isGhost && !isCurrentUser) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {top3 ? (
                    <span className="text-xs font-black" style={{ color: RANK_COLORS[i] }}>
                      {RANK_LABELS[i]}
                    </span>
                  ) : (
                    <span className="text-xs font-bold" style={{ color: isCurrentUser ? "#00FF88" : "rgba(255,255,255,0.3)" }}>
                      {isGhost ? "—" : i + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative w-10 shrink-0">
                  {isGhost ? (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center"
                      style={{ border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}>
                      <Ghost size={15} style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  ) : (
                    <>
                      <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="md" />
                      {top3 && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                          style={{ background: RANK_COLORS[i] }}>
                          {i + 1}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Name + country */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate"
                      style={{ color: isCurrentUser ? "#00FF88" : isGhost ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)" }}>
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.25)" }}>
                        You
                      </span>
                    )}
                    {isGhost && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
                        Benchmark
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{member.country}</div>
                </div>

                {/* Delta */}
                <div className="w-12 flex justify-center shrink-0">
                  {!isGhost && <DeltaBadge delta={member.rankDelta ?? 0} />}
                </div>

                {/* Points */}
                <div className="w-16 text-right shrink-0">
                  <span className="font-mono font-black text-2xl leading-none"
                    style={{ color: isCurrentUser ? "#00FF88" : isGhost ? "rgba(255,255,255,0.2)" : "white" }}>
                    {member.points}
                  </span>
                </div>

                {/* Chevron */}
                {!isGhost && (
                  <ChevronRight size={14} className="shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: "rgba(255,255,255,0.15)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Ghost footer */}
        {showGhost && (
          <div className="px-5 py-2.5 border-t flex items-center gap-2 text-[10px]"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.3)" }}>
            <Ghost size={11} />
            <span>
              <strong style={{ color: "rgba(255,255,255,0.5)" }}>The Expert</strong> shows the group average — a benchmark to beat.
            </span>
          </div>
        )}
      </div>

      {selected && !selected.isGhost && (
        <PlayerDrawer
          userId={selected.id}
          groupId={groupId ?? ""}
          name={selected.name}
          country={selected.country ?? ""}
          points={selected.points}
          rank={sorted.findIndex(m => m.id === selected.id) + 1}
          open={true}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}