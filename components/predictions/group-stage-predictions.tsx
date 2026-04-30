"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Check, Lock, ArrowUpDown, Star,
  Trophy, Medal, Users, AlertCircle, CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaggedTeam } from "@/components/predictions/flagged-team";
import { WC2026_MATCHES } from "@/lib/schedule";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScorePrediction { home: string; away: string; }

interface GroupPredictions {
  [matchId: string]: ScorePrediction;
}

interface TeamStanding {
  name: string;
  flagCode: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; pts: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function calcStandings(
  group: string,
  predictions: GroupPredictions
): TeamStanding[] {
  const matches = getGroupMatches(group);
  const teams = getGroupTeams(group);
  const table: Record<string, TeamStanding> = {};

  teams.forEach(t => {
    table[t.name] = { name: t.name, flagCode: t.flagCode, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });

  matches.forEach(m => {
    const pred = predictions[m.id];
    if (!pred || pred.home === "" || pred.away === "") return;
    const hg = parseInt(pred.home, 10);
    const ag = parseInt(pred.away, 10);
    if (isNaN(hg) || isNaN(ag)) return;
    if (!table[m.home] || !table[m.away]) return;

    table[m.home].played++; table[m.away].played++;
    table[m.home].gf += hg;  table[m.home].ga += ag;
    table[m.away].gf += ag;  table[m.away].ga += hg;
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
  const matches = getGroupMatches(group);
  return matches.every(m => {
    const p = predictions[m.id];
    return p && p.home !== "" && p.away !== "";
  });
}

// ─── Score Input ─────────────────────────────────────────────────────────────

function ScoreBox({ value, onChange, locked }: { value: string; onChange: (v: string) => void; locked: boolean }) {
  return (
    <input
      type="number" min="0" max="20" value={value} placeholder="–"
      disabled={locked}
      onChange={e => onChange(e.target.value)}
      className="w-12 h-12 text-center font-mono font-black text-2xl rounded-xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "rgba(0,212,255,0.05)", border: "1px solid #e2e8f0", color: "#0F172A", outline: "none" }}
      onFocus={e => { e.target.style.border = "1px solid #00D4FF"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.12)"; }}
      onBlur={e =>  { e.target.style.border = "1px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
    />
  );
}

// ─── Match Row ────────────────────────────────────────────────────────────────

function MatchRow({
  match, prediction, onChange, locked,
}: {
  match: typeof WC2026_MATCHES[0];
  prediction: ScorePrediction;
  onChange: (home: string, away: string) => void;
  locked: boolean;
}) {
  const filled = prediction.home !== "" && prediction.away !== "";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      {/* Status dot */}
      <div className="w-5 shrink-0 flex justify-center">
        {locked ? (
          <Lock size={12} style={{ color: "#94a3b8" }} />
        ) : filled ? (
          <CheckCircle2 size={14} style={{ color: "#059669" }} />
        ) : (
          <div className="h-2 w-2 rounded-full bg-slate-200" />
        )}
      </div>

      {/* Home team */}
      <div className="flex-1 flex justify-end">
        <FlaggedTeam name={match.home} flagCode={match.homeFlagCode} size="sm" />
      </div>

      {/* Score inputs */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ScoreBox value={prediction.home} onChange={v => onChange(v, prediction.away)} locked={locked} />
        <span className="font-bold text-slate-300 text-lg">–</span>
        <ScoreBox value={prediction.away} onChange={v => onChange(prediction.home, v)} locked={locked} />
      </div>

      {/* Away team */}
      <div className="flex-1">
        <FlaggedTeam name={match.away} flagCode={match.awayFlagCode} size="sm" />
      </div>

      {/* Date/time */}
      <div className="hidden sm:block text-[10px] text-right shrink-0" style={{ color: "#94a3b8", minWidth: 60 }}>
        <div>{new Date(match.utcTime).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
        <div>{match.time} {match.timezone}</div>
      </div>
    </div>
  );
}

// ─── Predicted Group Table ────────────────────────────────────────────────────

function GroupTable({ standings }: { standings: TeamStanding[] }) {
  if (standings.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ background: "#f8fafc", color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
        <div>Team</div>
        <div className="w-6 text-center">P</div>
        <div className="w-6 text-center">W</div>
        <div className="w-6 text-center">D</div>
        <div className="w-6 text-center">L</div>
        <div className="w-8 text-center">GD</div>
        <div className="w-8 text-center font-black" style={{ color: "#0891B2" }}>Pts</div>
      </div>

      {standings.map((team, i) => {
        const qualifies = i < 2;
        const thirdPlace = i === 2;
        return (
          <div key={team.name}
            className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center px-3 py-2"
            style={{
              borderBottom: i < standings.length - 1 ? "1px solid #f1f5f9" : undefined,
              background: qualifies ? "rgba(0,255,136,0.04)" : undefined,
              borderLeft: qualifies ? "3px solid #00FF88" : thirdPlace ? "3px solid rgba(217,119,6,0.4)" : "3px solid transparent",
            }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-black w-3" style={{ color: qualifies ? "#059669" : "#94a3b8" }}>{i + 1}</span>
              <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
              {qualifies && (
                <span className="hidden sm:inline text-[9px] font-bold px-1 rounded"
                  style={{ background: "rgba(0,255,136,0.12)", color: "#059669" }}>Q</span>
              )}
            </div>
            <div className="w-6 text-center text-xs" style={{ color: "#64748b" }}>{team.played}</div>
            <div className="w-6 text-center text-xs" style={{ color: "#059669" }}>{team.won}</div>
            <div className="w-6 text-center text-xs" style={{ color: "#64748b" }}>{team.drawn}</div>
            <div className="w-6 text-center text-xs" style={{ color: "#dc2626" }}>{team.lost}</div>
            <div className="w-8 text-center text-xs font-bold" style={{ color: team.gd > 0 ? "#059669" : team.gd < 0 ? "#dc2626" : "#64748b" }}>
              {team.gd > 0 ? `+${team.gd}` : team.gd}
            </div>
            <div className="w-8 text-center font-mono font-black text-sm" style={{ color: "#0891B2" }}>{team.pts}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Qualifiers Summary ───────────────────────────────────────────────────────

function QualifiersSummary({
  predictions,
  allComplete,
}: {
  predictions: GroupPredictions;
  allComplete: boolean;
}) {
  const qualifiers = useMemo(() => {
    const q: { group: string; pos: 1 | 2 | 3; team: TeamStanding }[] = [];

    GROUPS.forEach(g => {
      const standings = calcStandings(g, predictions);
      if (standings.length === 0) return;
      if (standings[0].played > 0) q.push({ group: g, pos: 1, team: standings[0] });
      if (standings[1]?.played > 0) q.push({ group: g, pos: 2, team: standings[1] });
      if (standings[2]?.played > 0) q.push({ group: g, pos: 3, team: standings[2] });
    });
    return q;
  }, [predictions]);

  const top1 = qualifiers.filter(q => q.pos === 1);
  const top2 = qualifiers.filter(q => q.pos === 2);
  const top3 = qualifiers.filter(q => q.pos === 3).sort((a, b) => b.team.pts - a.team.pts || b.team.gd - a.team.gd);
  const best8thirds = top3.slice(0, 8);

  if (qualifiers.length === 0) return null;

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <Trophy size={18} strokeWidth={1.5} style={{ color: "#d97706" }} />
        <span className="font-display text-xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Your Predicted Qualifiers
        </span>
        {!allComplete && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            Complete all groups to see full picture
          </span>
        )}
      </div>

      {/* Group winners */}
      {top1.length > 0 && (
        <div className="mb-5">
          <div className="label-caps mb-3 flex items-center gap-1.5">
            <Star size={11} style={{ color: "#0891B2" }} /> Group Winners (1st place)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {top1.map(({ group, team }) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
                <span className="text-[10px] font-black" style={{ color: "#0891B2" }}>Grp {group}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "#059669" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group runners-up */}
      {top2.length > 0 && (
        <div className="mb-5">
          <div className="label-caps mb-3 flex items-center gap-1.5">
            <Medal size={11} style={{ color: "#0891B2" }} /> Runners-up (2nd place)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {top2.map(({ group, team }) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <span className="text-[10px] font-black" style={{ color: "#0891B2" }}>Grp {group}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "#0891B2" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best 8 third-place */}
      {best8thirds.length > 0 && (
        <div>
          <div className="label-caps mb-3 flex items-center gap-1.5">
            <Users size={11} style={{ color: "#0891B2" }} /> Best 8 Third-Place Teams
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {best8thirds.map(({ group, team }, i) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: i < 8 ? "rgba(217,119,6,0.06)" : "rgba(241,245,249,0.5)",
                  border: `1px solid ${i < 8 ? "rgba(217,119,6,0.2)" : "#e2e8f0"}`,
                }}>
                <span className="text-[10px] font-black" style={{ color: i < 8 ? "#d97706" : "#94a3b8" }}>
                  {i < 8 ? `#${i + 1}` : `Grp ${group}`}
                </span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "#d97706" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
          {top3.length > 0 && top3.length < 12 && (
            <p className="text-[11px] mt-2" style={{ color: "#94a3b8" }}>
              Complete all groups to see all 12 third-place teams and determine the best 8.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface GroupStagePredictionsProps {
  groupId: string;
  locked?: boolean;
}

export function GroupStagePredictions({ groupId, locked = false }: GroupStagePredictionsProps) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [predictions,  setPredictions]  = useState<GroupPredictions>({});
  const [saving,       setSaving]       = useState(false);
  const [savedGroup,   setSavedGroup]   = useState<string | null>(null);

  // Load saved predictions from localStorage (Supabase in prod)
  useEffect(() => {
    const saved = localStorage.getItem(`cupclash_group_preds_${groupId}`);
    if (saved) setPredictions(JSON.parse(saved) as GroupPredictions);
  }, [groupId]);

  const setScore = (matchId: string, home: string, away: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));
  };

  const saveGroup = async (group: string) => {
    setSaving(true);
    const toSave = JSON.stringify(predictions);
    localStorage.setItem(`cupclash_group_preds_${groupId}`, toSave);
    // TODO: persist to Supabase group_predictions table
    await new Promise(r => setTimeout(r, 300));
    setSaving(false);
    setSavedGroup(group);
    setTimeout(() => setSavedGroup(null), 2000);
  };

  const groupMatches  = getGroupMatches(activeGroup);
  const groupTeams    = getGroupTeams(activeGroup);
  const standings     = calcStandings(activeGroup, predictions);
  const groupComplete = isGroupComplete(activeGroup, predictions);
  const allComplete   = GROUPS.every(g => isGroupComplete(g, predictions));

  const completedCount = GROUPS.filter(g => isGroupComplete(g, predictions)).length;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <Card variant="glass" className="px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold" style={{ color: "#0F172A" }}>
            Group Stage Progress
          </span>
          <span className="text-sm font-mono font-black" style={{ color: "#0891B2" }}>
            {completedCount} / 12
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(completedCount / 12) * 100}%`, background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: "#94a3b8" }}>
          Predict all 3 matches per group to see your predicted table and qualifiers.
        </p>
      </Card>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map(g => {
          const complete = isGroupComplete(g, predictions);
          const isActive = g === activeGroup;
          const teams    = getGroupTeams(g);
          return (
            <button key={g} onClick={() => setActiveGroup(g)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={isActive ? {
                background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,255,136,0.08))",
                color: "#0F172A",
                border: "1px solid rgba(0,212,255,0.3)",
                boxShadow: "0 2px 8px rgba(0,212,255,0.1)",
              } : {
                background: "rgba(255,255,255,0.7)",
                color: "#64748b",
                border: "1px solid #e2e8f0",
              }}>
              <span style={{ color: isActive ? "#0891B2" : "#94a3b8" }}>Group {g}</span>
              {/* Mini flags */}
              <span className="flex -space-x-1">
                {teams.slice(0, 2).map(t => t.flagCode && (
                  <span key={t.name} className="relative h-3 w-4 rounded-sm overflow-hidden inline-block"
                    style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
                    <Image src={flagUrl(t.flagCode, 20)} alt={t.name} fill className="object-cover" unoptimized />
                  </span>
                ))}
              </span>
              {complete && <Check size={11} style={{ color: "#059669" }} />}
            </button>
          );
        })}
      </div>

      {/* Active group panel */}
      <AnimatePresence mode="wait">
        <motion.div key={activeGroup}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="grid lg:grid-cols-[1fr_340px] gap-5"
        >
          {/* Left: match predictions */}
          <Card variant="glass" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-display text-2xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
                  Group {activeGroup}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  {groupTeams.map(t => t.name).join(" · ")}
                </div>
              </div>
              {groupComplete && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(5,150,105,0.1)", color: "#059669", border: "1px solid rgba(5,150,105,0.2)" }}>
                  <CheckCircle2 size={12} /> Complete
                </span>
              )}
            </div>

            <div className="px-5 divide-y divide-slate-50">
              {groupMatches.map(match => (
                <MatchRow key={match.id} match={match}
                  prediction={predictions[match.id] ?? { home: "", away: "" }}
                  onChange={(h, a) => setScore(match.id, h, a)}
                  locked={locked}
                />
              ))}
            </div>

            {!locked && (
              <div className="px-5 py-3 border-t border-slate-50"
                style={{ background: "#fafafa" }}>
                <Button onClick={() => saveGroup(activeGroup)} loading={saving} size="sm"
                  leftIcon={savedGroup === activeGroup ? <Check size={13} /> : <ArrowUpDown size={13} />}>
                  {savedGroup === activeGroup ? "Saved!" : `Save Group ${activeGroup}`}
                </Button>
              </div>
            )}
          </Card>

          {/* Right: predicted standings */}
          <div className="space-y-4">
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown size={14} strokeWidth={1.5} style={{ color: "#0891B2" }} />
                <span className="font-display text-lg uppercase tracking-tight" style={{ color: "#0F172A" }}>
                  Predicted Table
                </span>
              </div>

              {standings.length > 0 && standings.some(t => t.played > 0) ? (
                <GroupTable standings={standings} />
              ) : (
                <div className="py-6 text-center">
                  <AlertCircle size={24} className="mx-auto mb-2" style={{ color: "#cbd5e1" }} />
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    Predict matches to see<br />your predicted standings
                  </p>
                </div>
              )}

              {/* Legend */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "#64748b" }}>
                  <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }} />
                  Top 2 — Automatic qualifiers
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "#64748b" }}>
                  <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.25)" }} />
                  3rd place — May qualify (best 8 of 12)
                </div>
              </div>
            </Card>

            {/* Navigation hint */}
            <div className="flex gap-2">
              {activeGroup !== "A" && (
                <button onClick={() => setActiveGroup(GROUPS[GROUPS.indexOf(activeGroup) - 1])}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all hover:bg-slate-50"
                  style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                  ← Group {GROUPS[GROUPS.indexOf(activeGroup) - 1]}
                </button>
              )}
              {activeGroup !== "L" && (
                <button onClick={() => setActiveGroup(GROUPS[GROUPS.indexOf(activeGroup) + 1])}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all hover:bg-slate-50 flex items-center justify-center gap-1"
                  style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                  Group {GROUPS[GROUPS.indexOf(activeGroup) + 1]} <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Qualifiers summary */}
      <QualifiersSummary predictions={predictions} allComplete={allComplete} />
    </div>
  );
}