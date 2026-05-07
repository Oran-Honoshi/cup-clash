import { createClient } from "@supabase/supabase-js";
import type { Match } from "@/lib/types";
import { WC2026_MATCHES } from "@/lib/schedule";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Upcoming matches ─────────────────────────────────────────────────────────
// Primary: Supabase matches table (seeded from seed.sql)
// Fallback: lib/schedule.ts (same data, no DB needed)

export async function getUpcomingMatches(limit = 20): Promise<Match[]> {
  try {
    const { data, error } = await sb()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city")
      .gt("kickoff_at", new Date().toISOString())
      .order("kickoff_at", { ascending: true })
      .limit(limit);

    if (!error && data?.length) {
      return (data as Array<{
        id: string; home: string; away: string;
        home_flag: string | null; away_flag: string | null;
        kickoff_at: string; stage: string;
        group_letter: string | null;
        stadium: string | null; city: string | null;
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
      }));
    }
  } catch { /* fall through to schedule fallback */ }

  // Fallback — read directly from schedule.ts
  const now = Date.now();
  return WC2026_MATCHES
    .filter(m => new Date(m.utcTime).getTime() > now)
    .slice(0, limit)
    .map(m => ({
      id:          m.id,
      home:        m.home,
      away:        m.away,
      homeFlagCode:m.homeFlagCode,
      awayFlagCode:m.awayFlagCode,
      time:        m.utcTime,
      utcTime:     m.utcTime,
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

  // Fallback — find in schedule
  const found = WC2026_MATCHES.find(m => m.id === matchId);
  if (!found) return null;
  return {
    id: found.id, home: found.home, away: found.away,
    homeFlagCode: found.homeFlagCode,
    awayFlagCode: found.awayFlagCode,
    time: found.utcTime, utcTime: found.utcTime,
    stage: found.stage as Match["stage"],
    group: found.group,
    stadium: found.stadium, city: found.city,
  };
}

// ── Played matches (for scoring) ─────────────────────────────────────────────

export async function getPlayedMatches(groupLetter?: string): Promise<Array<{
  id: string; home: string; away: string;
  homeScore: number; awayScore: number; status: string;
}>> {
  let query = sb()
    .from("matches")
    .select("id, home, away, home_score, away_score, status, group_letter")
    .in("status", ["FT", "AET", "PEN"]);

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
  return new Date("2026-06-11T20:00:00Z");
}