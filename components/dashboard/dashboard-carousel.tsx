"use client";

import { useState, useEffect } from "react";
import { Trophy, Target, TrendingUp, XCircle } from "lucide-react";
import { MatchCarousel } from "@/components/dashboard/match-carousel";
import { LiveMatchHub } from "@/components/match/live-match-hub";
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

// Was `var(--bg)` — identical to the page's own background, so the panel
// read as a flat, theme-invariant slab instead of a floating tile like the
// rest of the app's cc-elevated cards (e.g. My Groups).
const PANEL_BG = "var(--sf)";

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
      style={{ width, height: "0.8em", background: "var(--ip)" }}
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
      <div className="ta-section-label text-center">
        FIFA World Cup 2026
      </div>
      <div className="font-display font-black uppercase text-center" style={{ fontSize: 22, color: "var(--tx)" }}>
        My Stats
      </div>

      {/* Total Pts — prioritized, full-width */}
      <div className="rounded-xl px-4 py-4 flex items-center gap-3"
        style={{ background: "var(--sf)", border: "1.5px solid var(--ac)" }}>
        <Trophy size={22} style={{ color: "var(--ac)", flexShrink: 0 }} />
        <div>
          <div className="font-barlow font-black" style={{ fontSize: 40, lineHeight: 1, color: "var(--ac)" }}>
            {loading ? <StatSkeleton width={48} /> : totalPts}
          </div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "var(--mt)", letterSpacing: 1 }}>TOTAL PTS</div>
        </div>
      </div>

      {/* Rank / Exact / Correct — 3-col row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div className="rounded-xl px-3 py-3.5" style={{ background: "var(--sf)", border: "0.5px solid var(--br)" }}>
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "var(--tx)" }}>#{rank}</div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "var(--mt)", letterSpacing: 1 }}>MY RANK</div>
        </div>
        <div className="rounded-xl px-3 py-3.5" style={{ background: "var(--sf)", border: "0.5px solid var(--br)" }}>
          <Target size={14} style={{ color: "#ffaa00", marginBottom: 4 }} />
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "#ffaa00" }}>
            {loading ? <StatSkeleton width={28} /> : exactCount}
          </div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "var(--mt)", letterSpacing: 1 }}>EXACT</div>
        </div>
        <div className="rounded-xl px-3 py-3.5" style={{ background: "var(--sf)", border: "0.5px solid var(--br)" }}>
          <TrendingUp size={14} style={{ color: "#5aaa6a", marginBottom: 4 }} />
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "#5aaa6a" }}>
            {loading ? <StatSkeleton width={28} /> : correct}
          </div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "var(--mt)", letterSpacing: 1 }}>CORRECT</div>
        </div>
      </div>

      {/* Wrong count */}
      <div className="rounded-xl px-3.5 py-3 flex items-center justify-between"
        style={{ background: "var(--sf)", border: "0.5px solid var(--br)" }}>
        <span className="flex items-center gap-1.5 font-barlow font-bold uppercase" style={{ fontSize: 10, color: "#cc4444", letterSpacing: 1 }}>
          <XCircle size={12} style={{ color: "#cc4444" }} /> WRONG
        </span>
        <span className="font-barlow font-black" style={{ fontSize: 28, color: "#cc4444" }}>
          {loading ? <StatSkeleton width={20} /> : wrong}
        </span>
      </div>

      {/* Member count footer */}
      <div className="text-center font-barlow" style={{ fontSize: 10, color: "var(--mt)" }}>
        {ordinal(rank)} of {totalPlayers} members
      </div>
    </div>
  );
}

// ── Match panel ───────────────────────────────────────────────────────────────

function MatchPanel({ matches, groupId, groupName, members, currentUserId, onOpenMatchCenter }: {
  matches: Match[];
  groupId: string;
  groupName: string;
  members: Member[];
  currentUserId: string;
  onOpenMatchCenter: (matchId: string) => void;
}) {
  if (!matches.length) {
    return (
      <div className="flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="font-barlow font-black uppercase" style={{ fontSize: 18, color: "var(--tx)" }}>All matches played!</div>
          <div className="font-barlow mt-1" style={{ fontSize: 11, color: "var(--mt)" }}>Check the leaderboard for results</div>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-match-card" className="px-4 py-4 space-y-3">
      <div className="ta-section-label text-center">
        {groupName} · Upcoming Matches
      </div>
      <MatchCarousel matches={matches} groupId={groupId} onOpenMatchCenter={onOpenMatchCenter} />
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
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);
  const openMatch = openMatchId ? matches.find(m => m.id === openMatchId) : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Panel pill tabs — independent floating pills, no shared bar behind them */}
      <div className="flex items-center justify-center gap-2 px-4"
        style={{ height: 40, flexShrink: 0 }}>
        {PANELS.map((label, i) => {
          const active = panel === i;
          return (
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
                border:     active ? "1px solid var(--ac)" : "1px solid var(--br)",
                background: active ? "color-mix(in srgb, var(--ac) 14%, transparent)" : "var(--sf)",
                color:      active ? "var(--ac)" : "var(--mt)",
                boxShadow:  active ? "0 2px 12px -1px color-mix(in srgb, var(--ac) 40%, transparent)" : "0 1px 6px -1px var(--shad)",
                cursor:     "pointer",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Active panel — flows with the page (the whole Home page scrolls as
          one region, not this panel independently) and gets the same
          floating-tile treatment as the rest of the app's cc-elevated cards
          instead of a flat slab matching the page background. */}
      <div className="cc-elevated" style={{
        minHeight: 280,
        background: PANEL_BG,
        border: "1px solid var(--br)",
        borderBottom: "none",
        borderRadius: "var(--border-radius-lg) var(--border-radius-lg) 0 0",
        paddingBottom: 24,
      }}>
        {panel === 0 && <MatchPanel matches={matches} groupId={groupId} groupName={groupName} members={members} currentUserId={currentUserId} onOpenMatchCenter={setOpenMatchId} />}
        {panel === 1 && <LeaderboardPanel members={members} currentUserId={currentUserId} groupId={groupId} groupName={groupName} isAdFree={isAdFree} isCorporate={isCorporate} />}
        {panel === 2 && <MyStatsPanel members={members} currentUserId={currentUserId} rank={rank} totalPlayers={totalPlayers} groupId={groupId} />}
      </div>

      {/* ── Match Center overlay ─────────────────────────────────── */}
      {openMatch && (
        <LiveMatchHub
          matchId={openMatch.id}
          home={openMatch.home}
          away={openMatch.away}
          homeFlagCode={openMatch.homeFlagCode}
          awayFlagCode={openMatch.awayFlagCode}
          kickoffAt={openMatch.time}
          stage={openMatch.stage}
          group={openMatch.group}
          stadium={openMatch.stadium}
          city={openMatch.city}
          groupId={groupId}
          onClose={() => setOpenMatchId(null)}
        />
      )}
    </div>
  );
}
