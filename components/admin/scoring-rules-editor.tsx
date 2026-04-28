"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, Calculator, Lock } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const TOTAL_MATCHES  = 104; // all WC 2026 matches
const TOTAL_KO       = 32;  // R32+R16+QF+SF+3rd+Final

interface ScoringRules {
  correctOutcome: number;
  exactScore: number;
  koAdvancement: number;
  tournamentWinner: number;
  topScorer: number;
  topAssister: number;
}

interface EnabledFeatures {
  outcome:    boolean;
  exact:      boolean;
  koAdv:      boolean;
  winner:     boolean;
  scorer:     boolean;
  assister:   boolean;
}

const DEFAULTS: ScoringRules = {
  correctOutcome: 10,
  exactScore: 25,
  koAdvancement: 20,
  tournamentWinner: 100,
  topScorer: 50,
  topAssister: 50,
};

const DEFAULT_ENABLED: EnabledFeatures = {
  outcome: true, exact: true, koAdv: true,
  winner: true, scorer: true, assister: true,
};

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

  // Load from Supabase on mount
  useEffect(() => {
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { setLoading(false); return; }
      try {
        const sb = getClient();
        const { data } = await sb
          .from("scoring_rules")
          .select("*")
          .eq("group_id", groupId)
          .single();
        if (data) {
          const d = data as Record<string, unknown>;
          setRules({
            correctOutcome:  Number(d.correct_outcome)   || DEFAULTS.correctOutcome,
            exactScore:      Number(d.exact_score)       || DEFAULTS.exactScore,
            koAdvancement:   Number(d.ko_advancement)    || DEFAULTS.koAdvancement,
            tournamentWinner: Number(d.tournament_winner) || DEFAULTS.tournamentWinner,
            topScorer:       Number(d.top_scorer)        || DEFAULTS.topScorer,
            topAssister:     Number(d.top_assister)      || DEFAULTS.topAssister,
          });
          setEnabled({
            outcome:  Boolean(d.enable_outcome  ?? true),
            exact:    Boolean(d.enable_exact    ?? true),
            koAdv:    Boolean(d.enable_ko_advancement ?? true),
            winner:   Boolean(d.enable_winner   ?? true),
            scorer:   Boolean(d.enable_scorer   ?? true),
            assister: Boolean(d.enable_assister ?? true),
          });
          setLocked(!!d.locked_at);
        }
      } catch { /* no rules yet — use defaults */ }
      setLoading(false);
    }
    load();
  }, [groupId]);

  const handleSave = async () => {
    if (locked) return;
    setSaving(true); setError(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await new Promise(r => setTimeout(r, 600));
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); return;
    }

    const sb = getClient();
    const { error: upsertError } = await sb.from("scoring_rules").upsert({
      group_id:         groupId,
      correct_outcome:  rules.correctOutcome,
      exact_score:      rules.exactScore,
      ko_advancement:   rules.koAdvancement,
      tournament_winner: rules.tournamentWinner,
      top_scorer:       rules.topScorer,
      top_assister:     rules.topAssister,
      enable_outcome:   enabled.outcome,
      enable_exact:     enabled.exact,
      enable_ko_advancement: enabled.koAdv,
      enable_winner:    enabled.winner,
      enable_scorer:    enabled.scorer,
      enable_assister:  enabled.assister,
      updated_at:       new Date().toISOString(),
    } as Record<string, unknown>, { onConflict: "group_id" });

    setSaving(false);
    if (upsertError) { setError(upsertError.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Max points calculator
  const maxMatch = (() => {
    if (enabled.exact)   return rules.exactScore   * TOTAL_MATCHES;
    if (enabled.outcome) return rules.correctOutcome * TOTAL_MATCHES;
    return 0;
  })();
  const maxKo      = enabled.koAdv    ? rules.koAdvancement   * TOTAL_KO : 0;
  const maxWinner  = enabled.winner   ? rules.tournamentWinner            : 0;
  const maxScorer  = enabled.scorer   ? rules.topScorer                   : 0;
  const maxAssist  = enabled.assister ? rules.topAssister                 : 0;
  const maxTotal   = maxMatch + maxKo + maxWinner + maxScorer + maxAssist;

  const RULES_CONFIG = [
    { key: "correctOutcome"   as keyof ScoringRules, feKey: "outcome"  as keyof EnabledFeatures, label: "Correct outcome",       desc: "W/D/L after 90 min",               per: "per match",    show: true  },
    { key: "exactScore"       as keyof ScoringRules, feKey: "exact"    as keyof EnabledFeatures, label: "Exact score",           desc: "Exact 90-min scoreline",           per: "per match",    show: true  },
    { key: "koAdvancement"    as keyof ScoringRules, feKey: "koAdv"    as keyof EnabledFeatures, label: "Knockout advancement",  desc: "Who advances (R32 → Final)",       per: "per KO match", show: true  },
    { key: "tournamentWinner" as keyof ScoringRules, feKey: "winner"   as keyof EnabledFeatures, label: "Tournament winner",     desc: "Pre-tournament pick",              per: "one-time",     show: true  },
    { key: "topScorer"        as keyof ScoringRules, feKey: "scorer"   as keyof EnabledFeatures, label: "Top scorer",           desc: "Pre-tournament pick",              per: "one-time",     show: true  },
    { key: "topAssister"      as keyof ScoringRules, feKey: "assister" as keyof EnabledFeatures, label: "Top assister",         desc: "Pre-tournament pick",              per: "one-time",     show: true  },
  ];

  if (loading) return (
    <Card variant="glass" className="p-5">
      <div className="text-center text-pitch-500 text-sm py-6">Loading scoring rules...</div>
    </Card>
  );

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <Calculator size={18} style={{ color: "rgb(var(--accent-glow))" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">Scoring Rules</span>
        {locked && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-warning uppercase tracking-widest">
            <Lock size={12} /> Locked
          </span>
        )}
      </div>
      <p className="text-[11px] text-pitch-500 mb-5">
        {locked ? "Rules are locked — the tournament has started." : "Rules lock when the first match kicks off on June 11."}
      </p>

      {/* Rules list */}
      <div className="space-y-2.5 mb-6">
        {RULES_CONFIG.map(({ key, feKey, label, desc, per }) => {
          const isOn = enabled[feKey];
          return (
            <div key={key}
              className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all",
                isOn ? "border-white/[0.08] bg-white/[0.02]" : "border-white/[0.04] opacity-50")}>
              {/* Checkbox */}
              <button onClick={() => { if (!locked) setEnabled(e => ({ ...e, [feKey]: !e[feKey] })); }}
                disabled={locked}
                className={cn("h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                  isOn ? "border-accent bg-accent/20" : "border-white/20")}
                style={isOn ? { borderColor: "rgb(var(--accent))" } : undefined}>
                {isOn && <Check size={12} style={{ color: "rgb(var(--accent-glow))" }} />}
              </button>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{label}</div>
                <div className="text-[11px] text-pitch-500">{desc} · {per}</div>
              </div>

              {/* Points input */}
              <div className="flex items-center gap-1.5 shrink-0">
                <input type="number" min={0} max={999} value={rules[key]}
                  disabled={!isOn || locked}
                  onChange={e => { setRules(r => ({ ...r, [key]: Number(e.target.value) })); setSaved(false); }}
                  className="w-16 rounded-lg px-2 py-1.5 text-sm text-white text-center bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent disabled:opacity-30 disabled:cursor-not-allowed" />
                <span className="text-xs text-pitch-500">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Max points breakdown */}
      <div className="glass rounded-xl p-4 mb-5">
        <div className="label-caps mb-3 flex items-center gap-1.5">
          <Calculator size={11} /> Maximum possible points
        </div>
        <div className="space-y-1.5 text-sm">
          {enabled.exact && (
            <div className="flex justify-between text-pitch-300">
              <span>Exact scores ({TOTAL_MATCHES} × {rules.exactScore})</span>
              <span className="font-bold text-white tabular">{maxMatch}</span>
            </div>
          )}
          {enabled.outcome && !enabled.exact && (
            <div className="flex justify-between text-pitch-300">
              <span>Correct outcomes ({TOTAL_MATCHES} × {rules.correctOutcome})</span>
              <span className="font-bold text-white tabular">{maxMatch}</span>
            </div>
          )}
          {enabled.koAdv && (
            <div className="flex justify-between text-pitch-300">
              <span>KO advancement ({TOTAL_KO} × {rules.koAdvancement})</span>
              <span className="font-bold text-white tabular">{maxKo}</span>
            </div>
          )}
          {enabled.winner   && <div className="flex justify-between text-pitch-300"><span>Tournament winner</span><span className="font-bold text-white tabular">{maxWinner}</span></div>}
          {enabled.scorer   && <div className="flex justify-between text-pitch-300"><span>Top scorer</span><span className="font-bold text-white tabular">{maxScorer}</span></div>}
          {enabled.assister && <div className="flex justify-between text-pitch-300"><span>Top assister</span><span className="font-bold text-white tabular">{maxAssist}</span></div>}
          <div className="flex justify-between pt-2 border-t border-white/[0.06]">
            <span className="font-bold text-white">Perfect score</span>
            <span className="font-display text-2xl" style={{ color: "rgb(var(--accent-glow))" }}>{maxTotal}</span>
          </div>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 text-xs text-danger mb-3"><AlertCircle size={13} />{error}</div>}

      <Button onClick={handleSave} loading={saving} disabled={locked} size="sm" className="w-full"
        leftIcon={saved ? <Check size={14} /> : <Calculator size={14} />}>
        {locked ? "Rules locked" : saved ? "Saved!" : "Save scoring rules"}
      </Button>
    </Card>
  );
}
