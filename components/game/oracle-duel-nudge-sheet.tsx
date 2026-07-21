"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { wasNudgeShownToday, markNudgeShownToday } from "@/lib/oracle-duel-nudge-storage";
import type { NudgeResponse } from "@/app/api/oracle-duels/nudge/route";

// Mounted once in app/(app)/layout.tsx alongside ReengagementSheet — same
// "fetch its own eligibility on mount" pattern, own once-per-day cap
// (lib/oracle-duel-nudge-storage.ts) so it doesn't compete with or get
// suppressed by the unrelated reengagement cap. Proactively surfaces
// today's featured Oracle Duel match (ranked server-side by
// getFeaturedOracleDuelMatch — see lib/services/oracle-duels.ts) rather
// than waiting for the user to find Game Room on their own.
export function OracleDuelNudgeSheet() {
  const router = useRouter();
  const { t } = useLocale();
  const [data, setData] = useState<NudgeResponse | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (wasNudgeShownToday()) return;

    (async () => {
      const res = await fetch("/api/oracle-duels/nudge", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as NudgeResponse;
      if (!body.eligible) return;
      markNudgeShownToday();
      setData(body);
    })();
  }, []);

  if (!data?.eligible) return null;
  const { match, prediction } = data;

  const close = () => setData(null);

  return (
    <BottomSheet open onClose={close} closeLabel={t("oracle_duel_nudge_dismiss")}>
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
        onClick={() => { close(); router.push("/game/oracle-duel"); }}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ac)", color: "var(--at)" }}
      >
        {t("oracle_duel_nudge_cta")} <ArrowRight size={16} />
      </button>
    </BottomSheet>
  );
}
