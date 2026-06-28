// World Cup 2026 Schedule — all 104 matches
// Source: API-Football v3 (league=1, season=2026) — rebuilt 2026-06-09
// All display times Eastern Time (ET = UTC−4, EDT)

export interface ScheduleMatch {
  id: string;
  kickoff_at: string;           // UTC ISO from Supabase — primary time source
  utcTime?: string;             // deprecated alias — use kickoff_at
  date?: string;                // YYYY-MM-DD UTC date (computed from kickoff_at)
  time?: string;                // legacy ET display time — unused
  timezone?: string;            // legacy — unused
  home: string;
  away: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
  group?: string;
  stage: "Group" | "R32" | "R16" | "QF" | "SF" | "3rd" | "Final";
  stadium?: string;
  city?: string;
  country?: "USA" | "CAN" | "MEX";
  home_score?: number | null;
  away_score?: number | null;
  status?: string;
}

export const WC2026_MATCHES: ScheduleMatch[] = [];

// ── Helpers ─────────────────────────────────────────────
export const STAGE_LABELS: Record<string, string> = {
  Group: "Group Stage", R32: "Round of 32", R16: "Round of 16",
  QF: "Quarter-Finals", SF: "Semi-Finals", "3rd": "Bronze Final", Final: "Final",
};

export const HOST_CITY_FLAGS: Record<string, string> = {
  "Vancouver": "🇨🇦",  "Seattle": "🇺🇸",    "San Francisco": "🇺🇸",
  "Los Angeles": "🇺🇸", "Guadalajara": "🇲🇽", "Mexico City": "🇲🇽",
  "Monterrey": "🇲🇽",  "Houston": "🇺🇸",     "Dallas": "🇺🇸",
  "Atlanta": "🇺🇸",    "Toronto": "🇨🇦",     "Boston": "🇺🇸",
  "Kansas City": "🇺🇸","Miami": "🇺🇸",        "New York/NJ": "🇺🇸",
  "Philadelphia": "🇺🇸",
};

export function groupMatchesByDate(matches: ScheduleMatch[]) {
  const map: Record<string, ScheduleMatch[]> = {};
  matches.forEach(m => {
    const key = m.date ?? m.kickoff_at.slice(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(m);
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ms]) => ({ date, matches: ms.sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at)) }));
}
