import type { Match } from "@/lib/types";
import { WC2026_MATCHES, matchInGroupScope } from "@/lib/schedule";
import type { ScheduleMatch } from "@/lib/schedule";
import { sbAnon as sb } from "@/lib/supabase/anon";
import { sbAdmin } from "@/lib/supabase/admin";
import { isMatchLocked } from "@/lib/isMatchLocked";

// ── Upcoming matches ─────────────────────────────────────────────────────────
// Primary: Supabase matches table (seeded from seed.sql)
// Fallback: lib/schedule.ts (same data, no DB needed)

// groupCompetitionId is REQUIRED (not optional) so every call site is forced
// to state its scope explicitly — an unscoped query here previously leaked
// other competitions' matches into a group's "next match" UI. Pass the
// group's own competition_id (null for World Cup groups) — see
// matchInGroupScope() in lib/schedule.ts for the scoping rule.
export async function getUpcomingMatches(limit: number, groupCompetitionId: string | null): Promise<Match[]> {
  try {
    // Over-fetch before scoping down to `limit`, since most rows may belong
    // to other competitions and get filtered out below.
    const { data, error } = await sb()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city, time_confirmed, competition_id")
      .gt("kickoff_at", new Date().toISOString())
      .neq("home", "TBD")
      .neq("away", "TBD")
      .order("kickoff_at", { ascending: true })
      .limit(Math.max(limit * 10, 100));

    if (!error && data?.length) {
      return (data as Array<{
        id: string; home: string; away: string;
        home_flag: string | null; away_flag: string | null;
        kickoff_at: string; stage: string;
        group_letter: string | null;
        stadium: string | null; city: string | null;
        time_confirmed: boolean | null;
        competition_id: string | null;
      }>)
        .filter(m => matchInGroupScope(m.stage, m.competition_id, groupCompetitionId))
        .slice(0, limit)
        .map(m => ({
          id:          m.id,
          home:        m.home,
          away:        m.away,
          homeFlagCode:m.home_flag  ?? undefined,
          awayFlagCode:m.away_flag  ?? undefined,
          time:        m.kickoff_at,
          utcTime:     m.kickoff_at,
          stage:       m.stage as Match["stage"],
          group:       m.group_letter ?? undefined,
          stadium:     m.stadium ?? undefined,
          city:        m.city    ?? undefined,
          timeConfirmed: m.time_confirmed ?? true,
        }));
    }
  } catch { /* fall through to schedule fallback */ }

  // Fallback — WC2026_MATCHES is now empty; returns [] if DB unreachable.
  // Only ever World Cup matches, so only serve it for World Cup scope.
  if (groupCompetitionId) return [];
  const now = Date.now();
  return WC2026_MATCHES
    .filter(m => new Date(m.kickoff_at).getTime() > now)
    .slice(0, limit)
    .map(m => ({
      id:          m.id,
      home:        m.home,
      away:        m.away,
      homeFlagCode:m.homeFlagCode,
      awayFlagCode:m.awayFlagCode,
      time:        m.kickoff_at,
      utcTime:     m.kickoff_at,
      stage:       m.stage as Match["stage"],
      group:       m.group,
      stadium:     m.stadium,
      city:        m.city,
    }));
}

export async function getNextMatch(groupCompetitionId: string | null): Promise<Match | null> {
  const upcoming = await getUpcomingMatches(1, groupCompetitionId);
  return upcoming[0] ?? null;
}

// ── Cross-competition match picker (Fast Group creation) ────────────────
// Deliberately unscoped by competition_id, unlike getUpcomingMatches — this
// backs the Fast Group match picker, which by design lets a group form
// around ANY match from ANY tracked competition, not one competition's
// fixtures. Not a violation of the matchInGroupScope() convention (that
// rule is for lookups scoped TO an existing group's own competition); this
// query has no group yet, so there's nothing to scope against.
export interface FastGroupMatchOption extends Match {
  competitionId: string | null;
}

