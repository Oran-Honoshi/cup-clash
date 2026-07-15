// World Cup 2026 Schedule — all 104 matches
// Source: API-Football v3 (league=1, season=2026) — rebuilt 2026-06-09
// All display times Eastern Time (ET = UTC−4, EDT)

import type { Match } from "@/lib/types";

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
  time_confirmed?: boolean;     // false ⇒ kickoff_at/stadium/city is a guessed placeholder, not yet confirmed by API-Football
  competitionId?: string | null; // ties this match to a row in the `competitions` table (multi-league expansion)
}

export const WC2026_MATCHES: ScheduleMatch[] = [];

// ── Helpers ─────────────────────────────────────────────
export const STAGE_LABELS: Record<string, string> = {
  Group: "Group Stage", R32: "Round of 32", R16: "Round of 16",
  QF: "Quarter-Finals", SF: "Semi-Finals", "3rd": "Bronze Final", Final: "Final",
};

// Groups aren't scoped to a competition_id in the schema yet, so surfaces
// that operate on the shared `matches` table (Knockout Predictions, group
// Results) need a way to exclude the multi-league expansion's fixtures
// (Bundesliga/La Liga/Premier League/Serie A stage="League", and UEFA
// Champions League stage="UCL R16"/"UCL QF"/"UCL SF"/"UCL Final") without a
// real per-group competition link. Matches this World Cup vocabulary only.
export const WORLD_CUP_STAGE_LIST = ["Group", "R32", "R16", "QF", "SF", "3rd", "Final"];
const WORLD_CUP_STAGES = new Set(WORLD_CUP_STAGE_LIST);
export function isWorldCupStage(stage: string): boolean {
  return WORLD_CUP_STAGES.has(stage);
}

export const HOST_CITY_FLAGS: Record<string, string> = {
  "Vancouver": "🇨🇦",  "Seattle": "🇺🇸",    "San Francisco": "🇺🇸",
  "Los Angeles": "🇺🇸", "Guadalajara": "🇲🇽", "Mexico City": "🇲🇽",
  "Monterrey": "🇲🇽",  "Houston": "🇺🇸",     "Dallas": "🇺🇸",
  "Atlanta": "🇺🇸",    "Toronto": "🇨🇦",     "Boston": "🇺🇸",
  "Kansas City": "🇺🇸","Miami": "🇺🇸",        "New York/NJ": "🇺🇸",
  "Philadelphia": "🇺🇸",
};

// Adapter to the dashboard's Match shape (camelCase, `time` instead of
// `kickoff_at`) — kept in sync with the equivalent local copy in
// components/predictions/knockout-predictions.tsx.
export function toMatchType(m: ScheduleMatch): Match {
  return {
    id:            m.id,
    home:          m.home,
    away:          m.away,
    homeFlagCode:  m.homeFlagCode,
    awayFlagCode:  m.awayFlagCode,
    time:          m.kickoff_at,
    stage:         m.stage,
    group:         m.group,
    stadium:       m.stadium,
    city:          m.city,
    homeScore:     m.home_score ?? undefined,
    awayScore:     m.away_score ?? undefined,
    status:        m.status,
    timeConfirmed: m.time_confirmed,
  };
}

// Earliest not-yet-finished World Cup match — excludes the multi-league
// expansion's fixtures (see isWorldCupStage) so a Bundesliga/UCL kickoff
// never surfaces as "next match" inside a World Cup group.
export function getNextScheduleMatch(matches: ScheduleMatch[]): ScheduleMatch | null {
  const now = Date.now();
  const upcoming = matches
    .filter(m => isWorldCupStage(m.stage) && m.status !== "finished" && new Date(m.kickoff_at).getTime() > now)
    .sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at));
  return upcoming[0] ?? null;
}

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
