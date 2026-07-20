"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGroupContext } from "@/lib/contexts/group-context";
import {
  Calendar, Lock, Search, X as XIcon,
  Users, Zap,
} from "lucide-react";
import { CopyPredictionSheet } from "@/components/predictions/copy-prediction-sheet";
import { upsertGroupPrediction } from "@/lib/services/predictions-client";
import { LiveMatchHub } from "@/components/match/live-match-hub";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { BallLoader } from "@/components/ui/BallLoader";
import { Card } from "@/components/ui/card";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { PredictionBadge } from "@/components/predictions/prediction-badge";
import { PredictionDistribution } from "@/components/dashboard/prediction-distribution";
import { AdBanner } from "@/components/ads/ad-banner";
import { createClient } from "@/lib/supabase/client";
import { WC2026_MATCHES, STAGE_LABELS, matchInGroupScope, type ScheduleMatch } from "@/lib/schedule";
import { getTeamColor } from "@/lib/countries";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MatchEvent {
  minute: number;
  extra: number | null;
  player: string | null;
  team: string | null;
  type: string;
}

interface MatchResult {
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  // True 90-minute score, alongside the raw (nullable) ET score — used
  // together to detect "went to extra time" via nullness, not a value
  // comparison, since a match that stayed level through ET (decided on
  // penalties) has homeScoreET === homeScore90 despite genuinely going to ET.
  homeScore90: number | null;
  awayScore90: number | null;
  homeScoreET: number | null;
  awayScoreET: number | null;
  minute: number | null;
  matchEvents: MatchEvent[] | null;
}

interface UserPrediction {
  homeScore: number;
  awayScore: number;
  pointsEarned: number | null;
  isExact: boolean | null;
}

interface LocalPred {
  home: string;
  away: string;
}

export interface ScheduleClientProps {
  userId?: string;
  groupId: string;
  groupName: string;
  allGroups: Array<{ id: string; name: string; passkey: string; groupType: string; singleMatchId: string | null; competitionId: string | null }>;
  allMatches?: ScheduleMatch[];
  matchResults: Record<string, MatchResult>;
  matchTeams?: Record<string, { home: string; away: string; homeFlagCode?: string; awayFlagCode?: string }>;
  matchKickoffs?: Record<string, string>;
  matchTimeConfirmed?: Record<string, boolean>;
  initialPredictions: Record<string, UserPrediction>;
  isAdFree: boolean;
  isCorporate: boolean;
  /** Viewer's own "Your Team" country selection — tints the exact-score confetti burst. */
  userCountry?: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────────

// matches.status values written by the /api/scores cron:
//   "upcoming" (default) | "live" | "finished"
const FINISHED_STATUS = "finished";
const LIVE_STATUS     = "live";


// ── Helpers ────────────────────────────────────────────────────────────────────

function isLocked(utcTime: string): boolean {
  return Date.now() >= new Date(utcTime).getTime() - 5 * 60 * 1000;
}

// Returns YYYY-MM-DD in the viewer's local timezone — used as a sortable
// group key and for "today" comparisons. kickoff_at.slice(0,10) is UTC and
// puts midnight-crossing matches (e.g. 21:00 UTC = 00:00 IL) on the wrong day.
function localDateKey(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLocalTime(utcTime: string): string {
  try {
    return new Date(utcTime).toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
  } catch { return ""; }
}

function getTzAbbr(utcTime: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      timeZoneName: "short",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).formatToParts(new Date(utcTime)).find(p => p.type === "timeZoneName")?.value ?? "";
  } catch { return ""; }
}

function getMatchState(matchId: string, results: Record<string, MatchResult>) {
  const r      = results[matchId];
  const status = r?.status ?? "upcoming";

  if (status === FINISHED_STATUS) {
    const wentToET = r.homeScoreET != null && r.awayScoreET != null;
    return {
      type:      "finished" as const,
      homeScore: r.homeScore ?? 0,
      awayScore: r.awayScore ?? 0,
      homeScore90: wentToET ? r.homeScore90 : null,
      awayScore90: wentToET ? r.awayScore90 : null,
      label:     "FT",
      events:    r.matchEvents ?? [] as MatchEvent[],
    };
  }
  if (status === LIVE_STATUS) {
    return {
      type:      "live" as const,
      homeScore: r.homeScore ?? 0,
      awayScore: r.awayScore ?? 0,
      label:     "Live",
      minute:    r.minute,
      events:    r.matchEvents ?? [] as MatchEvent[],
    };
  }
  return { type: "upcoming" as const };
}

function predResult(pred: UserPrediction, homeScore: number, awayScore: number): "exact" | "correct" | "missed" {
  if (pred.homeScore === homeScore && pred.awayScore === awayScore) return "exact";
  const pw = pred.homeScore > pred.awayScore ? "H" : pred.homeScore < pred.awayScore ? "A" : "D";
  const rw = homeScore > awayScore ? "H" : homeScore < awayScore ? "A" : "D";
  return pw === rw ? "correct" : "missed";
}

