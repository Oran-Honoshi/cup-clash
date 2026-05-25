"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, Calculator, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const TOTAL_MATCHES = 104;
const TOTAL_KO      = 32;

interface ScoringRules {
  correctOutcome:   number;
  exactScore:       number;
  koAdvancement:    number;
  tournamentWinner: number;
  topScorer:        number;
  topAssister:      number;
  goldenBall:       number;
  bestDefence:      number;
  bestYoungPlayer:  number;
  bestThird:        number;
}

interface EnabledFeatures {
  outcome:         boolean;
  exact:           boolean;
  koAdv:           boolean;
  winner:          boolean;
  scorer:          boolean;
  assister:        boolean;
  goldenBall:      boolean;
  bestDefence:     boolean;
  bestYoungPlayer: boolean;
  bestThird:       boolean;
}

const DEFAULTS: ScoringRules = {
  correctOutcome:   10,
  exactScore:       25,
  koAdvancement:    20,
  tournamentWinner: 100,
  topScorer:        50,
  topAssister:      50,
  goldenBall:       40,
  bestDefence:      30,
  bestYoungPlayer:  30,
  bestThird:        20,
};

const DEFAULT_ENABLED: EnabledFeatures = {
  outcome: true, exact: true, koAdv: true,
  winner: true, scorer: true, assister: true,
  goldenBall: false, bestDefence: false,
  bestYoungPlayer: false, bestThird: true,
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
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [locked,  setLocked]  = useState(false);

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
            correctOutcome:   Number(d.correct_outcome)    || DEFAULTS.correctOutcome,
            exactScore:       Number(d.exact_score)        || DEFAULTS.exactScore,
            koAdvancement:    Number(d.ko_advancement)     || DEFAULTS.koAdvancement,
            tournamentWinner: Number(d.tournament_winner)  || DEFAULTS.tournamentWinner,
            topScorer:        Number(d.top_scorer)         || DEFAULTS.topScorer,
            topAssister:      Number(d.top_assister)       || DEFAULTS.topAssister,
            goldenBall:       Number(d.golden_ball)        || DEFAULTS.goldenBall,
            bestDefence:      Number(d.best_defence)       || DEFAULTS.bestDefence,
            bestYoungPlayer:  Number(d.best_young_player)  || DEFAULTS.bestYoungPlayer,
            bestThird:        Number(d.best_third)         || DEFAULTS.bestThird,
          });
          setEnabled({
            outcome:         d.enable_outcome        !== false,
            exact:           d.enable_exact          !== false,
            koAdv:           d.enable_ko_advancement !== false,
            winner:          d.enable_winner         !== false,
            scorer:          d.enable_scorer         !== false,
            assister:        d.enable_assister       !== false,
            goldenBall:      Boolean(d.enable_golden_ball),
            bestDefence:     Boolean(d.enable_best_defence),
            bestYoungPlayer: Boolean(d.enable_best_young_player),
            bestThird:       d.enable_best_third !== false,
          });
          setLocked(!!d.locked_at);
        }
        setLoading(false);
      });
  }, [groupId]);

  const handleSave = async () => {
    if (locked) return;
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
      updated_at:             new Date().toISOString(),
    } as Record<string, unknown>, { onConflict: "group_id" });
    setSaving(false);
    if (upsertError) { setError(upsertError.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const maxMatch  = enabled.exact ? rules.exactScore * TOTAL_MATCHES : enabled.outcome ? rules.correctOutcome * TOTAL_MATCHES : 0;
  const maxKo     = enabled.koAdv           ? rules.koAdvancement   * TOTAL_KO : 0;
  const maxWinner = enabled.winner          ? rules.tournamentWinner            : 0;
  const maxScorer = enabled.scorer          ? rules.topScorer                   : 0;
  const maxAssist = enabled.assister        ? rules.topAssister                 : 0;
  const maxGB     = enabled.goldenBall      ? rules.goldenBall                  : 0;
  const maxDef    = enabled.bestDefence     ? rules.bestDefence                 : 0;
  const maxYoung  = enabled.bestYoungPlayer ? rules.bestYoungPlayer             : 0;
  const maxThird  = enabled.bestThird       ? rules.bestThird * 8               : 0;
  const maxTotal  = maxMatch + maxKo + maxWinner + maxScorer + maxAssist + maxGB + maxDef + maxYoung + maxThird;

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
        {locked && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ color: "#d97706" }}>
            <Lock size={12} /> Locked
          </span>
        )}
      </div>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
        {locked
          ? "Rules are locked — the tournament has started."
          : "These rules lock June 11 when the first match kicks off. Enable/disable and set point values below."}
      </p>

      <div className="space-y-2">
        {RULES_CONFIG.map(({ key, feKey, label, desc, per }) => {
          const isOn = enabled[feKey];
          return (
            <div key={key}
              className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all",
                !isOn && "opacity-50")}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
              <button
                onClick={() => { if (!locked) setEnabled(e => ({ ...e, [feKey]: !e[feKey] })); }}
                disabled={locked}
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
                  disabled={!isOn || locked}
                  onChange={e => { setRules(r => ({ ...r, [key]: Number(e.target.value) })); setSaved(false); }}
                  className="w-16 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
                />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Max points */}
      <div className="rounded-xl p-4" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
          Maximum possible points
        </div>
        <div className="space-y-1.5 text-sm">
          {enabled.exact && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Exact scores ({TOTAL_MATCHES} × {rules.exactScore})</span><span className="font-bold" style={{ color: "white" }}>{maxMatch}</span></div>}
          {enabled.outcome && !enabled.exact && <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}><span>Outcomes ({TOTAL_MATCHES} × {rules.correctOutcome})</span><span className="font-bold" style={{ color: "white" }}>{maxMatch}</span></div>}
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

      <button onClick={handleSave} disabled={locked || saving} style={{ padding: "12px 24px", borderRadius: 12, background: locked ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00FF88, #00D4FF)", color: locked ? "rgba(255,255,255,0.3)" : "#050810", fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase" as const, letterSpacing: "0.05em", cursor: locked ? "not-allowed" : "pointer", border: "none", width: "100%", opacity: saving ? 0.7 : 1 }}>
        {locked ? "Rules locked" : saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}