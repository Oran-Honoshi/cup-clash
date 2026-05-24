"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Check, Lock, ArrowUpDown, Star,
  Trophy, Medal, Users, AlertCircle, CheckCircle2,
} from "lucide-react";
import { CopyPredictions } from "@/components/predictions/copy-predictions";
import { Card } from "@/components/ui/card";
import { FlaggedTeam } from "@/components/predictions/flagged-team";
import { WC2026_MATCHES } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const TOURNAMENT_LOCK_UTC = "2026-06-11T19:55:00Z";

function isMatchLocked(utcTime: string): boolean {
  const lockTime = new Date(new Date(utcTime).getTime() - 5 * 60 * 1000);
  return new Date() >= lockTime;
}

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
  teams.forEach(t => {
    table[t.name] = { name: t.name, flagCode: t.flagCode, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });
  matches.forEach(m => {
    const pred = predictions[m.id];
    if (!pred || pred.home === "" || pred.away === "") return;
    const hg = parseInt(pred.home, 10);
    const ag = parseInt(pred.away, 10);
    if (isNaN(hg) || isNaN(ag) || !table[m.home] || !table[m.away]) return;
    table[m.home].played++; table[m.away].played++;
    table[m.home].gf += hg; table[m.home].ga += ag;
    table[m.away].gf += ag; table[m.away].ga += hg;
    table[m.home].gd = table[m.home].gf - table[m.home].ga;
    table[m.away].gd = table[m.away].gf - table[m.away].ga;
    if (hg > ag)      { table[m.home].won++; table[m.home].pts += 3; table[m.away].lost++; }
    else if (hg < ag) { table[m.away].won++; table[m.away].pts += 3; table[m.home].lost++; }
    else              { table[m.home].drawn++; table[m.home].pts++; table[m.away].drawn++; table[m.away].pts++; }
  });
  return Object.values(table).sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name)
  );
}

function isGroupComplete(group: string, predictions: GroupPredictions): boolean {
  return getGroupMatches(group).every(m => {
    const p = predictions[m.id];
    return p && p.home !== "" && p.away !== "";
  });
}

