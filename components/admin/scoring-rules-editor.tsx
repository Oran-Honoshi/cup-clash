"use client";

import { useState } from "react";
import { Check, AlertCircle, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_SCORING_RULES, type ScoringRules } from "@/lib/testing/data";
import { cn } from "@/lib/utils";

// 104 total matches in WC 2026:
// 60 group stage + 16 R32 + 8 R16 + 4 QF + 2 SF + 1 3rd + 1 Final
const MATCH_COUNTS = {
  group:  60,
  r32:    16,
  r16:    8,
  qf:     4,
  sf:     2,
  other:  2, // 3rd place + final
};
const TOTAL_MATCHES = Object.values(MATCH_COUNTS).reduce((a, b) => a + b, 0);

interface ScoringRulesEditorProps {
  groupId: string;
}

interface EnabledFeatures {
  matchOutcome:    boolean;
  exactScore:      boolean;
  tournamentWinner: boolean;
  topScorer:       boolean;
  topAssister:     boolean;
}

export function ScoringRulesEditor({ groupId }: ScoringRulesEditorProps) {
  const [rules, setRules] = useState<ScoringRules>(DEFAULT_SCORING_RULES);
  const [enabled, setEnabled] = useState<EnabledFeatures>({
    matchOutcome:    true,
    exactScore:      true,
    tournamentWinner: true,
    topScorer:       true,
    topAssister:     true,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // Total possible points calculation
  const maxMatchPoints =
    (enabled.matchOutcome ? 0 : 0) + // outcome is included in exact
    (enabled.exactScore   ? rules.exactScore * TOTAL_MATCHES : 0) +
    (enabled.matchOutcome && !enabled.exactScore ? rules.correctOutcome * TOTAL_MATCHES : 0);

  const maxMatchPointsDisplay = enabled.exactScore
    ? rules.exactScore * TOTAL_MATCHES
    : enabled.matchOutcome
    ? rules.correctOutcome * TOTAL_MATCHES
    : 0;

  const maxTournamentPoints =
    (enabled.tournamentWinner ? rules.tournamentWinner : 0) +
    (enabled.topScorer        ? rules.topScorer        : 0) +
    (enabled.topAssister      ? rules.topAssister       : 0);

  const maxTotalPoints = maxMatchPointsDisplay + maxTournamentPoints;

  const updateRule = (key: keyof ScoringRules, value: number) => {
    setRules((r) => ({ ...r, [key]: value }));
    setSaved(false);
  };

  const toggleFeature = (key: keyof EnabledFeatures) => {
    setEnabled((e) => ({ ...e, [key]: !e[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    // TODO: save to Supabase scoring_rules table when schema is extended
    // For now, simulate a save
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const POINT_RULES: Array<{
    key: keyof ScoringRules;
    featureKey: keyof EnabledFeatures;
    label: string;
    desc: string;
    per: string;
  }> = [
    { key: "correctOutcome",   featureKey: "matchOutcome",     label: "Correct outcome",    desc: "W/D/L correct",              per: "per match" },
    { key: "exactScore",       featureKey: "exactScore",       label: "Exact score",        desc: "Exact scoreline e.g. 2-1",   per: "per match" },
    { key: "tournamentWinner", featureKey: "tournamentWinner", label: "Tournament winner",  desc: "Pre-tournament pick",        per: "one-time"  },
    { key: "topScorer",        featureKey: "topScorer",        label: "Top scorer",         desc: "Pre-tournament pick",        per: "one-time"  },
    { key: "topAssister",      featureKey: "topAssister",      label: "Top assister",       desc: "Pre-tournament pick",        per: "one-time"  },
  ];

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center gap-2.5 mb-6">
        <Calculator size={18} style={{ color: "rgb(var(--accent-glow))" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">
          Scoring Rules
        </span>
        <span className="ml-auto text-[10px] text-pitch-500 uppercase tracking-widest">
          Locks at tournament start
        </span>
      </div>

      {/* Rules table */}
      <div className="space-y-3 mb-6">
        {POINT_RULES.map(({ key, featureKey, label, desc, per }) => {
          const isEnabled = enabled[featureKey];
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                isEnabled
                  ? "border-white/[0.08] bg-white/[0.02]"
                  : "border-white/[0.04] bg-white/[0.01] opacity-50"
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleFeature(featureKey)}
                className={cn(
                  "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                  isEnabled
                    ? "border-accent bg-accent/20"
                    : "border-white/20 bg-transparent"
                )}
                style={isEnabled ? { borderColor: "rgb(var(--accent))" } : undefined}
              >
                {isEnabled && <Check size={12} style={{ color: "rgb(var(--accent-glow))" }} />}
              </button>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{label}</div>
                <div className="text-[11px] text-pitch-500">{desc} · {per}</div>
              </div>

              {/* Points input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={rules[key]}
                  disabled={!isEnabled}
                  onChange={(e) => updateRule(key, Number(e.target.value))}
                  className="w-16 rounded-lg px-2 py-1.5 text-sm text-white text-center bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent disabled:opacity-30"
                />
                <span className="text-xs text-pitch-500">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Max points calculator */}
      <div className="glass rounded-xl p-4 mb-5">
        <div className="label-caps mb-3 flex items-center gap-1.5">
          <Calculator size={12} />
          Maximum possible points
        </div>
        <div className="space-y-2 text-sm">
          {enabled.exactScore && (
            <div className="flex justify-between text-pitch-300">
              <span>Exact scores ({TOTAL_MATCHES} matches × {rules.exactScore}pts)</span>
              <span className="font-bold text-white">{rules.exactScore * TOTAL_MATCHES}</span>
            </div>
          )}
          {enabled.matchOutcome && !enabled.exactScore && (
            <div className="flex justify-between text-pitch-300">
              <span>Correct outcomes ({TOTAL_MATCHES} matches × {rules.correctOutcome}pts)</span>
              <span className="font-bold text-white">{rules.correctOutcome * TOTAL_MATCHES}</span>
            </div>
          )}
          {enabled.tournamentWinner && (
            <div className="flex justify-between text-pitch-300">
              <span>Tournament winner</span>
              <span className="font-bold text-white">{rules.tournamentWinner}</span>
            </div>
          )}
          {enabled.topScorer && (
            <div className="flex justify-between text-pitch-300">
              <span>Top scorer</span>
              <span className="font-bold text-white">{rules.topScorer}</span>
            </div>
          )}
          {enabled.topAssister && (
            <div className="flex justify-between text-pitch-300">
              <span>Top assister</span>
              <span className="font-bold text-white">{rules.topAssister}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-white/[0.06]">
            <span className="font-bold text-white">Total maximum</span>
            <span
              className="font-display text-2xl"
              style={{ color: "rgb(var(--accent-glow))" }}
            >
              {maxTotalPoints}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-danger mb-3">
          <AlertCircle size={13} />{error}
        </div>
      )}

      <Button
        onClick={handleSave}
        loading={saving}
        size="sm"
        className="w-full"
        leftIcon={saved ? <Check size={14} /> : <Calculator size={14} />}
      >
        {saved ? "Rules saved!" : "Save scoring rules"}
      </Button>

      <p className="mt-3 text-[11px] text-pitch-500 text-center">
        Rules lock when the first match kicks off. Changes after that won't affect existing predictions.
      </p>
    </Card>
  );
}
