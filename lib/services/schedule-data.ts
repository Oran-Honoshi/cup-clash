import { sbAdmin } from "@/lib/supabase/admin";
import type { ScheduleMatch } from "@/lib/schedule";

// Schedule page's combined data fetch (match list + live/result state) —
// scoped to a kickoff_at window or a bounded chunk, instead of the old
// getAllMatches() + a second fully-unscoped `matches` select that together
// shipped every match across every competition (2.7MB) into the initial
// Schedule payload. See app/(app)/schedule/page.tsx (initial window) and
// app/api/schedule/matches/route.ts (on-demand Upcoming/Done pagination).

export interface MatchEvent {
  minute: number;
  extra: number | null;
  player: string | null;
  team: string | null;
  type: string;
}

export interface ScheduleMatchResult {
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeScore90: number | null;
  awayScore90: number | null;
  homeScoreET: number | null;
  awayScoreET: number | null;
  minute: number | null;
  matchEvents: MatchEvent[] | null;
}

export interface ScheduleTeamOverride {
  home: string;
  away: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
}

export interface ScheduleBundle {
  matches: ScheduleMatch[];
  matchResults: Record<string, ScheduleMatchResult>;
  matchTeams: Record<string, ScheduleTeamOverride>;
  matchKickoffs: Record<string, string>;
  matchTimeConfirmed: Record<string, boolean>;
}

type Row = {
  id: string; home: string; away: string;
  home_flag: string | null; away_flag: string | null;
  kickoff_at: string; stage: string;
  group_letter: string | null; stadium: string | null; city: string | null;
  home_score: number | null; away_score: number | null;
  home_score_et: number | null; away_score_et: number | null;
  status: string; time_confirmed: boolean | null;
  competition_id: string | null; round_label: string | null;
  home_team_id: string | null; away_team_id: string | null;
  minute: number | null; match_events: MatchEvent[] | null;
};

const COLUMNS = "id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city, home_score, away_score, home_score_et, away_score_et, status, time_confirmed, competition_id, round_label, home_team_id, away_team_id, minute, match_events";

function bundleFromRows(rows: Row[]): ScheduleBundle {
  const matches: ScheduleMatch[] = [];
  const matchResults: ScheduleBundle["matchResults"] = {};
  const matchTeams: ScheduleBundle["matchTeams"] = {};
  const matchKickoffs: ScheduleBundle["matchKickoffs"] = {};
  const matchTimeConfirmed: ScheduleBundle["matchTimeConfirmed"] = {};

  for (const m of rows) {
    matches.push({
      id:           m.id,
      kickoff_at:   m.kickoff_at,
      date:         m.kickoff_at.slice(0, 10),
      home:         m.home,
      away:         m.away,
      homeFlagCode: m.home_flag ?? undefined,
      awayFlagCode: m.away_flag ?? undefined,
      group:        m.group_letter ?? undefined,
      stage:        m.stage as ScheduleMatch["stage"],
      stadium:      m.stadium ?? undefined,
      city:         m.city    ?? undefined,
      home_score:   m.home_score_et ?? m.home_score,
      away_score:   m.away_score_et ?? m.away_score,
      status:       m.status,
      time_confirmed: m.time_confirmed ?? true,
      competitionId: m.competition_id,
      roundLabel:   m.round_label,
      homeTeamId:   m.home_team_id,
      awayTeamId:   m.away_team_id,
    });

    matchResults[m.id] = {
      status:      m.status ?? "",
      homeScore:   m.home_score_et ?? m.home_score,
      awayScore:   m.away_score_et ?? m.away_score,
      homeScore90: m.home_score,
      awayScore90: m.away_score,
      homeScoreET: m.home_score_et,
      awayScoreET: m.away_score_et,
      minute:      m.minute ?? null,
      matchEvents: m.match_events ?? null,
    };

    if (m.home && m.away) {
      matchTeams[m.id] = {
        home: m.home, away: m.away,
        homeFlagCode: m.home_flag ?? undefined,
        awayFlagCode: m.away_flag ?? undefined,
      };
    }
    if (m.kickoff_at) matchKickoffs[m.id] = m.kickoff_at;
    if (m.time_confirmed != null) matchTimeConfirmed[m.id] = m.time_confirmed;
  }

  return { matches, matchResults, matchTeams, matchKickoffs, matchTimeConfirmed };
}

// PostgREST caps a single response at 1000 rows (see getAllMatches()'s own
// comment) — loop through pages in case a wide window still holds more than
// that, though in practice the window bounds below keep this to one page.
const PAGE_SIZE = 1000;

// Initial Schedule SSR load — every match with kickoff_at inside [fromISO,
// toISO]. Callers pick a window that covers Live/Today/near-term Upcoming
// and recent Done, then extend it on demand (see getScheduleChunk below).
export async function getScheduleWindowBundle(fromISO: string, toISO: string): Promise<ScheduleBundle> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await sbAdmin()
      .from("matches")
      .select(COLUMNS)
      .gte("kickoff_at", fromISO)
      .lte("kickoff_at", toISO)
      .order("kickoff_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) break;
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return bundleFromRows(rows);
}

// On-demand pagination for the Upcoming ("after") and Done ("before") tabs
// once the viewer scrolls/taps past the initial window — one bounded chunk
// per call, not a full unbounded history fetch.
export async function getScheduleChunk(direction: "before" | "after", cutoffISO: string, limit: number): Promise<ScheduleBundle> {
  const query = sbAdmin().from("matches").select(COLUMNS);

  const { data, error } = direction === "before"
    ? await query.lt("kickoff_at", cutoffISO).order("kickoff_at", { ascending: false }).limit(limit)
    : await query.gt("kickoff_at", cutoffISO).order("kickoff_at", { ascending: true }).limit(limit);

  if (error || !data) return bundleFromRows([]);
  const rows = data as Row[];
  if (direction === "before") rows.reverse();
  return bundleFromRows(rows);
}