// ── Prediction Row ─────────────────────────────────────────────────────────────

// Cup Clash brand colors — used when the viewer hasn't picked a "Your Team" country
const DEFAULT_CONFETTI_COLORS = ["#2A398D", "#E61D25", "#D4AF37", "#FFFFFF"];

// Only celebrate matches finished within this window — otherwise a user with
// several historical exact scores gets every one of them fired at once the
// first time they open Schedule after this feature ships (localStorage has
// no "seen" keys yet for any of them).
const CONFETTI_RECENCY_MS = 6 * 60 * 60 * 1000; // 6 hours

function PredRow({
  pred,
  homeScore,
  awayScore,
  type,
  matchId,
  kickoff,
  userCountry,
}: {
  pred: UserPrediction;
  homeScore?: number;
  awayScore?: number;
  type: "upcoming" | "live" | "finished";
  matchId?: string;
  kickoff?: string;
  userCountry?: string | null;
}) {
  const isExactReveal =
    type === "finished" && homeScore !== undefined && awayScore !== undefined &&
    predResult(pred, homeScore, awayScore) === "exact" &&
    !!kickoff && Date.now() - new Date(kickoff).getTime() < CONFETTI_RECENCY_MS;

  // Fire a one-time confetti burst the first time this user sees an exact-score
  // result, tinted with their own team color. localStorage dedupes per match so
  // re-visiting Schedule for an already-seen result doesn't re-trigger it.
  useEffect(() => {
    if (!isExactReveal || !matchId) return;

    const seenKey = `cc_confetti_seen_${matchId}`;
    try {
      if (localStorage.getItem(seenKey)) return;
      localStorage.setItem(seenKey, "1");
    } catch {
      return;
    }

    const teamColor = getTeamColor(userCountry);
    const colors = teamColor
      ? [`rgb(${teamColor.accent})`, `rgb(${teamColor.accentGlow})`, "#FFFFFF"]
      : DEFAULT_CONFETTI_COLORS;

    const pkg = "canvas-confetti";
    import(/* webpackIgnore: true */ pkg as string)
      .then((mod: { default?: (opts: object) => void }) => {
        const confetti = mod.default;
        if (typeof confetti !== "function") return;
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.4 }, colors });
      })
      .catch(() => { /* not installed yet — skip */ });
  }, [isExactReveal, matchId, userCountry]);

  if (type === "finished" && homeScore !== undefined && awayScore !== undefined) {
    const result = predResult(pred, homeScore, awayScore);
    return (
      <div className="flex items-center gap-2 mt-1.5 pt-1.5"
        style={{ borderTop: "1px solid var(--dv)" }}>
        <span className="ta-section-label">Your pick</span>
        <span className="font-mono text-xs font-bold" style={{ color: "var(--sc)" }}>
          {pred.homeScore}–{pred.awayScore}
        </span>
        <span className="ml-auto">
          <PredictionBadge
            type={result}
            points={pred.pointsEarned ?? undefined}
            size="sm"
          />
        </span>
      </div>
    );
  }

  if (type === "live" && homeScore !== undefined && awayScore !== undefined) {
    const w = pred.homeScore > pred.awayScore ? "H" : pred.homeScore < pred.awayScore ? "A" : "D";
    const lw = homeScore > awayScore ? "H" : homeScore < awayScore ? "A" : "D";
    const onTrack = w === lw;
    return (
      <div className="flex items-center gap-2 mt-1.5 pt-1.5"
        style={{ borderTop: "1px solid var(--dv)" }}>
        <span className="ta-section-label">Your pick</span>
        <span className="font-mono text-xs font-bold" style={{ color: "var(--sc)" }}>
          {pred.homeScore}–{pred.awayScore}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={onTrack
            ? { background: "color-mix(in srgb, var(--ac) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 25%, transparent)", color: "var(--ac)" }
            : { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171" }}>
          {onTrack ? "On track" : "Behind"}
        </span>
      </div>
    );
  }

  // Upcoming: show saved prediction
  return (
    <div className="flex items-center gap-2 mt-1.5 pt-1.5"
      style={{ borderTop: "1px solid var(--dv)" }}>
      <Lock size={9} style={{ color: "var(--ft)" }} />
      <span className="ta-section-label">Your pick</span>
      <span className="font-mono text-xs font-bold" style={{ color: "var(--sc)" }}>
        {pred.homeScore}–{pred.awayScore}
      </span>
    </div>
  );
}

// ── Finished Score Line ──────────────────────────────────────────────────────
// A finished knockout match that went to extra time shows BOTH the 90-minute
// result and the final (AET) result — homeScore90/awayScore90 are only set
// (non-null) when they differ from the final score.

function FinishedScoreLine({
  homeScore, awayScore, homeScore90, awayScore90,
}: {
  homeScore: number; awayScore: number;
  homeScore90: number | null; awayScore90: number | null;
}) {
  if (homeScore90 == null || awayScore90 == null) {
    return (
      <span className="font-barlow font-black text-base tabular-nums" style={{ color: "var(--sc)" }}>
        {homeScore}–{awayScore}
      </span>
    );
  }
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-barlow font-black text-base tabular-nums" style={{ color: "var(--sc)" }}>
        {homeScore90}–{awayScore90}
      </span>
      <span className="text-[9px] font-bold" style={{ color: "var(--ft)" }}>90&apos;</span>
      <span className="text-[9px]" style={{ color: "var(--ft)" }}>·</span>
      <span className="font-barlow font-black text-base tabular-nums" style={{ color: "var(--sc)" }}>
        {homeScore}–{awayScore}
      </span>
      <span className="text-[9px] font-bold" style={{ color: "var(--ft)" }}>AET</span>
    </span>
  );
}

