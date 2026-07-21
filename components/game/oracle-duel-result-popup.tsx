"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Trophy } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import type { LatestResolvedOracleDuel } from "@/lib/services/oracle-duels";

const GOLD = "#D4AF37";

interface OracleDuelResultPopupProps {
  result: LatestResolvedOracleDuel;
  onDismiss: () => void;
}

// Win-celebration modal for Oracle Duel — extracted from the same
// glass-card/spring-animation shell as the orphaned PostMatchPopup
// (components/popups/post-match-popup.tsx), but built for a single
// user-vs-Oracle outcome (win/lose/tie) rather than a group's list of
// per-match winners, so it isn't a drop-in reuse of that component's props.
export function OracleDuelResultPopup({ result, onDismiss }: OracleDuelResultPopupProps) {
  const router = useRouter();
  const { t } = useLocale();

  const won = result.pointsUser > result.pointsOracle;
  const lost = result.pointsUser < result.pointsOracle;
  const outcomeColor = won ? "#00c46a" : lost ? "#f87171" : "var(--t2)";
  const outcomeTitle = won ? t("oracle_duel_celebrate_win") : lost ? t("oracle_duel_celebrate_lose") : t("oracle_duel_celebrate_tie");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onDismiss}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 40 }}
        transition={{ type: "spring", damping: 20, stiffness: 260 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
      >
        <div
          className="rounded-3xl p-6 max-w-sm w-full pointer-events-auto relative overflow-hidden"
          style={{ background: "var(--sf)", border: "1px solid var(--br)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: won ? `linear-gradient(90deg, ${GOLD}, #F5E06E)` : "linear-gradient(90deg, var(--ac), var(--ac2, var(--ac)))" }}
          />

          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center"
            style={{ color: "var(--t2)" }}
          >
            <X size={16} />
          </button>

          <div className="text-center mb-5">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--t2)" }}>
              {t("oracle_duel_celebrate_result_label")}
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
              {result.homeFlagCode && <FlagBadge code={result.homeFlagCode} label={result.home} size="sm" />}
              <span className="font-display text-sm uppercase font-bold" style={{ color: "var(--tx)" }}>{result.home}</span>
              <span className="font-display text-2xl font-black px-1" style={{ color: "var(--tx)" }}>
                {result.actualScore.home}–{result.actualScore.away}
              </span>
              <span className="font-display text-sm uppercase font-bold" style={{ color: "var(--tx)" }}>{result.away}</span>
              {result.awayFlagCode && <FlagBadge code={result.awayFlagCode} label={result.away} size="sm" />}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {won && <Trophy size={18} style={{ color: GOLD }} />}
            <span className="font-display text-lg uppercase font-black" style={{ color: outcomeColor }}>
              {outcomeTitle}
            </span>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--ip)" }}>
              <div>
                <div className="text-sm font-bold" style={{ color: "var(--tx)" }}>{t("oracle_duel_celebrate_you")}</div>
                <div className="text-xs" style={{ color: "var(--t2)" }}>
                  {interpolate(t("oracle_duel_celebrate_pick"), { home: result.userScore.home, away: result.userScore.away })}
                </div>
              </div>
              <div className="font-display text-2xl font-black" style={{ color: outcomeColor }}>+{result.pointsUser}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--ip)" }}>
              <div>
                <div className="text-sm font-bold" style={{ color: "var(--tx)" }}>{t("oracle_duel_label")}</div>
                <div className="text-xs" style={{ color: "var(--t2)" }}>
                  {interpolate(t("oracle_duel_celebrate_pick"), { home: result.oracleScore.home, away: result.oracleScore.away })}
                </div>
              </div>
              <div className="font-display text-2xl font-black" style={{ color: "var(--t2)" }}>+{result.pointsOracle}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onDismiss(); router.push("/game/oracle-duel"); }}
            className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
            style={{ background: "var(--ac)", color: "#03110c" }}
          >
            {t("oracle_duel_celebrate_cta")}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
