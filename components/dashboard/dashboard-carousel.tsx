"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Crown } from "lucide-react";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { PredictionDistribution } from "@/components/dashboard/prediction-distribution";
import { MemberAvatar } from "@/components/ui/member-avatar";
import type { Match, Member } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardCarouselProps {
  matches:       Match[];
  members:       Member[];
  groupId:       string;
  groupName:     string;
  currentUserId: string;
  rank:          number;
  totalPlayers:  number;
}

// ── Panel tabs ────────────────────────────────────────────────────────────────

const PANELS = ["MATCH", "LEADERBOARD", "MY STATS"] as const;
type PanelId = typeof PANELS[number];

const PANEL_BG = "radial-gradient(ellipse at 50% 120%, #1a3810 0%, #0a1808 55%, #030c04 100%)";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

// ── Leaderboard panel ─────────────────────────────────────────────────────────

const PODIUM_ORDER = [1, 0, 2] as const; // left=2nd, center=1st, right=3rd
const PODIUM_HEIGHTS = [46, 64, 34];
const PODIUM_AVATAR_SIZES: Array<"sm" | "md"> = ["sm", "md", "sm"];
const PODIUM_COLORS = ["#a0c8a0", "#ffaa00", "#a0c8a0"];

function LeaderboardPanel({ members, currentUserId, groupName }: {
  members: Member[];
  currentUserId: string;
  groupName: string;
}) {
  const sorted = [...members].sort((a, b) => b.points - a.points);
  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
      {/* Meta */}
      <div className="font-barlow font-bold uppercase text-center" style={{ fontSize: 9, letterSpacing: 2, color: "#3a7a3a" }}>
        {groupName} · {members.length} members
      </div>

      <div className="font-display font-black uppercase text-center" style={{ fontSize: 22, color: "#e0f2e0" }}>
        Leaderboard
      </div>

      {/* Podium */}
      {top3.length >= 2 && (
        <div className="flex items-end justify-center gap-2 pb-1">
          {PODIUM_ORDER.map((srcIdx, pos) => {
            const member = top3[srcIdx];
            if (!member) return null;
            const isMe = member.id === currentUserId;
            const rank = srcIdx + 1;
            return (
              <div key={member.id} style={{ width: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {rank === 1 && <Crown size={14} fill="#ffaa00" style={{ color: "#ffaa00" }} />}
                <div style={{
                  borderRadius: "50%",
                  boxShadow: rank === 1
                    ? "0 0 0 2px #ffaa00"
                    : isMe ? "0 0 0 2px #00e5a0" : `0 0 0 2px #4a7a4a`,
                }}>
                  <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size={PODIUM_AVATAR_SIZES[pos]} />
                </div>
                <span className="font-barlow font-bold uppercase text-center truncate w-full px-1" style={{ fontSize: 11, color: isMe ? "#00e5a0" : "#a0c8a0" }}>
                  {member.name}
                </span>
                <div style={{
                  width: 80, height: PODIUM_HEIGHTS[pos],
                  borderRadius: "6px 6px 0 0",
                  background: rank === 1 ? "#162a10" : "#1c3a1c",
                  border: "1px solid #2a5a2a",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                }}>
                  <span className="font-barlow font-black" style={{ fontSize: 18, color: PODIUM_COLORS[pos] }}>{member.points}</span>
                  <span className="font-barlow font-bold" style={{ fontSize: 9, color: "#5a9a5a" }}>{ordinal(rank)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remaining rows */}
      {rest.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0c1c0c", border: "1px solid #1a3a1a" }}>
          {rest.map((member, i) => {
            const rank    = i + 4;
            const isMe    = member.id === currentUserId;
            return (
              <div key={member.id} className="flex items-center gap-3 px-3.5 py-3"
                style={{
                  borderBottom: i < rest.length - 1 ? "1px solid #162a16" : undefined,
                  background: isMe ? "rgba(0,229,160,0.05)" : undefined,
                  outline: isMe ? "1px solid #00e5a0" : undefined,
                }}>
                <span className="font-barlow font-bold" style={{ fontSize: 12, color: "#5a9a5a", width: 20, textAlign: "center", flexShrink: 0 }}>{rank}</span>
                <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="xs" />
                <span className="font-barlow font-bold truncate flex-1" style={{ fontSize: 13, color: isMe ? "#00e5a0" : "#a0c8a0" }}>{member.name}</span>
                <span className="font-barlow font-bold" style={{ fontSize: 13, color: isMe ? "#00e5a0" : "#7ab07a", flexShrink: 0 }}>{member.points}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── My Stats panel ────────────────────────────────────────────────────────────

function MyStatsPanel({ members, currentUserId, rank, totalPlayers }: {
  members: Member[];
  currentUserId: string;
  rank: number;
  totalPlayers: number;
}) {
  const me = members.find(m => m.id === currentUserId) ?? members[0];
  if (!me) return null;

  const exact   = me.exactScores ?? 0;
  const correct = me.correctPredictions ?? 0;
  const totalPredicted = exact + correct + Math.max(0, (me.points - exact * 25 - correct * 10) / 10);

  const exactPct   = totalPredicted > 0 ? Math.round((exact / totalPredicted) * 100)   : 0;
  const correctPct = totalPredicted > 0 ? Math.round((correct / totalPredicted) * 100)  : 0;
  const missPct    = Math.max(0, 100 - exactPct - correctPct);

  const STATS: Array<{ label: string; value: string | number; color: string }> = [
    { label: "Total Points",  value: me.points, color: "#00e5a0"  },
    { label: "Exact Scores",  value: exact,     color: "#ffaa00"  },
    { label: "Correct",       value: correct,   color: "#5aaa6a"  },
    { label: "My Rank",       value: ordinal(rank), color: "#e0f2e0" },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
      {/* Meta */}
      <div className="font-barlow font-bold uppercase text-center" style={{ fontSize: 9, letterSpacing: 2, color: "#3a7a3a" }}>
        FIFA World Cup 2026
      </div>
      <div className="font-display font-black uppercase text-center" style={{ fontSize: 22, color: "#e0f2e0" }}>
        My Stats
      </div>

      {/* Rank card */}
      <div className="text-center rounded-2xl px-5 py-5" style={{ background: "#0c1c0c", border: "1px solid #1a3a1a" }}>
        <div className="font-barlow font-black" style={{ fontSize: 64, lineHeight: 1, color: "#00e5a0" }}>{ordinal(rank)}</div>
        <div className="font-barlow uppercase mt-1" style={{ fontSize: 11, color: "#3a7a3a", letterSpacing: 1 }}>of {totalPlayers} members</div>
      </div>

      {/* 2×2 stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {STATS.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl px-3.5 py-3.5" style={{ background: "#0c1c0c", border: "1px solid #1a3a1a" }}>
            <div className="font-barlow font-black" style={{ fontSize: 32, lineHeight: 1, color }}>{value}</div>
            <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Accuracy bar */}
      {totalPredicted > 0 && (
        <div className="rounded-xl px-3.5 py-3.5" style={{ background: "#0c1c0c", border: "1px solid #1a3a1a" }}>
          <div className="font-barlow uppercase mb-2.5" style={{ fontSize: 9, color: "#2a6a2a", letterSpacing: 1 }}>
            Accuracy · {Math.round(totalPredicted)} predicted
          </div>
          <div className="flex overflow-hidden rounded-full" style={{ height: 8, background: "#091509" }}>
            <div style={{ width: `${exactPct}%`,   background: "#00e5a0" }} />
            <div style={{ width: `${correctPct}%`, background: "#5aaa6a" }} />
            <div style={{ width: `${missPct}%`,    background: "#1c3a1c" }} />
          </div>
          <div className="flex gap-3.5 mt-2.5">
            {[
              { color: "#00e5a0", label: `Exact (${exactPct}%)` },
              { color: "#5aaa6a", label: `Correct (${correctPct}%)` },
              { color: "#1c3a1c", label: `Miss (${missPct}%)` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span className="font-barlow" style={{ fontSize: 9, color: "#3a7a3a" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Match panel ───────────────────────────────────────────────────────────────

function MatchPanel({ matches, groupId, groupName }: {
  matches: Match[];
  groupId: string;
  groupName: string;
}) {
  const match = matches[0];
  if (!match) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: "#3a7a3a" }}>
        <div className="text-center">
          <div className="font-barlow font-black uppercase" style={{ fontSize: 18, color: "#e0f2e0" }}>All matches played!</div>
          <div className="font-barlow mt-1" style={{ fontSize: 11, color: "#3a7a3a" }}>Check the leaderboard for results</div>
        </div>
      </div>
    );
  }

  const matchDate  = new Date(match.time);
  const stageName  = match.stage === "Group" && match.group ? `Group ${match.group}` : match.stage;
  const dateStr    = matchDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-3" style={{ WebkitOverflowScrolling: "touch" }}>
      {/* Meta */}
      <div className="font-barlow font-bold uppercase text-center" style={{ fontSize: 9, letterSpacing: 1, color: "#3a7a3a" }}>
        {groupName} · {stageName} · {dateStr}
      </div>
      <NextMatchCard match={match} groupId={groupId} />
      {groupId && <PredictionDistribution matchId={match.id} groupId={groupId} />}
    </div>
  );
}

// ── Main Carousel ─────────────────────────────────────────────────────────────

export function DashboardCarousel({
  matches,
  members,
  groupId,
  groupName,
  currentUserId,
  rank,
  totalPlayers,
}: DashboardCarouselProps) {
  const [panel, setPanel]       = useState(0);
  const trackRef                = useRef<HTMLDivElement>(null);
  const dragRef                 = useRef<{ startX: number; dragging: boolean }>({ startX: 0, dragging: false });

  const snapTo = useCallback((idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, PANELS.length - 1));
    setPanel(clamped);
    el.style.transition = "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    el.style.transform  = `translateX(${-clamped * 100}%)`;
  }, []);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = { startX: e.touches[0].clientX, dragging: true };
    el.style.transition = "none";
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.dragging) return;
    const el = trackRef.current;
    if (!el) return;
    const diff = e.touches[0].clientX - dragRef.current.startX;
    const base = -panel * 100;
    const pct  = (diff / el.offsetWidth) * 100;
    const clamped = Math.max(-(PANELS.length - 1) * 100, Math.min(0, base + pct));
    el.style.transform = `translateX(${clamped}%)`;
  }, [panel]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const diff = e.changedTouches[0].clientX - dragRef.current.startX;
    if (Math.abs(diff) > 50) {
      snapTo(panel + (diff < 0 ? 1 : -1));
    } else {
      snapTo(panel);
    }
  }, [panel, snapTo]);

  // Mouse drag handlers (desktop)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = { startX: e.clientX, dragging: true };
    el.style.transition = "none";
    document.body.style.cursor  = "grabbing";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const el = trackRef.current;
      if (!el) return;
      const diff = e.clientX - dragRef.current.startX;
      const base = -panel * 100;
      const pct  = (diff / el.offsetWidth) * 100;
      const clamped = Math.max(-(PANELS.length - 1) * 100, Math.min(0, base + pct));
      el.style.transform = `translateX(${clamped}%)`;
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      document.body.style.cursor  = "";
      document.body.style.userSelect = "";
      const diff = e.clientX - dragRef.current.startX;
      if (Math.abs(diff) > 50) {
        snapTo(panel + (diff < 0 ? 1 : -1));
      } else {
        snapTo(panel);
      }
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup",   onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup",   onMouseUp);
    };
  }, [panel, snapTo]);

  // Sync transform when panel changes via pill tap
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    el.style.transform  = `translateX(${-panel * 100}%)`;
  }, [panel]);

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Panel pill tabs */}
      <div className="flex items-center justify-center gap-1.5 px-4"
        style={{ height: 40, background: "#020c04", borderBottom: "1px solid #091509", flexShrink: 0 }}>
        {PANELS.map((label, i) => (
          <button
            key={label}
            onClick={() => snapTo(i)}
            className="font-barlow font-bold uppercase shrink-0"
            style={{
              padding: "5px 13px",
              borderRadius: 20,
              fontSize: 9,
              letterSpacing: 1,
              border:      panel === i ? "1px solid #00e5a0" : "1px solid #1a3a1a",
              background:  panel === i ? "#162a16"           : "transparent",
              color:       panel === i ? "#00e5a0"           : "#3a7a3a",
              cursor:      "pointer",
              transition:  "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Swipeable track */}
      <div
        style={{ overflow: "hidden", flex: 1, minHeight: 0 }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            width: `${PANELS.length * 100}%`,
            height: "100%",
            willChange: "transform",
            WebkitTapHighlightColor: "transparent",
            userSelect: "none",
          }}
        >
          {/* Panel 0 — Match */}
          <div style={{ width: `${100 / PANELS.length}%`, height: "100%", background: PANEL_BG, flexShrink: 0 }}>
            <MatchPanel matches={matches} groupId={groupId} groupName={groupName} />
          </div>
          {/* Panel 1 — Leaderboard */}
          <div style={{ width: `${100 / PANELS.length}%`, height: "100%", background: PANEL_BG, flexShrink: 0 }}>
            <LeaderboardPanel members={members} currentUserId={currentUserId} groupName={groupName} />
          </div>
          {/* Panel 2 — My Stats */}
          <div style={{ width: `${100 / PANELS.length}%`, height: "100%", background: PANEL_BG, flexShrink: 0 }}>
            <MyStatsPanel members={members} currentUserId={currentUserId} rank={rank} totalPlayers={totalPlayers} />
          </div>
        </div>
      </div>
    </div>
  );
}
