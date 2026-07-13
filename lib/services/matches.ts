import type { Match } from "@/lib/types";
import { WC2026_MATCHES } from "@/lib/schedule";
import type { ScheduleMatch } from "@/lib/schedule";
import { sbAnon as sb } from "@/lib/supabase/anon";

// ── Upcoming matches ─────────────────────────────────────────────────────────
// Primary: Supabase matches table (seeded from seed.sql)
// Fallback: lib/schedule.ts (same data, no DB needed)

export async function getUpcomingMatches(limit = 20): Promise<Match[]> {
  try {
    const { data, error } = await sb()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city, time_confirmed")
      .gt("kickoff_at", new Date().toISOString())
      .neq("home", "TBD")
      .neq("away", "TBD")
      .order("kickoff_at", { ascending: true })
      .limit(limit);

    if (!error && data?.length) {
      return (data as Array<{
        id: string; home: string; away: string;
        home_flag: string | null; away_flag: string | null;
        kickoff_at: string; stage: string;
        group_letter: string | null;
        stadium: string | null; city: string | null;
        time_confirmed: boolean | null;
      }>).map(m => ({
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

  // Fallback — WC2026_MATCHES is now empty; returns [] if DB unreachable
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

export async function getNextMatch(): Promise<Match | null> {
  const upcoming = await getUpcomingMatches(1);
  return upcoming[0] ?? null;
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
};

export async function getAllMatches(): Promise<ScheduleMatch[]> {
  try {
    const { data, error } = await sb()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city, home_score, away_score, home_score_et, away_score_et, status, time_confirmed, competition_id")
      .order("kickoff_at", { ascending: true });

    if (!error && data?.length) {
      return (data as DbAllMatch[]).map(m => ({
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