async function getUpcomingMatchesAllCompetitions(withinDays: number, limit: number): Promise<FastGroupMatchOption[]> {
  const windowEnd = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await sb()
    .from("matches")
    .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city, time_confirmed, competition_id")
    .gt("kickoff_at", new Date().toISOString())
    .lte("kickoff_at", windowEnd)
    .neq("home", "TBD")
    .neq("away", "TBD")
    .order("kickoff_at", { ascending: true })
    .limit(limit);

  return ((data ?? []) as Array<{
    id: string; home: string; away: string;
    home_flag: string | null; away_flag: string | null;
    kickoff_at: string; stage: string;
    group_letter: string | null;
    stadium: string | null; city: string | null;
    time_confirmed: boolean | null;
    competition_id: string | null;
  }>)
    .filter(m => !isMatchLocked(m.kickoff_at))
    .map(m => ({
      id:          m.id,
      home:        m.home,
      away:        m.away,
      homeFlagCode:m.home_flag  ?? undefined,
      awayFlagCode:m.away_flag  ?? undefined,
      time:        m.kickoff_at,
      utcTime:     m.kickoff_at,
      stage:       m.stage as Match["stage"],
      group:       m.group_letter ?? undefined,
      stadium:     m.stadium ?? undefined,
      city:        m.city    ?? undefined,
      timeConfirmed: m.time_confirmed ?? true,
      competitionId: m.competition_id,
    }));
}

// Real match list for the Fast Group picker's manual-override search —
// widens to 14 days so there's always something to pick even on a sparse
// fixture day.
export async function getFastGroupMatchOptions(limit = 40): Promise<FastGroupMatchOption[]> {
  return getUpcomingMatchesAllCompetitions(14, limit);
}

const STAGE_TIER: Record<string, number> = {
  Final: 100, SF: 80, "3rd": 70, QF: 60, R16: 50, R32: 40, Group: 10,
};
const SPARSE_VOLUME_THRESHOLD = 5;

