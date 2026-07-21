"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { OracleMatchCard, GAME_ACCENT } from "@/components/game/oracle-match-card";
import type { OracleGameCard } from "@/lib/services/oracle";

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

type Filter = "mine" | "all";

export function OracleHistoryClient({ cards, signedIn }: { cards: OracleGameCard[]; signedIn: boolean }) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<Filter>(signedIn ? "mine" : "all");

  const filtered = useMemo(
    () => (filter === "mine" ? cards.filter(c => c.userPick !== null) : cards),
    [cards, filter]
  );

  return (
    <div className="space-y-3">
      {signedIn && (
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--ip)" }}>
          {(["mine", "all"] as Filter[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors"
              style={{
                background: filter === f ? GAME_ACCENT : "transparent",
                color: filter === f ? "#03110c" : "var(--t2)",
              }}
            >
              {f === "mine" ? t("oracle_history_filter_mine") : t("oracle_history_filter_all")}
            </button>
          ))}
        </div>
      )}

      <div className="p-5 space-y-2" style={surface}>
        {filtered.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>{t("oracle_history_filter_empty")}</p>
        ) : (
          filtered.map(card => <OracleMatchCard key={card.match.id} card={card} t={t} />)
        )}
      </div>
    </div>
  );
}
