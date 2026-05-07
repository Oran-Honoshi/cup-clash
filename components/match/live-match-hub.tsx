"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Clock, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp, Users, Target, BarChart2,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { flagUrl } from "@/lib/countries";

// ── Types ────────────────────────────────────────────────────────────────────

interface MatchEvent {
  time:   { elapsed: number; extra: number | null };
  team:   { id: number; name: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type:   string;  // Goal / Card / subst
  detail: string;  // Normal Goal / Yellow Card / Red Card / etc.
  comments: string | null;
}

interface MatchStat {
  team: { id: number; name: string };
  statistics: Array<{ type: string; value: string | number | null }>;
}

interface LineupPlayer {
  player: {
    id:     number;
    name:   string;
    number: number;
    pos:    string;
    grid:   string | null;
  };
}

interface Lineup {
  team:      { id: number; name: string };
  startXI:   LineupPlayer[];
  formation: string;
}

interface LiveMatchData {
  match_id:   string;
  home_score: number;
  away_score: number;
  status:     string;
  minute:     number | null;
  raw_data:   {
    fixture:    { id: number; status: { short: string; elapsed: number | null } };
    teams: {
      home: { id: number; name: string; logo: string };
      away: { id: number; name: string; logo: string };
    };
    goals:      { home: number | null; away: number | null };
    events?:    MatchEvent[];
    statistics?: MatchStat[];
    lineups?:   Lineup[];
  } | null;
}

interface UserPrediction { homeScore: number; awayScore: number; }

interface LiveMatchHubProps {
  matchId:          string;
  home:             string;
  away:             string;
  homeFlagCode:     string;
  awayFlagCode:     string;
  kickoffAt:        string;
  userPrediction?:  UserPrediction;
  groupId?:         string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  NS: "Upcoming", "1H": "1st Half", HT: "Half Time",
  "2H": "2nd Half", FT: "Full Time", AET: "AET", PEN: "Penalties",
  ET: "Extra Time", BT: "Break Time", P: "Penalties",
};

function isLive(status: string) {
  return ["1H", "2H", "ET", "P"].includes(status);
}

function getStat(stats: MatchStat[] | undefined, teamIdx: number, type: string): number {
  const raw = stats?.[teamIdx]?.statistics?.find(s => s.type === type)?.value;
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "string") return parseInt(raw.replace("%", ""), 10) || 0;
  return raw;
}

function calcLivePoints(pred: UserPrediction, home: number, away: number, rules = { exact: 25, outcome: 10 }) {
  if (pred.homeScore === home && pred.awayScore === away) return { pts: rules.exact, label: "Exact" };
  const predW = pred.homeScore > pred.awayScore ? "H" : pred.homeScore < pred.awayScore ? "A" : "D";
  const realW = home > away ? "H" : home < away ? "A" : "D";
  if (predW === realW) return { pts: rules.outcome, label: "Correct outcome" };
  return { pts: 0, label: "No points" };
}

// ── Event icon ───────────────────────────────────────────────────────────────

function EventIcon({ type, detail }: { type: string; detail: string }) {
  if (type === "Goal") {
    if (detail.includes("Penalty")) return <span className="text-base">⚽ P</span>;
    if (detail.includes("Own"))     return <span className="text-base text-red-400">⚽ OG</span>;
    return <span className="text-base">⚽</span>;
  }
  if (type === "Card") {
    if (detail.includes("Yellow")) return <div className="h-4 w-3 rounded-sm" style={{ background: "#facc15" }} />;
    if (detail.includes("Red"))    return <div className="h-4 w-3 rounded-sm" style={{ background: "#dc2626" }} />;
  }
  if (type === "subst") return <RefreshCw size={14} style={{ color: "#64748b" }} />;
  return <Activity size={14} style={{ color: "#64748b" }} />;
}

// ── Battle stat bar ───────────────────────────────────────────────────────────

