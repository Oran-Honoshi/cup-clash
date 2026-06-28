"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGroupContext } from "@/lib/contexts/group-context";
import {
  Calendar, Lock, Search, X as XIcon,
  Users, Zap,
} from "lucide-react";
import { CopyPredictionSheet } from "@/components/predictions/copy-prediction-sheet";
import { Flag } from "@/components/ui/flag";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { PredictionBadge } from "@/components/predictions/prediction-badge";
import { PredictionDistribution } from "@/components/dashboard/prediction-distribution";
import { AdBanner } from "@/components/ads/ad-banner";
import { createClient } from "@/lib/supabase/client";
import { WC2026_MATCHES, STAGE_LABELS } from "@/lib/schedule";
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
  matchResults: Record<string, MatchResult>;
  matchTeams?: Record<string, { home: string; away: string; homeFlagCode?: string; awayFlagCode?: string }>;
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

// ── Glass tokens ───────────────────────────────────────────────────────────────

const glassCard = {
  background: "rgba(18,14,38,0.45)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.09)",
} as const;

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
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}>Your pick</span>
        <span className="font-mono text-xs font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>
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
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}>Your pick</span>
        <span className="font-mono text-xs font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>
          {pred.homeScore}–{pred.awayScore}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={onTrack
            ? { background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "#00FF88" }
            : { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171" }}>
          {onTrack ? "On track" : "Behind"}
        </span>
      </div>
    );
  }

  // Upcoming: show saved prediction
  return (
    <div className="flex items-center gap-2 mt-1.5 pt-1.5"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <Lock size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
      <span className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.3)" }}>Your pick</span>
      <span className="font-mono text-xs font-bold" style={{ color: "#fbbf24" }}>
        {pred.homeScore}–{pred.awayScore}
      </span>
    </div>
  );
}

// ── Goal Events ────────────────────────────────────────────────────────────────

