"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  wasNudgeShownToday,
  markNudgeShownToday,
  isNudgeOptedOut,
  setNudgeOptedOut,
} from "@/lib/pick-follows-nudge-storage";

interface PickFollowsNudgeSheetProps {
  /** Server-computed getFollowCount() > 0 for the signed-in viewer — re-evaluated on every Home load. */
  hasFollows: boolean;
}

// Recurring companion to MyTeamsSection's always-visible "Pick your teams"
// empty-state card — that card is passive, this is the prominent once-daily
// nudge. Home is force-dynamic, so `hasFollows` is re-checked server-side on
// every visit; once true this stops rendering entirely, no client polling needed.
export function PickFollowsNudgeSheet({ hasFollows }: PickFollowsNudgeSheetProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (hasFollows) return;
    if (firedRef.current) return;
    firedRef.current = true;
    if (isNudgeOptedOut()) return;
    if (wasNudgeShownToday()) return;
    markNudgeShownToday();
    setOpen(true);
  }, [hasFollows]);

  if (hasFollows) return null;

  const close = () => setOpen(false);
  const dontAskAgain = () => {
    setNudgeOptedOut();
    setOpen(false);
  };

  return (
    <BottomSheet open={open} onClose={close} closeLabel={t("pyf_close")}>
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
        onClick={() => { close(); router.push("/leagues?tab=teams"); }}
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
