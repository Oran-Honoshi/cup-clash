"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGroupContext } from "@/lib/contexts/group-context";
import {
  Calendar, Lock, Search, X as XIcon,
  Users, Zap,
} from "lucide-react";
import { CopyPredictionSheet } from "@/components/predictions/copy-prediction-sheet";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { BallLoader } from "@/components/ui/BallLoader";
import { Card } from "@/components/ui/card";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { PredictionBadge } from "@/components/predictions/prediction-badge";
import { PredictionDistribution } from "@/components/dashboard/prediction-distribution";
import { AdBanner } from "@/components/ads/ad-banner";
import { createClient } from "@/lib/supabase/client";
import { WC2026_MATCHES, STAGE_LABELS, type ScheduleMatch } from "@/lib/schedule";
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
  allGroups: Array<{ id: string; name: string; passkey: string }>;
  allMatches?: ScheduleMatch[];
  matchResults: Record<string, MatchResult>;
  matchTeams?: Record<string, { home: string; away: string; homeFlagCode?: string; awayFlagCode?: string }>;
  matchKickoffs?: Record<string, string>;
  matchTimeConfirmed?: Record<string, boolean>;
  initialPredictions: Record<string, UserPrediction>;
  isAdFree: boolean;
  isCorporate: boolean;
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
    return {
      type:      "finished" as const,
      homeScore: r.homeScore ?? 0,
      awayScore: r.awayScore ?? 0,
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

function PredRow({
  pred,
  homeScore,
  awayScore,
  type,
}: {
  pred: UserPrediction;
  homeScore?: number;
  awayScore?: number;
  type: "upcoming" | "live" | "finished";
}) {
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

// ── Goal Events ────────────────────────────────────────────────────────────────

function GoalEvents({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="mt-1.5 pt-1.5 space-y-0.5" style={{ borderTop: "1px solid var(--dv)" }}>
      {events.map((e, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--mt)" }}>
          <span>⚽</span>
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
          {e.team && (
            <span style={{ color: "var(--ft)" }}>· {e.team}</span>
          )}
        </div>
      ))}
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
    <div className="transition-all" style={cardStyle}>

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
              <span className="font-barlow font-black text-base tabular-nums" style={{ color: "var(--sc)" }}>{state.homeScore}–{state.awayScore}</span>
              <span className="ta-team-name truncate" style={{ fontSize: 12, color: "var(--tx)" }}>{displayAway}</span>
              <FlagBadge code={displayAwayFlagCode} size="sm" />
            </div>
            <span className="shrink-0 font-barlow font-bold px-2 py-0.5 rounded-md"
              style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--t2)", fontSize: 9 }}>
              FT
            </span>
          </div>
          {state.events.length > 0 && <GoalEvents events={state.events} />}
          {showPred && pred && (
            <PredRow pred={pred} type="finished"
              homeScore={(state as { homeScore: number }).homeScore}
              awayScore={(state as { awayScore: number }).awayScore} />
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
            <div className="flex items-center gap-1.5 mt-2">
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
}: ScheduleClientProps) {
  const router = useRouter();
  const { setPrediction, refreshPredictions, setActiveUserId } = useGroupContext();

  // ── Register userId so GroupSwipeSelector can refresh predictions ──────────
  useEffect(() => {
    if (userId) setActiveUserId(userId);
  }, [userId, setActiveUserId]);

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
  const [copySheet, setCopySheet] = useState<{ matchId: string; home: number; away: number } | null>(null);

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

    const sb = createClient();
    const { error } = await sb.from("group_predictions").upsert({
      user_id:    userId,
      group_id:   groupId,
      match_id:   matchId,
      home_score: h,
      away_score: a,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,group_id,match_id" });

    if (!error) {
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
      // Offer to copy to other groups when user has multiple groups
      if (allGroups.length > 1) {
        setCopySheet({ matchId, home: h, away: a });
      }
    } else {
      setSaveFlash(prev => ({ ...prev, [matchId]: "error" }));
      setTimeout(() => setSaveFlash(prev => ({ ...prev, [matchId]: null })), 2000);
    }
  }, [userId, groupId, setPrediction]);

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
        <div className="ta-section-label mb-1">
          FIFA World Cup 2026
        </div>
        <h1 className="ta-screen-title uppercase" style={{ color: "var(--tx)" }}>
          Schedule
        </h1>
        <p className="ta-body mt-2">
          All 104 matches · Group Stage through Final
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
      <div className="ta-stadium-bg rounded-2xl">
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
      {copySheet && userId && (
        <CopyPredictionSheet
          matchId={copySheet.matchId}
          home={copySheet.home}
          away={copySheet.away}
          groups={allGroups}
          currentGroupId={groupId}
          userId={userId}
          onDismiss={() => setCopySheet(null)}
        />
      )}
    </div>
  );
}
