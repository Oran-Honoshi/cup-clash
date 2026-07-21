import type { OracleGameCard } from "@/lib/services/oracle";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ZONES } from "@/lib/zones";
import { interpolate, type Translations } from "@/lib/i18n";

export const GAME_ACCENT = ZONES.find(z => z.key === "game")!.accent;

export type Translator = (key: keyof Translations) => string;

export function formatOracleMatchDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function closerLabel(closer: OracleGameCard["closer"], t: Translator): { text: string; color: string } | null {
  if (closer === "user") return { text: t("oracle_game_closer_you"), color: "#00c46a" };
  if (closer === "oracle") return { text: t("oracle_game_closer_oracle"), color: GAME_ACCENT };
  if (closer === "tie") return { text: t("oracle_game_closer_tie"), color: "var(--t2)" };
  if (closer === "no_pick") return { text: t("oracle_game_closer_no_pick"), color: "var(--mt)" };
  return null;
}

// No server-only imports here (deliberately not lib/server-locale) — this
// exact markup is shared by the server-rendered Game Room section and the
// client-rendered oracle-history filter page, and a next/headers import
// anywhere in this file's tree breaks the client bundle for the latter.
export function OracleMatchCard({ card, t }: { card: OracleGameCard; t: Translator }) {
  const { match, prediction, stats, userPick, closer } = card;
  const isFinished = match.status === "finished";
  const label = closerLabel(closer, t);

  return (
    <div className="p-3 rounded-xl space-y-2" style={{ background: "var(--ip)" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {match.homeFlagCode && <FlagBadge code={match.homeFlagCode} label={match.home} size="sm" />}
          <span className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{match.home} vs {match.away}</span>
          {match.awayFlagCode && <FlagBadge code={match.awayFlagCode} label={match.away} size="sm" />}
        </div>
        <span className="text-[10px] shrink-0" style={{ color: "var(--mt)" }}>{formatOracleMatchDate(match.kickoffAt)}</span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex-1 text-center"
          style={{ padding: "6px 4px", borderRadius: 8, background: `color-mix(in srgb, ${GAME_ACCENT} 14%, transparent)` }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: GAME_ACCENT }}>
            {t("oracle_teaser_oracle_pick")}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
            {prediction.predicted_home_score}-{prediction.predicted_away_score}
          </div>
        </div>

        {isFinished ? (
          <div className="flex-1 text-center" style={{ padding: "6px 4px", borderRadius: 8, background: "var(--sf)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--mt)" }}>
              {t("oracle_game_final_label")}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
              {match.homeScoreET ?? match.homeScore}-{match.awayScoreET ?? match.awayScore}
            </div>
          </div>
        ) : userPick ? (
          <div className="flex-1 text-center" style={{ padding: "6px 4px", borderRadius: 8, background: "var(--sf)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--mt)" }}>
              {t("oracle_teaser_your_pick")}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
              {userPick.homeScore}-{userPick.awayScore}
            </div>
          </div>
        ) : (
          <div className="flex-1 text-center" style={{ padding: "6px 4px", color: "var(--mt)", fontSize: 11 }}>
            {interpolate(t("oracle_confidence"), { pct: prediction.confidence_pct })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Per-match agree/disagree tally, from getOracleAgreementStats() — how many
            *other* users' group_predictions match the Oracle's pick for this one match.
            Distinct from OracleGameRoomSection's `record` (the running Beat-the-Oracle
            tally across all matches) and from OracleDuelInviteCard (a separate
            standalone user-vs-Oracle duel keyed off the oracle_duels table). */}
        <span style={{ fontSize: 11, color: "var(--t2)" }}>
          {stats.total > 0
            ? interpolate(t("oracle_game_agree_stats"), { agree: stats.agree, disagree: stats.disagree })
            : t("oracle_game_no_predictions")}
        </span>
        {label && <span className="text-[11px] font-bold shrink-0" style={{ color: label.color }}>{label.text}</span>}
      </div>
    </div>
  );
}
