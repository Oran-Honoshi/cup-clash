"use client";

import { useState, type KeyboardEvent } from "react";
import { Crown, Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Ghost, Target, Star, Volleyball, Medal } from "lucide-react";
import { PlayerDrawer } from "@/components/dashboard/player-drawer";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { AdBanner } from "@/components/ads/ad-banner";
import { FOCUS_RING, FOCUS_RING_INSET } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { countryFlagCode } from "@/lib/countries";
import type { Member } from "@/lib/types";
import { compareMembersForRanking } from "@/lib/leaderboard-sort";

// Single source of truth for how a ranked member list renders. Two visual
// treatments share the same ranking pipeline (sort → top3/rest split →
// row-click → PlayerDrawer): "full" for the standalone Leaderboard page,
// "compact" for the dashboard Home tab carousel panel.

function activateOnEnterOrSpace(handler: () => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

export interface LeaderboardListProps {
  members:        Member[];
  currentUserId?: string;
  groupId?:       string;
  variant:        "compact" | "full";
  groupName?:     string;   // compact header line
  isAdFree?:      boolean;
  isCorporate?:   boolean;
  showGhost?:     boolean;  // full only — benchmark row, default true
  showBestThird?: boolean;  // full only — best-3rd stat chip
  scrollable?:    boolean;  // full only — inner scroll for embedded tiles
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
  // 2nd (left) — silver
  { background: "rgba(196,201,212,0.1)",     border: "1px solid rgba(196,201,212,0.35)", borderBottom: "none" },
  // 1st (center) — gold wash
  { background: "var(--color-background-warning)", border: "1.5px solid #fbbf24",        borderBottom: "none" },
  // 3rd (right) — bronze
  { background: "rgba(249,115,22,0.1)",      border: "1px solid rgba(249,115,22,0.35)",  borderBottom: "none" },
] as const;

const PODIUM_BAR_HEIGHTS = [64, 80, 50]; // 2nd, 1st, 3rd
const PODIUM_ACTUAL_RANKS = [2, 1, 3];
const PODIUM_POINT_COLORS = ["rgba(255,255,255,0.7)", "#fbbf24", "#f97316"];
const PODIUM_RING_COLORS_FULL = ["#c4c9d4", "#fbbf24", "#f97316"]; // silver, gold, bronze

// ── Compact (dashboard Home tab carousel) ──────────────────────────────────

const COMPACT_PODIUM_ORDER = [1, 0, 2] as const; // left=2nd, center=1st, right=3rd
const COMPACT_PODIUM_HEIGHTS = [80, 110, 60];
const COMPACT_PODIUM_AVATAR_SIZES: Array<"sm" | "md"> = ["sm", "md", "sm"];
const COMPACT_PODIUM_COLORS = ["#c4c9d4", "#ffaa00", "#cd7f45"];
const COMPACT_PODIUM_RING_COLORS = ["#c4c9d4", "#ffaa00", "#cd7f45"];
const COMPACT_PODIUM_BG = [
  "#1c3a1c",                          // 2nd — neutral surface
  "var(--color-background-warning)", // 1st — gold wash
  "#1c3a1c",                          // 3rd — neutral surface
];
const COMPACT_PODIUM_BORDER = [
  "1px solid rgba(196,201,212,0.35)",
  "1.5px solid #ffaa00",
  "1px solid rgba(205,127,69,0.4)",
];

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

function CompactBoard({
  sorted, top3, rest, currentUserId, groupName, members, isAdFree, isCorporate, onSelect,
}: {
  sorted: Member[]; top3: Member[]; rest: Member[]; currentUserId?: string; groupName?: string;
  members: Member[]; isAdFree?: boolean; isCorporate?: boolean; onSelect: (m: Member) => void;
}) {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Meta */}
      <div className="font-barlow font-bold uppercase text-center" style={{ fontSize: 9, letterSpacing: 2, color: "#3a7a3a" }}>
        {groupName} · {members.length} members
      </div>

      <div className="font-display font-black uppercase text-center" style={{ fontSize: 22, color: "#e0f2e0" }}>
        Leaderboard
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl px-4 py-8 text-center" style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
          <Trophy size={22} style={{ color: "#3a7a3a", margin: "0 auto 8px" }} />
          <div className="font-barlow font-bold uppercase" style={{ fontSize: 12, color: "#a0c8a0" }}>No members yet</div>
          <div className="font-barlow mt-1" style={{ fontSize: 11, color: "#3a7a3a" }}>Invite friends to see the standings here.</div>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <div className="flex items-end justify-center gap-2 pb-1">
              {COMPACT_PODIUM_ORDER.map((srcIdx, pos) => {
                const member = top3[srcIdx];
                if (!member) return null;
                const isMe = member.id === currentUserId;
                const rank = srcIdx + 1;
                return (
                  <button
                    key={member.id}
                    onClick={() => onSelect(member)}
                    style={{ width: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <div style={{ height: 16, display: "flex", alignItems: "flex-end", marginBottom: 2 }}>
                      {rank === 1 && <Crown size={15} fill="#ffaa00" style={{ color: "#ffaa00" }} />}
                    </div>
                    <UserAvatar
                      name={member.name}
                      avatarUrl={member.avatarUrl}
                      size={COMPACT_PODIUM_AVATAR_SIZES[pos]}
                      ringColor={isMe && rank !== 1 ? "#00e5a0" : COMPACT_PODIUM_RING_COLORS[pos]}
                    />
                    <span className="font-barlow font-bold uppercase text-center truncate w-full px-1" style={{ fontSize: 11, color: isMe ? "#00e5a0" : "#a0c8a0" }}>
                      {member.name}
                    </span>
                    <div style={{
                      width: 80, height: COMPACT_PODIUM_HEIGHTS[pos],
                      borderRadius: "var(--border-radius-lg) var(--border-radius-lg) 0 0",
                      background: COMPACT_PODIUM_BG[pos],
                      border: COMPACT_PODIUM_BORDER[pos],
                      borderBottom: "none",
                      boxShadow: rank === 1 ? "0 -4px 20px rgba(255,170,0,0.15)" : undefined,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                    }}>
                      <span className="font-barlow font-black" style={{ fontSize: 18, color: COMPACT_PODIUM_COLORS[pos] }}>{member.points}</span>
                      <span className="font-barlow font-bold" style={{ fontSize: 9, color: "#5a9a5a" }}>{ordinal(rank)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Ad between podium and member list */}
          {isAdFree !== undefined && isCorporate !== undefined && (
            <AdBanner isAdFree={isAdFree} isCorporate={isCorporate} />
          )}

          {/* Section divider — podium (top 3) vs full standings (#4 onward) */}
          {rest.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span className="font-barlow font-bold uppercase" style={{ fontSize: 9, letterSpacing: 1.5, color: "#3a7a3a" }}>Full Standings</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>
          )}

          {/* Remaining rows */}
          {rest.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
              {rest.map((member, i) => {
                const rank = i + 4;
                const isMe = member.id === currentUserId;
                return (
                  <button
                    key={member.id}
                    onClick={() => onSelect(member)}
                    className="flex items-center gap-3 px-3.5 py-3 w-full text-left"
                    style={{
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: i < rest.length - 1 ? "1px solid #162a16" : "none",
                      background: isMe ? "rgba(0,229,160,0.05)" : "none",
                      outline: isMe ? "1px solid #00e5a0" : undefined,
                      cursor: "pointer",
                    }}>
                    <span className="font-barlow font-bold" style={{ fontSize: 12, color: "#5a9a5a", width: 20, textAlign: "center", flexShrink: 0 }}>{rank}</span>
                    <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="xs" ringColor={isMe ? "#00e5a0" : undefined} />
                    <span className="font-barlow font-bold truncate flex-1" style={{ fontSize: 13, color: isMe ? "#00e5a0" : "#a0c8a0" }}>{member.name}</span>
                    <span className="font-barlow font-bold" style={{ fontSize: 13, color: isMe ? "#00e5a0" : "#7ab07a", flexShrink: 0 }}>{member.points}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Full (standalone Leaderboard page) ─────────────────────────────────────

function FullBoard({
  sorted, top3, tableDisplay, display, currentUserId, members, isAdFree, isCorporate, showGhost, showBestThird, scrollable, onSelect,
}: {
  sorted: Member[]; top3: Member[]; tableDisplay: Member[]; display: Member[]; currentUserId?: string;
  members: Member[]; isAdFree?: boolean; isCorporate?: boolean; showGhost: boolean; showBestThird: boolean;
  scrollable: boolean; onSelect: (m: Member) => void;
}) {
  const realMembers  = sorted.filter(m => !m.isGhost);
  const totalExact   = realMembers.reduce((s, m) => s + (m.exactScores        ?? 0), 0);
  const totalCorrect = realMembers.reduce((s, m) => s + (m.correctPredictions ?? 0), 0);

  const podiumOrder = [top3[1], top3[0], top3[2]].filter((m): m is Member => m !== undefined);

  if (members.length === 0) {
    return (
      <div
        className="rounded-2xl px-6 py-12 text-center"
        style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
        }}
      >
        <Trophy size={28} style={{ color: "rgba(255,255,255,0.2)", margin: "0 auto 12px" }} />
        <div className="font-display text-lg uppercase text-white">No players yet</div>
        <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Invite friends to your group to start the leaderboard.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Group stat chips ────────────────────────────── */}
      {(totalExact > 0 || totalCorrect > 0) && (
        <div className="flex items-center gap-2 px-1 pb-2 flex-wrap">
          {totalExact > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.2)" }}
            >
              <Target size={11} style={{ color: "#facc15" }} />
              <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                {totalExact} exact
              </span>
            </div>
          )}
          {totalCorrect > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}
            >
              <TrendingUp size={11} style={{ color: "#00FF88" }} />
              <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                {totalCorrect} correct
              </span>
            </div>
          )}
          {showBestThird && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}
            >
              <Star size={11} style={{ color: "#fbbf24" }} />
              <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
                best 3rd scoring pending
              </span>
            </div>
          )}
        </div>
      )}

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
                role="button"
                tabIndex={0}
                aria-label={`View ${member.name}'s stats, ${RANK_LABELS[rank - 1]} place, ${member.points} points`}
                onClick={() => onSelect(member)}
                onKeyDown={activateOnEnterOrSpace(() => onSelect(member))}
                className={cn("rounded-lg", FOCUS_RING)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
              >
                {/* Crown slot — reserved height on every column so avatars stay aligned */}
                <div style={{ height: 20, display: "flex", alignItems: "flex-end", marginBottom: 4 }}>
                  {rank === 1 && <Crown size={16} fill="#fbbf24" style={{ color: "#fbbf24" }} />}
                </div>

                {/* Avatar */}
                <div style={{
                  borderRadius: "50%",
                  boxShadow: rank === 1 ? "0 0 14px rgba(251,191,36,0.4)" : "none",
                }}>
                  <UserAvatar
                    name={member.name}
                    avatarUrl={member.avatarUrl}
                    size="md"
                    ringColor={isMe && rank !== 1 ? "#00FF88" : PODIUM_RING_COLORS_FULL[pos]}
                  />
                </div>

                {/* Name — outside the bar so it never gets clipped */}
                <div
                  style={{
                    marginTop: 5,
                    marginBottom: 3,
                    fontFamily: "var(--font-ui)",
                    fontWeight: 800,
                    fontSize: 10,
                    color: isMe ? "#00FF88" : "white",
                    textTransform: "uppercase",
                    textAlign: "center",
                    width: "100%",
                    padding: "0 2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {member.name}
                </div>

                {/* Bar — shows only points + rank label */}
                <div
                  style={{
                    width: "100%",
                    height: PODIUM_BAR_HEIGHTS[pos],
                    borderRadius: "var(--border-radius-lg) var(--border-radius-lg) 0 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    ...PODIUM_BAR_STYLES[pos],
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 900,
                      fontSize: 18,
                      lineHeight: 1,
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

      {/* ── Ad between podium and table ─────────────────── */}
      {isAdFree !== undefined && isCorporate !== undefined && (
        <AdBanner isAdFree={isAdFree} isCorporate={isCorporate} />
      )}

      {/* ── Section divider — podium (top 3) vs full standings ─── */}
      {top3.length >= 2 && tableDisplay.length > 0 && (
        <div className="flex items-center gap-2 px-1 py-3">
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Full Standings</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>
      )}

      {/* ── Main card ───────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
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

        {/* Rows: 4th place onward */}
        <div
          className="p-2 space-y-1.5"
          style={{
            ...(scrollable && { overflowY: "auto", maxHeight: 340 }),
          }}
        >
          {tableDisplay.map((member) => {
            const isCurrentUser = member.id === currentUserId;
            const isGhost       = member.isGhost;
            const realRank      = isGhost ? null : sorted.findIndex(m => m.id === member.id) + 1;

            const activate = () => { if (!isGhost) onSelect(member); };
            return (
              <div
                key={member.id}
                {...(!isGhost && {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": `View ${member.name}'s stats, rank ${realRank}, ${member.points} points`,
                  onClick: activate,
                  onKeyDown: activateOnEnterOrSpace(activate),
                })}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 px-4 py-3 transition-all rounded-xl",
                  !isGhost && "cursor-pointer group",
                  !isGhost && FOCUS_RING_INSET,
                  isGhost && "opacity-50",
                )}
                style={{
                  background: isCurrentUser ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
                  border: isCurrentUser ? "0.5px solid rgba(0,255,136,0.3)" : "0.5px solid var(--color-border-tertiary)",
                }}
                onMouseEnter={(e: { currentTarget: HTMLElement }) => { if (!isGhost && !isCurrentUser) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e: { currentTarget: HTMLElement }) => { if (!isGhost && !isCurrentUser) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              >
                {/* Rank */}
                <div className="w-6 sm:w-8 text-center shrink-0">
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: isCurrentUser ? "#00FF88" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {isGhost ? "-" : realRank}
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative w-9 sm:w-10 shrink-0">
                  {isGhost ? (
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center"
                      style={{ border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}
                    >
                      <Ghost size={15} style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  ) : (
                    <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" ringColor={isCurrentUser ? "#00FF88" : undefined} />
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
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {!isGhost && <FlagBadge code={countryFlagCode(member.country ?? "")} size="sm" />}
                    <span className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {member.country}
                    </span>
                  </div>
                  {!isGhost && (member.gsPts || member.knockoutPts || member.bestThirdPts || member.bonusPts) ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[
                        { icon: Volleyball, label: "GS",    value: member.gsPts        ?? 0 },
                        { icon: Trophy,     label: "KO",    value: member.knockoutPts  ?? 0 },
                        { icon: Medal,      label: "3rd",   value: member.bestThirdPts ?? 0 },
                        { icon: Star,       label: "Bonus", value: member.bonusPts     ?? 0 },
                      ].map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <Icon size={9} style={{ color: "rgba(255,255,255,0.4)" }} />
                          <span className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>{label}:</span>
                          <span className="text-[9px] font-black" style={{ color: value > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Delta */}
                <div className="w-8 sm:w-12 flex justify-center shrink-0">
                  {!isGhost && <DeltaBadge delta={member.rankDelta ?? 0} />}
                </div>

                {/* Points */}
                <div className="w-12 sm:w-16 text-right shrink-0">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 900,
                      fontSize: "clamp(16px, 5vw, 22px)",
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
              <strong style={{ color: "rgba(255,255,255,0.5)" }}>The Expert</strong> shows the group average, a benchmark to beat.
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// ── Shared entry point ──────────────────────────────────────────────────────

export function LeaderboardList({
  members, currentUserId, groupId, variant, groupName, isAdFree, isCorporate,
  showGhost = true, showBestThird = false, scrollable = false,
}: LeaderboardListProps) {
  const [selected, setSelected] = useState<Member | null>(null);

  const sorted = [...members].sort(compareMembersForRanking);

  const full = variant === "full";
  const ghost = buildGhostPlayer(members);

  let display: Member[] = sorted;
  if (full && showGhost && sorted.length > 0) {
    const insertAt = sorted.findIndex(m => m.points <= ghost.points);
    display = insertAt === -1
      ? [...sorted, ghost]
      : [...sorted.slice(0, insertAt), ghost, ...sorted.slice(insertAt)];
  }

  const top3 = sorted.slice(0, 3);
  const top3Ids = new Set(top3.map(m => m.id));
  const tableDisplay = display.filter(m => !top3Ids.has(m.id));
  const rest = sorted.slice(3);

  return (
    <>
      {full ? (
        <FullBoard
          sorted={sorted} top3={top3} tableDisplay={tableDisplay} display={display}
          currentUserId={currentUserId} members={members} isAdFree={isAdFree} isCorporate={isCorporate}
          showGhost={showGhost} showBestThird={showBestThird} scrollable={scrollable}
          onSelect={setSelected}
        />
      ) : (
        <CompactBoard
          sorted={sorted} top3={top3} rest={rest} currentUserId={currentUserId} groupName={groupName}
          members={members} isAdFree={isAdFree} isCorporate={isCorporate} onSelect={setSelected}
        />
      )}

      {selected && !selected.isGhost && (
        <PlayerDrawer
          userId={selected.id}
          groupId={groupId ?? ""}
          name={selected.name}
          avatarUrl={selected.avatarUrl}
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
