"use client";

import { useState, useEffect } from "react";
import { Trophy, Target, TrendingUp, XCircle } from "lucide-react";
import { MatchCarousel } from "@/components/dashboard/match-carousel";
import { LeaderboardList } from "@/components/dashboard/leaderboard-list";
import { MiniLeaderboard } from "@/components/dashboard/mini-leaderboard";
import { ENABLE_BETA_FEATURES } from "@/lib/feature-flags";
import type { Match, Member } from "@/lib/types";
import type { MemberPredictionsResponse } from "@/app/api/member-predictions/route";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardCarouselProps {
  matches:       Match[];
  members:       Member[];
  groupId:       string;
  groupName:     string;
  currentUserId: string;
  rank:          number;
  totalPlayers:  number;
  isAdFree:      boolean;
  isCorporate:   boolean;
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

function StatSkeleton({ width }: { width: number }) {
  return (
    <span
      className="inline-block rounded animate-pulse align-middle"
      style={{ width, height: "0.8em", background: "rgba(255,255,255,0.1)" }}
    />
  );
}

// ── Leaderboard panel ─────────────────────────────────────────────────────────

function LeaderboardPanel({ members, currentUserId, groupId, groupName, isAdFree, isCorporate }: {
  members:       Member[];
  currentUserId: string;
  groupId:       string;
  groupName:     string;
  isAdFree:      boolean;
  isCorporate:   boolean;
}) {
  return (
    <LeaderboardList
      variant="compact"
      members={members}
      currentUserId={currentUserId}
      groupId={groupId}
      groupName={groupName}
      isAdFree={isAdFree}
      isCorporate={isCorporate}
    />
  );
}

// ── My Stats panel ────────────────────────────────────────────────────────────

function MyStatsPanel({ members, currentUserId, rank, totalPlayers, groupId }: {
  members:       Member[];
  currentUserId: string;
  rank:          number;
  totalPlayers:  number;
  groupId:       string;
}) {
  const me = members.find(m => m.id === currentUserId) ?? members[0];
  const [stats, setStats] = useState<MemberPredictionsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || !groupId) return;
    setLoading(true);
    fetch(`/api/member-predictions?userId=${encodeURIComponent(currentUserId)}&groupId=${encodeURIComponent(groupId)}`)
      .then(r => r.json() as Promise<MemberPredictionsResponse>)
      .then(data => { setStats(data.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentUserId, groupId]);

  if (!me) return null;

  const totalPts   = stats?.totalPoints    ?? me.points;
  const exactCount = stats?.exactCount     ?? me.exactScores        ?? 0;
  const correct    = stats?.outcomeCount   ?? me.correctPredictions ?? 0;
  const wrong      = stats?.missedCount    ?? 0;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Meta */}
      <div className="font-barlow font-bold uppercase text-center" style={{ fontSize: 9, letterSpacing: 2, color: "#3a7a3a" }}>
        FIFA World Cup 2026
      </div>
      <div className="font-display font-black uppercase text-center" style={{ fontSize: 22, color: "#e0f2e0" }}>
        My Stats
      </div>

      {/* Total Pts — prioritized, full-width */}
      <div className="rounded-xl px-4 py-4 flex items-center gap-3"
        style={{ background: "var(--color-background-secondary)", border: "1.5px solid rgba(0,229,160,0.4)", borderRadius: "var(--border-radius-lg)" }}>
        <Trophy size={22} style={{ color: "#00e5a0", flexShrink: 0 }} />
        <div>
          <div className="font-barlow font-black" style={{ fontSize: 40, lineHeight: 1, color: "#00e5a0" }}>
            {loading ? <StatSkeleton width={48} /> : totalPts}
          </div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}>TOTAL PTS</div>
        </div>
      </div>

      {/* Rank / Exact / Correct — 3-col row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div className="rounded-xl px-3 py-3.5" style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "#e0f2e0" }}>#{rank}</div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}>MY RANK</div>
        </div>
        <div className="rounded-xl px-3 py-3.5" style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
          <Target size={14} style={{ color: "#ffaa00", marginBottom: 4 }} />
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "#ffaa00" }}>
            {loading ? <StatSkeleton width={28} /> : exactCount}
          </div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}>EXACT</div>
        </div>
        <div className="rounded-xl px-3 py-3.5" style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
          <TrendingUp size={14} style={{ color: "#5aaa6a", marginBottom: 4 }} />
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "#5aaa6a" }}>
            {loading ? <StatSkeleton width={28} /> : correct}
          </div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}>CORRECT</div>
        </div>
      </div>

      {/* Wrong count */}
      <div className="rounded-xl px-3.5 py-3 flex items-center justify-between"
        style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
        <span className="flex items-center gap-1.5 font-barlow font-bold uppercase" style={{ fontSize: 10, color: "#cc4444", letterSpacing: 1 }}>
          <XCircle size={12} style={{ color: "#cc4444" }} /> WRONG
        </span>
        <span className="font-barlow font-black" style={{ fontSize: 28, color: "#cc4444" }}>
          {loading ? <StatSkeleton width={20} /> : wrong}
        </span>
      </div>

      {/* Member count footer */}
      <div className="text-center font-barlow" style={{ fontSize: 10, color: "#3a7a3a" }}>
        {ordinal(rank)} of {totalPlayers} members
      </div>
    </div>
  );
}

