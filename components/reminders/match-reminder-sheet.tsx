"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { wasMatchReminderShown, markMatchReminderShown } from "@/lib/match-reminder-storage";

type PendingMatchReminder = {
  matchId: string;
  tier: "24h" | "1h";
  home: string;
  away: string;
  kickoffAt: string;
  missingGroupCount: number;
};

// Mounted once in app/(app)/layout.tsx, alongside the other self-fetching
// app-shell sheets. Fetches once per mount ("shown on next app open"),
// filters out anything already seen (localStorage, per match+tier — see
// lib/match-reminder-storage.ts), then shows the remaining ones as a queue,
// one BottomSheet at a time.
export function MatchReminderSheet() {
  const router = useRouter();
  const { t } = useLocale();
  const [queue, setQueue] = useState<PendingMatchReminder[]>([]);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    (async () => {
      const res = await fetch("/api/reminders/match-check", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as { reminders: PendingMatchReminder[] };
      const unseen = data.reminders.filter(r => !wasMatchReminderShown(r.matchId, r.tier));
      if (unseen.length) setQueue(unseen);
    })();
  }, []);

  if (!queue.length) return null;
  const current = queue[0];

  const dismiss = () => {
    markMatchReminderShown(current.matchId, current.tier);
    setQueue(q => q.slice(1));
  };

  const goPredict = () => {
    dismiss();
    router.push("/predictions");
  };

  const title = interpolate(
    current.tier === "24h" ? t("mr_title_24h") : t("mr_title_1h"),
    { home: current.home, away: current.away }
  );
  const subtitle = current.missingGroupCount > 1
    ? interpolate(t("mr_subtitle_multi"), { count: current.missingGroupCount })
    : t("mr_subtitle_single");

  return (
    <BottomSheet open onClose={dismiss} closeLabel={t("mr_dismiss")}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,212,255,0.12)" }}>
          <Clock size={20} style={{ color: "#00D4FF" }} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-black leading-snug" style={{ color: "var(--tx)" }}>
            {title}
          </p>
          <p className="ta-meta mt-0.5">{subtitle}</p>
        </div>
      </div>

      <button
        onClick={goPredict}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ac)", color: "var(--at)" }}
      >
        {t("mr_cta_predict")} <ArrowRight size={16} />
      </button>
    </BottomSheet>
  );
}
