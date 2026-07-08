"use client";

import { useState, useEffect } from "react";
import { Crown, Trophy, Target, TrendingUp, XCircle } from "lucide-react";
import { MatchCarousel } from "@/components/dashboard/match-carousel";
import { AdBanner } from "@/components/ads/ad-banner";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PlayerDrawer } from "@/components/dashboard/player-drawer";
import { MiniLeaderboard } from "@/components/dashboard/mini-leaderboard";
import { ENABLE_BETA_FEATURES } from "@/lib/feature-flags";
import type { Match, Member } from "@/lib/types";
import type { MemberPredictionsResponse } from "@/app/api/member-predictions/route";
import { compareMembersForRanking } from "@/lib/leaderboard-sort";

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

// ── Leaderboard panel ─────────────────────────────────────────────────────────

const PODIUM_ORDER = [1, 0, 2] as const; // left=2nd, center=1st, right=3rd
const PODIUM_HEIGHTS = [80, 110, 60];
const PODIUM_AVATAR_SIZES: Array<"sm" | "md"> = ["sm", "md", "sm"];
const PODIUM_COLORS = ["#c4c9d4", "#ffaa00", "#cd7f45"];
const PODIUM_RING_COLORS = ["#c4c9d4", "#ffaa00", "#cd7f45"]; // silver, gold, bronze
const PODIUM_BG = [
  "#1c3a1c",                       // 2nd — neutral surface
  "var(--color-background-warning)", // 1st — gold wash
  "#1c3a1c",                       // 3rd — neutral surface
];
const PODIUM_BORDER = [
  "1px solid rgba(196,201,212,0.35)",
  "1.5px solid #ffaa00",
  "1px solid rgba(205,127,69,0.4)",
];

function LeaderboardPanel({ members, currentUserId, groupId, groupName, isAdFree, isCorporate }: {
  members:       Member[];
  currentUserId: string;
  groupId:       string;
  groupName:     string;
  isAdFree:      boolean;
  isCorporate:   boolean;
}) {
  const sorted = [...members].sort(compareMembersForRanking);
  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <div className="px-4 py-4 space-y-4">
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
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                style={{ width: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <div style={{ height: 16, display: "flex", alignItems: "flex-end", marginBottom: 2 }}>
                  {rank === 1 && <Crown size={15} fill="#ffaa00" style={{ color: "#ffaa00" }} />}
                </div>
                <UserAvatar
                  name={member.name}
                  avatarUrl={member.avatarUrl}
                  size={PODIUM_AVATAR_SIZES[pos]}
                  ringColor={isMe && rank !== 1 ? "#00e5a0" : PODIUM_RING_COLORS[pos]}
                />
                <span className="font-barlow font-bold uppercase text-center truncate w-full px-1" style={{ fontSize: 11, color: isMe ? "#00e5a0" : "#a0c8a0" }}>
                  {member.name}
                </span>
                <div style={{
                  width: 80, height: PODIUM_HEIGHTS[pos],
                  borderRadius: "var(--border-radius-lg) var(--border-radius-lg) 0 0",
                  background: PODIUM_BG[pos],
                  border: PODIUM_BORDER[pos],
                  borderBottom: "none",
                  boxShadow: rank === 1 ? "0 -4px 20px rgba(255,170,0,0.15)" : undefined,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                }}>
                  <span className="font-barlow font-black" style={{ fontSize: 18, color: PODIUM_COLORS[pos] }}>{member.points}</span>
                  <span className="font-barlow font-bold" style={{ fontSize: 9, color: "#5a9a5a" }}>{ordinal(rank)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Ad between podium and member list */}
      <AdBanner isAdFree={isAdFree} isCorporate={isCorporate} />

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
            const rank    = i + 4;
            const isMe    = member.id === currentUserId;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
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

      {selectedMember && (
        <PlayerDrawer
          userId={selectedMember.id}
          groupId={groupId}
          name={selectedMember.name}
          avatarUrl={selectedMember.avatarUrl}
          country={selectedMember.country ?? ""}
          points={selectedMember.points}
          rank={sorted.findIndex(m => m.id === selectedMember.id) + 1}
          open={true}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
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

  const totalPts   = loading ? "…" : (stats?.totalPoints ?? me.points);
  const exactCount = loading ? "…" : (stats?.exactCount  ?? me.exactScores  ?? 0);
  const correct    = loading ? "…" : (stats?.outcomeCount ?? me.correctPredictions ?? 0);
  const wrong      = loading ? "…" : (stats?.missedCount  ?? 0);

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
          <div className="font-barlow font-black" style={{ fontSize: 40, lineHeight: 1, color: "#00e5a0" }}>{totalPts}</div>
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
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "#ffaa00" }}>{exactCount}</div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}>EXACT</div>
        </div>
        <div className="rounded-xl px-3 py-3.5" style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
          <TrendingUp size={14} style={{ color: "#5aaa6a", marginBottom: 4 }} />
          <div className="font-barlow font-black" style={{ fontSize: 26, lineHeight: 1, color: "#5aaa6a" }}>{correct}</div>
          <div className="font-barlow uppercase mt-1" style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}>CORRECT</div>
        </div>
      </div>

      {/* Wrong count */}
      <div className="rounded-xl px-3.5 py-3 flex items-center justify-between"
        style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
        <span className="flex items-center gap-1.5 font-barlow font-bold uppercase" style={{ fontSize: 10, color: "#cc4444", letterSpacing: 1 }}>
          <XCircle size={12} style={{ color: "#cc4444" }} /> WRONG
        </span>
        <span className="font-barlow font-black" style={{ fontSize: 28, color: "#cc4444" }}>{wrong}</span>
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
