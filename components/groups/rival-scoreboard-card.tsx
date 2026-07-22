"use client";

import { useState, useEffect, useCallback } from "react";
import { Swords, X } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getSessionCached, setSessionCached } from "@/lib/session-cache";

interface RivalSide {
  userId:      string;
  name:        string;
  country:     string;
  avatarUrl:   string | null;
  points:      number;
  exactScores: number;
  todayPoints: number;
}

interface RivalData {
  declaredByMe: boolean;
  me:    RivalSide;
  rival: RivalSide;
}

// Matches group-detail-client.tsx's own hardcoded dark "glass" card
// convention (see its `glass` const, and GroupStreakCard next to which
// this renders) — this page doesn't use the --tx/--sf token system, so a
// half-themed card here would look inconsistent with its neighbors.
const CARD_STYLE = {
  background: "rgba(220,38,38,0.06)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(220,38,38,0.22)",
} as const;

function StatRow({ label, meVal, rivalVal }: { label: string; meVal: number; rivalVal: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-black text-base w-12 text-left" style={{ color: meVal >= rivalVal ? "#f87171" : "rgba(255,255,255,0.5)" }}>
        {meVal}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
      <span className="font-black text-base w-12 text-right" style={{ color: rivalVal >= meVal ? "#f87171" : "rgba(255,255,255,0.5)" }}>
        {rivalVal}
      </span>
    </div>
  );
}

// Reuses getMembers()/group_predictions data end-to-end (via /api/rivalries
// -> lib/services/rivalries.ts) — no scoring is recomputed here, this is
// purely a filtered 2-person view of numbers the Leaderboard already shows.
export function RivalScoreboardCard({ groupId }: { groupId: string }) {
  const { t } = useLocale();
  const [data,     setData]     = useState<RivalData | null | undefined>(undefined); // undefined = loading
  const [removing, setRemoving] = useState(false);

  const cacheKey = `rival-scoreboard:${groupId}`;

  const load = useCallback(() => {
    const cached = getSessionCached<RivalData | null>(cacheKey);
    if (cached !== undefined) { setData(cached); return; }

    fetch(`/api/rivalries?groupId=${encodeURIComponent(groupId)}`)
      .then(r => r.json())
      .then((d: { rival: RivalData | null }) => {
        setData(d.rival);
        setSessionCached(cacheKey, d.rival);
      })
      .catch(() => setData(null));
  }, [groupId, cacheKey]);

  useEffect(() => { load(); }, [load]);

  // No rival declared yet — the entry point lives in the Player Drawer
  // ("Challenge as Rival"), so there's nothing useful to show here until
  // then (same "render nothing while empty" convention as GroupStreakCard).
  if (!data) return null;

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await fetch(`/api/rivalries?groupId=${encodeURIComponent(groupId)}`, { method: "DELETE" });
      setData(null);
      setSessionCached(cacheKey, null);
    } finally {
      setRemoving(false);
    }
  };

  const diff = data.me.points - data.rival.points;
  const leaderLine = diff === 0
    ? t("rival_widget_tied")
    : interpolate(t("rival_widget_ahead"), {
        name:   diff > 0 ? t("rival_widget_you") : data.rival.name,
        points: String(Math.abs(diff)),
      });

  return (
    <div className="rounded-2xl px-5 py-4 space-y-3" style={CARD_STYLE}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords size={16} style={{ color: "#f87171" }} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#f87171" }}>
              {t("rival_widget_heading")}
            </div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{t("rival_widget_tagline")}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          aria-label={t("rival_remove")}
          className="p-1.5 rounded-lg disabled:opacity-40"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 min-w-0">
          <UserAvatar name={data.me.name} avatarUrl={data.me.avatarUrl} size="md" teamCountry={data.me.country} />
          <span className="text-xs font-bold truncate max-w-[90px]" style={{ color: "#fff" }}>{t("rival_widget_you")}</span>
        </div>
        <span className="font-display text-sm font-black" style={{ color: "rgba(255,255,255,0.3)" }}>VS</span>
        <div className="flex flex-col items-center gap-1 min-w-0">
          <UserAvatar name={data.rival.name} avatarUrl={data.rival.avatarUrl} size="md" teamCountry={data.rival.country} />
          <span className="text-xs font-bold truncate max-w-[90px]" style={{ color: "#fff" }}>{data.rival.name}</span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <StatRow label={t("rival_widget_points")} meVal={data.me.points}      rivalVal={data.rival.points} />
        <StatRow label={t("rival_widget_exact")}  meVal={data.me.exactScores} rivalVal={data.rival.exactScores} />
        <StatRow label={t("rival_widget_today")}  meVal={data.me.todayPoints} rivalVal={data.rival.todayPoints} />
      </div>

      <div className="text-center text-xs font-bold pt-1" style={{ color: "#f87171" }}>{leaderLine}</div>
    </div>
  );
}
