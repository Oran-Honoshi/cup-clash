"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Newspaper } from "lucide-react";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Chip } from "@/components/ui/chip";
import type { ReengagementResult } from "@/lib/nudges/check-reengagement";

interface ReengagementSheetProps {
  data: ReengagementResult;
  onClose: () => void;
}

// Purely presentational — eligibility is resolved once by the nudge
// coordinator (components/nudges/nudge-coordinator.tsx), which also owns the
// shown-today cap (lib/reengagement-storage.ts). This component only renders
// the winning result and handles its own CTAs.
export function ReengagementSheet({ data, onClose }: ReengagementSheetProps) {
  const router = useRouter();
  const { t } = useLocale();

  const goToLeaderboard = (groupId: string) => {
    onClose();
    router.push(`/groups/${groupId}?tab=leaderboard`);
  };

  if (data.kind === "group-member") {
    const single = data.groups.length === 1;
    const first = data.groups[0];
    const title = single
      ? interpolate(t("reeng_title_single"), { match: data.matchLabel, rank: first.rank, group: first.groupName })
      : interpolate(t("reeng_title_multi"), { match: data.matchLabel });

    return (
      <BottomSheet open onClose={onClose} closeLabel={t("reeng_close")}>
        <p className="font-display text-lg font-black leading-snug" style={{ color: "var(--tx)" }}>
          {title}
        </p>

        {single ? (
          <button
            onClick={() => goToLeaderboard(first.groupId)}
            className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: "var(--ac)", color: "var(--at)" }}
          >
            {t("reeng_cta_take_me_there")} <ArrowRight size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {data.groups.map(g => (
              <button key={g.groupId} onClick={() => goToLeaderboard(g.groupId)}>
                <Chip label={`${g.groupName} · #${g.rank}`} color="#00D4FF" />
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open onClose={onClose} closeLabel={t("reeng_close")}>
      <button
        onClick={() => { onClose(); router.push("/daily-challenge"); }}
        className="w-full flex items-center justify-between gap-3 py-3.5 px-4 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ip)", color: "var(--tx)" }}
      >
        <span className="flex items-center gap-2"><Sparkles size={16} style={{ color: "var(--ac)" }} /> {t("reeng_anon_guess_cta")}</span>
        <ArrowRight size={16} />
      </button>
      <button
        onClick={() => { onClose(); router.push(data.hasFollows ? "/news?feed=following" : "/leagues"); }}
        className="w-full flex items-center justify-between gap-3 py-3.5 px-4 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ip)", color: "var(--tx)" }}
      >
        <span className="flex items-center gap-2"><Newspaper size={16} style={{ color: "var(--ac)" }} /> {t("reeng_anon_news_cta")}</span>
        <ArrowRight size={16} />
      </button>
    </BottomSheet>
  );
}