function BattleBar({ label, home, away, isPercent = false }: {
  label: string; home: number; away: number; isPercent?: boolean;
}) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold">
        <span style={{ color: "#0891B2" }}>{isPercent ? `${home}%` : home}</span>
        <span style={{ color: "#64748b" }} className="uppercase tracking-widest text-[10px]">{label}</span>
        <span style={{ color: "#64748b" }}>{isPercent ? `${away}%` : away}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        <motion.div animate={{ width: `${homePct}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-l-full" style={{ background: "linear-gradient(90deg, #00D4FF, #0891B2)" }} />
        <motion.div animate={{ width: `${awayPct}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-r-full" style={{ background: "#e2e8f0" }} />
      </div>
    </div>
  );
}

// ── CSS Pitch ────────────────────────────────────────────────────────────────

function TacticalPitch({ lineups }: { lineups: Lineup[] | undefined }) {
  if (!lineups?.length) return (
    <div className="flex items-center justify-center h-48 rounded-2xl text-sm" style={{ background: "rgba(0,100,0,0.08)", color: "#94a3b8" }}>
      Line-ups available closer to kickoff
    </div>
  );

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(180deg, #166534 0%, #15803d 50%, #166534 100%)", aspectRatio: "0.7" }}>
      <div className="absolute inset-4 border border-white/20 rounded-sm" />
      <div className="absolute left-4 right-4 top-1/2 h-px" style={{ background: "rgba(255,255,255,0.2)" }} />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      {lineups.map((team: Lineup, ti: number) =>
        team.startXI.map(({ player }: LineupPlayer) => {
          if (!player.grid) return null;
          const [col, row] = player.grid.split(":").map(Number);
          const cols = Math.max(...team.startXI.map((p: LineupPlayer) => p.player.grid ? Number(p.player.grid.split(":")[0]) : 1));
          const rows = Math.max(...team.startXI.map((p: LineupPlayer) => p.player.grid ? Number(p.player.grid.split(":")[1]) : 1));
          const x = ((col - 1) / Math.max(cols - 1, 1)) * 80 + 10;
          const yBase = ((row - 1) / Math.max(rows - 1, 1)) * 40;
          const y = ti === 0 ? yBase + 5 : 55 + yBase;

          return (
            <div key={player.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black shadow-lg"
                style={{
                  background: ti === 0 ? "linear-gradient(135deg, #00D4FF, #0891B2)" : "rgba(255,255,255,0.9)",
                  color: ti === 0 ? "white" : "#0F172A",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                }}>
                {player.number}
              </div>
              <div className="text-[7px] font-bold mt-0.5 px-1 rounded whitespace-nowrap"
                style={{ background: "rgba(0,0,0,0.5)", color: "white" }}>
                {player.name.split(" ").pop()}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LiveMatchHub({
  matchId, home, away, homeFlagCode, awayFlagCode,
  kickoffAt, userPrediction, groupId,
}: LiveMatchHubProps) {
  const [data,      setData]      = useState<LiveMatchData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<"timeline"|"stats"|"lineup">("timeline");
  const [expanded,  setExpanded]  = useState(true);
  const prevScore   = useRef<{ h: number; a: number } | null>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: score } = await sb
        .from("live_scores")
        .select("*")
        .eq("match_id", matchId)
        .single();

      if (score) {
        // Check for goal — play sound
        const prev = prevScore.current;
        const newH = score.home_score ?? 0;
        const newA = score.away_score ?? 0;
        if (prev && (newH > prev.h || newA > prev.a)) {
          audioRef.current?.play().catch(() => {});
        }
        prevScore.current = { h: newH, a: newA };
        setData(score as LiveMatchData);
      }
    } catch (e) { console.warn(e); }
    setLoading(false);
  }, [matchId]);

  // Load initial data
  useEffect(() => { fetchData(); }, [fetchData]);

  // Supabase realtime — updates when cron writes new score
  useEffect(() => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const channel = sb.channel(`live:${matchId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "live_scores",
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const prev = prevScore.current;
        const updated = payload.new as LiveMatchData;
        if (prev && ((updated.home_score ?? 0) > prev.h || (updated.away_score ?? 0) > prev.a)) {
          audioRef.current?.play().catch(() => {});
        }
        prevScore.current = { h: updated.home_score ?? 0, a: updated.away_score ?? 0 };
        setData(updated);
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [matchId]);

  const raw       = data?.raw_data;
  const events    = raw?.events    ?? [];
  const stats     = raw?.statistics ?? [];
  const lineups   = raw?.lineups   ?? [] as Lineup[];
  const status    = data?.status ?? "NS";
  const minute    = data?.minute;
  const homeScore = data?.home_score ?? 0;
  const awayScore = data?.away_score ?? 0;
  const live      = isLive(status);

  const livePoints = userPrediction && (live || status === "FT" || status === "AET" || status === "PEN")
    ? calcLivePoints(userPrediction, homeScore, awayScore)
    : null;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,212,255,0.18)", boxShadow: "0 8px 40px rgba(0,212,255,0.08)" }}>

      {/* ── SCOREBOARD HEADER ─────────────────────────────────────────── */}
      <div className="relative px-5 py-6"
        style={{ background: live ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(0,212,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.05) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Status bar */}
        <div className="relative flex items-center justify-center mb-5">
          {live ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75" style={{ backgroundColor: "#00FF88" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#00FF88" }} />
              </span>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#00FF88" }}>
                LIVE {minute ? `${minute}'` : ""}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <Clock size={11} style={{ color: "#0891B2" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>
                {STATUS_LABELS[status] ?? status}
              </span>
            </div>
          )}
        </div>

        {/* Flags + Score */}
        <div className="relative flex items-center justify-between gap-4">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative h-16 w-20 rounded-xl overflow-hidden shadow-lg"
              style={{ border: "2px solid rgba(0,212,255,0.2)" }}>
              <Image src={flagUrl(homeFlagCode, 160)} alt={home} fill className="object-cover" unoptimized />
            </div>
            <span className="font-display text-lg uppercase font-black text-center"
              style={{ color: live ? "white" : "#0F172A" }}>
              {home}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center shrink-0">
            <div className="flex items-center gap-3">
              <motion.div key={homeScore}
                initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                className="font-display font-black tabular"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: live ? "white" : "#0F172A", lineHeight: 1 }}>
                {homeScore}
              </motion.div>
              <span className="font-display font-black" style={{ fontSize: "2rem", color: live ? "rgba(255,255,255,0.3)" : "#cbd5e1" }}>–</span>
              <motion.div key={awayScore}
                initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                className="font-display font-black tabular"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: live ? "white" : "#0F172A", lineHeight: 1 }}>
                {awayScore}
              </motion.div>
            </div>
            {/* Goal scorers */}
            {events.filter(e => e.type === "Goal" && e.team.name === home).length > 0 && (
              <div className="text-[10px] text-center mt-1" style={{ color: live ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>
                {events.filter(e => e.type === "Goal" && e.team.name === home)
                  .map(e => `${e.player.name.split(" ").pop()} ${e.time.elapsed}'`).join(", ")}
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative h-16 w-20 rounded-xl overflow-hidden shadow-lg"
              style={{ border: "2px solid rgba(0,212,255,0.2)" }}>
              <Image src={flagUrl(awayFlagCode, 160)} alt={away} fill className="object-cover" unoptimized />
            </div>
            <span className="font-display text-lg uppercase font-black text-center"
              style={{ color: live ? "white" : "#0F172A" }}>
              {away}
            </span>
          </div>
        </div>

        {/* User's prediction + live points */}
        {userPrediction && (
          <div className="relative mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: live ? "rgba(255,255,255,0.08)" : "rgba(0,212,255,0.06)", border: live ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,212,255,0.15)" }}>
              <Target size={12} style={{ color: live ? "rgba(255,255,255,0.5)" : "#0891B2" }} />
              <span style={{ color: live ? "rgba(255,255,255,0.6)" : "#64748b" }}>Your guess:</span>
              <span className="font-mono font-black" style={{ color: live ? "white" : "#0F172A" }}>
                {userPrediction.homeScore}–{userPrediction.awayScore}
              </span>
              {livePoints && livePoints.pts > 0 && (
                <span className="font-black" style={{ color: "#00FF88" }}>+{livePoints.pts} pts</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── TAB BAR ──────────────────────────────────────────────────── */}
      <div className="flex border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        {(["timeline", "stats", "lineup"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
            style={tab === t ? {
              color: "#0891B2",
              borderBottom: "2px solid #00D4FF",
            } : { color: "#94a3b8" }}>
            {t === "timeline" ? "Timeline" : t === "stats" ? "Battle Stats" : "Line-ups"}
          </button>
        ))}
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <div className="p-4">
        {loading && (
          <div className="py-8 text-center text-sm" style={{ color: "#94a3b8" }}>Loading match data...</div>
        )}

        {/* Timeline */}
        {!loading && tab === "timeline" && (
          <div className="space-y-1">
            {events.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: "#94a3b8" }}>
                {status === "NS" ? "Match hasn't started yet" : "No events yet"}
              </div>
            ) : (
              [...events].reverse().map((event, i) => {
                const isHome = event.team.name === home;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: isHome ? -8 : 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 py-2 ${isHome ? "" : "flex-row-reverse"}`}>
                    {/* Time */}
                    <span className="font-mono font-bold text-xs w-8 shrink-0 text-center"
                      style={{ color: "#0891B2" }}>
                      {event.time.elapsed}{event.time.extra ? `+${event.time.extra}` : ""}&apos;
                    </span>
                    {/* Icon */}
                    <div className="shrink-0"><EventIcon type={event.type} detail={event.detail} /></div>
                    {/* Info */}
                    <div className={`flex-1 ${isHome ? "" : "text-right"}`}>
                      <div className="text-xs font-bold" style={{ color: "#0F172A" }}>{event.player.name}</div>
                      {event.type === "subst" && event.assist.name && (
                        <div className="text-[10px]" style={{ color: "#94a3b8" }}>↑ {event.assist.name}</div>
                      )}
                    </div>
                    {/* Team indicator */}
                    <div className="relative h-5 w-6 rounded-sm overflow-hidden shrink-0">
                      <Image src={flagUrl(isHome ? homeFlagCode : awayFlagCode, 20)} alt="" fill className="object-cover" unoptimized />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Battle Stats */}
        {!loading && tab === "stats" && (
          <div className="space-y-4">
            {stats.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: "#94a3b8" }}>Stats available during the match</div>
            ) : (
              <>
                {/* Team headers */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-8 rounded overflow-hidden">
                      <Image src={flagUrl(homeFlagCode, 20)} alt={home} fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-xs font-black uppercase" style={{ color: "#0F172A" }}>{home}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <div className="relative h-6 w-8 rounded overflow-hidden">
                      <Image src={flagUrl(awayFlagCode, 20)} alt={away} fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-xs font-black uppercase" style={{ color: "#0F172A" }}>{away}</span>
                  </div>
                </div>
                {[
                  { label: "Possession",       type: "Ball Possession",      isPercent: true  },
                  { label: "Shots on Target",  type: "Shots on Goal",        isPercent: false },
                  { label: "Total Shots",      type: "Total Shots",          isPercent: false },
                  { label: "Corners",          type: "Corner Kicks",         isPercent: false },
                  { label: "Fouls",            type: "Fouls",                isPercent: false },
                  { label: "Yellow Cards",     type: "Yellow Cards",         isPercent: false },
                  { label: "xG",               type: "expected_goals",       isPercent: false },
                  { label: "Dangerous Attacks",type: "Dangerous Attacks",    isPercent: false },
                ].map(stat => {
                  const h = getStat(stats, 0, stat.type);
                  const a = getStat(stats, 1, stat.type);
                  if (h === 0 && a === 0) return null;
                  return <BattleBar key={stat.label} label={stat.label} home={h} away={a} isPercent={stat.isPercent} />;
                })}
              </>
            )}
          </div>
        )}

        {/* Line-ups */}
        {!loading && tab === "lineup" && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold" style={{ color: "#64748b" }}>
              <span>{lineups[0]?.formation ?? "?"}</span>
              <span style={{ color: "#0891B2" }}>Formation</span>
              <span>{lineups[1]?.formation ?? "?"}</span>
            </div>
            <TacticalPitch lineups={lineups} />
          </div>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 border-t text-[10px] flex items-center justify-between"
        style={{ borderColor: "rgba(0,212,255,0.08)", color: "#94a3b8" }}>
        <span>Auto-refreshes every 5 min</span>
        <span className="flex items-center gap-1">
          <BarChart2 size={10} />
          Powered by API-Football
        </span>
      </div>

      {/* Invisible audio for goal sound */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/sounds/goal.mp3" preload="auto" style={{ display: "none" }} />
    </div>
  );
}