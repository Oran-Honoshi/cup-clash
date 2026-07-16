import type { OracleGameCard } from "@/lib/services/oracle";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ZONES } from "@/lib/zones";
import { serverT, interpolate } from "@/lib/server-locale";

const GAME_ACCENT = ZONES.find(z => z.key === "game")!.accent;
const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function closerLabel(closer: OracleGameCard["closer"]): { text: string; color: string } | null {
  if (closer === "user") return { text: serverT("oracle_game_closer_you"), color: "#00c46a" };
  if (closer === "oracle") return { text: serverT("oracle_game_closer_oracle"), color: GAME_ACCENT };
  if (closer === "tie") return { text: serverT("oracle_game_closer_tie"), color: "var(--t2)" };
  if (closer === "no_pick") return { text: serverT("oracle_game_closer_no_pick"), color: "var(--mt)" };
  return null;
}

function OracleMatchCard({ card }: { card: OracleGameCard }) {
  const { match, prediction, stats, userPick, closer } = card;
  const isFinished = match.status === "finished";
  const label = closerLabel(closer);

  return (
    <div className="p-3 rounded-xl space-y-2" style={{ background: "var(--ip)" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {match.homeFlagCode && <FlagBadge code={match.homeFlagCode} label={match.home} size="sm" />}
          <span className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{match.home} vs {match.away}</span>
          {match.awayFlagCode && <FlagBadge code={match.awayFlagCode} label={match.away} size="sm" />}
        </div>
        <span className="text-[10px] shrink-0" style={{ color: "var(--mt)" }}>{formatMatchDate(match.kickoffAt)}</span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex-1 text-center"
          style={{ padding: "6px 4px", borderRadius: 8, background: `color-mix(in srgb, ${GAME_ACCENT} 14%, transparent)` }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: GAME_ACCENT }}>
            {serverT("oracle_teaser_oracle_pick")}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
            {prediction.predicted_home_score}-{prediction.predicted_away_score}
          </div>
        </div>

        {isFinished ? (
          <div className="flex-1 text-center" style={{ padding: "6px 4px", borderRadius: 8, background: "var(--sf)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--mt)" }}>
              {serverT("oracle_game_final_label")}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
              {match.homeScoreET ?? match.homeScore}-{match.awayScoreET ?? match.awayScore}
            </div>
          </div>
        ) : userPick ? (
          <div className="flex-1 text-center" style={{ padding: "6px 4px", borderRadius: 8, background: "var(--sf)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--mt)" }}>
              {serverT("oracle_teaser_your_pick")}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
              {userPick.homeScore}-{userPick.awayScore}
            </div>
          </div>
        ) : (
          <div className="flex-1 text-center" style={{ padding: "6px 4px", color: "var(--mt)", fontSize: 11 }}>
            {interpolate(serverT("oracle_confidence"), { pct: prediction.confidence_pct })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span style={{ fontSize: 11, color: "var(--t2)" }}>
          {stats.total > 0
            ? interpolate(serverT("oracle_game_agree_stats"), { agree: stats.agree, disagree: stats.disagree })
            : serverT("oracle_game_no_predictions")}
        </span>
        {label && <span className="text-[11px] font-bold shrink-0" style={{ color: label.color }}>{label.text}</span>}
      </div>
    </div>
  );
}

interface OracleGameRoomSectionProps {
  cards: OracleGameCard[];
  record: { you: number; oracle: number } | null;
}

// Game Room's "Beat the Oracle" section — mirrors DuelCard's on-read
// computation from a live table (no persisted running-record column here
// either; see getOracleGameRoomData in lib/services/oracle.ts).
export function OracleGameRoomSection({ cards, record }: OracleGameRoomSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <img
          src="/images/oracle-mascot.png"
          alt=""
          width={24}
          height={24}
          style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--br)" }}
        />
        <span
          style={{
            fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--t2)",
          }}
        >
          {serverT("oracle_game_heading")}
        </span>
      </div>

      <div className="p-5 space-y-3" style={surface}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--t2)", margin: 0 }}>
          {serverT("oracle_game_subtitle")}
        </p>

        {cards.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>{serverT("oracle_game_empty")}</p>
        ) : (
          <div className="space-y-2">
            {cards.map(card => <OracleMatchCard key={card.match.id} card={card} />)}
          </div>
        )}

        {record && (
          <div className="text-center" style={{ paddingTop: 10, borderTop: "1px solid var(--br)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--tx)" }}>
              {interpolate(serverT("oracle_game_record"), { you: record.you, oracle: record.oracle })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
