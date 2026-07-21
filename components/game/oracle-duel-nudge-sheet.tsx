"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import type { OracleDuelNudgeResult } from "@/lib/nudges/check-oracle-duel";

interface OracleDuelNudgeSheetProps {
  data: OracleDuelNudgeResult;
  onClose: () => void;
}

// Purely presentational — eligibility is resolved once by the nudge
// coordinator (components/nudges/nudge-coordinator.tsx), which also owns the
// once-per-day cap (lib/oracle-duel-nudge-storage.ts). Surfaces today's
// featured Oracle Duel match (ranked server-side by getFeaturedOracleDuelMatch
// — see lib/services/oracle-duels.ts) rather than waiting for the user to
// find Game Room on their own.
export function OracleDuelNudgeSheet({ data, onClose }: OracleDuelNudgeSheetProps) {
  const router = useRouter();
  const { t } = useLocale();
  const { match, prediction } = data;

  return (
    <BottomSheet open onClose={onClose} closeLabel={t("oracle_duel_nudge_dismiss")}>
      <div className="flex items-center gap-2 mb-1">
        <img src="/images/oracle-mascot.png" alt="" width={24} height={24} style={{ borderRadius: "50%", objectFit: "cover" }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>
          {t("oracle_duel_label")}
        </span>
      </div>

      <p className="font-display text-lg font-black leading-snug" style={{ color: "var(--tx)" }}>
        {interpolate(t("oracle_duel_nudge_title"), { home: match.home, away: match.away })}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {match.homeFlagCode && <FlagBadge code={match.homeFlagCode} label={match.home} size="sm" />}
        <span className="text-sm" style={{ color: "var(--t2)" }}>
          {interpolate(t("oracle_duel_nudge_subtitle"), { home: prediction.homeScore, away: prediction.awayScore })}
        </span>
        {match.awayFlagCode && <FlagBadge code={match.awayFlagCode} label={match.away} size="sm" />}
      </div>

      <button
        onClick={() => { onClose(); router.push("/game/oracle-duel"); }}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ac)", color: "var(--at)" }}
      >
        {t("oracle_duel_nudge_cta")} <ArrowRight size={16} />
      </button>
    </BottomSheet>
  );
}
