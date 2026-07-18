"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Lock, CheckCircle2, Clock, MapPin, ChevronDown } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { createClient } from "@/lib/supabase/client";
import type { ScheduleMatch } from "@/lib/schedule";

const glassCard = {
  background: "var(--sf)",
  border: "1px solid var(--br)",
} as const;

function isMatchLocked(kickoffAt: string): boolean {
  const lockTime = new Date(new Date(kickoffAt).getTime() - 5 * 60 * 1000);
  return new Date() >= lockTime;
}

interface ScorePrediction { home: string; away: string; }

// ── Predictable league match card — same shape/behavior as KnockoutCard in
// knockout-predictions.tsx, just without the bracket-round context ─────────
function LeagueMatchCard({ match, prediction, onChange, flashStatus }: {
  match: ScheduleMatch;
  prediction: ScorePrediction;
  onChange: (home: string, away: string) => void;
  flashStatus?: "success" | "error" | null;
}) {
  const filled = prediction.home !== "" && prediction.away !== "";
  const locked = isMatchLocked(match.kickoff_at);
  const status = locked ? "locked" : filled ? "saved" : "open";

  const [localTimeStr, setLocalTimeStr] = useState("");
  useEffect(() => {
    const d = new Date(match.kickoff_at);
    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    setLocalTimeStr(`${dateStr} · ${timeStr}`);
  }, [match.kickoff_at]);

  const cardStyle = {
    open:   { background: "var(--sf)", border: "1px solid var(--ac)" },
    saved:  { background: "var(--sf)", border: "1px solid rgba(251,191,36,0.35)" },
    locked: { background: "var(--sf)", border: "1px solid var(--br)" },
  }[status];

  return (
    <div className="cc-elevated" style={{ ...cardStyle, borderRadius: 16, padding: "10px 14px", opacity: locked ? 0.7 : 1 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 ta-meta">
          <span className="flex items-center gap-1" suppressHydrationWarning><Clock size={9} />{localTimeStr}</span>
          {match.stadium && <span className="hidden sm:flex items-center gap-1"><MapPin size={9} />{match.city ?? match.stadium}</span>}
        </div>
        {status === "saved" && (
          <span className="ta-subtab-label flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
            <CheckCircle2 size={10} /> Saved
          </span>
        )}
        {status === "locked" && (
          <span className="ta-subtab-label flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            style={{ background: "var(--ip)", color: "var(--mt)" }}>
            <Lock size={9} /> Locked
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col items-center gap-1">
          <FlagBadge code={match.homeFlagCode ?? "un"} size="sm" />
          <span className="ta-team-name text-center" style={{ fontSize: 12, color: "var(--tx)" }}>
            {(match.home ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div style={{
            display: "flex", alignItems: "center", gap: 6, borderRadius: 8,
            border: flashStatus === "success" ? "1.5px solid var(--ac)" : flashStatus === "error" ? "1.5px solid #f87171" : "1.5px solid transparent",
            padding: "3px 6px",
            background: flashStatus === "success" ? "rgba(0,207,128,0.06)" : flashStatus === "error" ? "rgba(248,113,113,0.06)" : "transparent",
            transition: "border-color 0.3s, background 0.3s",
          }}>
            <ScoreInputCC value={prediction.home} onChange={v => onChange(v, prediction.away)} disabled={locked} />
            <span className="ta-score" style={{ fontSize: 16 }}>:</span>
            <ScoreInputCC value={prediction.away} onChange={v => onChange(prediction.home, v)} disabled={locked} />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <FlagBadge code={match.awayFlagCode ?? "un"} size="sm" />
          <span className="ta-team-name text-center" style={{ fontSize: 12, color: "var(--tx)" }}>
            {(match.away ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
// A league-format competition (Premier League, La Liga, ...) has no group
// letters or knockout bracket — every match shares stage="League", so
// matches are grouped by roundLabel ("Matchday N") instead. Unlike the
// World Cup's fixed 7-stage vocabulary, a league season has 30-40+ rounds —
// only the next couple of upcoming matchdays render by default, with the
// rest available behind "Show more" rather than all at once.
interface LeaguePredictionsProps {
  groupId:     string;
  userId?:     string;
  allMatches?: ScheduleMatch[];
}

const DEFAULT_VISIBLE_ROUNDS = 2;

export function LeaguePredictions({ groupId, userId, allMatches = [] }: LeaguePredictionsProps) {
  const [predictions, setPredictions] = useState<Record<string, ScorePrediction>>({});
  const [chipFlash,   setChipFlash]   = useState<Record<string, "success" | "error" | null>>({});
  const [visibleRounds, setVisibleRounds] = useState(DEFAULT_VISIBLE_ROUNDS);
  const autoSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const predictionsRef = useRef(predictions);
  predictionsRef.current = predictions;

  const upcomingMatches = useMemo(
    () => allMatches.filter(m => m.status !== "finished" && !!m.homeFlagCode && !!m.awayFlagCode),
    [allMatches],
  );

  const roundGroups = useMemo(() => {
    const byRound = new Map<string, ScheduleMatch[]>();
    for (const m of upcomingMatches) {
      const key = m.roundLabel ?? "Fixtures";
      if (!byRound.has(key)) byRound.set(key, []);
      byRound.get(key)!.push(m);
    }
    return [...byRound.entries()]
      .map(([label, matches]) => ({
        label,
        matches: matches.sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at)),
        minKickoff: matches.reduce((min, m) => m.kickoff_at < min ? m.kickoff_at : min, matches[0].kickoff_at),
      }))
      .sort((a, b) => a.minKickoff.localeCompare(b.minKickoff));
  }, [upcomingMatches]);

  const matchIds = useMemo(() => upcomingMatches.map(m => m.id), [upcomingMatches]);

  useEffect(() => {
    setPredictions({});
    if (!userId || !matchIds.length) return;
    const sb = createClient();
    sb.from("group_predictions")
      .select("match_id, home_score, away_score")
      .eq("group_id", groupId).eq("user_id", userId).eq("pred_type", "match")
      .in("match_id", matchIds)
      .then(({ data }) => {
        const loaded: Record<string, ScorePrediction> = {};
        (data as Array<{ match_id: string; home_score: number; away_score: number }> ?? []).forEach(row => {
          loaded[row.match_id] = { home: String(row.home_score), away: String(row.away_score) };
        });
        setPredictions(loaded);
      });
  }, [userId, groupId, matchIds]);

  const doAutoSaveRef = useRef<((matchId: string, home: string, away: string) => Promise<void>) | null>(null);

  // Flush (not just cancel) pending debounced saves on unmount — mirrors
  // knockout-predictions.tsx: this component is remounted via key={groupId}
  // on every group switch, so an edit inside the debounce window right
  // before switching groups would otherwise be silently discarded.
  useEffect(() => {
    return () => {
      const pendingIds = Object.keys(autoSaveTimers.current);
      pendingIds.forEach(id => clearTimeout(autoSaveTimers.current[id]));
      pendingIds.forEach(id => {
        const pred = predictionsRef.current[id];
        if (pred && pred.home !== "" && pred.away !== "") {
          doAutoSaveRef.current?.(id, pred.home, pred.away);
        }
      });
    };
  }, []);

  const doAutoSave = useCallback(async (matchId: string, home: string, away: string) => {
    if (!userId) return;
    const h = parseInt(home, 10), a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a)) return;
    try {
      const sb = createClient();
      const { error } = await sb.from("group_predictions").upsert({
        user_id: userId, group_id: groupId, match_id: matchId,
        home_score: h, away_score: a, pred_type: "match",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,group_id,match_id" });
      if (error) throw error;
      setChipFlash(prev => ({ ...prev, [matchId]: "success" }));
      setTimeout(() => setChipFlash(prev => ({ ...prev, [matchId]: null })), 1000);
    } catch {
      setChipFlash(prev => ({ ...prev, [matchId]: "error" }));
      setTimeout(() => setChipFlash(prev => ({ ...prev, [matchId]: null })), 2000);
    }
  }, [userId, groupId]);
  doAutoSaveRef.current = doAutoSave;

  const setScore = (matchId: string, home: string, away: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));
    if (autoSaveTimers.current[matchId]) clearTimeout(autoSaveTimers.current[matchId]);
    autoSaveTimers.current[matchId] = setTimeout(() => {
      delete autoSaveTimers.current[matchId];
      doAutoSave(matchId, home, away);
    }, 800);
  };

  const predictedCount = upcomingMatches.filter(m => {
    const p = predictions[m.id];
    return p && p.home !== "" && p.away !== "";
  }).length;

  if (!upcomingMatches.length) {
    return (
      <div className="rounded-2xl p-5 text-center cc-elevated" style={glassCard}>
        <p className="ta-body">
          No upcoming matches open for predictions yet.
        </p>
      </div>
    );
  }

  const shownGroups = roundGroups.slice(0, visibleRounds);
  const remaining = roundGroups.length - shownGroups.length;

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="rounded-2xl px-4 py-3 cc-elevated" style={{ ...glassCard, borderRadius: 18 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="ta-section-label mb-0.5">
              Matches Predicted
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono" style={{ color: "var(--ac)" }}>{predictedCount}</span>
              <span className="text-sm font-bold" style={{ color: "var(--ft)" }}>/ {upcomingMatches.length}</span>
            </div>
          </div>
        </div>
      </div>

      {shownGroups.map(round => (
        <div key={round.label} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="ta-match-label" style={{ color: "var(--tx)" }}>{round.label}</span>
          </div>
          <div className="flex flex-col gap-2">
            {round.matches.map(match => (
              <LeagueMatchCard
                key={match.id}
                match={match}
                prediction={predictions[match.id] ?? { home: "", away: "" }}
                onChange={(h, a) => setScore(match.id, h, a)}
                flashStatus={chipFlash[match.id]}
              />
            ))}
          </div>
        </div>
      ))}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisibleRounds(n => n + DEFAULT_VISIBLE_ROUNDS)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl ta-subtab-label"
          style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--t2)" }}
        >
          <ChevronDown size={14} /> Show {Math.min(remaining, DEFAULT_VISIBLE_ROUNDS)} more matchday{remaining > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