// "Today's most popular match" for the Fast Group auto-pick default — ranks
// by real group_predictions volume (same crowd signal as
// getFeaturedOracleDuelMatch in oracle-duels.ts) and only falls back to a
// static stage-importance tier when no candidate has enough volume yet to
// trust. Unlike the Oracle version, the candidate pool here is every
// upcoming match across every tracked competition, not just Oracle's own
// WC-knockout picks — so most candidates will have no `stage` tier at all
// (non-WC league fixtures), which is fine: they simply fall back to the
// kickoff-time tiebreak.
export async function getMostPopularUpcomingMatch(): Promise<FastGroupMatchOption | null> {
  let candidates = await getUpcomingMatchesAllCompetitions(3, 60);
  if (!candidates.length) candidates = await getUpcomingMatchesAllCompetitions(14, 60);
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];

  const matchIds = candidates.map(c => c.id);
  const { data } = await sbAdmin()
    .from("group_predictions")
    .select("match_id")
    .in("match_id", matchIds);

  const volumeByMatchId = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ match_id: string }>) {
    volumeByMatchId.set(row.match_id, (volumeByMatchId.get(row.match_id) ?? 0) + 1);
  }
  const volumeOf = (matchId: string) => volumeByMatchId.get(matchId) ?? 0;
  const useVolume = candidates.some(c => volumeOf(c.id) >= SPARSE_VOLUME_THRESHOLD);

  const ranked = [...candidates].sort((a, b) => {
    if (useVolume) {
      const volDiff = volumeOf(b.id) - volumeOf(a.id);
      if (volDiff !== 0) return volDiff;
    }
    const tierDiff = (STAGE_TIER[b.stage] ?? 0) - (STAGE_TIER[a.stage] ?? 0);
    if (tierDiff !== 0) return tierDiff;
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  return ranked[0];
}

// ── Match by ID ──────────────────────────────────────────────────────────────

export async function getMatch(matchId: string): Promise<Match | null> {
  // Try Supabase first
  try {
    const { data } = await sb()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city")
      .eq("id", matchId)
      .single();

    if (data) {
      const m = data as {
        id: string; home: string; away: string;
        home_flag: string | null; away_flag: string | null;
        kickoff_at: string; stage: string;
        group_letter: string | null; stadium: string | null; city: string | null;
      };
      return {
        id: m.id, home: m.home, away: m.away,
        homeFlagCode: m.home_flag ?? undefined,
        awayFlagCode: m.away_flag ?? undefined,
        time: m.kickoff_at, utcTime: m.kickoff_at,
        stage: m.stage as Match["stage"],
        group: m.group_letter ?? undefined,
        stadium: m.stadium ?? undefined,
        city: m.city ?? undefined,
      };
    }
  } catch { /* fall through */ }

  // Fallback — find in schedule (WC2026_MATCHES is now empty)
  const found = WC2026_MATCHES.find(m => m.id === matchId);
  if (!found) return null;
  return {
    id: found.id, home: found.home, away: found.away,
    homeFlagCode: found.homeFlagCode,
    awayFlagCode: found.awayFlagCode,
    time: found.kickoff_at, utcTime: found.kickoff_at,
    stage: found.stage as Match["stage"],
    group: found.group,
    stadium: found.stadium, city: found.city,
  };
}

// ── All matches (for schedule / summary / predictions) ───────────────────────

type DbAllMatch = {
  id: string;
  home: string; away: string;
  home_flag: string | null; away_flag: string | null;
  kickoff_at: string;
  stage: string;
  group_letter: string | null;
  stadium: string | null; city: string | null;
  home_score: number | null; away_score: number | null;
  home_score_et: number | null; away_score_et: number | null;
  status: string;
  time_confirmed: boolean | null;
  competition_id: string | null;
  round_label: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
};

// PostgREST caps a single response at 1000 rows — with 6 competitions now
// live the `matches` table holds 3000+ rows, so a single unpaginated select
// silently truncated the schedule to the chronologically-earliest 1000
// fixtures (everything after ~Matchday 2 of any league season vanished).
// Page through in batches until a page comes back short.
const MATCHES_PAGE_SIZE = 1000;

export async function getAllMatches(): Promise<ScheduleMatch[]> {
  try {
    const rows: DbAllMatch[] = [];
    for (let from = 0; ; from += MATCHES_PAGE_SIZE) {
      const { data, error } = await sb()
        .from("matches")
        .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city, home_score, away_score, home_score_et, away_score_et, status, time_confirmed, competition_id, round_label, home_team_id, away_team_id")
        .order("kickoff_at", { ascending: true })
        .range(from, from + MATCHES_PAGE_SIZE - 1);

      if (error) break;
      rows.push(...((data ?? []) as DbAllMatch[]));
      if (!data || data.length < MATCHES_PAGE_SIZE) break;
    }

    if (rows.length) {
      return rows.map(m => ({
        id:           m.id,
        kickoff_at:   m.kickoff_at,
        date:         m.kickoff_at.slice(0, 10),
        home:         m.home,
        away:         m.away,
        homeFlagCode: m.home_flag  ?? undefined,
        awayFlagCode: m.away_flag  ?? undefined,
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
      }));
    }
  } catch { /* fall through */ }

  return WC2026_MATCHES; // empty fallback
}

// ── Played matches (for scoring) ─────────────────────────────────────────────

export async function getPlayedMatches(groupLetter?: string): Promise<Array<{
  id: string; home: string; away: string;
  homeScore: number; awayScore: number; status: string;
}>> {
  let query = sb()
    .from("matches")
    .select("id, home, away, home_score, away_score, status, group_letter")
    .eq("status", "finished");

  if (groupLetter) {
    query = query.eq("group_letter", groupLetter);
  }

  const { data } = await query.order("kickoff_at", { ascending: true });
  if (!data?.length) return [];

  return (data as Array<{
    id: string; home: string; away: string;
    home_score: number; away_score: number; status: string;
  }>).map(m => ({
    id: m.id, home: m.home, away: m.away,
    homeScore: m.home_score, awayScore: m.away_score,
    status: m.status,
  }));
}

// ── Live scores ──────────────────────────────────────────────────────────────

export async function getLiveScores(): Promise<Array<{
  matchId: string; homeScore: number; awayScore: number;
  status: string; minute: number | null;
}>> {
  const { data } = await sb()
    .from("live_scores")
    .select("match_id, home_score, away_score, status, minute")
    .in("status", ["1H", "HT", "2H", "ET", "P"]);

  if (!data?.length) return [];
  return (data as Array<{
    match_id: string; home_score: number; away_score: number;
    status: string; minute: number | null;
  }>).map(m => ({
    matchId: m.match_id, homeScore: m.home_score, awayScore: m.away_score,
    status: m.status, minute: m.minute,
  }));
}

export function getTournamentStart(): Date {
  return new Date("2026-06-11T19:00:00Z");
}

// ── Recent results per followed team ─────────────────────────────────────────

export interface TeamRecentResult {
  matchId: string;
  opponent: string;
  opponentFlag: string | null;
  isHome: boolean;
  homeScore: number | null;
  awayScore: number | null;
  kickoffAt: string;
  outcome: "W" | "D" | "L";
}

// One query for the union of all followed teams' finished matches, then
// sliced to `perTeamLimit` per team in memory — avoids N+1 queries for a
// "My Teams" list of a handful of teams.
export async function getRecentResultsByTeam(
  teamIds: string[],
  perTeamLimit = 5
): Promise<Map<string, TeamRecentResult[]>> {
  const byTeam = new Map<string, TeamRecentResult[]>();
  if (teamIds.length === 0) return byTeam;

  const orFilter = teamIds
    .map((id) => `home_team_id.eq.${id},away_team_id.eq.${id}`)
    .join(",");

  const { data } = await sb()
    .from("matches")
    .select("id, home, away, home_flag, away_flag, kickoff_at, home_score, away_score, home_team_id, away_team_id")
    .eq("status", "finished")
    .or(orFilter)
    .order("kickoff_at", { ascending: false });

  for (const m of (data ?? []) as Array<{
    id: string; home: string; away: string;
    home_flag: string | null; away_flag: string | null;
    kickoff_at: string; home_score: number | null; away_score: number | null;
    home_team_id: string | null; away_team_id: string | null;
  }>) {
    for (const teamId of teamIds) {
      if (m.home_team_id !== teamId && m.away_team_id !== teamId) continue;
      const list = byTeam.get(teamId) ?? [];
      if (list.length >= perTeamLimit) continue;

      const isHome = m.home_team_id === teamId;
      const own = isHome ? m.home_score : m.away_score;
      const opp = isHome ? m.away_score : m.home_score;
      const outcome: TeamRecentResult["outcome"] =
        own == null || opp == null ? "D" : own > opp ? "W" : own < opp ? "L" : "D";

      list.push({
        matchId: m.id,
        opponent: isHome ? m.away : m.home,
        opponentFlag: isHome ? m.away_flag : m.home_flag,
        isHome,
        homeScore: m.home_score,
        awayScore: m.away_score,
        kickoffAt: m.kickoff_at,
        outcome,
      });
      byTeam.set(teamId, list);
    }
  }

  return byTeam;
}

export interface ContinentalTie {
  teamId: string;
  teamName: string;
  teamFlag: string | null;
  competitionId: string;
  competitionName: string;
  matchId: string;
  opponent: string;
  opponentFlag: string | null;
  isHome: boolean;
  kickoffAt: string;
  stage: string;
}

// Derived "your club is in continental competition" lookup — reuses the
// same followedTeamIds callers already have (getRecentResultsByTeam's own
// keying), no new follow type needed. A competition is "continental" here
// iff it's a cup with no single country (competitions.country is null) —
// the exact set migration 069 deliberately left null: UCL/UEL/UECL/
// Libertadores/Sudamericana. One nearest-upcoming tie per team.
export async function getContinentalInvolvement(teamIds: string[]): Promise<ContinentalTie[]> {
  if (teamIds.length === 0) return [];

  const { data: continentalComps } = await sb()
    .from("competitions")
    .select("id, name")
    .eq("type", "cup")
    .is("country", null);
  const comps = (continentalComps ?? []) as Array<{ id: string; name: string }>;
  if (comps.length === 0) return [];
  const compNameById = new Map(comps.map((c) => [c.id, c.name]));
  const compIds = comps.map((c) => c.id);

  const orFilter = teamIds
    .map((id) => `home_team_id.eq.${id},away_team_id.eq.${id}`)
    .join(",");

  const { data } = await sb()
    .from("matches")
    .select("id, home, away, home_flag, away_flag, kickoff_at, stage, competition_id, home_team_id, away_team_id, status")
    .neq("status", "finished")
    .in("competition_id", compIds)
    .or(orFilter)
    .order("kickoff_at", { ascending: true });

  const seenTeam = new Set<string>();
  const ties: ContinentalTie[] = [];
  for (const m of (data ?? []) as Array<{
    id: string; home: string; away: string;
    home_flag: string | null; away_flag: string | null;
    kickoff_at: string; stage: string; competition_id: string;
    home_team_id: string | null; away_team_id: string | null;
  }>) {
    for (const teamId of teamIds) {
      if (m.home_team_id !== teamId && m.away_team_id !== teamId) continue;
      if (seenTeam.has(teamId)) continue; // nearest kickoff only, list is already date-ordered
      seenTeam.add(teamId);

      const isHome = m.home_team_id === teamId;
      ties.push({
        teamId,
        teamName: isHome ? m.home : m.away,
        teamFlag: isHome ? m.home_flag : m.away_flag,
        competitionId: m.competition_id,
        competitionName: compNameById.get(m.competition_id) ?? "",
        matchId: m.id,
        opponent: isHome ? m.away : m.home,
        opponentFlag: isHome ? m.away_flag : m.home_flag,
        isHome,
        kickoffAt: m.kickoff_at,
        stage: m.stage,
      });
    }
  }

  return ties;
}
