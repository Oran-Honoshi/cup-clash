"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useLocale } from "@/components/i18n/locale-provider";
import { setNudgeOptedOut } from "@/lib/pick-follows-nudge-storage";

interface PickFollowsNudgeSheetProps {
  onClose: () => void;
}

// Purely presentational — eligibility (no follows yet, via
// /api/pick-follows/check) is resolved once by the nudge coordinator
// (components/nudges/nudge-coordinator.tsx), which is gated to /home there
// and owns the once-per-day cap (lib/pick-follows-nudge-storage.ts).
// Recurring companion to MyTeamsSection's always-visible "Pick your teams"
// empty-state card — that card is passive, this is the prominent once-daily
// nudge.
export function PickFollowsNudgeSheet({ onClose }: PickFollowsNudgeSheetProps) {
  const router = useRouter();
  const { t } = useLocale();

  const dontAskAgain = () => {
    setNudgeOptedOut();
    onClose();
  };

  return (
    <BottomSheet open onClose={onClose} closeLabel={t("pyf_close")}>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0 rounded-xl"
          style={{ width: 40, height: 40, background: "var(--ip)", color: "var(--ac)" }}
        >
          <Shield size={18} />
        </div>
        <p className="font-display text-lg font-black leading-snug" style={{ color: "var(--tx)" }}>
          {t("pyf_title")}
        </p>
      </div>

      <p className="text-sm" style={{ color: "var(--t2)" }}>
        {t("pyf_subtitle")}
      </p>

      <button
        onClick={() => { onClose(); router.push("/leagues?tab=teams"); }}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ac)", color: "var(--at)" }}
      >
        {t("pyf_cta")} <ArrowRight size={16} />
      </button>

      <button
        onClick={dontAskAgain}
        className="w-full text-center text-xs font-bold py-1"
        style={{ color: "var(--mt)" }}
      >
        {t("pyf_dont_ask_again")}
      </button>
    </BottomSheet>
  );
}
