"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { getSessionCached, setSessionCached } from "@/lib/session-cache";

// Group Streak for the Daily Challenge — always reads from
// getGroupStreak() via /api/groups/[id]/daily-streak (see
// lib/services/daily-challenge.ts), never recomputed here.
export function GroupStreakCard({ groupId }: { groupId: string }) {
  const { t } = useLocale();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const cacheKey = `group-streak:${groupId}`;
    const cached = getSessionCached<number>(cacheKey);
    if (cached !== undefined) { setStreak(cached); return; }

    let cancelled = false;
    fetch(`/api/groups/${groupId}/daily-streak`)
      .then(r => r.json())
      .then((data: { currentStreak: number }) => {
        if (cancelled) return;
        setStreak(data.currentStreak);
        setSessionCached(cacheKey, data.currentStreak);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [groupId]);

  if (streak === null) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-3"
      style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.25)" }}
    >
      <Flame size={20} style={{ color: "#f97316", flexShrink: 0 }} />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#f97316" }}>
          {t("dc_group_streak_heading")}
        </div>
        <div className="font-display text-lg font-black" style={{ color: "#fff" }}>
          {streak > 0 ? interpolate(t("dc_group_streak_active"), { count: streak }) : t("dc_group_streak_inactive")}
        </div>
      </div>
    </div>
  );
}
