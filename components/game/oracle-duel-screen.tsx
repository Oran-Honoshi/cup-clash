"use client";

import { useState, useEffect, useCallback } from "react";
import { Swords, Lock } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { BallLoader } from "@/components/ui/BallLoader";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { ZONES } from "@/lib/zones";
import type { OracleDuelDashboard, OracleDuelHistoryItem } from "@/lib/services/oracle-duels";

const GAME_ACCENT = ZONES.find(z => z.key === "game")!.accent;
const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

function formatMatchDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

type LocaleT = ReturnType<typeof useLocale>["t"];

function resultLabel(item: OracleDuelHistoryItem, t: LocaleT): { text: string; color: string } | null {
  if (!item.resolved || item.pointsUser == null || item.pointsOracle == null) return null;
  if (item.pointsUser > item.pointsOracle) return { text: t("oracle_duel_result_won"), color: "#00c46a" };
  if (item.pointsUser < item.pointsOracle) return { text: t("oracle_duel_result_lost"), color: "#f87171" };
  return { text: t("oracle_duel_result_tied"), color: "var(--t2)" };
}

function HistoryRow({ item }: { item: OracleDuelHistoryItem }) {
  const { t } = useLocale();
  const label = resultLabel(item, t);

  return (
    <div className="p-3 rounded-xl space-y-2" style={{ background: "var(--ip)" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {item.homeFlagCode && <FlagBadge code={item.homeFlagCode} label={item.home} size="sm" />}
          <span className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{item.home} vs {item.away}</span>
          {item.awayFlagCode && <FlagBadge code={item.awayFlagCode} label={item.away} size="sm" />}
        </div>
        <span className="text-[10px] shrink-0" style={{ color: "var(--mt)" }}>{formatMatchDate(item.kickoffAt)}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 text-center" style={{ padding: "6px 4px", borderRadius: 8, background: "var(--sf)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--mt)" }}>
            {t("oracle_teaser_your_pick")}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--tx)" }}>
            {item.userScore.home}-{item.userScore.away}
          </div>
        </div>
        <div
          className="flex-1 text-center"
          style={{ padding: "6px 4px", borderRadius: 8, background: `color-mix(in srgb, ${GAME_ACCENT} 14%, transparent)` }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: GAME_ACCENT }}>
            {t("oracle_teaser_oracle_pick")}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--tx)" }}>
            {item.oracleScore.home}-{item.oracleScore.away}
          </div>
        </div>
        {item.actualScore && (
          <div className="flex-1 text-center" style={{ padding: "6px 4px", borderRadius: 8, background: "var(--sf)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--mt)" }}>
              {t("oracle_game_final_label")}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--tx)" }}>
              {item.actualScore.home}-{item.actualScore.away}
            </div>
          </div>
        )}
      </div>

      {label && (
        <div className="flex items-center justify-between gap-2">
          <span style={{ fontSize: 11, color: "var(--t2)" }}>
            {interpolate(t("oracle_duel_points_you"), { pts: item.pointsUser ?? 0 })}
            {" · "}
            {interpolate(t("oracle_duel_points_oracle"), { pts: item.pointsOracle ?? 0 })}
          </span>
          <span className="text-[11px] font-bold shrink-0" style={{ color: label.color }}>{label.text}</span>
        </div>
      )}
    </div>
  );
}

