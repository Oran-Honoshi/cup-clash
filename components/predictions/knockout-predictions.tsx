"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Lock, CheckCircle2, Clock, MapPin, HelpCircle } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { createClient } from "@/lib/supabase/client";
import { STAGE_LABELS, type ScheduleMatch } from "@/lib/schedule";
import { ENABLE_BETA_FEATURES } from "@/lib/feature-flags";
import { KnockoutMatchCard } from "@/components/dashboard/knockout-match-card";
import type { Match } from "@/lib/types";

function toMatchType(m: ScheduleMatch): Match {
  return {
    id:            m.id,
    home:          m.home,
    away:          m.away,
    homeFlagCode:  m.homeFlagCode,
    awayFlagCode:  m.awayFlagCode,
    time:          m.kickoff_at,
    stage:         m.stage,
    stadium:       m.stadium,
    city:          m.city,
    status:        m.status,
    timeConfirmed: m.time_confirmed,
  };
}

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

const STAGE_ORDER = ["R32", "R16", "QF", "SF", "3rd", "Final"] as const;

function isMatchLocked(kickoffAt: string): boolean {
  const lockTime = new Date(new Date(kickoffAt).getTime() - 5 * 60 * 1000);
  return new Date() >= lockTime;
}

interface ScorePrediction { home: string; away: string; }

// ── Pending / unconfirmed placeholder match ─────────────────────────────────
function PendingMatchCard({ match }: { match: ScheduleMatch }) {
  return (
    <div style={{
      background: "rgba(18,14,38,0.28)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "12px 14px", opacity: 0.65,
    }}>
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
          Awaiting confirmation
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 text-center">
        <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{match.home}</span>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>vs</span>
        <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{match.away}</span>
      </div>
      <div className="flex items-center justify-center gap-1 mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
        <Lock size={9} /> Predictions open once both teams are confirmed
      </div>
    </div>
  );
}

