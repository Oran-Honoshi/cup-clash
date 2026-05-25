"use client";

import { useState } from "react";
import { Crown, Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Ghost } from "lucide-react";
import { PlayerDrawer } from "@/components/dashboard/player-drawer";
import { AvatarCC } from "@/components/ui/avatar-cc";
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

const PODIUM_BAR_STYLES = [
  // 2nd (left)
  { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderBottom: "none" },
  // 1st (center)
  { background: "rgba(251,191,36,0.2)",   border: "1px solid #fbbf24",               borderBottom: "none" },
  // 3rd (right)
  { background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", borderBottom: "none" },
] as const;

const PODIUM_BAR_HEIGHTS = [64, 80, 50]; // 2nd, 1st, 3rd
const PODIUM_ACTUAL_RANKS = [2, 1, 3];
const PODIUM_POINT_COLORS = ["rgba(255,255,255,0.7)", "#fbbf24", "#f97316"];

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

  // Podium: top 3 real members — order: 2nd (left) · 1st (center) · 3rd (right)
  const top3 = sorted.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter((m): m is Member => m !== undefined);

  // Table: everything that isn't in the top 3
  const top3Ids = new Set(top3.map(m => m.id));
  const tableDisplay = display.filter(m => !top3Ids.has(m.id));

  return (
    <>
      {/* ── Podium ──────────────────────────────────────── */}
      {top3.length >= 2 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 8,
            padding: "16px 14px 0",
          }}
        >
          {podiumOrder.map((member, pos) => {
            const rank = PODIUM_ACTUAL_RANKS[pos];
            const isMe = member.id === currentUserId;
            return (
              <div
                key={member.id}
                onClick={() => setSelected(member)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
              >
                {/* Crown above 1st place */}
                {rank === 1 && (
                  <Crown
                    size={16}
                    fill="#fbbf24"
                    style={{ color: "#fbbf24", marginBottom: 4 }}
                  />
                )}

                {/* Avatar */}
                <AvatarCC
                  name={member.name}
                  size={44}
                  you={isMe}
                  ring={rank === 1 ? "#fbbf24" : undefined}
                />

                {/* Bar */}
                <div
                  style={{
                    marginTop: 6,
                    width: "100%",
                    height: PODIUM_BAR_HEIGHTS[pos],
                    borderRadius: "10px 10px 0 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    ...PODIUM_BAR_STYLES[pos],
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontWeight: 800,
                      fontSize: 11,
                      color: "white",
                      textTransform: "uppercase",
                      textAlign: "center",
                      padding: "0 4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 900,
                      fontSize: 16,
                      color: PODIUM_POINT_COLORS[pos],
                    }}
                  >
                    {member.points}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: RANK_COLORS[rank - 1],
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    {RANK_LABELS[rank - 1]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Main card ───────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12, 18, 32, 0.78)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
            <span className="font-display text-xl uppercase text-white tracking-wide">Leaderboard</span>
          </div>
          <div className="flex items-center gap-3">
            {showGhost && (
              <span
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <Ghost size={11} /> Benchmark
              </span>
            )}
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {members.length} players
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div
          className="hidden sm:grid grid-cols-[2rem_2.5rem_1fr_3rem_4rem_1.5rem] gap-2 items-center px-5 py-2 border-b"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div />
          <div />
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Player</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: "rgba(255,255,255,0.3)" }}>Δ</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: "rgba(255,255,255,0.3)" }}>Pts</div>
          <div />
        </div>

        {/* Rows — 4th place onward */}
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {tableDisplay.map((member) => {
            const isCurrentUser = member.id === currentUserId;
            const isGhost       = member.isGhost;
            const realRank      = isGhost ? null : sorted.findIndex(m => m.id === member.id) + 1;

            return (
              <div
                key={member.id}
                onClick={() => !isGhost && setSelected(member)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 transition-all",
                  !isGhost && "cursor-pointer group",
                  isGhost && "opacity-50",
                )}
                style={
                  isCurrentUser
                    ? { background: "rgba(0,255,136,0.08)", borderLeft: "2px solid #00FF88", paddingLeft: "calc(1.25rem - 2px)" }
                    : undefined
                }
                onMouseEnter={(e: { currentTarget: HTMLElement }) => { if (!isGhost && !isCurrentUser) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e: { currentTarget: HTMLElement }) => { if (!isGhost && !isCurrentUser) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: isCurrentUser ? "#00FF88" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {isGhost ? "—" : realRank}
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative w-10 shrink-0">
                  {isGhost ? (
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center"
                      style={{ border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}
                    >
                      <Ghost size={15} style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  ) : (
                    <AvatarCC name={member.name} size={36} you={isCurrentUser} />
                  )}
                </div>

                {/* Name + country */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold truncate"
                      style={{ color: isCurrentUser ? "#00FF88" : isGhost ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)" }}
                    >
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.25)" }}
                      >
                        You
                      </span>
                    )}
                    {isGhost && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                      >
                        Benchmark
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {member.country}
                  </div>
                </div>

                {/* Delta */}
                <div className="w-12 flex justify-center shrink-0">
                  {!isGhost && <DeltaBadge delta={member.rankDelta ?? 0} />}
                </div>

                {/* Points */}
                <div className="w-16 text-right shrink-0">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 900,
                      fontSize: 22,
                      lineHeight: 1,
                      color: isCurrentUser ? "#00FF88" : isGhost ? "rgba(255,255,255,0.2)" : "white",
                    }}
                  >
                    {member.points}
                  </span>
                </div>

                {/* Chevron */}
                {!isGhost && (
                  <ChevronRight
                    size={14}
                    className="shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: "rgba(255,255,255,0.15)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Ghost footer */}
        {showGhost && (
          <div
            className="px-5 py-2.5 border-t flex items-center gap-2 text-[10px]"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.3)" }}
          >
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
