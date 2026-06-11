"use client";

import { useState, useEffect, Fragment } from "react";
import { Check, AlertCircle, Calculator } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const TOTAL_MATCHES = 104;
const TOTAL_KO      = 32;

interface ScoringRules {
  correctOutcome:      number;
  exactScore:          number;
  koAdvancement:       number;
  tournamentWinner:    number;
  topScorer:           number;
  topAssister:         number;
  goldenBall:          number;
  bestDefence:         number;
  bestYoungPlayer:     number;
  bestThird:           number;
  gsCorrectOutcome:    number;
  gsExactScore:        number;
  r32CorrectOutcome:   number;
  r32ExactScore:       number;
  r16CorrectOutcome:   number;
  r16ExactScore:       number;
  qfCorrectOutcome:    number;
  qfExactScore:        number;
  sfCorrectOutcome:    number;
  sfExactScore:        number;
  thirdCorrectOutcome: number;
  thirdExactScore:     number;
  finalCorrectOutcome: number;
  finalExactScore:     number;
}

interface EnabledFeatures {
  outcome:            boolean;
  exact:              boolean;
  koAdv:              boolean;
  winner:             boolean;
  scorer:             boolean;
  assister:           boolean;
  goldenBall:         boolean;
  bestDefence:        boolean;
  bestYoungPlayer:    boolean;
  bestThird:          boolean;
  progressiveScoring: boolean;
}

const DEFAULTS: ScoringRules = {
  correctOutcome:      10,
  exactScore:          25,
  koAdvancement:       20,
  tournamentWinner:    100,
  topScorer:           50,
  topAssister:         50,
  goldenBall:          40,
  bestDefence:         30,
  bestYoungPlayer:     30,
  bestThird:           20,
  gsCorrectOutcome:    10,
  gsExactScore:        25,
  r32CorrectOutcome:   10,
  r32ExactScore:       25,
  r16CorrectOutcome:   10,
  r16ExactScore:       25,
  qfCorrectOutcome:    10,
  qfExactScore:        25,
  sfCorrectOutcome:    10,
  sfExactScore:        25,
  thirdCorrectOutcome: 10,
  thirdExactScore:     25,
  finalCorrectOutcome: 10,
  finalExactScore:     25,
};

const DEFAULT_ENABLED: EnabledFeatures = {
  outcome: true, exact: true, koAdv: true,
  winner: true, scorer: true, assister: true,
  goldenBall: false, bestDefence: false,
  bestYoungPlayer: false, bestThird: true,
  progressiveScoring: false,
};

const RULES_CONFIG = [
  { key: "correctOutcome"   as keyof ScoringRules, feKey: "outcome"         as keyof EnabledFeatures, label: "Correct outcome",        desc: "W/D/L after 90 min",             per: "per match"    },
  { key: "exactScore"       as keyof ScoringRules, feKey: "exact"           as keyof EnabledFeatures, label: "Exact score",            desc: "Exact 90-min scoreline",         per: "per match"    },
  { key: "koAdvancement"    as keyof ScoringRules, feKey: "koAdv"           as keyof EnabledFeatures, label: "Knockout advancement",   desc: "Who advances R32→Final",         per: "per KO match" },
  { key: "tournamentWinner" as keyof ScoringRules, feKey: "winner"          as keyof EnabledFeatures, label: "Tournament winner",      desc: "Pre-tournament pick",            per: "one-time"     },
  { key: "topScorer"        as keyof ScoringRules, feKey: "scorer"          as keyof EnabledFeatures, label: "Top scorer",            desc: "Golden Boot pick",               per: "one-time"     },
  { key: "topAssister"      as keyof ScoringRules, feKey: "assister"        as keyof EnabledFeatures, label: "Top assister",          desc: "Pre-tournament pick",            per: "one-time"     },
  { key: "goldenBall"       as keyof ScoringRules, feKey: "goldenBall"      as keyof EnabledFeatures, label: "Golden Ball",           desc: "Best player of tournament",      per: "one-time"     },
  { key: "bestDefence"      as keyof ScoringRules, feKey: "bestDefence"     as keyof EnabledFeatures, label: "Best defence",          desc: "Team conceding fewest goals",    per: "one-time"     },
  { key: "bestYoungPlayer"  as keyof ScoringRules, feKey: "bestYoungPlayer" as keyof EnabledFeatures, label: "Best young player",     desc: "Best U-21 player (Yashin-style)", per: "one-time"    },
  { key: "bestThird"        as keyof ScoringRules, feKey: "bestThird"       as keyof EnabledFeatures, label: "Best 3rd-place teams",  desc: "Pick 8 of 12 qualifying thirds", per: "per correct"  },
];