function useAutoSave(predictions: GroupPredictions, userId: string | undefined, groupId: string) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(predictions);
  latestRef.current = predictions;

  const saveToDB = useCallback(async (preds: GroupPredictions) => {
    if (!userId) return;
    setSaveStatus("saving");
    try {
      const sb = createClient();
      const rows = Object.entries(preds)
        .filter(([, p]) => p.home !== "" && p.away !== "")
        .map(([matchId, p]) => ({
          user_id:    userId,
          group_id:   groupId,
          match_id:   matchId,
          home_score: parseInt(p.home, 10),
          away_score: parseInt(p.away, 10),
          pred_type:  "match",
          updated_at: new Date().toISOString(),
        }));
      if (rows.length === 0) { setSaveStatus("idle"); return; }
      const { error } = await sb.from("group_predictions")
        .upsert(rows, { onConflict: "user_id,group_id,match_id" });
      if (error) throw error;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [userId, groupId]);

  useEffect(() => {
    if (!userId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveToDB(latestRef.current), 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [predictions, userId, saveToDB]);

  return saveStatus;
}

// ── Score Box ─────────────────────────────────────────────────────────────────

function ScoreBox({ value, onChange, locked }: { value: string; onChange: (v: string) => void; locked: boolean }) {
  return (
    <input
      type="number" min="0" max="20" value={value} placeholder="–"
      disabled={locked}
      onChange={e => onChange(e.target.value)}
      className="w-12 h-12 text-center font-mono font-black text-2xl rounded-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: "rgba(0,255,136,0.06)",
        border: "1px solid rgba(0,255,136,0.25)",
        color: "#00FF88",
        outline: "none",
      }}
      onFocus={e => {
        e.target.style.border = "1px solid rgba(0,255,136,0.6)";
        e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.12)";
      }}
      onBlur={e => {
        e.target.style.border = "1px solid rgba(0,255,136,0.25)";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

// ── Match Row ─────────────────────────────────────────────────────────────────

function MatchRow({ match, prediction, onChange, globalLocked }: {
  match: typeof WC2026_MATCHES[0];
  prediction: ScorePrediction;
  onChange: (home: string, away: string) => void;
  globalLocked: boolean;
}) {
  const filled      = prediction.home !== "" && prediction.away !== "";
  const matchLocked = globalLocked || isMatchLocked(match.utcTime);

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="w-5 shrink-0 flex justify-center">
        {matchLocked
          ? <Lock size={12} style={{ color: "rgba(255,255,255,0.2)" }} />
          : filled
            ? <CheckCircle2 size={14} style={{ color: "#00FF88" }} />
            : <div className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        }
      </div>
      <div className="flex-1 flex justify-end">
        <FlaggedTeam name={match.home} flagCode={match.homeFlagCode} size="sm" />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <ScoreBox value={prediction.home} onChange={v => onChange(v, prediction.away)} locked={matchLocked} />
        <span className="font-bold text-lg" style={{ color: "rgba(255,255,255,0.25)" }}>–</span>
        <ScoreBox value={prediction.away} onChange={v => onChange(prediction.home, v)} locked={matchLocked} />
      </div>
      <div className="flex-1">
        <FlaggedTeam name={match.away} flagCode={match.awayFlagCode} size="sm" />
      </div>
      <div className="hidden sm:block text-[10px] text-right shrink-0"
        style={{ color: "rgba(255,255,255,0.3)", minWidth: 60 }}>
        <div>{new Date(match.utcTime).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
        <div>{match.time} {match.timezone}</div>
      </div>
    </div>
  );
}

// ── Group Table ───────────────────────────────────────────────────────────────

function GroupTable({ standings }: { standings: TeamStanding[] }) {
  if (!standings.length) return null;
  return (
    <div className="mt-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>Team</div>
        <div className="w-6 text-center">P</div>
        <div className="w-6 text-center">W</div>
        <div className="w-6 text-center">D</div>
        <div className="w-6 text-center">L</div>
        <div className="w-8 text-center">GD</div>
        <div className="w-8 text-center font-black" style={{ color: "#00D4FF" }}>Pts</div>
      </div>
      {standings.map((team, i) => {
        const qualifies  = i < 2;
        const thirdPlace = i === 2;
        return (
          <div key={team.name}
            className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-2 items-center px-3 py-2"
            style={{
              borderBottom: i < standings.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              background: qualifies ? "rgba(0,255,136,0.04)" : undefined,
              borderLeft: qualifies
                ? "2px solid rgba(0,255,136,0.5)"
                : thirdPlace
                  ? "2px solid rgba(251,191,36,0.4)"
                  : "2px solid transparent",
            }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-black w-3"
                style={{ color: qualifies ? "#00FF88" : "rgba(255,255,255,0.3)" }}>{i + 1}</span>
              <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
              {qualifies && (
                <span className="hidden sm:inline text-[9px] font-bold px-1 rounded"
                  style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88" }}>Q</span>
              )}
            </div>
            <div className="w-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{team.played}</div>
            <div className="w-6 text-center text-xs" style={{ color: "#00FF88" }}>{team.won}</div>
            <div className="w-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{team.drawn}</div>
            <div className="w-6 text-center text-xs" style={{ color: "#f87171" }}>{team.lost}</div>
            <div className="w-8 text-center text-xs font-bold"
              style={{ color: team.gd > 0 ? "#00FF88" : team.gd < 0 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
              {team.gd > 0 ? `+${team.gd}` : team.gd}
            </div>
            <div className="w-8 text-center font-mono font-black text-sm" style={{ color: "#00D4FF" }}>{team.pts}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Qualifiers Summary ────────────────────────────────────────────────────────

function QualifiersSummary({ predictions, allComplete }: { predictions: GroupPredictions; allComplete: boolean }) {
  const qualifiers = useMemo(() => {
    const q: { group: string; pos: 1 | 2 | 3; team: TeamStanding }[] = [];
    GROUPS.forEach(g => {
      const standings = calcStandings(g, predictions);
      if (!standings.length) return;
      if (standings[0].played > 0) q.push({ group: g, pos: 1, team: standings[0] });
      if (standings[1]?.played > 0) q.push({ group: g, pos: 2, team: standings[1] });
      if (standings[2]?.played > 0) q.push({ group: g, pos: 3, team: standings[2] });
    });
    return q;
  }, [predictions]);

  const top1  = qualifiers.filter(q => q.pos === 1);
  const top2  = qualifiers.filter(q => q.pos === 2);
  const top3  = qualifiers.filter(q => q.pos === 3).sort((a, b) => b.team.pts - a.team.pts || b.team.gd - a.team.gd);
  const best8 = top3.slice(0, 8);

  if (!qualifiers.length) return null;

  return (
    <div className="rounded-2xl overflow-hidden p-5"
      style={{
        background: "rgba(12,18,32,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
      <div className="flex items-center gap-2.5 mb-5">
        <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
        <span className="font-display text-xl uppercase tracking-tight text-white">
          Your Predicted Qualifiers
        </span>
        {!allComplete && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            Complete all groups for full picture
          </span>
        )}
      </div>

      {top1.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <Star size={11} style={{ color: "#00D4FF" }} /> Group Winners
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
        <div className="mb-5">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <Medal size={11} style={{ color: "#00D4FF" }} /> Runners-up
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
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <Users size={11} style={{ color: "#00D4FF" }} /> Best 8 Third-Place Teams
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {best8.map(({ group, team }, i) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <span className="text-[10px] font-black" style={{ color: "#fbbf24" }}>#{i + 1}</span>
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

// ── Save Indicator ────────────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold"
      style={{ color: status === "saved" ? "#00FF88" : status === "error" ? "#f87171" : "rgba(255,255,255,0.4)" }}>
      {status === "saving" && <span className="animate-spin">⟳</span>}
      {status === "saved"  && <Check size={12} />}
      {status === "error"  && <AlertCircle size={12} />}
      {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Save failed"}
    </div>
  );
}

// ── Glass card helper (local) ─────────────────────────────────────────────────

const glassCard = {
  background: "rgba(12,18,32,0.78)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
} as const;

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
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoaded(true); return; }
      sb.from("group_predictions")
        .select("match_id, home_score, away_score")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .eq("pred_type", "match")
        .then(({ data, error }) => {
          if (error) console.error("Load predictions error:", error.message);
          if (data?.length) {
            const loaded: GroupPredictions = {};
            (data as Array<{ match_id: string; home_score: number; away_score: number }>)
              .forEach(row => {
                loaded[row.match_id] = { home: String(row.home_score), away: String(row.away_score) };
              });
            setPredictions(loaded);
          }
          setLoaded(true);
        });
    });
  }, [userId, groupId]);

  const setScore = (matchId: string, home: string, away: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));
  };

  const groupMatches   = getGroupMatches(activeGroup);
  const groupTeams     = getGroupTeams(activeGroup);
  const standings      = calcStandings(activeGroup, predictions);
  const groupComplete  = isGroupComplete(activeGroup, predictions);
  const allComplete    = GROUPS.every(g => isGroupComplete(g, predictions));
  const completedCount = GROUPS.filter(g => isGroupComplete(g, predictions)).length;

  return (
    <div className="space-y-5">

      {/* Progress bar card */}
      <div className="rounded-2xl px-5 py-3" style={glassCard}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">Group Stage Progress</span>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <span className="text-sm font-mono font-black" style={{ color: "#00D4FF" }}>
              {completedCount} / 12
            </span>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(completedCount / 12) * 100}%`, background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          Predictions save automatically as you type · Each match locks 5 min before kickoff
        </p>
      </div>

      {/* Group filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map(g => {
          const complete = isGroupComplete(g, predictions);
          const isActive = g === activeGroup;
          const teams    = getGroupTeams(g);
          return (
            <button key={g} onClick={() => setActiveGroup(g)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={isActive ? {
                background: "rgba(0,212,255,0.15)",
                color: "#00D4FF",
                border: "1px solid rgba(0,212,255,0.35)",
                boxShadow: "0 2px 8px rgba(0,212,255,0.15)",
              } : {
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
              <span>Group {g}</span>
              <span className="flex -space-x-1">
                {teams.slice(0, 2).map(t => t.flagCode && (
                  <span key={t.name} className="relative h-3 w-4 rounded-sm overflow-hidden inline-block border"
                    style={{ borderColor: "rgba(0,0,0,0.3)" }}>
                    <img src={`https://flagcdn.com/w20/${t.flagCode}.png`} alt={t.name}
                      className="w-full h-full object-cover" />
                  </span>
                ))}
              </span>
              {complete && <Check size={11} style={{ color: "#00FF88" }} />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeGroup}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
          className="grid lg:grid-cols-[1fr_340px] gap-5">

          {/* Match list card */}
          <div className="rounded-2xl overflow-hidden" style={glassCard}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div>
                <div className="font-display text-2xl uppercase tracking-tight text-white">
                  Group {activeGroup}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {groupTeams.map(t => t.name).join(" · ")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SaveIndicator status={saveStatus} />
                {groupComplete && (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <CheckCircle2 size={12} /> Complete
                  </span>
                )}
              </div>
            </div>
            <div className="px-5">
              {groupMatches.map(match => (
                <MatchRow key={match.id} match={match}
                  prediction={predictions[match.id] ?? { home: "", away: "" }}
                  onChange={(h, a) => setScore(match.id, h, a)}
                  globalLocked={locked}
                />
              ))}
            </div>
            {!loaded && (
              <div className="px-5 py-3 text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                Loading your predictions...
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Predicted table */}
            <div className="rounded-2xl p-4" style={glassCard}>
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown size={14} strokeWidth={1.5} style={{ color: "#00D4FF" }} />
                <span className="font-display text-lg uppercase tracking-tight text-white">
                  Predicted Table
                </span>
              </div>
              {standings.length > 0 && standings.some(t => t.played > 0) ? (
                <GroupTable standings={standings} />
              ) : (
                <div className="py-6 text-center">
                  <AlertCircle size={24} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Predict matches to see<br />your predicted standings
                  </p>
                </div>
              )}
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div className="w-3 h-3 rounded-sm"
                    style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)" }} />
                  Top 2 — Automatic qualifiers
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div className="w-3 h-3 rounded-sm"
                    style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }} />
                  3rd place — May qualify (best 8 of 12)
                </div>
              </div>
            </div>

            {userId && (
              <CopyPredictions
                currentGroupId={groupId}
                userId={userId}
                onCopied={(preds) => setPredictions(prev => ({ ...prev, ...preds }))}
              />
            )}

            {/* Prev / Next group buttons */}
            <div className="flex gap-2">
              {activeGroup !== "A" && (
                <button onClick={() => setActiveGroup(GROUPS[GROUPS.indexOf(activeGroup) - 1])}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                  ← Group {GROUPS[GROUPS.indexOf(activeGroup) - 1]}
                </button>
              )}
              {activeGroup !== "L" && (
                <button onClick={() => setActiveGroup(GROUPS[GROUPS.indexOf(activeGroup) + 1])}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                  Group {GROUPS[GROUPS.indexOf(activeGroup) + 1]} <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <QualifiersSummary predictions={predictions} allComplete={allComplete} />
    </div>
  );
}