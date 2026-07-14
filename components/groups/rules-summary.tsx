"use client";

import { Target, Lock } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";

const ENABLE_KEYS: Record<string, string> = {
  correct_outcome: "enable_outcome", exact_score: "enable_exact", ko_advancement: "enable_ko_advancement",
  tournament_winner: "enable_winner", top_scorer: "enable_scorer", top_assister: "enable_assister",
  golden_ball: "enable_golden_ball", best_defence: "enable_best_defence", best_young_player: "enable_best_young_player", best_third: "enable_best_third",
};

const glass = { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.06)" } as const;

const PROGRESSIVE_STAGES = [
  { label: "Group Stage",    coKey: "gs_correct_outcome",    esKey: "gs_exact_score"    },
  { label: "Round of 32",    coKey: "r32_correct_outcome",   esKey: "r32_exact_score"   },
  { label: "Round of 16",    coKey: "r16_correct_outcome",   esKey: "r16_exact_score"   },
  { label: "Quarter Finals", coKey: "qf_correct_outcome",    esKey: "qf_exact_score"    },
  { label: "Semi Finals",    coKey: "sf_correct_outcome",    esKey: "sf_exact_score"    },
  { label: "3rd Place",      coKey: "third_correct_outcome", esKey: "third_exact_score" },
  { label: "Final",          coKey: "final_correct_outcome", esKey: "final_exact_score" },
] as const;

interface RulesSummaryProps {
  rules: Record<string, number | boolean> | null;
}

export function RulesSummary({ rules }: RulesSummaryProps) {
  const { t } = useLocale();

  const SCORING_LABELS: Record<string, string> = {
    correct_outcome:   t("sc_outcome"),
    exact_score:       t("sc_exact"),
    ko_advancement:    t("sc_ko"),
    tournament_winner: t("sc_winner"),
    top_scorer:        t("sc_scorer"),
    top_assister:      t("sc_assister"),
    golden_ball:       t("sc_golden"),
    best_defence:      t("sc_defence"),
    best_young_player: t("sc_young"),
    best_third:        t("sc_third"),
  };

  const scoringRows = Object.entries(SCORING_LABELS).filter(([key]) => {
    const ek = ENABLE_KEYS[key];
    return !ek || rules?.[ek] !== false;
  });

  const progressive = Boolean(rules?.use_progressive_scoring);
  const lockAt = rules?.tournament_lock_at as string | undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={glass}>
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} style={{ color: "#00D4FF" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{t("grp_scoring")}</span>
          <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}><Lock size={10} /> {t("grp_locks")}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {scoringRows.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
              <span className="text-sm font-black" style={{ color: "#00D4FF" }}>+{rules?.[key] as number ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {progressive && (
        <div className="rounded-2xl p-5" style={glass}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            Progressive Stage Scoring
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ textAlign: "left",   padding: "6px 8px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stage</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", color: "#00D4FF",                fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Outcome</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", color: "#00FF88",               fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>+Exact</th>
                </tr>
              </thead>
              <tbody>
                {PROGRESSIVE_STAGES.map(({ label, coKey, esKey }) => (
                  <tr key={label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "6px 8px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: "#00D4FF", fontWeight: 700 }}>{(rules?.[coKey] as number) ?? "—"}</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: "#00FF88", fontWeight: 700 }}>{(rules?.[esKey] as number) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lockAt && (
        <div className="rounded-2xl px-4 py-3 text-xs" style={{ ...glass, color: "rgba(255,255,255,0.5)" }}>
          Tournament picks lock at {new Date(lockAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