interface ScoringRulesEditorProps {
  groupId: string;
}

export function ScoringRulesEditor({ groupId }: ScoringRulesEditorProps) {
  const [rules,   setRules]   = useState<ScoringRules>(DEFAULTS);
  const [enabled, setEnabled] = useState<EnabledFeatures>(DEFAULT_ENABLED);
  const [loading,           setLoading]           = useState(true);
  const [saving,            setSaving]            = useState(false);
  const [saved,             setSaved]             = useState(false);
  const [error,             setError]             = useState<string | null>(null);
  const [useCustomLockTime, setUseCustomLockTime] = useState(false);
  const [tournamentLockAt,  setTournamentLockAt]  = useState("");

  useEffect(() => {
    const sb = createClient();
    sb.from("scoring_rules")
      .select("*")
      .eq("group_id", groupId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as Record<string, unknown>;
          setRules({
            correctOutcome:      Number(d.correct_outcome)       || DEFAULTS.correctOutcome,
            exactScore:          Number(d.exact_score)           || DEFAULTS.exactScore,
            koAdvancement:       Number(d.ko_advancement)        || DEFAULTS.koAdvancement,
            tournamentWinner:    Number(d.tournament_winner)     || DEFAULTS.tournamentWinner,
            topScorer:           Number(d.top_scorer)            || DEFAULTS.topScorer,
            topAssister:         Number(d.top_assister)          || DEFAULTS.topAssister,
            goldenBall:          Number(d.golden_ball)           || DEFAULTS.goldenBall,
            bestDefence:         Number(d.best_defence)          || DEFAULTS.bestDefence,
            bestYoungPlayer:     Number(d.best_young_player)     || DEFAULTS.bestYoungPlayer,
            bestThird:           Number(d.best_third)            || DEFAULTS.bestThird,
            gsCorrectOutcome:    Number(d.gs_correct_outcome)    || DEFAULTS.gsCorrectOutcome,
            gsExactScore:        Number(d.gs_exact_score)        || DEFAULTS.gsExactScore,
            r32CorrectOutcome:   Number(d.r32_correct_outcome)   || DEFAULTS.r32CorrectOutcome,
            r32ExactScore:       Number(d.r32_exact_score)       || DEFAULTS.r32ExactScore,
            r16CorrectOutcome:   Number(d.r16_correct_outcome)   || DEFAULTS.r16CorrectOutcome,
            r16ExactScore:       Number(d.r16_exact_score)       || DEFAULTS.r16ExactScore,
            qfCorrectOutcome:    Number(d.qf_correct_outcome)    || DEFAULTS.qfCorrectOutcome,
            qfExactScore:        Number(d.qf_exact_score)        || DEFAULTS.qfExactScore,
            sfCorrectOutcome:    Number(d.sf_correct_outcome)    || DEFAULTS.sfCorrectOutcome,
            sfExactScore:        Number(d.sf_exact_score)        || DEFAULTS.sfExactScore,
            thirdCorrectOutcome: Number(d.third_correct_outcome) || DEFAULTS.thirdCorrectOutcome,
            thirdExactScore:     Number(d.third_exact_score)     || DEFAULTS.thirdExactScore,
            finalCorrectOutcome: Number(d.final_correct_outcome) || DEFAULTS.finalCorrectOutcome,
            finalExactScore:     Number(d.final_exact_score)     || DEFAULTS.finalExactScore,
          });
          setEnabled({
            outcome:            d.enable_outcome        !== false,
            exact:              d.enable_exact          !== false,
            koAdv:              d.enable_ko_advancement !== false,
            winner:             d.enable_winner         !== false,
            scorer:             d.enable_scorer         !== false,
            assister:           d.enable_assister       !== false,
            goldenBall:         Boolean(d.enable_golden_ball),
            bestDefence:        Boolean(d.enable_best_defence),
            bestYoungPlayer:    Boolean(d.enable_best_young_player),
            bestThird:          d.enable_best_third !== false,
            progressiveScoring: Boolean(d.use_progressive_scoring),
          });
          if (d.tournament_lock_at) {
            setUseCustomLockTime(true);
            const dt = new Date(d.tournament_lock_at as string);
            const pad = (n: number) => String(n).padStart(2, "0");
            setTournamentLockAt(`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
          }
        }
        setLoading(false);
      });
  }, [groupId]);

  const handleSave = async () => {
    setSaving(true); setError(null);
    const sb = createClient();
    const { error: upsertError } = await sb.from("scoring_rules").upsert({
      group_id:               groupId,
      correct_outcome:        rules.correctOutcome,
      exact_score:            rules.exactScore,
      ko_advancement:         rules.koAdvancement,
      tournament_winner:      rules.tournamentWinner,
      top_scorer:             rules.topScorer,
      top_assister:           rules.topAssister,
      golden_ball:            rules.goldenBall,
      best_defence:           rules.bestDefence,
      best_young_player:      rules.bestYoungPlayer,
      best_third:             rules.bestThird,
      enable_outcome:         enabled.outcome,
      enable_exact:           enabled.exact,
      enable_ko_advancement:  enabled.koAdv,
      enable_winner:          enabled.winner,
      enable_scorer:          enabled.scorer,
      enable_assister:        enabled.assister,
      enable_golden_ball:     enabled.goldenBall,
      enable_best_defence:    enabled.bestDefence,
      enable_best_young_player: enabled.bestYoungPlayer,
      enable_best_third:      enabled.bestThird,
      use_progressive_scoring: enabled.progressiveScoring,
      gs_correct_outcome:     rules.gsCorrectOutcome,
      gs_exact_score:         rules.gsExactScore,
      r32_correct_outcome:    rules.r32CorrectOutcome,
      r32_exact_score:        rules.r32ExactScore,
      r16_correct_outcome:    rules.r16CorrectOutcome,
      r16_exact_score:        rules.r16ExactScore,
      qf_correct_outcome:     rules.qfCorrectOutcome,
      qf_exact_score:         rules.qfExactScore,
      sf_correct_outcome:     rules.sfCorrectOutcome,
      sf_exact_score:         rules.sfExactScore,
      third_correct_outcome:  rules.thirdCorrectOutcome,
      third_exact_score:      rules.thirdExactScore,
      final_correct_outcome:  rules.finalCorrectOutcome,
      final_exact_score:      rules.finalExactScore,
      updated_at:             new Date().toISOString(),
      tournament_lock_at:     useCustomLockTime && tournamentLockAt ? new Date(tournamentLockAt).toISOString() : null,
    } as Record<string, unknown>, { onConflict: "group_id" });
    setSaving(false);
    if (upsertError) { setError(upsertError.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const maxMatchFlat = enabled.exact
    ? (rules.correctOutcome + rules.exactScore) * TOTAL_MATCHES
    : enabled.outcome ? rules.correctOutcome * TOTAL_MATCHES : 0;

  // WC2026 match counts per stage (72 group + 16+8+4+2+1+1 KO = 104)
  const STAGE_ROWS = [
    { label: "Group Stage",    count: 72, co: rules.gsCorrectOutcome,    es: rules.gsExactScore    },
    { label: "Round of 32",    count: 16, co: rules.r32CorrectOutcome,   es: rules.r32ExactScore   },
    { label: "Round of 16",    count:  8, co: rules.r16CorrectOutcome,   es: rules.r16ExactScore   },
    { label: "Quarter Finals", count:  4, co: rules.qfCorrectOutcome,    es: rules.qfExactScore    },
    { label: "Semi Finals",    count:  2, co: rules.sfCorrectOutcome,    es: rules.sfExactScore    },
    { label: "3rd Place",      count:  1, co: rules.thirdCorrectOutcome, es: rules.thirdExactScore },
    { label: "Final",          count:  1, co: rules.finalCorrectOutcome, es: rules.finalExactScore },
  ] as const;
  const maxMatchProg = STAGE_ROWS.reduce((sum, s) => sum + (s.co + s.es) * s.count, 0);

  const effectiveMaxMatch = enabled.progressiveScoring ? maxMatchProg : maxMatchFlat;
  const maxKo     = enabled.koAdv           ? rules.koAdvancement   * TOTAL_KO : 0;
  const maxWinner = enabled.winner          ? rules.tournamentWinner            : 0;
  const maxScorer = enabled.scorer          ? rules.topScorer                   : 0;
  const maxAssist = enabled.assister        ? rules.topAssister                 : 0;
  const maxGB     = enabled.goldenBall      ? rules.goldenBall                  : 0;
  const maxDef    = enabled.bestDefence     ? rules.bestDefence                 : 0;
  const maxYoung  = enabled.bestYoungPlayer ? rules.bestYoungPlayer             : 0;
  const maxThird  = enabled.bestThird       ? rules.bestThird * 8               : 0;
  const maxTotal  = effectiveMaxMatch + maxKo + maxWinner + maxScorer + maxAssist + maxGB + maxDef + maxYoung + maxThird;

  if (loading) return (
    <div className="rounded-2xl p-5 text-center text-sm" style={{
      background: "rgba(18,14,38,0.32)",
      backdropFilter: "blur(40px) saturate(180%)",
      WebkitBackdropFilter: "blur(40px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
      borderRadius: 28,
      color: "rgba(255,255,255,0.35)",
    }}>
      Loading scoring rules...
    </div>
  );

  return (
    <div className="rounded-2xl p-5 space-y-5"
      style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
        borderRadius: 28,
      }}>
      <div className="flex items-center gap-2.5">
        <Calculator size={18} style={{ color: "#0891B2" }} />
        <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>Scoring Rules</span>
      </div>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
        Enable/disable and set point values below. Changes apply immediately to all future scoring.
      </p>

      <div className="space-y-2">
        {RULES_CONFIG.map(({ key, feKey, label, desc, per }) => {
          const isOverridden = enabled.progressiveScoring && (feKey === "outcome" || feKey === "exact");
          const isOn = enabled[feKey] && !isOverridden;
          return (
            <Fragment key={key}>
              <div
                className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all",
                  (!isOn || isOverridden) && "opacity-30",
                  isOverridden && "pointer-events-none")}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                <button
                  onClick={() => { setEnabled(e => ({ ...e, [feKey]: !e[feKey] })); }}
                  disabled={isOverridden}
                  className="h-5 w-5 rounded flex items-center justify-center shrink-0 transition-all"
                  style={isOn
                    ? { borderColor: "rgba(0,212,255,1)", background: "rgba(0,212,255,0.2)", border: "2px solid rgba(0,212,255,1)" }
                    : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  {isOn && <Check size={11} style={{ color: "#0891B2" }} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: "white" }}>{label}</div>
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{desc} · {per}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number" min={0} max={999} value={rules[key]}
                    disabled={!isOn || isOverridden}
                    onChange={e => { setRules(r => ({ ...r, [key]: Number(e.target.value) })); setSaved(false); }}
                    className="w-16 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none disabled:opacity-30"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
                  />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>pts</span>
                </div>
              </div>
              {isOverridden && feKey === "exact" && (
                <div style={{ fontSize: 11, color: "#00D4FF", padding: "6px 10px", borderRadius: 8, background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
                  Using progressive scoring — per-stage points are set below
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Progressive stage scoring */}
      <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", !enabled.progressiveScoring && "opacity-50")}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => { setEnabled(e => ({ ...e, progressiveScoring: !e.progressiveScoring })); }}
            className="h-5 w-5 rounded flex items-center justify-center shrink-0 transition-all"
            style={enabled.progressiveScoring
              ? { borderColor: "rgba(0,212,255,1)", background: "rgba(0,212,255,0.2)", border: "2px solid rgba(0,212,255,1)" }
              : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {enabled.progressiveScoring && <Check size={11} style={{ color: "#0891B2" }} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold" style={{ color: "white" }}>Progressive stage scoring</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Higher-stakes matches award more points</div>
          </div>
        </div>

        {enabled.progressiveScoring && (
          <div className="mt-3 space-y-2">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <th style={{ textAlign: "left",   padding: "6px 8px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stage</th>
                    <th style={{ textAlign: "center", padding: "6px 8px", color: "#00D4FF",                fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Correct Outcome</th>
                    <th style={{ textAlign: "center", padding: "6px 8px", color: "#00FF88",               fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>+Exact Bonus</th>
                    <th style={{ textAlign: "center", padding: "6px 8px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Max</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    { label: "Group Stage",    coKey: "gsCorrectOutcome"    as keyof ScoringRules, esKey: "gsExactScore"        as keyof ScoringRules },
                    { label: "Round of 32",    coKey: "r32CorrectOutcome"   as keyof ScoringRules, esKey: "r32ExactScore"       as keyof ScoringRules },
                    { label: "Round of 16",    coKey: "r16CorrectOutcome"   as keyof ScoringRules, esKey: "r16ExactScore"       as keyof ScoringRules },
                    { label: "Quarter Finals", coKey: "qfCorrectOutcome"    as keyof ScoringRules, esKey: "qfExactScore"        as keyof ScoringRules },
                    { label: "Semi Finals",    coKey: "sfCorrectOutcome"    as keyof ScoringRules, esKey: "sfExactScore"        as keyof ScoringRules },
                    { label: "3rd Place",      coKey: "thirdCorrectOutcome" as keyof ScoringRules, esKey: "thirdExactScore"     as keyof ScoringRules },
                    { label: "Final",          coKey: "finalCorrectOutcome" as keyof ScoringRules, esKey: "finalExactScore"     as keyof ScoringRules },
                  ]).map(({ label, coKey, esKey }) => {
                    const coVal = rules[coKey] as number;
                    const esVal = rules[esKey] as number;
                    return (
                      <tr key={label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "6px 8px", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 12 }}>{label}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <input
                            type="number" min={0} max={999} value={coVal}
                            onChange={e => { setRules(r => ({ ...r, [coKey]: Number(e.target.value) })); setSaved(false); }}
                            className="w-14 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none disabled:opacity-30"
                            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}
                          />
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <input
                            type="number" min={0} max={999} value={esVal}
                            onChange={e => { setRules(r => ({ ...r, [esKey]: Number(e.target.value) })); setSaved(false); }}
                            className="w-14 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none disabled:opacity-30"
                            style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88" }}
                          />
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, fontFamily: "var(--font-mono)", color: "white", fontSize: 13 }}>
                          {coVal + esVal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)", paddingLeft: 2 }}>
              Max per match = Outcome + Bonus (both earned on an exact-score prediction)
            </div>
          </div>
        )}
      </div>

      {/* Tournament Picks Lock Time */}
      <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold" style={{ color: "white" }}>Tournament Picks Lock Time</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              Default locks 5 minutes before the first match. Set a custom time for groups joining late.
            </div>
          </div>
          <button
            onClick={() => { setUseCustomLockTime(v => !v); }}
            className="relative h-6 w-11 rounded-full shrink-0 transition-all"
            style={{ background: useCustomLockTime ? "#00D4FF" : "rgba(255,255,255,0.12)" }}>
            <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
              style={{ left: useCustomLockTime ? "22px" : "2px" }} />
          </button>
        </div>
        {useCustomLockTime && (
          <div className="space-y-1.5">
            <input
              type="datetime-local"
              value={tournamentLockAt}
              onChange={e => { setTournamentLockAt(e.target.value); setSaved(false); }}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none disabled:opacity-30"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ffffff",
                colorScheme: "dark",
              }}
            />
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Time is in your local timezone. Leave off to use default (5 min before first match).
            </p>
          </div>
        )}
      </div>

      {/* Max points */}
      <div className="rounded-xl p-4" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
          Maximum possible points
        </div>
        <div className="space-y-1.5 text-sm">
          {enabled.progressiveScoring ? (
            STAGE_ROWS.map(({ label, count, co, es }) => (
              <div key={label} className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span>{label} ({count} × max {co + es}pts)</span>
                <span className="font-bold" style={{ color: "white" }}>{(co + es) * count}</span>
              </div>
            ))
          ) : (
            <>
              {enabled.exact && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Exact scores ({TOTAL_MATCHES} × {rules.correctOutcome + rules.exactScore})</span><span className="font-bold" style={{ color: "white" }}>{maxMatchFlat}</span></div>}
              {enabled.outcome && !enabled.exact && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Outcomes ({TOTAL_MATCHES} × {rules.correctOutcome})</span><span className="font-bold" style={{ color: "white" }}>{maxMatchFlat}</span></div>}
            </>
          )}
          {enabled.koAdv    && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>KO advancement ({TOTAL_KO} × {rules.koAdvancement})</span><span className="font-bold" style={{ color: "white" }}>{maxKo}</span></div>}
          {enabled.winner   && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Tournament winner</span><span className="font-bold" style={{ color: "white" }}>{maxWinner}</span></div>}
          {enabled.scorer   && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Top scorer</span><span className="font-bold" style={{ color: "white" }}>{maxScorer}</span></div>}
          {enabled.assister && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Top assister</span><span className="font-bold" style={{ color: "white" }}>{maxAssist}</span></div>}
          {enabled.goldenBall      && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Golden Ball</span><span className="font-bold" style={{ color: "white" }}>{maxGB}</span></div>}
          {enabled.bestDefence     && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Best defence</span><span className="font-bold" style={{ color: "white" }}>{maxDef}</span></div>}
          {enabled.bestYoungPlayer && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Best young player</span><span className="font-bold" style={{ color: "white" }}>{maxYoung}</span></div>}
          {enabled.bestThird && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Best 3rd-place teams (8 × {rules.bestThird})</span><span className="font-bold" style={{ color: "white" }}>{maxThird}</span></div>}
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="font-bold" style={{ color: "white" }}>Perfect score</span>
            <span className="font-display text-2xl font-black" style={{ color: "#0891B2" }}>{maxTotal}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
          style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626" }}>
          <AlertCircle size={13} />{error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#050810", fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase" as const, letterSpacing: "0.05em", cursor: "pointer", border: "none", width: "100%", opacity: saving ? 0.7 : 1 }}>
        {saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}