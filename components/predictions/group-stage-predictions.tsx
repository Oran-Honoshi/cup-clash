"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Lock, ArrowUpDown, Star, Trophy, Medal,
  Users, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft,
} from "lucide-react";
import { CopyPredictions } from "@/components/predictions/copy-predictions";
import { FlaggedTeam } from "@/components/predictions/flagged-team";
import { Flag } from "@/components/ui/flag";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { WC2026_MATCHES } from "@/lib/schedule";
import { createClient } from "@/lib/supabase/client";

// ── Glass tokens ──────────────────────────────────────────────────────────────
const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

// ── Time-based locking ────────────────────────────────────────────────────────
function isMatchLocked(utcTime: string): boolean {
  const lockTime = new Date(new Date(utcTime).getTime() - 5 * 60 * 1000);
  return new Date() >= lockTime;
}

function getCountdown(utcTime: string): string {
  const diff = new Date(utcTime).getTime() - 5 * 60 * 1000 - Date.now();
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `Locks in ${h}H ${m}M`;
  return `Locks in ${m}M`;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScorePrediction { home: string; away: string; }
interface GroupPredictions { [matchId: string]: ScorePrediction; }
interface TeamStanding {
  name: string; flagCode: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; pts: number;
}

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function getGroupMatches(group: string) {
  return WC2026_MATCHES.filter(m => m.group === group && m.stage === "Group");
}

function getGroupTeams(group: string): Array<{ name: string; flagCode: string }> {
  const matches = getGroupMatches(group);
  const teams: Record<string, string> = {};
  matches.forEach(m => {
    if (m.home !== "TBD") teams[m.home] = m.homeFlagCode ?? "";
    if (m.away !== "TBD") teams[m.away] = m.awayFlagCode ?? "";
  });
  return Object.entries(teams).map(([name, flagCode]) => ({ name, flagCode }));
}

function calcStandings(group: string, predictions: GroupPredictions): TeamStanding[] {
  const matches = getGroupMatches(group);
  const teams   = getGroupTeams(group);
  const table: Record<string, TeamStanding> = {};
  teams.forEach(t => { table[t.name] = { name: t.name, flagCode: t.flagCode, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }; });
  matches.forEach(m => {
    const pred = predictions[m.id];
    if (!pred || pred.home === "" || pred.away === "") return;
    const hg = parseInt(pred.home, 10); const ag = parseInt(pred.away, 10);
    if (isNaN(hg) || isNaN(ag) || !table[m.home] || !table[m.away]) return;
    table[m.home].played++; table[m.away].played++;
    table[m.home].gf += hg; table[m.home].ga += ag;
    table[m.away].gf += ag; table[m.away].ga += hg;
    table[m.home].gd = table[m.home].gf - table[m.home].ga;
    table[m.away].gd = table[m.away].gf - table[m.away].ga;
    if      (hg > ag) { table[m.home].won++; table[m.home].pts += 3; table[m.away].lost++; }
    else if (hg < ag) { table[m.away].won++; table[m.away].pts += 3; table[m.home].lost++; }
    else              { table[m.home].drawn++; table[m.home].pts++; table[m.away].drawn++; table[m.away].pts++; }
  });
  return Object.values(table).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
}

function isGroupComplete(group: string, predictions: GroupPredictions): boolean {
  return getGroupMatches(group).every(m => {
    const p = predictions[m.id]; return p && p.home !== "" && p.away !== "";
  });
}

// ── Auto-save ─────────────────────────────────────────────────────────────────
function useAutoSave(predictions: GroupPredictions, userId: string | undefined, groupId: string) {
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(predictions);
  latestRef.current = predictions;

  const saveToDB = useCallback(async (preds: GroupPredictions) => {
    if (!userId) return;
    setSaveStatus("saving");
    try {
      const sb   = createClient();
      const rows = Object.entries(preds)
        .filter(([, p]) => p.home !== "" && p.away !== "")
        .map(([matchId, p]) => ({ user_id: userId, group_id: groupId, match_id: matchId, home_score: parseInt(p.home, 10), away_score: parseInt(p.away, 10), pred_type: "match", updated_at: new Date().toISOString() }));
      if (!rows.length) { setSaveStatus("idle"); return; }
      const { error } = await sb.from("group_predictions").upsert(rows, { onConflict: "user_id,group_id,match_id" });
      if (error) throw error;
      setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 2000);
    } catch { setSaveStatus("error"); setTimeout(() => setSaveStatus("idle"), 3000); }
  }, [userId, groupId]);

  useEffect(() => {
    if (!userId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveToDB(latestRef.current), 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [predictions, userId, saveToDB]);

  return saveStatus;
}

// ── Match Card Block ──────────────────────────────────────────────────────────
function MatchCard({ match, prediction, onChange, globalLocked }: {
  match: typeof WC2026_MATCHES[0];
  prediction: ScorePrediction;
  onChange: (home: string, away: string) => void;
  globalLocked: boolean;
}) {
  const filled      = prediction.home !== "" && prediction.away !== "";
  const matchLocked = globalLocked || isMatchLocked(match.utcTime);
  const countdown   = !matchLocked ? getCountdown(match.utcTime) : "";
  const status      = matchLocked ? "locked" : filled ? "saved" : "open";

  const cardStyle = {
    open:   { background: "rgba(18,14,38,0.55)",  border: "1px solid rgba(0,255,136,0.25)"   },
    saved:  { background: "rgba(30,20,10,0.55)",  border: "1px solid rgba(251,191,36,0.25)"  },
    locked: { background: "rgba(18,14,38,0.45)",  border: "1px solid rgba(255,255,255,0.07)" },
  }[status];

  return (
    <div style={{ ...cardStyle, borderRadius: 16, padding: "8px 12px", opacity: matchLocked ? 0.7 : 1, width: "100%" }}>

      {/* Row 1 — meta strip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)" }}>
          {new Date(match.utcTime).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          {" · "}{match.time} {match.timezone}
        </div>
        {status === "open" && countdown && (
          <span className="flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.25)", fontFamily: "var(--font-ui)" }}>
            {countdown}
          </span>
        )}
        {status === "saved" && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)", fontFamily: "var(--font-ui)" }}>
            <CheckCircle2 size={10} /> Saved
          </span>
        )}
        {status === "locked" && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-ui)" }}>
            <Lock size={9} /> Locked
          </span>
        )}
      </div>

      {/* Score row — same layout as NextMatchCard */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col items-center gap-1">
          <Flag code={match.homeFlagCode ?? "un"} size="sm" />
          <span className="font-display text-xs uppercase font-black text-center text-white">
            {(match.home ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ScoreInputCC value={prediction.home} onChange={v => onChange(v, prediction.away)} disabled={matchLocked} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>:</span>
          <ScoreInputCC value={prediction.away} onChange={v => onChange(prediction.home, v)} disabled={matchLocked} />
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <Flag code={match.awayFlagCode ?? "un"} size="sm" />
          <span className="font-display text-xs uppercase font-black text-center text-white">
            {(match.away ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Group Table ───────────────────────────────────────────────────────────────
function GroupTable({ standings }: { standings: TeamStanding[] }) {
  if (!standings.length) return null;
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
        style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>Team</div>
        {["P","W","D","L","GD","Pts"].map(h => (
          <div key={h} className={`w-6 text-center${["W","D","L"].includes(h) ? " hidden sm:block" : ""}`} style={h==="Pts" ? { color: "#00D4FF" } : undefined}>{h}</div>
        ))}
      </div>
      {standings.map((team, i) => {
        const qualifies  = i < 2;
        const thirdPlace = i === 2;
        return (
          <div key={team.name}
            className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-2 items-center px-3 py-2"
            style={{
              borderBottom: i < standings.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              background: qualifies ? "rgba(0,255,136,0.04)" : undefined,
              borderLeft: qualifies ? "2px solid rgba(0,255,136,0.5)" : thirdPlace ? "2px solid rgba(251,191,36,0.35)" : "2px solid transparent",
            }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-black w-3 shrink-0" style={{ color: qualifies ? "#00FF88" : "rgba(255,255,255,0.25)" }}>{i + 1}</span>
              <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
              {qualifies && <span className="hidden sm:inline text-[9px] font-bold px-1 rounded shrink-0" style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88" }}>Q</span>}
            </div>
            <div className="w-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{team.played}</div>
            <div className="w-6 text-center text-xs hidden sm:block" style={{ color: "#00FF88" }}>{team.won}</div>
            <div className="w-6 text-center text-xs hidden sm:block" style={{ color: "rgba(255,255,255,0.4)" }}>{team.drawn}</div>
            <div className="w-6 text-center text-xs hidden sm:block" style={{ color: "#f87171" }}>{team.lost}</div>
            <div className="w-6 text-center text-xs font-bold"
              style={{ color: team.gd > 0 ? "#00FF88" : team.gd < 0 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
              {team.gd > 0 ? `+${team.gd}` : team.gd}
            </div>
            <div className="w-6 text-center font-black text-sm" style={{ fontFamily: "var(--font-mono)", color: "#00D4FF" }}>{team.pts}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Qualifiers Summary ────────────────────────────────────────────────────────
function QualifiersSummary({ predictions, allComplete }: { predictions: GroupPredictions; allComplete: boolean }) {
  const qualifiers = useMemo(() => {
    const q: { group: string; pos: 1|2|3; team: TeamStanding }[] = [];
    GROUPS.forEach(g => {
      const s = calcStandings(g, predictions);
      if (s[0]?.played > 0) q.push({ group: g, pos: 1, team: s[0] });
      if (s[1]?.played > 0) q.push({ group: g, pos: 2, team: s[1] });
      if (s[2]?.played > 0) q.push({ group: g, pos: 3, team: s[2] });
    });
    return q;
  }, [predictions]);

  const top1  = qualifiers.filter(q => q.pos === 1);
  const top2  = qualifiers.filter(q => q.pos === 2);
  const best8 = qualifiers.filter(q => q.pos === 3).sort((a,b) => b.team.pts - a.team.pts || b.team.gd - a.team.gd).slice(0,8);

  if (!qualifiers.length) return null;

  return (
    <div className="rounded-2xl p-5 space-y-5" style={glassCard}>
      <div className="flex items-center gap-2.5">
        <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
        <span className="font-display text-xl uppercase tracking-tight text-white">Your Predicted Qualifiers</span>
        {!allComplete && <span className="ml-auto text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>Complete all groups for full picture</span>}
      </div>
      {top1.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Star size={10} style={{ color: "#00D4FF" }} /> Group Winners
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {top1.map(({ group, team }) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
                <span className="text-[10px] font-black" style={{ color: "#00D4FF" }}>Grp {group}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "#00FF88" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {top2.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Medal size={10} style={{ color: "#00D4FF" }} /> Runners-up
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {top2.map(({ group, team }) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <span className="text-[10px] font-black" style={{ color: "#00D4FF" }}>Grp {group}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "#00D4FF" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {best8.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Users size={10} style={{ color: "#00D4FF" }} /> Best 8 Third-Place Teams
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {best8.map(({ group, team }, i) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <span className="text-[10px] font-black" style={{ color: "#fbbf24" }}>#{i+1}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "#fbbf24" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Save indicator ────────────────────────────────────────────────────────────
function SaveIndicator({ status }: { status: "idle"|"saving"|"saved"|"error" }) {
  if (status === "idle") return null;
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-bold"
      style={{ color: status === "saved" ? "#00FF88" : status === "error" ? "#f87171" : "rgba(255,255,255,0.4)" }}>
      {status === "saving" && <span className="animate-spin">⟳</span>}
      {status === "saved"  && <Check size={11} />}
      {status === "error"  && <AlertCircle size={11} />}
      {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Failed"}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface GroupStagePredictionsProps {
  groupId: string;
  userId?: string;
  locked?: boolean;
}

export function GroupStagePredictions({ groupId, locked = false, userId }: GroupStagePredictionsProps) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [predictions, setPredictions] = useState<GroupPredictions>({});
  const [loaded,      setLoaded]      = useState(false);

  const saveStatus = useAutoSave(loaded ? predictions : {}, userId, groupId);

  useEffect(() => {
    if (!userId) return;
    setPredictions({});
    setLoaded(false);
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoaded(true); return; }
      sb.from("group_predictions")
        .select("match_id, home_score, away_score")
        .eq("group_id", groupId).eq("user_id", user.id).eq("pred_type", "match")
        .then(({ data, error }) => {
          if (error) console.error("Load predictions error:", error.message);
          if (data?.length) {
            const loaded: GroupPredictions = {};
            (data as Array<{ match_id: string; home_score: number; away_score: number }>)
              .forEach(row => { loaded[row.match_id] = { home: String(row.home_score), away: String(row.away_score) }; });
            setPredictions(loaded);
          }
          setLoaded(true);
        });
    });
  }, [userId, groupId]);

  const setScore = (matchId: string, home: string, away: string) =>
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));

  const groupMatches   = getGroupMatches(activeGroup);
  const groupTeams     = getGroupTeams(activeGroup);
  const standings      = calcStandings(activeGroup, predictions);
  const groupComplete  = isGroupComplete(activeGroup, predictions);
  const allComplete    = GROUPS.every(g => isGroupComplete(g, predictions));
  const completedCount = GROUPS.filter(g => isGroupComplete(g, predictions)).length;
  const activeIdx      = GROUPS.indexOf(activeGroup);

  return (
    <div className="space-y-4 overflow-x-hidden">

      {/* Progress + save status */}
      <div className="rounded-2xl px-4 py-3" style={{ ...glassCard, borderRadius: 18 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">Group Stage Progress</span>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <span className="text-sm font-black" style={{ fontFamily: "var(--font-mono)", color: "#00D4FF" }}>{completedCount} / 12</span>
          </div>
        </div>
        <div className="overflow-hidden" style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full transition-all duration-500"
            style={{ width: `${(completedCount/12)*100}%`, background: "linear-gradient(90deg, #00D4FF, #00FF88)", borderRadius: 3 }} />
        </div>
        <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
          Auto-saves as you type · Each match locks 5 min before kickoff
        </p>
      </div>

      {/* Group pills — scrollable row */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 w-full min-w-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {GROUPS.map(g => {
          const complete = isGroupComplete(g, predictions);
          const isActive = g === activeGroup;
          const teams    = getGroupTeams(g);
          return (
            <button key={g} onClick={() => setActiveGroup(g)}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-bold uppercase tracking-wider transition-all shrink-0"
              style={isActive ? {
                background: "rgba(0,212,255,0.12)",
                color: "#00D4FF",
                border: "1px solid rgba(0,212,255,0.35)",
                borderRadius: 100,
                boxShadow: "0 0 12px rgba(0,212,255,0.15)",
              } : {
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 100,
              }}>
              Grp {g}
              <span className="flex -space-x-0.5">
                {teams.slice(0,2).map(t => t.flagCode && (
                  <span key={t.name} className="h-3 w-4 rounded-sm overflow-hidden inline-block border"
                    style={{ borderColor: "rgba(0,0,0,0.3)" }}>
                    <img src={`/flags/${t.flagCode}.svg`} alt={t.name} className="w-full h-full object-cover" />
                  </span>
                ))}
              </span>
              {complete && <Check size={10} style={{ color: "#00FF88" }} />}
            </button>
          );
        })}
      </div>

      {/* Active group section */}
      <AnimatePresence mode="wait">
        <motion.div key={activeGroup}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="space-y-4" style={{ overflow: "visible" }}>

          {/* Group header */}
          <div className="flex items-center justify-between px-1 overflow-hidden">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl uppercase tracking-tight text-white font-black">Group {activeGroup}</h2>
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{groupTeams.map(t => t.name).join(" · ")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {groupComplete && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>
                  <CheckCircle2 size={11} /> Complete
                </span>
              )}
            </div>
          </div>

          {/* Match cards — single column stack */}
          <div className="flex flex-col" style={{ gap: 6, overflow: "visible" }}>
            {groupMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions[match.id] ?? { home: "", away: "" }}
                onChange={(h, a) => setScore(match.id, h, a)}
                globalLocked={locked}
              />
            ))}
          </div>

          {/* Predicted table — collapsible below matches */}
          {standings.some(t => t.played > 0) && (
            <div className="p-4" style={{ ...glassCard, borderRadius: 18 }}>
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown size={14} strokeWidth={1.5} style={{ color: "#00D4FF" }} />
                <span className="font-display text-lg uppercase tracking-tight text-white">Predicted Table</span>
              </div>
              <GroupTable standings={standings} />
              <div className="mt-3 flex gap-4">
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(0,255,136,0.3)" }} /> Top 2 qualify
                </div>
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(251,191,36,0.3)" }} /> 3rd — may qualify
                </div>
              </div>
            </div>
          )}

          {userId && (
            <CopyPredictions
              currentGroupId={groupId}
              userId={userId}
              onCopied={(preds) => setPredictions(prev => ({ ...prev, ...preds }))}
            />
          )}

          {/* Prev / Next group navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => activeIdx > 0 && setActiveGroup(GROUPS[activeIdx - 1])}
              disabled={activeIdx === 0}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              <ChevronLeft size={13} /> Group {GROUPS[activeIdx - 1] ?? ""}
            </button>
            <button
              onClick={() => activeIdx < GROUPS.length - 1 && setActiveGroup(GROUPS[activeIdx + 1])}
              disabled={activeIdx === GROUPS.length - 1}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              Group {GROUPS[activeIdx + 1] ?? ""} <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <QualifiersSummary predictions={predictions} allComplete={allComplete} />
    </div>
  );
}