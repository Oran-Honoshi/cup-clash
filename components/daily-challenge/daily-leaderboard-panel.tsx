"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { UserAvatar } from "@/components/ui/UserAvatar";

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

type DailyRow = { userId: string; name: string; avatarUrl: string | null; solved: boolean; guessCount: number; timeMs: number | null };
type AllTimeRow = { userId: string; name: string; avatarUrl: string | null; solvedCount: number; avgGuesses: number | null; avgTimeMs: number | null };

// Public leaderboard for the Daily Challenge — global always available;
// the group toggle only appears for users who happen to be in a group
// (an optional layer, never a gate — per the Daily Challenges spec).
export function DailyLeaderboardPanel({ groupId }: { groupId: string | null }) {
  const { t } = useLocale();
  const [scope, setScope] = useState<"global" | "group">("global");
  const [range, setRange] = useState<"daily" | "alltime">("daily");
  const [dailyRows, setDailyRows] = useState<DailyRow[]>([]);
  const [allTimeRows, setAllTimeRows] = useState<AllTimeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ scope, range });
    if (scope === "group" && groupId) params.set("groupId", groupId);
    fetch(`/api/daily-challenge/leaderboard?${params.toString()}`)
      .then(r => r.json())
      .then((data: { rows: (DailyRow | AllTimeRow)[] }) => {
        if (range === "daily") setDailyRows(data.rows as DailyRow[]);
        else setAllTimeRows(data.rows as AllTimeRow[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scope, range, groupId]);

  const rows = range === "daily" ? dailyRows : allTimeRows;

  return (
    <div className="p-5 cc-elevated space-y-4" style={surface}>
      <div className="flex items-center gap-2">
        <Trophy size={16} style={{ color: "var(--ac)" }} />
        <span className="text-sm font-black uppercase tracking-wide" style={{ color: "var(--tx)" }}>
          {t("dc_leaderboard_heading")}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <ToggleGroup
          value={scope}
          onChange={v => setScope(v as "global" | "group")}
          options={[
            { value: "global", label: t("dc_scope_global") },
            ...(groupId ? [{ value: "group", label: t("dc_scope_group") }] : []),
          ]}
        />
        <ToggleGroup
          value={range}
          onChange={v => setRange(v as "daily" | "alltime")}
          options={[
            { value: "daily", label: t("dc_range_daily") },
            { value: "alltime", label: t("dc_range_alltime") },
          ]}
        />
      </div>

      {loading ? (
        <div className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>…</div>
      ) : rows.length === 0 ? (
        <div className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>{t("dc_leaderboard_empty")}</div>
      ) : (
        <div className="space-y-1">
          {rows.map((row, i) => (
            <div key={row.userId} className="flex items-center gap-3 py-1.5">
              <span className="w-5 text-xs font-bold text-center shrink-0" style={{ color: "var(--t2)" }}>{i + 1}</span>
              <UserAvatar name={row.name} avatarUrl={row.avatarUrl} size="sm" />
              <span className="flex-1 text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{row.name}</span>
              <span className="text-xs font-bold shrink-0" style={{ color: "var(--t2)" }}>
                {range === "daily"
                  ? (row as DailyRow).solved ? `${(row as DailyRow).guessCount}/6` : "—"
                  : `${(row as AllTimeRow).solvedCount} solved`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--br)" }}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="px-3 py-1.5 text-xs font-bold"
          style={{
            background: value === opt.value ? "var(--ac)" : "transparent",
            color: value === opt.value ? "#03110c" : "var(--t2)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