export function OracleDuelScreen({ signedIn }: { signedIn: boolean }) {
  const { t } = useLocale();
  const [dashboard, setDashboard] = useState<OracleDuelDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [homeInput, setHomeInput] = useState("");
  const [awayInput, setAwayInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!signedIn) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/oracle-duels");
      if (!res.ok) { setDashboard(null); return; }
      const data = (await res.json()) as { dashboard: OracleDuelDashboard };
      setDashboard(data.dashboard);
    } finally {
      setLoading(false);
    }
  }, [signedIn]);

  useEffect(() => { refresh(); }, [refresh]);

  const submit = useCallback(async () => {
    if (!dashboard?.nextChallenge) return;
    const home = parseInt(homeInput, 10);
    const away = parseInt(awayInput, 10);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      setError(t("oracle_duel_locked"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/oracle-duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: dashboard.nextChallenge.match.id, homeScore: home, awayScore: away }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error === "locked" ? t("oracle_duel_locked") : t("oracle_duel_locked"));
        return;
      }
      setHomeInput("");
      setAwayInput("");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }, [dashboard, homeInput, awayInput, refresh, t]);

  if (!signedIn) {
    return (
      <div className="p-5 flex items-center gap-3 cc-elevated" style={surface}>
        <Swords size={22} style={{ color: "var(--ac)" }} />
        <div className="flex-1">
          <div className="text-sm font-black" style={{ color: "var(--tx)" }}>{t("oracle_duel_page_title")}</div>
          <p className="text-xs mt-0.5" style={{ color: "var(--t2)" }}>{t("oracle_duel_sign_in_required")}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="py-10 flex justify-center"><BallLoader size="md" /></div>;
  }

  const totals = dashboard?.totals ?? null;
  const next = dashboard?.nextChallenge ?? null;
  const history = dashboard?.history ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
          {t("oracle_duel_page_title")}
        </h1>
        <p style={{ fontSize: 13, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          {t("oracle_duel_page_subtitle")}
        </p>
      </div>

      <div className="p-5 text-center cc-elevated" style={surface}>
        {totals ? (
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--tx)" }}>
            {interpolate(t("oracle_game_record"), { you: totals.you, oracle: totals.oracle })}
          </span>
        ) : history.length > 0 ? (
          <span style={{ fontSize: 13, color: "var(--t2)" }}>{t("oracle_duel_totals_pending")}</span>
        ) : (
          <span style={{ fontSize: 13, color: "var(--t2)" }}>{t("oracle_duel_history_empty")}</span>
        )}
      </div>

      <div className="p-5 space-y-4 cc-elevated" style={surface}>
        {!next ? (
          <p className="text-xs text-center py-2" style={{ color: "var(--t2)" }}>{t("oracle_duel_no_open_challenge")}</p>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {next.match.homeFlagCode && <FlagBadge code={next.match.homeFlagCode} label={next.match.home} size="sm" />}
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
                {next.match.home} vs {next.match.away}
              </span>
              {next.match.awayFlagCode && <FlagBadge code={next.match.awayFlagCode} label={next.match.away} size="sm" />}
            </div>

            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--t2)", textAlign: "center", margin: 0, fontStyle: "italic" }}>
              {interpolate(t("oracle_duel_prediction_line"), {
                home: next.match.home,
                homeScore: next.prediction.predicted_home_score,
                away: next.match.away,
                awayScore: next.prediction.predicted_away_score,
              })}
            </p>

            {next.existing ? (
              <div className="text-center space-y-1">
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--tx)" }}>
                  {next.existing.home}-{next.existing.away}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs" style={{ color: "var(--t2)" }}>
                  {next.existing.locked && <Lock size={11} />}
                  {t("oracle_duel_already_predicted")}
                </div>
              </div>
            ) : next.existing == null && new Date() >= new Date(new Date(next.match.kickoffAt).getTime() - 5 * 60 * 1000) ? (
              <p className="text-xs text-center" style={{ color: "var(--t2)" }}>{t("oracle_duel_locked")}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <ScoreInputCC value={homeInput} onChange={setHomeInput} disabled={submitting} />
                  <span style={{ fontSize: 20, fontWeight: 800, color: "var(--mt)" }}>–</span>
                  <ScoreInputCC value={awayInput} onChange={setAwayInput} disabled={submitting} />
                </div>
                {error && <p className="text-xs text-center" style={{ color: "#f87171" }}>{error}</p>}
                <button
                  type="button"
                  disabled={submitting || homeInput === "" || awayInput === ""}
                  onClick={submit}
                  className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: GAME_ACCENT, color: "#03110c" }}
                >
                  {submitting ? t("oracle_duel_submitting") : t("oracle_duel_submit_cta")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <span
          style={{
            fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--t2)",
          }}
        >
          {t("oracle_duel_history_heading")}
        </span>
        {history.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>{t("oracle_duel_history_empty")}</p>
        ) : (
          <div className="space-y-2">
            {history.map(item => <HistoryRow key={item.matchId} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