// ── Goal Events ────────────────────────────────────────────────────────────────
// Only real goal-scoring event types ("goal", "penalty", "own_goal") get the
// ⚽ scorer-line treatment — subs and cards render with their own icon/label
// so a 3-goal match doesn't read as a 16-goal thriller (missed penalties never
// went in, so they're excluded from goal styling too).

function eventGlyph(type: string): { icon: string; iconColor?: string } {
  switch (type) {
    case "own_goal":       return { icon: "⚽", iconColor: "rgba(239,68,68,0.7)" };
    case "penalty":        return { icon: "⚽" };
    case "goal":           return { icon: "⚽" };
    case "missed_penalty": return { icon: "❌" };
    case "yellow_card":    return { icon: "🟨" };
    case "red_card":       return { icon: "🟥" };
    case "sub":             return { icon: "🔄" };
    default:                return { icon: "⚽" };
  }
}

function GoalEvents({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="mt-1.5 pt-1.5 space-y-0.5" style={{ borderTop: "1px solid var(--dv)" }}>
      {events.map((e, i) => {
        const { icon, iconColor } = eventGlyph(e.type);
        return (
          <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--mt)" }}>
            <span style={iconColor ? { color: iconColor } : undefined}>{icon}</span>
            <span className="font-mono font-bold" style={{ color: "var(--t2)" }}>
              {e.extra != null ? `${e.minute}+${e.extra}'` : `${e.minute}'`}
            </span>
            {e.player && <span>{e.player}</span>}
            {e.type === "own_goal" && (
              <span style={{ color: "rgba(239,68,68,0.7)" }}>(OG)</span>
            )}
            {e.type === "penalty" && (
              <span style={{ color: "var(--ft)" }}>(pen)</span>
            )}
            {e.type === "missed_penalty" && (
              <span style={{ color: "var(--mt)" }}>(missed pen)</span>
            )}
            {e.type === "yellow_card" && (
              <span style={{ color: "var(--mt)" }}>(yellow card)</span>
            )}
            {e.type === "red_card" && (
              <span style={{ color: "rgba(239,68,68,0.7)" }}>(red card)</span>
            )}
            {e.type === "sub" && (
              <span style={{ color: "var(--mt)" }}>(sub)</span>
            )}
            {e.team && (
              <span style={{ color: "var(--ft)" }}>· {e.team}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Match Card ─────────────────────────────────────────────────────────────────

function MatchCard({
  match,
  state,
  pred,
  localPred,
  onLocalPredChange,
  userId,
  groupId,
  noGroup,
  isToday,
  isNext,
  saveStatus,
  teamOverride,
  kickoff,
  timeConfirmed,
  onOpenMatchCenter,
  userCountry,
}: {
  match: ScheduleMatch;
  state: ReturnType<typeof getMatchState>;
  pred: UserPrediction | undefined;
  localPred: LocalPred | undefined;
  onLocalPredChange: (matchId: string, home: string, away: string) => void;
  userId: string | undefined;
  groupId: string;
  noGroup: boolean;
  isToday: boolean;
  isNext: boolean;
  saveStatus?: "success" | "error" | null;
  teamOverride?: { home: string; away: string; homeFlagCode?: string; awayFlagCode?: string };
  kickoff: string;
  timeConfirmed: boolean;
  onOpenMatchCenter: (matchId: string) => void;
  userCountry?: string | null;
}) {
  const locked = state.type !== "upcoming" || isLocked(kickoff);
  const canPredict = !!userId && !!groupId && !locked && state.type === "upcoming";

  const [localTime, setLocalTime] = useState("");
  useEffect(() => {
    if (!timeConfirmed) { setLocalTime("Date TBD"); return; }
    const d = new Date(kickoff);
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const tz = getTzAbbr(kickoff);
    setLocalTime(tz ? `${time} ${tz}` : time);
  }, [kickoff, timeConfirmed]);

  const displayHome        = teamOverride?.home        ?? match.home;
  const displayAway        = teamOverride?.away        ?? match.away;
  const displayHomeFlagCode = teamOverride?.homeFlagCode ?? match.homeFlagCode;
  const displayAwayFlagCode = teamOverride?.awayFlagCode ?? match.awayFlagCode;

  const stageName = match.group ? `Grp ${match.group}` : STAGE_LABELS[match.stage] ?? match.stage;

  const showPred = !!pred && (state.type !== "upcoming" || locked);
  const showInputs = canPredict && !pred;
  const showEditInputs = canPredict && !!pred;

  // Per-state card style — Theme A: flat var(--sf) panel for every state so
  // cards read as one system; isNext gets an accent border highlight, and
  // live keeps a subtle semantic-red border so it still reads as "live"
  // against the flat panel background.
  const cardStyle: React.CSSProperties =
    state.type === "live"
      ? { background: "var(--sf)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 12, padding: "12px 13px" }
      : isNext
        ? { background: "var(--sf)", border: "1.5px solid var(--ac)", borderRadius: 12, padding: "12px 13px" }
        : { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 12, padding: "12px 13px", opacity: state.type === "finished" ? 0.9 : 1 };

  const teamColor = "var(--tx)";

  return (
    <div
      className="transition-all cursor-pointer cc-elevated cc-elevated-interactive"
      style={cardStyle}
      onClick={() => onOpenMatchCenter(match.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onOpenMatchCenter(match.id); }}
    >

      {/* ── Live layout ─────────────────────────────────────────── */}
      {state.type === "live" && (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="font-barlow text-xs font-bold uppercase tracking-wide truncate" style={{ color: "var(--tx)" }}>
              {displayHome} vs {displayAway}
            </span>
            <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <span className="inline-block rounded-full animate-pulse" style={{ width: 6, height: 6, background: "#ef4444" }} />
              <span className="font-barlow font-bold" style={{ fontSize: 11, color: "var(--sc)" }}>
                {state.homeScore}–{state.awayScore}
                {state.minute != null && <span style={{ marginLeft: 4, color: "#ef4444" }}>{state.minute}&apos;</span>}
              </span>
            </div>
          </div>
          {state.events.length > 0 && <GoalEvents events={state.events} />}
          {showPred && pred && (
            <div className="flex items-center gap-2 mt-1.5 pt-1.5" style={{ borderTop: "1px solid var(--dv)" }}>
              <span className="ta-section-label">Your pick</span>
              <span className="font-mono text-[10px] font-bold" style={{ color: "var(--sc)" }}>{pred.homeScore}–{pred.awayScore}</span>
            </div>
          )}
          {groupId && <PredictionDistribution matchId={match.id} groupId={groupId} />}
        </>
      )}

      {/* ── Finished layout ─────────────────────────────────────── */}
      {state.type === "finished" && (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FlagBadge code={displayHomeFlagCode} size="sm" />
              <span className="ta-team-name truncate" style={{ fontSize: 12, color: "var(--tx)" }}>{displayHome}</span>
              <FinishedScoreLine
                homeScore={state.homeScore} awayScore={state.awayScore}
                homeScore90={state.homeScore90} awayScore90={state.awayScore90}
              />
              <span className="ta-team-name truncate" style={{ fontSize: 12, color: "var(--tx)" }}>{displayAway}</span>
              <FlagBadge code={displayAwayFlagCode} size="sm" />
            </div>
            <span className="shrink-0 font-barlow font-bold px-2 py-0.5 rounded-md"
              style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--t2)", fontSize: 9 }}>
              {state.homeScore90 != null ? "AET" : "FT"}
            </span>
          </div>
          {state.events.length > 0 && <GoalEvents events={state.events} />}
          {showPred && pred && (
            <PredRow pred={pred} type="finished"
              homeScore={(state as { homeScore: number }).homeScore}
              awayScore={(state as { awayScore: number }).awayScore}
              matchId={match.id}
              kickoff={kickoff}
              userCountry={userCountry} />
          )}
        </>
      )}

      {/* ── Upcoming layout ─────────────────────────────────────── */}
      {state.type === "upcoming" && (
        <>
          {/* Teams + time row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <FlagBadge code={displayHomeFlagCode} size="sm" />
              <span className="ta-team-name truncate" style={{ fontSize: 12, color: teamColor }}>{displayHome}</span>
            </div>
            <span className="font-barlow font-bold text-xs shrink-0" style={{ color: "var(--mt)" }}>vs</span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
              <span className="ta-team-name truncate" style={{ fontSize: 12, color: teamColor }}>{displayAway}</span>
              <FlagBadge code={displayAwayFlagCode} size="sm" />
            </div>
            <div className="flex flex-col items-end shrink-0 ml-2">
              {locked && <Lock size={8} style={{ color: "var(--ft)" }} />}
              <span className="font-mono text-[10px] font-bold" style={{ color: "var(--ac)" }} suppressHydrationWarning>{localTime}</span>
            </div>
          </div>

          {/* Score inputs — shown for all upcoming unlocked matches */}
          {(showInputs || showEditInputs) && (
            <div className="flex items-center gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                borderRadius: 8,
                border: saveStatus === "success" ? "1.5px solid var(--ac)" : saveStatus === "error" ? "1.5px solid #f87171" : "1.5px solid transparent",
                padding: "2px 5px",
                background: saveStatus === "success" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : saveStatus === "error" ? "rgba(248,113,113,0.06)" : "transparent",
                transition: "border-color 0.3s, background 0.3s",
              }}>
                <ScoreInputCC
                  value={localPred?.home ?? ""}
                  onChange={v => onLocalPredChange(match.id, v, localPred?.away ?? "")}
                  size={26}
                  disabled={locked}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--mt)" }}>–</span>
                <ScoreInputCC
                  value={localPred?.away ?? ""}
                  onChange={v => onLocalPredChange(match.id, localPred?.home ?? "", v)}
                  size={26}
                  disabled={locked}
                />
              </div>
              {saveStatus === "success" && <span style={{ fontSize: 10, color: "var(--ac)", fontWeight: 700 }}>✓ Saved</span>}
              {!saveStatus && pred && (
                <span className="font-barlow font-bold" style={{ fontSize: 9, color: "var(--ac)", marginLeft: 2 }}>✓ Saved</span>
              )}
              <div className="flex-1" />
              <span className="font-barlow font-bold px-2 py-0.5 rounded-md"
                style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--t2)", fontSize: 9 }}>
                {stageName}
              </span>
            </div>
          )}
          {/* No-group nudge for logged-in users not in any group */}
          {noGroup && !locked && (
            <div className="mt-2" style={{ fontSize: 10, color: "var(--mt)" }}>
              Join a group to predict
            </div>
          )}
          {!showInputs && !showEditInputs && pred && showPred && (
            <PredRow pred={pred} type="upcoming" />
          )}
        </>
      )}
    </div>
  );
}


// ── Main component ─────────────────────────────────────────────────────────────

export function ScheduleClient({
  userId,
  groupId,
  groupName,
  allGroups,
  allMatches = WC2026_MATCHES,
  matchResults,
  matchTeams,
  matchKickoffs,
  matchTimeConfirmed,
  initialPredictions,
  isAdFree,
  isCorporate,
  userCountry,
}: ScheduleClientProps) {
  const router = useRouter();
  const { t } = useLocale();
  const { setPrediction, refreshPredictions, setActiveUserId } = useGroupContext();

  // ── Register userId so GroupSwipeSelector can refresh predictions ──────────
  useEffect(() => {
    if (userId) setActiveUserId(userId);
  }, [userId, setActiveUserId]);

  // Lookup maps used to enforce matchInGroupScope() before any prediction
  // write — the Schedule page deliberately shows every competition's
  // matches for browsing, but a prediction may only be saved against a
  // group whose own competition the match actually belongs to.
  const matchById = useMemo(() => {
    const map = new Map<string, ScheduleMatch>();
    for (const m of allMatches) map.set(m.id, m);
    return map;
  }, [allMatches]);
  const groupById = useMemo(() => {
    const map = new Map<string, { competitionId: string | null }>();
    for (const g of allGroups) map.set(g.id, { competitionId: g.competitionId });
    return map;
  }, [allGroups]);

  // ── Auto-refresh every 60s when a match is live
  const hasLive = useMemo(
    () => Object.values(matchResults).some(r => r.status === LIVE_STATUS),
    [matchResults]
  );
  useEffect(() => {
    if (!hasLive) return;
    const id = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(id);
  }, [hasLive, router]);

  // ── Refetch predictions when the user switches groups ─────────────────────
  // `groupId` is a prop from the server — it changes (without unmounting) when
  // router.push updates the URL. We detect that change here, clear stale state,
  // and fetch fresh predictions for the new group client-side so the user sees
  // correct data immediately rather than stale inputs from the previous group.
  useEffect(() => {
    if (prevGroupIdRef.current === groupId) return;
    prevGroupIdRef.current = groupId;
    if (!userId) return;

    let cancelled = false;
    setPredsLoading(true);
    setSavedPreds({});
    setLocalPreds({});

    type GroupPredRow = {
      match_id: string;
      home_score: number;
      away_score: number;
      points_earned: number | null;
      is_exact: boolean | null;
    };

    createClient()
      .from("group_predictions")
      .select("match_id, home_score, away_score, points_earned, is_exact")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .then(({ data }) => {
        if (cancelled) return;
        const newSaved: Record<string, UserPrediction> = {};
        const newLocal: Record<string, LocalPred> = {};
        for (const p of (data ?? []) as GroupPredRow[]) {
          newSaved[p.match_id] = {
            homeScore:    p.home_score,
            awayScore:    p.away_score,
            pointsEarned: p.points_earned,
            isExact:      p.is_exact,
          };
          newLocal[p.match_id] = {
            home: String(p.home_score),
            away: String(p.away_score),
          };
        }
        setSavedPreds(newSaved);
        setLocalPreds(newLocal);
        setPredsLoading(false);
        refreshPredictions(groupId, userId);
      });

    return () => { cancelled = true; };
  }, [groupId, userId, refreshPredictions]);

  // ── Filter state
  const [tabFilter, setTabFilter] = useState<"live" | "today" | "upcoming" | "done">("today");
  const [searchQuery, setSearchQuery]   = useState("");

  // ── Copy-to-groups sheet
  const [copySheet, setCopySheet] = useState<{
    matchId: string; home: number; away: number;
    groups:  Array<{ id: string; name: string }>;
  } | null>(null);

  // ── Match Center overlay
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  // ── Prediction state (local editing)
  const [localPreds, setLocalPreds] = useState<Record<string, LocalPred>>(() => {
    const map: Record<string, LocalPred> = {};
    for (const [mid, p] of Object.entries(initialPredictions)) {
      map[mid] = { home: String(p.homeScore), away: String(p.awayScore) };
    }
    return map;
  });

  // Persisted predictions (confirmed from DB)
  const [savedPreds, setSavedPreds] = useState<Record<string, UserPrediction>>(initialPredictions);

  // Loading state while fetching predictions for a newly-selected group
  const [predsLoading, setPredsLoading] = useState(false);

  // Per-match save flash status
  const [saveFlash, setSaveFlash] = useState<Record<string, "success" | "error" | null>>({});

  // ── Per-match debounce timers
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Track previous groupId so we can detect prop changes without re-running on every render
  const prevGroupIdRef = useRef(groupId);

  const savePred = useCallback(async (matchId: string, home: string, away: string) => {
    if (!userId || !groupId) return;
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a)) return;

    // Guard against saving a match that doesn't belong to the active
    // group's own competition (e.g. a League match while a World Cup
    // group is active) — the Schedule page browses every competition at
    // once, but writes must stay scoped per group.
    const match = matchById.get(matchId);
    const activeGroupCompetitionId = groupById.get(groupId)?.competitionId ?? null;
    if (!match || !matchInGroupScope(match.stage, match.competitionId, activeGroupCompetitionId)) {
      setSaveFlash(prev => ({ ...prev, [matchId]: "error" }));
      setTimeout(() => setSaveFlash(prev => ({ ...prev, [matchId]: null })), 2000);
      return;
    }

    const success = await upsertGroupPrediction({ userId, groupId, matchId, homeScore: h, awayScore: a });

    if (success) {
      setSavedPreds(prev => ({
        ...prev,
        [matchId]: {
          homeScore: h,
          awayScore: a,
          pointsEarned: prev[matchId]?.pointsEarned ?? null,
          isExact: prev[matchId]?.isExact ?? null,
        },
      }));
      setPrediction(matchId, h, a);
      setSaveFlash(prev => ({ ...prev, [matchId]: "success" }));
      setTimeout(() => setSaveFlash(prev => ({ ...prev, [matchId]: null })), 1000);

      // Offer to copy to other groups where this same match is also
      // predictable (a single_match group only predicts its own match)
      // and copying would actually change something there.
      const eligibleIds = allGroups
        .filter(g =>
          g.id !== groupId &&
          (g.groupType !== "single_match" || g.singleMatchId === matchId) &&
          matchInGroupScope(match.stage, match.competitionId, g.competitionId)
        )
        .map(g => g.id);

      if (eligibleIds.length > 0) {
        const sb = createClient();
        const { data: existing } = await sb
          .from("group_predictions")
          .select("group_id, home_score, away_score")
          .eq("user_id", userId)
          .eq("match_id", matchId)
          .in("group_id", eligibleIds);

        const existingByGroup = new Map(
          (existing ?? []).map((p: { group_id: string; home_score: number; away_score: number }) => [p.group_id, p])
        );

        const copyTargets = allGroups
          .filter(g => eligibleIds.includes(g.id))
          .filter(g => {
            const ex = existingByGroup.get(g.id);
            return !ex || ex.home_score !== h || ex.away_score !== a;
          })
          .map(g => ({ id: g.id, name: g.name }));

        if (copyTargets.length > 0) {
          setCopySheet({ matchId, home: h, away: a, groups: copyTargets });
        }
      }
    } else {
      setSaveFlash(prev => ({ ...prev, [matchId]: "error" }));
      setTimeout(() => setSaveFlash(prev => ({ ...prev, [matchId]: null })), 2000);
    }
  }, [userId, groupId, setPrediction, allGroups, matchById, groupById]);

  const handleLocalPredChange = useCallback((matchId: string, home: string, away: string) => {
    setLocalPreds(prev => ({ ...prev, [matchId]: { home, away } }));

    if (timersRef.current[matchId]) clearTimeout(timersRef.current[matchId]);
    timersRef.current[matchId] = setTimeout(() => {
      savePred(matchId, home, away);
    }, 800);
  }, [savePred]);

  // ── Today's date string (matches WC2026_MATCHES date format)
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // ── Derive match state for each match
  const matchStates = useMemo(() => {
    const map: Record<string, ReturnType<typeof getMatchState>> = {};
    for (const m of allMatches) {
      map[m.id] = getMatchState(m.id, matchResults);
    }
    return map;
  }, [allMatches, matchResults]);

  // ── Filtered matches
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allMatches.filter(m => {
      const s = matchStates[m.id];
      const matchDate = localDateKey(m.kickoff_at);
      if (tabFilter === "live"     && s.type !== "live")            return false;
      if (tabFilter === "today"    && matchDate !== todayStr)        return false;
      if (tabFilter === "upcoming" && (s.type !== "upcoming" || matchDate <= todayStr)) return false;
      if (tabFilter === "done"     && s.type !== "finished")        return false;
      if (q) {
        const t = matchTeams?.[m.id];
        const haystack = `${t?.home ?? m.home} ${t?.away ?? m.away}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allMatches, tabFilter, searchQuery, matchStates, todayStr, matchTeams]);

  // ── Group by date
  const groupedDates = useMemo(() => {
    const map: Record<string, ScheduleMatch[]> = {};
    for (const m of filtered) {
      const key = localDateKey(m.kickoff_at);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // ── No-group flag: logged-in user with no groups yet
  const noGroup = !!userId && allGroups.length === 0;

  // ── First upcoming match ID (for "Next" highlight)
  const nextMatchId = useMemo(() => {
    return allMatches.find(m => matchStates[m.id]?.type === "upcoming" && !isLocked(matchKickoffs?.[m.id] ?? m.kickoff_at))?.id ?? null;
  }, [allMatches, matchStates, matchKickoffs]);

  // ── Prediction stats
  const predStats = useMemo(() => {
    const total   = allMatches.length;
    const made    = Object.keys(savedPreds).length;
    const unlocked = allMatches.filter(m => {
      const s = matchStates[m.id];
      return s.type === "upcoming" && !isLocked(matchKickoffs?.[m.id] ?? m.kickoff_at);
    });
    return { total, made, unlockable: unlocked.length };
  }, [allMatches, savedPreds, matchStates, matchKickoffs]);

  const glass = {
    background: "var(--sf)",
    border: "1px solid var(--br)",
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-32 space-y-4 pt-4" style={{ background: "var(--bg)" }}>

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="pt-2 pb-1">
        <h1 className="ta-screen-title uppercase" style={{ color: "var(--tx)" }}>
          {t("sch_title")}
        </h1>
        <p className="ta-body mt-2">
          {t("sch_subtitle")}
        </p>
      </div>

      {/* ── Predicting-for info card ──────────────────────────── */}
      {userId && allGroups.length > 0 && (
        <Card className="flex items-center gap-3 px-4 py-3" style={glass}>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in srgb, var(--ac) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 25%, transparent)" }}>
            <Users size={14} style={{ color: "var(--ac)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="ta-section-label mb-0.5">
              Predicting for
            </div>
            <div className="font-display text-base uppercase font-black truncate" style={{ color: "var(--tx)" }}>
              {groupName}
            </div>
          </div>
          <div className="text-[11px] shrink-0" style={{ color: "var(--ft)" }}>
            {predsLoading
              ? <BallLoader size="sm" label={null} />
              : <span>{predStats.made}/{predStats.total} picks</span>}
          </div>
        </Card>
      )}

      {/* ── Guest CTA ──────────────────────────────────────────── */}
      {!userId && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl"
          style={{ background: "color-mix(in srgb, var(--ac) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 20%, transparent)" }}>
          <div className="ta-body">
            Sign up to predict scores for every match
          </div>
          <a href="/signup"
            className="shrink-0 font-bold text-xs px-4 py-2 rounded-xl"
            style={{ background: "var(--ac)", color: "var(--at)" }}>
            Get started
          </a>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--ft)" }} />
          <input
            type="text"
            placeholder="Search teams…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none placeholder:text-[color:var(--ft)]"
            style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--ft)" }}>
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* Status tab row */}
        <div style={{ background: "var(--nv)", borderRadius: 10, border: "1px solid var(--br)", overflow: "hidden", padding: 3, gap: 2, display: "flex" }}>
          {(["live", "today", "upcoming", "done"] as const).map(tab => {
            const active = tabFilter === tab;
            const isLive = tab === "live";
            const labels = { live: "LIVE", today: "TODAY", upcoming: "UPCOMING", done: "DONE" } as const;
            return (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className="ta-subtab-label"
                style={{
                  flex: 1,
                  padding: "7px 0",
                  textAlign: "center",
                  borderRadius: 7,
                  background: active ? (isLive ? "rgba(239,68,68,0.15)" : "color-mix(in srgb, var(--ac) 15%, transparent)") : "transparent",
                  color: active ? (isLive ? "#ef4444" : "var(--ac)") : "var(--mt)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ad between filters and match list ────────────────────── */}
      <AdBanner isAdFree={isAdFree} isCorporate={isCorporate} />

      {/* ── Match list area — stadium photo background lives here only,
           never behind the header/predicting-card/filters above ────── */}
      <div className="ta-stadium-bg rounded-2xl overflow-hidden">
        <div className="px-1 pt-2 pb-1">
          {/* ── Match count ──────────────────────────────────────────── */}
          <div className="ta-meta font-bold mb-3">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
          </div>

          {/* ── Match list grouped by date ────────────────────────────── */}
          {groupedDates.length === 0 ? (
            <div className="text-center py-20 text-sm" style={{ color: "var(--ft)" }}>
              No matches found
            </div>
          ) : (
            <div className="space-y-6 pb-2">
              {groupedDates.map(([date, matches]) => {
                const isToday = date === todayStr;
                // If every match bucketed under this guessed date is itself unconfirmed,
                // the date grouping is a guess too — don't present it as a real day.
                const allUnconfirmed = matches.every(m => (matchTimeConfirmed?.[m.id] ?? m.time_confirmed) === false);
                const refDate  = new Date(matches[0].kickoff_at);
                const dayLabel = allUnconfirmed ? "Date TBD" : refDate.toLocaleDateString("en-GB", { weekday: "long" });
                const dateLabel = allUnconfirmed ? "" : refDate.toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" });

                return (
                  <section key={date}>
                    {/* Sticky date header */}
                    <div className="sticky top-0 z-10 flex items-center gap-3 py-2 mb-2 -mx-1 px-1"
                      style={{ background: "rgba(16,20,29,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                      <Calendar size={13} style={{ color: isToday ? "var(--ac)" : "var(--ft)" }} />
                      <div className="flex items-center gap-2">
                        <span className="ta-match-label"
                          style={{ color: isToday ? "var(--ac)" : "var(--tx)" }}
                          suppressHydrationWarning>
                          {dayLabel}
                        </span>
                        {isToday && (
                          <span className="font-barlow text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{ background: "color-mix(in srgb, var(--ac) 15%, transparent)", color: "var(--ac)", border: "1px solid color-mix(in srgb, var(--ac) 35%, transparent)", letterSpacing: "1px" }}>
                            Today
                          </span>
                        )}
                        <span className="ta-meta" suppressHydrationWarning>{dateLabel}</span>
                      </div>
                      <div className="flex-1 h-px" style={{ background: "var(--dv)" }} />
                      <span className="ta-meta">
                        {matches.length} {matches.length === 1 ? "match" : "matches"}
                      </span>
                    </div>

                    {/* Match cards */}
                    <div className="space-y-2">
                      {matches.map(m => {
                        const state = matchStates[m.id];
                        const pred  = savedPreds[m.id];
                        return (
                          <MatchCard
                            key={m.id}
                            match={m}
                            state={state}
                            pred={pred}
                            localPred={localPreds[m.id]}
                            onLocalPredChange={handleLocalPredChange}
                            userId={userId}
                            groupId={groupId}
                            noGroup={noGroup}
                            isToday={localDateKey(m.kickoff_at) === todayStr}
                            isNext={m.id === nextMatchId}
                            saveStatus={saveFlash[m.id]}
                            teamOverride={matchTeams?.[m.id]}
                            kickoff={matchKickoffs?.[m.id] ?? m.kickoff_at}
                            timeConfirmed={matchTimeConfirmed?.[m.id] ?? m.time_confirmed ?? true}
                            onOpenMatchCenter={setOpenMatchId}
                            userCountry={userCountry}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats footer ──────────────────────────────────────────── */}
      {userId && predStats.unlockable > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <Zap size={14} style={{ color: "#fbbf24" }} />
          <span style={{ color: "var(--t2)" }}>
            <span className="font-bold" style={{ color: "var(--tx)" }}>{predStats.unlockable}</span> matches still open to predict
          </span>
        </div>
      )}

      {/* ── Copy-to-groups bottom sheet ───────────────────────────── */}
      <CopyPredictionSheet
        matchId={copySheet?.matchId ?? null}
        home={copySheet?.home ?? 0}
        away={copySheet?.away ?? 0}
        groups={copySheet?.groups ?? []}
        userId={userId ?? ""}
        onDismiss={() => setCopySheet(null)}
      />

      {/* ── Match Center overlay ─────────────────────────────────── */}
      {openMatchId && (() => {
        const m = allMatches.find(x => x.id === openMatchId);
        if (!m) return null;
        const teams = matchTeams?.[m.id];
        return (
          <LiveMatchHub
            matchId={m.id}
            home={teams?.home ?? m.home}
            away={teams?.away ?? m.away}
            homeFlagCode={teams?.homeFlagCode ?? m.homeFlagCode}
            awayFlagCode={teams?.awayFlagCode ?? m.awayFlagCode}
            kickoffAt={matchKickoffs?.[m.id] ?? m.kickoff_at}
            stage={m.stage}
            group={m.group}
            stadium={m.stadium}
            city={m.city}
            groupId={groupId}
            onClose={() => setOpenMatchId(null)}
          />
        );
      })()}
    </div>
  );
}
