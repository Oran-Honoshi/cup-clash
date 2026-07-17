import Link from "next/link";
import type { OracleMatchInfo, OraclePredictionRow } from "@/lib/services/oracle";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ZONES } from "@/lib/zones";
import { serverT, interpolate } from "@/lib/server-locale";

const GAME_ACCENT = ZONES.find(z => z.key === "game")!.accent;
const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

interface OracleDuelInviteCardProps {
  match: OracleMatchInfo | null;
  prediction: OraclePredictionRow | null;
  existing: { home: number; away: number } | null;
  signedIn: boolean;
}

// Game Room entry point for Oracle Duel — a standalone head-to-head
// prediction against the Oracle, distinct from the "Beat the Oracle"
// section below it (which compares the Oracle to a user's group picks).
// Mirrors DuelCard's anonymous-vs-signed-in split: anonymous visitors get a
// static sign-in prompt, never a live link, since the duel is keyed by
// user_id with no anonymous path.
export function OracleDuelInviteCard({ match, prediction, existing, signedIn }: OracleDuelInviteCardProps) {
  if (!match || !prediction) return null;

  if (!signedIn) {
    return (
      <div className="p-5 flex items-center gap-3 cc-elevated" style={surface}>
        <img
          src="/images/oracle-mascot.png"
          alt=""
          width={32}
          height={32}
          style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--br)" }}
        />
        <div className="flex-1">
          <div className="text-sm font-black" style={{ color: "var(--tx)" }}>{serverT("oracle_duel_label")}</div>
          <p className="text-xs mt-0.5" style={{ color: "var(--t2)" }}>{serverT("oracle_duel_sign_in_required")}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/game/oracle-duel"
      className="block p-5 space-y-3 cc-elevated transition-transform hover:-translate-y-0.5"
      style={{ ...surface, textDecoration: "none" }}
    >
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
          {serverT("oracle_duel_card_eyebrow")}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {match.homeFlagCode && <FlagBadge code={match.homeFlagCode} label={match.home} size="sm" />}
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--tx)" }}>
          {match.home} vs {match.away}
        </span>
        {match.awayFlagCode && <FlagBadge code={match.awayFlagCode} label={match.away} size="sm" />}
      </div>

      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--t2)", margin: 0, lineHeight: 1.4 }}>
        <span style={{ fontStyle: "italic" }}>
          {interpolate(serverT("oracle_duel_prediction_line"), {
            home: match.home,
            homeScore: prediction.predicted_home_score,
            away: match.away,
            awayScore: prediction.predicted_away_score,
          })}
        </span>{" "}
        {serverT("oracle_duel_cta_question")}
      </p>

      <div
        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold"
        style={{ background: GAME_ACCENT, color: "#03110c" }}
      >
        {existing ? serverT("oracle_duel_view_your_pick") : serverT("oracle_duel_cta")}
      </div>
    </Link>
  );
}
