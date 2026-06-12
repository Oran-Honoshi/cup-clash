"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, Lock, Search, Star, Check, X as XIcon,
  ChevronDown, Users, Zap,
} from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { createClient } from "@/lib/supabase/client";
import { WC2026_MATCHES, STAGE_LABELS } from "@/lib/schedule";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MatchResult {
  status: string;
  homeScore: number | null;
  awayScore: number | null;
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
  initialPredictions: Record<string, UserPrediction>;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FINISHED = new Set(["FT", "AET", "PEN"]);
const LIVE     = new Set(["1H", "HT", "2H", "ET", "P"]);
const GROUPS   = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const STAGES   = ["All","Group","R32","R16","QF","SF","Final"] as const;
const STATUSES = ["All","Upcoming","Live","Finished"] as const;

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Group: { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.55)", border: "rgba(255,255,255,0.12)" },
  R32:   { bg: "rgba(0,212,255,0.08)",  text: "#00D4FF",                border: "rgba(0,212,255,0.2)"  },
  R16:   { bg: "rgba(139,92,246,0.1)",  text: "#a78bfa",                border: "rgba(139,92,246,0.2)" },
  QF:    { bg: "rgba(251,191,36,0.08)", text: "#fbbf24",                border: "rgba(251,191,36,0.2)" },
  SF:    { bg: "rgba(249,115,22,0.1)",  text: "#fb923c",                border: "rgba(249,115,22,0.2)" },
  "3rd": { bg: "rgba(148,163,184,0.08)",text: "#94a3b8",                border: "rgba(148,163,184,0.2)"},
  Final: { bg: "rgba(234,179,8,0.1)",   text: "#facc15",                border: "rgba(234,179,8,0.25)" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function isLocked(utcTime: string): boolean {
  return Date.now() >= new Date(utcTime).getTime() - 5 * 60 * 1000;
}

function getLocalTime(utcTime: string): string {
  try {
    return new Date(utcTime).toLocaleTimeString(undefined, {
      hour: "numeric", minute: "2-digit", hour12: true,
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
  const r = results[matchId];
  if (!r || !r.status || r.status === "NS" || r.status === "") {
    return { type: "upcoming" as const };
  }
  if (FINISHED.has(r.status)) {
    return { type: "finished" as const, homeScore: r.homeScore ?? 0, awayScore: r.awayScore ?? 0, label: r.status };
  }
  if (LIVE.has(r.status)) {
    return { type: "live" as const, homeScore: r.homeScore ?? 0, awayScore: r.awayScore ?? 0, label: r.status };
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
    const cfg = {
      exact:   { icon: Star,   color: "#00FF88", label: "Exact",   bg: "rgba(0,255,136,0.1)",  border: "rgba(0,255,136,0.25)"  },
      correct: { icon: Check,  color: "#00D4FF", label: "Correct", bg: "rgba(0,212,255,0.08)", border: "rgba(0,212,255,0.2)"   },
      missed:  { icon: XIcon,  color: "#f87171", label: "Missed",  bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.18)"  },
    }[result];
    const Icon = cfg.icon;
    return (
      <div className="flex items-center gap-2 mt-1.5 pt-1.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}>Your pick</span>
        <span className="font-mono text-xs font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>
          {pred.homeScore}–{pred.awayScore}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
          <Icon size={9} />
          {cfg.label}
        </span>
        {pred.pointsEarned !== null && (
          <span className="text-[11px] font-bold ml-auto" style={{ color: cfg.color }}>
            +{pred.pointsEarned} pts
          </span>
        )}
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

// ── Match Card ─────────────────────────────────────────────────────────────────

function MatchCard({
  match,
  state,
  pred,
  localPred,
  onLocalPredChange,
  userId,
  groupId,
}: {
  match: typeof WC2026_MATCHES[0];
  state: ReturnType<typeof getMatchState>;
  pred: UserPrediction | undefined;
  localPred: LocalPred | undefined;
  onLocalPredChange: (matchId: string, home: string, away: string) => void;
  userId: string | undefined;
  groupId: string;
}) {
  const locked = state.type !== "upcoming" || isLocked(match.utcTime);
  const canPredict = !!userId && !!groupId && !locked && state.type === "upcoming";

  const [localTime, setLocalTime] = useState(`${match.time} ET`);
  const [tzAbbr, setTzAbbr] = useState("ET");
  useEffect(() => {
    setLocalTime(getLocalTime(match.utcTime));
    setTzAbbr(getTzAbbr(match.utcTime));
  }, [match.utcTime]);

  const stageCfg = STAGE_COLORS[match.stage] ?? STAGE_COLORS.Group;
  const stageName = match.group ? `Grp ${match.group}` : STAGE_LABELS[match.stage] ?? match.stage;

  const showPred = !!pred && (state.type !== "upcoming" || locked);
  const showInputs = canPredict && !pred;
  const showEditInputs = canPredict && !!pred;

  // Card border color based on state
  const cardBorderStyle = state.type === "live"
    ? "1px solid rgba(239,68,68,0.3)"
    : state.type === "finished" && pred
      ? pred.isExact
        ? "1px solid rgba(0,255,136,0.2)"
        : predResult(pred, (state as { homeScore: number }).homeScore, (state as { awayScore: number }).awayScore) === "correct"
          ? "1px solid rgba(0,212,255,0.2)"
          : "1px solid rgba(239,68,68,0.15)"
      : "1px solid rgba(255,255,255,0.09)";

  return (
    <div
      className="rounded-2xl px-4 py-3 transition-all"
      style={{ ...glassCard, border: cardBorderStyle }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Stage badge */}
        <span
          className="shrink-0 hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
          style={{ background: stageCfg.bg, color: stageCfg.text, border: `1px solid ${stageCfg.border}` }}
        >
          {stageName}
        </span>

        {/* Home team */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
          <span className="font-display text-sm sm:text-base uppercase font-black truncate text-white">
            {match.home}
          </span>
          <Flag code={match.homeFlagCode} size="xs" />
        </div>

        {/* Score / vs / inputs */}
        <div className="flex items-center gap-2 shrink-0">
          {state.type === "finished" && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums leading-none">
                {state.homeScore}
              </span>
              <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>–</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums leading-none">
                {state.awayScore}
              </span>
            </div>
          )}

          {state.type === "live" && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums leading-none"
                style={{ color: "#f87171" }}>
                {state.homeScore}
              </span>
              <span className="text-sm font-bold" style={{ color: "rgba(248,113,113,0.5)" }}>–</span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums leading-none"
                style={{ color: "#f87171" }}>
                {state.awayScore}
              </span>
            </div>
          )}

          {state.type === "upcoming" && (showInputs || showEditInputs) && (
            <div className="flex items-center gap-1.5">
              <ScoreInputCC
                value={localPred?.home ?? ""}
                onChange={v => onLocalPredChange(match.id, v, localPred?.away ?? "")}
                size={40}
              />
              <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>–</span>
              <ScoreInputCC
                value={localPred?.away ?? ""}
                onChange={v => onLocalPredChange(match.id, localPred?.home ?? "", v)}
                size={40}
              />
            </div>
          )}

          {state.type === "upcoming" && !showInputs && !showEditInputs && (
            <span className="text-sm font-bold px-3 sm:px-4" style={{ color: "rgba(255,255,255,0.25)" }}>
              vs
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Flag code={match.awayFlagCode} size="xs" />
          <span className="font-display text-sm sm:text-base uppercase font-black truncate text-white">
            {match.away}
          </span>
        </div>

        {/* Status / time */}
        <div className="shrink-0 flex items-center gap-1.5 min-w-[70px] justify-end">
          {state.type === "finished" && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {state.label}
            </span>
          )}
          {state.type === "live" && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {state.label}
            </span>
          )}
          {state.type === "upcoming" && (
            <div className="flex flex-col items-end gap-0.5">
              {locked && (
                <Lock size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
              )}
              <span className="font-mono text-[11px] sm:text-xs font-bold" style={{ color: "#00D4FF" }}>
                <span suppressHydrationWarning>{localTime}</span>
              </span>
              <span className="text-[9px] hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span suppressHydrationWarning>{tzAbbr}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Prediction row */}
      {showPred && pred && (
        <PredRow
          pred={pred}
          type={state.type}
          homeScore={state.type !== "upcoming" ? (state as { homeScore: number }).homeScore : undefined}
          awayScore={state.type !== "upcoming" ? (state as { awayScore: number }).awayScore : undefined}
        />
      )}
    </div>
  );
}

// ── Filter chip ────────────────────────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
      style={active
        ? { background: "rgba(0,212,255,0.12)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.35)" }
        : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ScheduleClient({
  userId,
  groupId,
  groupName,
  allGroups,
  matchResults,
  initialPredictions,
}: ScheduleClientProps) {
  const router = useRouter();

  // ── Filter state
  const [groupFilter, setGroupFilter]   = useState<string>("All");
  const [stageFilter, setStageFilter]   = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery]   = useState("");
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);

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

  // ── Per-match debounce timers
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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
    }
  }, [userId, groupId]);

  const handleLocalPredChange = useCallback((matchId: string, home: string, away: string) => {
    setLocalPreds(prev => ({ ...prev, [matchId]: { home, away } }));

    if (timersRef.current[matchId]) clearTimeout(timersRef.current[matchId]);
    timersRef.current[matchId] = setTimeout(() => {
      savePred(matchId, home, away);
    }, 700);
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
      if (groupFilter !== "All" && m.group !== groupFilter) return false;
      if (stageFilter !== "All" && m.stage !== stageFilter) return false;
      if (statusFilter !== "All") {
        const s = matchStates[m.id];
        if (statusFilter === "Upcoming" && s.type !== "upcoming") return false;
        if (statusFilter === "Live"     && s.type !== "live")     return false;
        if (statusFilter === "Finished" && s.type !== "finished") return false;
      }
      if (q) {
        const haystack = `${m.home} ${m.away}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [groupFilter, stageFilter, statusFilter, searchQuery, matchStates]);

  // ── Group by date
  const groupedDates = useMemo(() => {
    const map: Record<string, typeof WC2026_MATCHES> = {};
    for (const m of filtered) {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

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

  const switchGroup = (id: string) => {
    setGroupPickerOpen(false);
    router.push(`/schedule?group=${id}`);
  };

  const glass = {
    background: "rgba(18,14,38,0.45)",
    backdropFilter: "blur(24px) saturate(160%)",
    WebkitBackdropFilter: "blur(24px) saturate(160%)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-32 space-y-4">

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

      {/* ── Group switcher (if logged in with groups) ──────────── */}
      {userId && allGroups.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setGroupPickerOpen(v => !v)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all"
            style={glass}
          >
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
            <div className="flex items-center gap-2 text-[11px] shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
              <span>{predStats.made}/{predStats.total} picks</span>
              {allGroups.length > 1 && (
                <ChevronDown size={14} style={{ transform: groupPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              )}
            </div>
          </button>

          {groupPickerOpen && allGroups.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden z-20"
              style={{ background: "rgba(10,8,24,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
              {allGroups.map((g, i) => (
                <button key={g.id} onClick={() => switchGroup(g.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{ borderBottom: i < allGroups.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined, background: g.id === groupId ? "rgba(0,212,255,0.08)" : undefined }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-white">{g.name}</div>
                    <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{g.passkey}</div>
                  </div>
                  {g.id === groupId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(0,212,255,0.12)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}>
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
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

        {/* Stage filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="shrink-0 text-[10px] font-black uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}>Stage</span>
          <div className="flex items-center gap-1.5">
            {STAGES.map(s => (
              <Chip key={s} active={stageFilter === s} onClick={() => {
                setStageFilter(s);
                if (s !== "All" && s !== "Group") setGroupFilter("All");
              }}>
                {s === "All" ? "All" : STAGE_LABELS[s] ?? s}
              </Chip>
            ))}
          </div>
        </div>

        {/* Group filter (only relevant for Group stage) */}
        {(stageFilter === "All" || stageFilter === "Group") && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.35)" }}>Group</span>
            <div className="flex items-center gap-1.5">
              <Chip active={groupFilter === "All"} onClick={() => setGroupFilter("All")}>All</Chip>
              {GROUPS.map(g => (
                <Chip key={g} active={groupFilter === g} onClick={() => {
                  setGroupFilter(g);
                  setStageFilter("Group");
                }}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Status filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="shrink-0 text-[10px] font-black uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}>Status</span>
          <div className="flex items-center gap-1.5">
            {STATUSES.map(s => (
              <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</Chip>
            ))}
          </div>
        </div>
      </div>

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
            const dateObj = new Date(date + "T12:00:00Z");
            const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
            const dateLabel = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

            return (
              <section key={date}>
                {/* Sticky date header */}
                <div className="sticky top-0 z-10 flex items-center gap-3 py-2 mb-2 -mx-1 px-1"
                  style={{ background: "rgba(6,4,15,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                  <Calendar size={13} style={{ color: isToday ? "#00FF88" : "rgba(255,255,255,0.3)" }} />
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl uppercase font-black tracking-tight"
                      style={{ color: isToday ? "#00FF88" : "rgba(255,255,255,0.9)" }}>
                      {dayLabel}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}>
                        Today
                      </span>
                    )}
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{dateLabel}</span>
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
    </div>
  );
}