// ── Predictable knockout match card ─────────────────────────────────────────
function KnockoutCard({ match, prediction, onChange, flashStatus }: {
  match: ScheduleMatch;
  prediction: ScorePrediction;
  onChange: (home: string, away: string) => void;
  flashStatus?: "success" | "error" | null;
}) {
  const filled  = prediction.home !== "" && prediction.away !== "";
  const locked  = isMatchLocked(match.kickoff_at);
  const status  = locked ? "locked" : filled ? "saved" : "open";

  const dateConfirmed = match.time_confirmed !== false;

  const [localTimeStr, setLocalTimeStr] = useState("");
  useEffect(() => {
    if (!dateConfirmed) { setLocalTimeStr("Date TBD"); return; }
    const d = new Date(match.kickoff_at);
    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    setLocalTimeStr(`${dateStr} · ${timeStr}`);
  }, [match.kickoff_at, dateConfirmed]);

  const cardStyle = {
    open:   { background: "rgba(18,14,38,0.55)", border: "1px solid rgba(0,255,136,0.25)"  },
    saved:  { background: "rgba(30,20,10,0.55)", border: "1px solid rgba(251,191,36,0.25)" },
    locked: { background: "rgba(18,14,38,0.45)", border: "1px solid rgba(255,255,255,0.07)" },
  }[status];

  return (
    <div style={{ ...cardStyle, borderRadius: 16, padding: "10px 14px", opacity: locked ? 0.7 : 1 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span className="flex items-center gap-1" suppressHydrationWarning><Clock size={9} />{localTimeStr}</span>
          {match.stadium && <span className="hidden sm:flex items-center gap-1"><MapPin size={9} />{match.city ?? match.stadium}</span>}
        </div>
        {status === "saved" && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
            <CheckCircle2 size={10} /> Saved
          </span>
        )}
        {status === "locked" && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
            <Lock size={9} /> Locked
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col items-center gap-1">
          <FlagBadge code={match.homeFlagCode ?? "un"} size="sm" />
          <span className="font-display text-xs uppercase font-black text-center text-white">
            {(match.home ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div style={{
            display: "flex", alignItems: "center", gap: 6, borderRadius: 8,
            border: flashStatus === "success" ? "1.5px solid #00e5a0" : flashStatus === "error" ? "1.5px solid #f87171" : "1.5px solid transparent",
            padding: "3px 6px",
            background: flashStatus === "success" ? "rgba(0,229,160,0.06)" : flashStatus === "error" ? "rgba(248,113,113,0.06)" : "transparent",
            transition: "border-color 0.3s, background 0.3s",
          }}>
            <ScoreInputCC value={prediction.home} onChange={v => onChange(v, prediction.away)} disabled={locked} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>:</span>
            <ScoreInputCC value={prediction.away} onChange={v => onChange(prediction.home, v)} disabled={locked} />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <FlagBadge code={match.awayFlagCode ?? "un"} size="sm" />
          <span className="font-display text-xs uppercase font-black text-center text-white">
            {(match.away ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
interface KnockoutPredictionsProps {
  groupId:     string;
  userId?:     string;
  allMatches?: ScheduleMatch[];
}

export function KnockoutPredictions({ groupId, userId, allMatches = [] }: KnockoutPredictionsProps) {
  const [predictions, setPredictions] = useState<Record<string, ScorePrediction>>({});
  const [chipFlash,   setChipFlash]   = useState<Record<string, "success" | "error" | null>>({});
  const autoSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => { Object.values(autoSaveTimers.current).forEach(clearTimeout); };
  }, []);

  const knockoutMatches = useMemo(
    () => allMatches.filter(m => m.stage !== "Group" && m.status !== "finished"),
    [allMatches],
  );

  const predictableMatches = useMemo(
    () => knockoutMatches.filter(m => !!m.homeFlagCode && !!m.awayFlagCode),
    [knockoutMatches],
  );

  const matchIds = useMemo(() => knockoutMatches.map(m => m.id), [knockoutMatches]);

  useEffect(() => {
    if (!userId || !matchIds.length) return;
    const sb = createClient();
    sb.from("group_predictions")
      .select("match_id, home_score, away_score")
      .eq("group_id", groupId).eq("user_id", userId).eq("pred_type", "match")
      .in("match_id", matchIds)
      .then(({ data }) => {
        if (!data?.length) return;
        const loaded: Record<string, ScorePrediction> = {};
        (data as Array<{ match_id: string; home_score: number; away_score: number }>).forEach(row => {
          loaded[row.match_id] = { home: String(row.home_score), away: String(row.away_score) };
        });
        setPredictions(prev => ({ ...prev, ...loaded }));
      });
  }, [userId, groupId, matchIds]);

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

  const setScore = (matchId: string, home: string, away: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));
    if (autoSaveTimers.current[matchId]) clearTimeout(autoSaveTimers.current[matchId]);
    autoSaveTimers.current[matchId] = setTimeout(() => doAutoSave(matchId, home, away), 800);
  };

  const predictedCount = predictableMatches.filter(m => {
    const p = predictions[m.id];
    return p && p.home !== "" && p.away !== "";
  }).length;

  if (!knockoutMatches.length) {
    return (
      <div className="rounded-2xl p-5 text-center" style={glassCard}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          No knockout matches open for predictions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="rounded-2xl px-4 py-3" style={{ ...glassCard, borderRadius: 18 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Matches Predicted
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono" style={{ color: "#00FF88" }}>{predictedCount}</span>
              <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>/ {predictableMatches.length}</span>
            </div>
          </div>
        </div>
      </div>

      {STAGE_ORDER.map(stage => {
        const stageMatches = knockoutMatches.filter(m => m.stage === stage).sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at));
        if (!stageMatches.length) return null;
        return (
          <div key={stage} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="font-display text-lg uppercase tracking-tight text-white">{STAGE_LABELS[stage] ?? stage}</span>
            </div>
            <div className="flex flex-col gap-2">
              {stageMatches.map(match => (
                !match.homeFlagCode || !match.awayFlagCode
                  ? <PendingMatchCard key={match.id} match={match} />
                  : ENABLE_BETA_FEATURES
                  ? <KnockoutMatchCard key={match.id} match={toMatchType(match)} groupId={groupId} />
                  : (
                    <KnockoutCard
                      key={match.id}
                      match={match}
                      prediction={predictions[match.id] ?? { home: "", away: "" }}
                      onChange={(h, a) => setScore(match.id, h, a)}
                      flashStatus={chipFlash[match.id]}
                    />
                  )
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
