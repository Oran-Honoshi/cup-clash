import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { OracleMatchInfo, OraclePredictionRow } from "@/lib/services/oracle";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ZONES } from "@/lib/zones";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";
import { serverT, interpolate } from "@/lib/server-locale";

const HOME_ACCENT = ZONES.find(z => z.key === "home")!.accent;

interface OracleTeaserProps {
  match: OracleMatchInfo;
  prediction: OraclePredictionRow;
  userPrediction: { homeScore: number; awayScore: number } | null;
}

// Home digest teaser for the Oracle predictions feature — mirrors the visual
// convention of daily-challenge-teaser.tsx/group-nudge-card.tsx (full-card
// Link/surface, zone-accent-tinted icon tile) but taller, since it needs to
// carry a score comparison and a reasoning blurb.
export function OracleTeaser({ match, prediction, userPrediction }: OracleTeaserProps) {
  return (
    <div
      className={`rounded-xl ${zoneFontVars}`}
      style={{ padding: 14, background: "var(--sf)", border: "1px solid var(--br)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
        <img
          src="/images/oracle-mascot.png"
          alt=""
          width={28}
          height={28}
          style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--br)" }}
        />
        <span
          style={{
            fontFamily: "var(--font-zone-body)", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", color: HOME_ACCENT,
          }}
        >
          {serverT("oracle_teaser_eyebrow")}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 10 }}>
        {match.homeFlagCode && <FlagBadge code={match.homeFlagCode} label={match.home} size="sm" />}
        <span style={{ fontFamily: "var(--font-zone-display)", fontSize: 15, fontWeight: 700, color: "var(--tx)" }}>
          {match.home} vs {match.away}
        </span>
        {match.awayFlagCode && <FlagBadge code={match.awayFlagCode} label={match.away} size="sm" />}
      </div>

      {userPrediction ? (
        <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
          <div className="flex-1 text-center" style={{ padding: "8px 6px", borderRadius: 10, background: "var(--ip)" }}>
            <div style={{ fontFamily: "var(--font-zone-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--mt)" }}>
              {serverT("oracle_teaser_your_pick")}
            </div>
            <div style={{ fontFamily: "var(--font-zone-display)", fontSize: 20, fontWeight: 800, color: "var(--tx)", marginTop: 2 }}>
              {userPrediction.homeScore}-{userPrediction.awayScore}
            </div>
          </div>
          <div
            className="flex-1 text-center"
            style={{ padding: "8px 6px", borderRadius: 10, background: `color-mix(in srgb, ${HOME_ACCENT} 14%, transparent)` }}
          >
            <div style={{ fontFamily: "var(--font-zone-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: HOME_ACCENT }}>
              {serverT("oracle_teaser_oracle_pick")}
            </div>
            <div style={{ fontFamily: "var(--font-zone-display)", fontSize: 20, fontWeight: 800, color: "var(--tx)", marginTop: 2 }}>
              {prediction.predicted_home_score}-{prediction.predicted_away_score}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--font-zone-display)", fontSize: 24, fontWeight: 800, color: HOME_ACCENT }}>
            {prediction.predicted_home_score}-{prediction.predicted_away_score}
          </div>
          <div style={{ fontFamily: "var(--font-zone-body)", fontSize: 11, color: "var(--mt)", marginTop: 2 }}>
            {interpolate(serverT("oracle_confidence"), { pct: prediction.confidence_pct })}
          </div>
        </div>
      )}

      <p style={{ fontFamily: "var(--font-zone-body)", fontSize: 12, color: "var(--t2)", fontStyle: "italic", margin: 0, lineHeight: 1.4 }}>
        <span style={{ fontWeight: 700, fontStyle: "normal", color: "var(--tx)" }}>{serverT("oracle_says_prefix")} </span>
        &ldquo;{prediction.reasoning_blurb}&rdquo;
      </p>

      {!userPrediction && (
        <Link
          href="/predictions"
          className="flex items-center gap-1"
          style={{
            marginTop: 12, fontFamily: "var(--font-zone-body)", fontSize: 13,
            fontWeight: 700, color: HOME_ACCENT, textDecoration: "none",
          }}
        >
          {serverT("oracle_teaser_cta")} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
