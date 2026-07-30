// Gameweek picks — captain selection + Oracle Captain toggle. Distinct
// from lib/services/fantasy-scoring.ts (the cron that resolves points);
// this is the read/write surface for the picks panel on
// /fantasy/[leagueId] and the Oracle Captain celebration trigger.

import { sbAdmin } from "@/lib/supabase/admin";
import type { FantasyPosition } from "@/lib/services/fantasy";

export interface CurrentGameweek {
  id: string;
  number: number;
  deadlineAt: string;
  locked: boolean; // deadline has passed
}

// Soonest upcoming deadline for this competition; if every known gameweek's
// deadline has already passed, falls back to the most recent past one (so
// "This Gameweek" still shows something sensible — read-only — instead of
// going blank between the last gameweek's deadline and the next one being
// created by the fixtures cron). Same "soonest upcoming" shape as
// getNextOracleMatch().
export async function getCurrentGameweek(competitionId: string): Promise<CurrentGameweek | null> {
  const sb = sbAdmin();
  const nowIso = new Date().toISOString();

  const { data: upcoming } = await sb
    .from("gameweeks")
    .select("id, number, deadline_at")
    .eq("competition_id", competitionId)
    .gte("deadline_at", nowIso)
    .order("deadline_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (upcoming) {
    return { id: upcoming.id, number: upcoming.number, deadlineAt: upcoming.deadline_at, locked: false };
  }

  const { data: past } = await sb
    .from("gameweeks")
    .select("id, number, deadline_at")
    .eq("competition_id", competitionId)
    .order("deadline_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return past ? { id: past.id, number: past.number, deadlineAt: past.deadline_at, locked: true } : null;
}

export interface SquadPick {
  captainFantasyPlayerId: string;
  oracleCaptainActive: boolean;
}

export async function getSquadGameweekPick(squadId: string, gameweekId: string): Promise<SquadPick | null> {
  const sb = sbAdmin();
  const { data } = await sb
    .from("fantasy_gameweek_picks")
    .select("captain_fantasy_player_id, oracle_captain_active")
    .eq("fantasy_squad_id", squadId)
    .eq("gameweek_id", gameweekId)
    .maybeSingle();
  return data ? { captainFantasyPlayerId: data.captain_fantasy_player_id, oracleCaptainActive: data.oracle_captain_active } : null;
}

// ── Latest resolved Oracle Captain result (celebration trigger) ─────────
// Deliberately its own small query, same rationale as
// getLatestResolvedOracleDuel — too heavy to derive from a full dashboard
// read just to check "is there a fresh result to celebrate".

export interface LatestOracleCaptainResult {
  scoreId: string;
  fantasyLeagueId: string;
  won: boolean; // captain_multiplier === 3
  captainName: string;
  captainPhoto: string | null;
  basePoints: number;
  multiplier: number;
  totalPoints: number;
  home: string;
  away: string;
  homeFlagCode: string | null;
  awayFlagCode: string | null;
  actualScore: { home: number; away: number };
  oraclePredictedWinner: "home" | "away" | "draw" | null;
}

export async function getLatestResolvedOracleCaptainResult(userId: string): Promise<LatestOracleCaptainResult | null> {
  const sb = sbAdmin();

  const { data: squads } = await sb.from("fantasy_squads").select("id, fantasy_league_id").eq("user_id", userId);
  const squadRows = (squads ?? []) as Array<{ id: string; fantasy_league_id: string }>;
  if (!squadRows.length) return null;
  const leagueIdBySquadId = new Map(squadRows.map(s => [s.id, s.fantasy_league_id]));

  const { data: rows } = await sb
    .from("fantasy_gameweek_scores")
    .select("id, fantasy_squad_id, captain_fantasy_player_id, captain_base_points, captain_multiplier, captain_match_id, scored_at")
    .in("fantasy_squad_id", squadRows.map(s => s.id))
    .eq("captain_oracle_active", true)
    .not("captain_multiplier", "is", null)
    .order("scored_at", { ascending: false })
    .limit(1);

  const row = rows?.[0] as {
    id: string; fantasy_squad_id: string; captain_fantasy_player_id: string | null; captain_base_points: number | null;
    captain_multiplier: number | null; captain_match_id: string | null; scored_at: string;
  } | undefined;
  if (!row || !row.captain_fantasy_player_id || row.captain_base_points == null || row.captain_multiplier == null || !row.captain_match_id) return null;
  const fantasyLeagueId = leagueIdBySquadId.get(row.fantasy_squad_id);
  if (!fantasyLeagueId) return null;

  const [{ data: player }, { data: match }] = await Promise.all([
    sb.from("fantasy_players").select("full_name, photo").eq("id", row.captain_fantasy_player_id).maybeSingle(),
    sb.from("matches").select("home, away, home_flag, away_flag, home_score, away_score").eq("id", row.captain_match_id).maybeSingle(),
  ]);
  if (!player || !match || match.home_score == null || match.away_score == null) return null;

  const { data: oraclePred } = await sb
    .from("oracle_predictions").select("predicted_winner").eq("match_id", row.captain_match_id).maybeSingle();

  return {
    scoreId: row.id,
    fantasyLeagueId,
    won: row.captain_multiplier === 3,
    captainName: player.full_name,
    captainPhoto: player.photo,
    basePoints: row.captain_base_points,
    multiplier: row.captain_multiplier,
    totalPoints: row.captain_base_points * row.captain_multiplier,
    home: match.home,
    away: match.away,
    homeFlagCode: match.home_flag,
    awayFlagCode: match.away_flag,
    actualScore: { home: match.home_score, away: match.away_score },
    oraclePredictedWinner: (oraclePred?.predicted_winner as "home" | "away" | "draw" | undefined) ?? null,
  };
}

export interface SquadPickPlayer {
  id: string;
  fullName: string;
  teamName: string;
  position: FantasyPosition;
  photo: string | null;
}
