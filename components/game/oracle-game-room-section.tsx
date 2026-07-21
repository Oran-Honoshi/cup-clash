import Link from "next/link";
import type { OracleGameCard } from "@/lib/services/oracle";
import { serverT, interpolate } from "@/lib/server-locale";
import { OracleMatchCard, GAME_ACCENT } from "@/components/game/oracle-match-card";

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

interface OracleGameRoomSectionProps {
  cards: OracleGameCard[];
  record: { you: number; oracle: number } | null;
  hasMore: boolean;
}

// Game Room's "Beat the Oracle" section — mirrors DuelCard's on-read
// computation from a live table (no persisted running-record column here
// either; see getOracleGameRoomData in lib/services/oracle.ts). Capped to
// the 5 most recent Oracle picks; getOracleHistoryData/oracle-history/
// backs the uncapped full-history page linked below.
export function OracleGameRoomSection({ cards, record, hasMore }: OracleGameRoomSectionProps) {
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
            {cards.map(card => <OracleMatchCard key={card.match.id} card={card} t={serverT} />)}
          </div>
        )}

        {record && (
          <div className="text-center" style={{ paddingTop: 10, borderTop: "1px solid var(--br)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--tx)" }}>
              {interpolate(serverT("oracle_game_record"), { you: record.you, oracle: record.oracle })}
            </span>
          </div>
        )}

        {hasMore && (
          <div className="text-center" style={{ paddingTop: 10, borderTop: "1px solid var(--br)" }}>
            <Link
              href="/game/oracle-history"
              className="text-xs font-bold"
              style={{ color: GAME_ACCENT, textDecoration: "none" }}
            >
              {serverT("oracle_game_history_link")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