// ── Match panel ───────────────────────────────────────────────────────────────

function MatchPanel({ matches, groupId, groupName, members, currentUserId }: {
  matches: Match[];
  groupId: string;
  groupName: string;
  members: Member[];
  currentUserId: string;
}) {
  if (!matches.length) {
    return (
      <div className="flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="font-barlow font-black uppercase" style={{ fontSize: 18, color: "#e0f2e0" }}>All matches played!</div>
          <div className="font-barlow mt-1" style={{ fontSize: 11, color: "#3a7a3a" }}>Check the leaderboard for results</div>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-match-card" className="px-4 py-4 space-y-3">
      <div className="font-barlow font-bold uppercase text-center" style={{ fontSize: 9, letterSpacing: 1, color: "#3a7a3a" }}>
        {groupName} · Upcoming Matches
      </div>
      <MatchCarousel matches={matches} groupId={groupId} />
      {ENABLE_BETA_FEATURES && (
        <div className="space-y-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full inline-block"
            style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
            Beta
          </span>
          <MiniLeaderboard members={members} groupId={groupId} currentUserId={currentUserId} />
        </div>
      )}
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
  isAdFree,
  isCorporate,
}: DashboardCarouselProps) {
  const [panel, setPanel] = useState(0);

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Panel pill tabs */}
      <div className="flex items-center justify-center gap-1.5 px-4"
        style={{ height: 40, background: "#020c04", borderBottom: "1px solid #091509", flexShrink: 0 }}>
        {PANELS.map((label, i) => (
          <button
            key={label}
            id={label === "LEADERBOARD" ? "tour-group-preds" : undefined}
            onClick={() => setPanel(i)}
            className="font-barlow font-bold uppercase shrink-0"
            style={{
              padding: "5px 13px",
              borderRadius: 20,
              fontSize: 9,
              letterSpacing: 1,
              border:     panel === i ? "1px solid #00e5a0" : "1px solid #1a3a1a",
              background: panel === i ? "#162a16"           : "transparent",
              color:      panel === i ? "#00e5a0"           : "#3a7a3a",
              cursor:     "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active panel — vertically scrollable */}
      <div style={{
        flex: 1, minHeight: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        background: PANEL_BG,
        paddingBottom: 24,
      }}>
        {panel === 0 && <MatchPanel matches={matches} groupId={groupId} groupName={groupName} members={members} currentUserId={currentUserId} />}
        {panel === 1 && <LeaderboardPanel members={members} currentUserId={currentUserId} groupId={groupId} groupName={groupName} isAdFree={isAdFree} isCorporate={isCorporate} />}
        {panel === 2 && <MyStatsPanel members={members} currentUserId={currentUserId} rank={rank} totalPlayers={totalPlayers} groupId={groupId} />}
      </div>
    </div>
  );
}
