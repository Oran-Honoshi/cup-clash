"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, ArrowRight } from "lucide-react";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";

type IncompleteTournamentGroup = {
  groupId:   string;
  groupName: string;
  missing:   Array<"winner" | "top_scorer" | "top_assister">;
};

interface Props {
  // Omit to show a nag aggregating every group with incomplete picks (Home).
  // Pass to scope the nag to one group only (that group's Predictions
  // sub-sector) — works for both the country picker (World Cup) and the
  // club-team picker (league-format groups like Premier League) since the
  // completeness check itself is picker-agnostic (just checks pred_type rows).
  groupId?: string;
}

// Persistent — no dismiss control. Reappears every time this mounts until
// the user completes winner/top-scorer/top-assister picks (whichever are
// enabled for that group) or the group's tournament picks lock (5 min
// before its own first match — see getEffectiveTournamentLockAt, not a
// hardcoded World Cup date).
export function TournamentPicksNag({ groupId }: Props) {
  const router = useRouter();
  const { t } = useLocale();
  const [groups, setGroups] = useState<IncompleteTournamentGroup[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/reminders/tournament-picks-check", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as { groups: IncompleteTournamentGroup[] };
      setGroups(groupId ? data.groups.filter(g => g.groupId === groupId) : data.groups);
    })();
  }, [groupId]);

  if (!groups.length) return null;

  const goPredict = (targetGroupId: string) => router.push(`/groups/${targetGroupId}?tab=predictions`);

  const single = groups.length === 1;

  return (
    <div className="rounded-2xl p-4 flex items-center gap-3"
      style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)" }}>
      <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(217,119,6,0.15)" }}>
        <Trophy size={17} style={{ color: "#d97706" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold" style={{ color: "var(--tx)" }}>
          {single ? interpolate(t("tpn_title_single"), { group: groups[0].groupName }) : interpolate(t("tpn_title_multi"), { count: groups.length })}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--mt)" }}>{t("tpn_subtitle")}</p>
      </div>
      <button
        onClick={() => goPredict(groups[0].groupId)}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5"
        style={{ background: "#d97706", color: "#fff" }}
      >
        {t("tpn_cta")} <ArrowRight size={13} />
      </button>
    </div>
  );
}