function GoalEvents({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="mt-1.5 pt-1.5 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      {events.map((e, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span>⚽</span>
          <span className="font-mono font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
            {e.extra != null ? `${e.minute}+${e.extra}'` : `${e.minute}'`}
          </span>
          {e.player && <span>{e.player}</span>}
          {e.type === "own_goal" && (
            <span style={{ color: "rgba(239,68,68,0.7)" }}>(OG)</span>
          )}
          {e.type === "penalty" && (
            <span style={{ color: "rgba(255,255,255,0.35)" }}>(pen)</span>
          )}
          {e.team && (
            <span style={{ color: "rgba(255,255,255,0.3)" }}>· {e.team}</span>
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
}: {
  match: typeof WC2026_MATCHES[0];
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
}) {
  const locked = state.type !== "upcoming" || isLocked(match.utcTime);
  const canPredict = !!userId && !!groupId && !locked && state.type === "upcoming";

  const [localTime, setLocalTime] = useState("");
  useEffect(() => {
    const d = new Date(match.utcTime);
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const tz = getTzAbbr(match.utcTime);
    setLocalTime(tz ? `${time} ${tz}` : time);
  }, [match.utcTime]);

  const displayHome        = teamOverride?.home        ?? match.home;
  const displayAway        = teamOverride?.away        ?? match.away;
  const displayHomeFlagCode = teamOverride?.homeFlagCode ?? match.homeFlagCode;
  const displayAwayFlagCode = teamOverride?.awayFlagCode ?? match.awayFlagCode;

  const stageName = match.group ? `Grp ${match.group}` : STAGE_LABELS[match.stage] ?? match.stage;

  const showPred = !!pred && (state.type !== "upcoming" || locked);
  const showInputs = canPredict && !pred;
  const showEditInputs = canPredict && !!pred;

  // Per-state card style
  const cardStyle: React.CSSProperties =
    state.type === "live"
      ? { background: "#160e0e", border: "1px solid #3a1a1a", borderRadius: 12, padding: "12px 13px" }
      : state.type === "finished"
        ? { background: "#0a140a", border: "1px solid #162a16", borderRadius: 12, padding: "12px 13px", opacity: 0.9 }
        : isNext
          ? { background: "#0e1f0e", border: "1.5px solid #00e5a0", borderRadius: 12, padding: "12px 13px" }
          : isToday
            ? { background: "#0e1f0e", border: "1px solid #1a3a1a", borderRadius: 12, padding: "12px 13px" }
            : { background: "rgba(18,14,38,0.25)", border: "1px solid #1a3a1a", borderRadius: 12, padding: "12px 13px" };

  const teamColor = state.type === "live" ? "#c8a0a0" : isToday ? "#a0c8a0" : "rgba(255,255,255,0.8)";

  return (
    <div className="transition-all" style={cardStyle}>

      {/* ── Live layout ─────────────────────────────────────────── */}
      {state.type === "live" && (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="font-barlow text-xs font-bold uppercase tracking-wide truncate" style={{ color: "#c8a0a0" }}>
              {displayHome} vs {displayAway}
            </span>
            <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md"
              style={{ background: "#3a1010", border: "1px solid #5a1a1a" }}>
              <span className="inline-block rounded-full animate-pulse" style={{ width: 6, height: 6, background: "#ff4444" }} />
              <span className="font-barlow font-bold" style={{ fontSize: 11, color: "#ff6666" }}>
                {state.homeScore}–{state.awayScore}
                {state.minute != null && <span style={{ marginLeft: 4 }}>{state.minute}&apos;</span>}
              </span>
            </div>
          </div>
          {state.events.length > 0 && <GoalEvents events={state.events} />}
          {showPred && pred && (
            <div className="flex items-center gap-2 mt-1.5 pt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#3a7a3a" }}>Your pick</span>
              <span className="font-mono text-[10px] font-bold" style={{ color: "#00e5a0" }}>{pred.homeScore}–{pred.awayScore}</span>
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
              <Flag code={displayHomeFlagCode} size="xs" />
              <span className="font-barlow font-bold uppercase truncate text-xs" style={{ color: "#a0c8a0" }}>{displayHome}</span>
              <span className="font-barlow font-black text-base tabular-nums" style={{ color: "#ffaa00" }}>{state.homeScore}–{state.awayScore}</span>
              <span className="font-barlow font-bold uppercase truncate text-xs" style={{ color: "#a0c8a0" }}>{displayAway}</span>
              <Flag code={displayAwayFlagCode} size="xs" />
            </div>
            <span className="shrink-0 font-barlow font-bold px-2 py-0.5 rounded-md"
              style={{ background: "#162a10", border: "1px solid #2a4a10", color: "#ffaa00", fontSize: 9 }}>
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
              <Flag code={displayHomeFlagCode} size="xs" />
              <span className="font-barlow font-bold uppercase text-xs truncate" style={{ color: teamColor }}>{displayHome}</span>
            </div>
            <span className="font-barlow font-bold text-xs shrink-0" style={{ color: "#3a7a3a" }}>vs</span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
              <span className="font-barlow font-bold uppercase text-xs truncate" style={{ color: teamColor }}>{displayAway}</span>
              <Flag code={displayAwayFlagCode} size="xs" />
            </div>
            <div className="flex flex-col items-end shrink-0 ml-2">
              {locked && <Lock size={8} style={{ color: "rgba(255,255,255,0.25)" }} />}
              <span className="font-mono text-[10px] font-bold" style={{ color: isNext ? "#00e5a0" : "#00D4FF" }} suppressHydrationWarning>{localTime}</span>
            </div>
          </div>

          {/* Score inputs — shown for all upcoming unlocked matches */}
          {(showInputs || showEditInputs) && (
            <div className="flex items-center gap-1.5 mt-2">
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                borderRadius: 8,
                border: saveStatus === "success" ? "1.5px solid #00e5a0" : saveStatus === "error" ? "1.5px solid #f87171" : "1.5px solid transparent",
                padding: "2px 5px",
                background: saveStatus === "success" ? "rgba(0,229,160,0.06)" : saveStatus === "error" ? "rgba(248,113,113,0.06)" : "transparent",
                transition: "border-color 0.3s, background 0.3s",
              }}>
                <ScoreInputCC
                  value={localPred?.home ?? ""}
                  onChange={v => onLocalPredChange(match.id, v, localPred?.away ?? "")}
                  size={26}
                  disabled={locked}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1c4a1c" }}>–</span>
                <ScoreInputCC
                  value={localPred?.away ?? ""}
                  onChange={v => onLocalPredChange(match.id, localPred?.home ?? "", v)}
                  size={26}
                  disabled={locked}
                />
              </div>
              {saveStatus === "success" && <span style={{ fontSize: 10, color: "#00e5a0", fontWeight: 700 }}>✓ Saved</span>}
              {!saveStatus && pred && (
                <span className="font-barlow font-bold" style={{ fontSize: 9, color: "#00e5a0", marginLeft: 2 }}>✓ Saved</span>
              )}
              <div className="flex-1" />
              <span className="font-barlow font-bold px-2 py-0.5 rounded-md"
                style={{ background: "#162a16", border: "1px solid #2a5a2a", color: "#2a7a2a", fontSize: 9 }}>
                {stageName}
              </span>
            </div>
          )}
          {/* No-group nudge for logged-in users not in any group */}
          {noGroup && !locked && (
            <div className="mt-2" style={{ fontSize: 10, color: "#3a7a3a" }}>
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
  matchResults,
  matchTeams,
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
    for (const m of WC2026_MATCHES) {
      map[m.id] = getMatchState(m.id, matchResults);
    }
    return map;
  }, [matchResults]);

  // ── Filtered matches
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return WC2026_MATCHES.filter(m => {
      const s = matchStates[m.id];
      if (tabFilter === "live"     && s.type !== "live")     return false;
      if (tabFilter === "today"    && m.date !== todayStr)   return false;
      if (tabFilter === "upcoming" && (s.type !== "upcoming" || m.date <= todayStr)) return false;
      if (tabFilter === "done"     && s.type !== "finished") return false;
      if (q) {
        const t = matchTeams?.[m.id];
        const haystack = `${t?.home ?? m.home} ${t?.away ?? m.away}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tabFilter, searchQuery, matchStates, todayStr]);

  // ── Group by date
  const groupedDates = useMemo(() => {
    const map: Record<string, typeof WC2026_MATCHES> = {};
    for (const m of filtered) {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // ── No-group flag: logged-in user with no groups yet
  const noGroup = !!userId && allGroups.length === 0;

  // ── First upcoming match ID (for "Next" highlight)
  const nextMatchId = useMemo(() => {
    return WC2026_MATCHES.find(m => matchStates[m.id]?.type === "upcoming" && !isLocked(m.utcTime))?.id ?? null;
  }, [matchStates]);

  // ── Prediction stats
  const predStats = useMemo(() => {
    const total   = WC2026_MATCHES.length;
    const made    = Object.keys(savedPreds).length;
    const unlocked = WC2026_MATCHES.filter(m => {
      const s = matchStates[m.id];
      return s.type === "upcoming" && !isLocked(m.utcTime);
    });
    return { total, made, unlockable: unlocked.length };
  }, [savedPreds, matchStates]);

  const glass = {
    background: "rgba(18,14,38,0.45)",
    backdropFilter: "blur(24px) saturate(160%)",
    WebkitBackdropFilter: "blur(24px) saturate(160%)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-32 space-y-4 pt-4">

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="pt-2 pb-1">
        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>
          FIFA World Cup 2026
        </div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black text-white leading-none tracking-tight">
          Schedule
        </h1>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
          All 104 matches · Group Stage through Final
        </p>
      </div>

      {/* ── Predicting-for info card ──────────────────────────── */}
      {userId && allGroups.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={glass}>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}>
            <Users size={14} style={{ color: "#00D4FF" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#00D4FF" }}>
              Predicting for
            </div>
            <div className="font-display text-base uppercase font-black truncate text-white">
              {groupName}
            </div>
          </div>
          <div className="text-[11px] shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
            {predsLoading
              ? <span style={{ color: "#00D4FF" }}>Loading…</span>
              : <span>{predStats.made}/{predStats.total} picks</span>}
          </div>
        </div>
      )}

      {/* ── Guest CTA ──────────────────────────────────────────── */}
      {!userId && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
          <div className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Sign up to predict scores for every match
          </div>
          <a href="/signup"
            className="shrink-0 font-bold text-xs px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg,#00FF88,#00D4FF)", color: "#0B141B" }}>
            Get started
          </a>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            placeholder="Search teams…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none placeholder:text-[rgba(255,255,255,0.25)]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* Status tab row */}
        <div style={{ background: "#091409", borderRadius: 10, border: "1px solid #162a16", overflow: "hidden", padding: 3, gap: 2, display: "flex" }}>
          {(["live", "today", "upcoming", "done"] as const).map(tab => {
            const active = tabFilter === tab;
            const isLive = tab === "live";
            const labels = { live: "LIVE", today: "TODAY", upcoming: "UPCOMING", done: "DONE" } as const;
            return (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className="font-barlow font-bold uppercase"
                style={{
                  flex: 1,
                  padding: "7px 0",
                  textAlign: "center",
                  borderRadius: 7,
                  fontSize: 10,
                  letterSpacing: 0.5,
                  background: active ? (isLive ? "#2a1010" : "#162a16") : "transparent",
                  color: active ? (isLive ? "#ff6666" : "#00e5a0") : "#3a6a3a",
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

      {/* ── Match count ──────────────────────────────────────────── */}
      <div className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
        {filtered.length} {filtered.length === 1 ? "match" : "matches"}
      </div>

      {/* ── Match list grouped by date ────────────────────────────── */}
      {groupedDates.length === 0 ? (
        <div className="text-center py-20 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          No matches found
        </div>
      ) : (
        <div className="space-y-6">
          {groupedDates.map(([date, matches]) => {
            const isToday = date === todayStr;
            // Use the first match's UTC kickoff as the date source — no string
            // manipulation, no appended T12:00:00Z. toLocaleDateString converts
            // directly to the viewer's local timezone.
            const refDate  = new Date(matches[0].utcTime);
            const dayLabel = refDate.toLocaleDateString("en-GB", { weekday: "long" });
            const dateLabel = refDate.toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" });

            return (
              <section key={date}>
                {/* Sticky date header */}
                <div className="sticky top-0 z-10 flex items-center gap-3 py-2 mb-2 -mx-1 px-1"
                  style={{ background: "rgba(6,4,15,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                  <Calendar size={13} style={{ color: isToday ? "#00FF88" : "rgba(255,255,255,0.3)" }} />
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl uppercase font-black tracking-tight"
                      style={{ color: isToday ? "#00e5a0" : "rgba(255,255,255,0.9)" }}
                      suppressHydrationWarning>
                      {dayLabel}
                    </span>
                    {isToday && (
                      <span className="font-barlow text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ background: "#162a16", color: "#00e5a0", border: "1px solid #1c5a1c", letterSpacing: "1px" }}>
                        Today
                      </span>
                    )}
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }} suppressHydrationWarning>{dateLabel}</span>
                  </div>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
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
                        isToday={m.date === todayStr}
                        isNext={m.id === nextMatchId}
                        saveStatus={saveFlash[m.id]}
                        teamOverride={matchTeams?.[m.id]}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ── Stats footer ──────────────────────────────────────────── */}
      {userId && predStats.unlockable > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <Zap size={14} style={{ color: "#fbbf24" }} />
          <span style={{ color: "rgba(255,255,255,0.6)" }}>
            <span className="font-bold text-white">{predStats.unlockable}</span> matches still open to predict
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
