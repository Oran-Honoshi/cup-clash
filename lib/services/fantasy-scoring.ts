// Fantasy League gameweek-scoring cron — a distinct concern from both
// league-football.ts (fixtures/standings) and app/api/scores/route.ts (WC
// live pipeline), same "separate file per concern" precedent as
// oracle.ts/oracle-duels.ts being split out.
//
// Idempotency: mirrors resolveOracleDuels()'s pattern (query a durable
// per-row fact, not a caller-side status-transition gate — see the
// "newlyFinished" one-shot bug in app/api/scores/route.ts, which this
// deliberately avoids) but goes one step further: every eligible gameweek
// is fully RECOMPUTED and UPSERTED on every tick, not just resolved once.
// fantasy_gameweek_scores(fantasy_squad_id, gameweek_id) is a plain
// idempotent overwrite target, so a stat correction API-Football makes
// after full-time is picked up on the very next cron tick instead of being
// permanently missed.
//
// Data-shape gotchas (confirmed against /fixtures/players):
//   - goals.total / goals.assists / cards.* / penalty.* are null (not 0)
//     for a player with no such event — every read below coalesces ?? 0.
//   - games.position ("Midfielder", single-letter codes, etc. depending on
//     endpoint) is NOT used for scoring weight — a player can be fielded
//     out of position. fantasy_players.position (the seeded canonical
//     position) is the only source of truth for goal/clean-sheet weights.

import { sbAdmin } from "@/lib/supabase/admin";

const API_BASE = "https://v3.football.api-sports.io";

function apiHeaders(): Record<string, string> {
  return { "x-apisports-key": process.env.API_FOOTBALL_KEY! };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: apiHeaders(),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

// ── Scoring table (hardcoded, not per-league configurable — same
// precedent as calcLivePoints()'s fixed 25/10 defaults) ───────────────

type Position = "GK" | "DEF" | "MID" | "FWD";

const APPEARANCE_POINTS      = 1; // any minutes played
const APPEARANCE_60_BONUS    = 1; // additional point for 60+ minutes (total 2)
const GOAL_POINTS: Record<Position, number> = { GK: 6, DEF: 6, MID: 5, FWD: 4 };
const ASSIST_POINTS          = 3;
const CLEAN_SHEET_POINTS: Record<Position, number> = { GK: 4, DEF: 4, MID: 1, FWD: 0 };
const PENALTY_SAVED_POINTS   = 5; // GK only
const PENALTY_MISSED_POINTS  = -2;
const YELLOW_CARD_POINTS     = -1;
const RED_CARD_POINTS        = -3;
const PREDICTION_BONUS_POINTS = 2; // per (owner, fixture), not per player
const CAPTAIN_MULTIPLIER        = 2;
const ORACLE_CAPTAIN_MULTIPLIER = 3;

// Only gameweeks whose window started within this many days are
// (re)scored on a given tick — bounds API-Football call volume (one call
// per finished match per tick) to the current/just-finished gameweek
// instead of replaying an entire season's fixtures forever. API-Football
// stat corrections are realistically same-day, so this comfortably covers
// the correction window while staying cheap. scoreGameweek() itself has no
// such bound — it can be called directly for any gameweek (used by
// verification / a manual re-score).
const RESCORE_WINDOW_DAYS = 5;

// ── API-Football response shape (/fixtures/players) ───────────────────

interface APIFixturePlayersResponse {
  response: Array<{
    team: { id: number };
    players: Array<{
      player: { id: number };
      statistics: Array<{
        games:   { minutes: number | null };
        goals:   { total: number | null; assists: number | null };
        cards:   { yellow: number | null; red: number | null };
        penalty: { scored: number | null; missed: number | null; saved: number | null };
      }>;
    }>;
  }>;
}

interface RawPlayerStats {
  minutes: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  penMissed: number;
  penSaved: number;
  cleanSheetEligible: boolean; // player's team conceded 0 in this match
}

function computeBasePoints(position: Position, s: RawPlayerStats): number {
  let pts = 0;
  if (s.minutes > 0) pts += APPEARANCE_POINTS;
  if (s.minutes >= 60) pts += APPEARANCE_60_BONUS;
  pts += s.goals * GOAL_POINTS[position];
  pts += s.assists * ASSIST_POINTS;
  if (s.cleanSheetEligible && s.minutes >= 60) pts += CLEAN_SHEET_POINTS[position];
  if (position === "GK") pts += s.penSaved * PENALTY_SAVED_POINTS;
  pts += s.penMissed * PENALTY_MISSED_POINTS;
  pts += s.yellow * YELLOW_CARD_POINTS;
  pts += s.red * RED_CARD_POINTS;
  return pts;
}

// ── Per-match player stats, shared across every squad scoring this
// gameweek — one /fixtures/players call per finished match, not per
// player or per squad. ─────────────────────────────────────────────────

interface MatchContribution {
  matchId: string; // matches.id (text, "lg-<api_fixture_id>")
  stats: RawPlayerStats;
}

async function buildContributionsForGameweek(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  gameweekId: string
): Promise<{ byApiPlayerId: Map<number, MatchContribution>; finishedMatches: Array<{ id: string; home_team_id: string; away_team_id: string; home_score: number; away_score: number }> }> {
  const { data: matches } = await sb
    .from("matches")
    .select("id, api_fixture_id, home_team_id, away_team_id, home_score, away_score, status")
    .eq("gameweek_id", gameweekId)
    .eq("status", "finished");

  const finished = ((matches ?? []) as Array<{
    id: string; api_fixture_id: number | null; home_team_id: string | null; away_team_id: string | null;
    home_score: number | null; away_score: number | null; status: string;
  }>).filter((m): m is { id: string; api_fixture_id: number; home_team_id: string; away_team_id: string; home_score: number; away_score: number; status: string } =>
    m.api_fixture_id != null && m.home_team_id != null && m.away_team_id != null && m.home_score != null && m.away_score != null
  );

  const byApiPlayerId = new Map<number, MatchContribution>();
  if (!finished.length) return { byApiPlayerId, finishedMatches: [] };

  const teamIds = [...new Set(finished.flatMap(m => [m.home_team_id, m.away_team_id]))];
  const { data: teamRows } = await sb.from("teams").select("id, api_team_id").in("id", teamIds);
  const apiTeamIdByTeamId = new Map(
    ((teamRows ?? []) as Array<{ id: string; api_team_id: number | null }>).map(t => [t.id, t.api_team_id])
  );

  for (const m of finished) {
    const homeApiTeamId = apiTeamIdByTeamId.get(m.home_team_id);
    const awayApiTeamId = apiTeamIdByTeamId.get(m.away_team_id);
    if (homeApiTeamId == null || awayApiTeamId == null) continue;

    let resp: APIFixturePlayersResponse;
    try {
      resp = await apiFetch<APIFixturePlayersResponse>(`/fixtures/players?fixture=${m.api_fixture_id}`);
    } catch {
      continue; // transient API failure — this match's contributions simply stay absent this tick, safely recoverable next tick
    }

    for (const teamBlock of resp.response ?? []) {
      const goalsAgainst = teamBlock.team.id === homeApiTeamId ? m.away_score
        : teamBlock.team.id === awayApiTeamId ? m.home_score
        : null;
      if (goalsAgainst == null) continue; // unrecognized team block, defensively skip

      for (const p of teamBlock.players ?? []) {
        const stats = p.statistics?.[0];
        if (!stats) continue;
        byApiPlayerId.set(p.player.id, {
          matchId: m.id,
          stats: {
            minutes:            stats.games.minutes ?? 0,
            goals:              stats.goals.total ?? 0,
            assists:            stats.goals.assists ?? 0,
            yellow:             stats.cards.yellow ?? 0,
            red:                stats.cards.red ?? 0,
            penMissed:          stats.penalty?.missed ?? 0,
            penSaved:           stats.penalty?.saved ?? 0,
            cleanSheetEligible: goalsAgainst === 0,
          },
        });
      }
    }
  }

  return { byApiPlayerId, finishedMatches: finished };
}

// ── Score one gameweek for every squad in every league on that gameweek's
// competition. Exported standalone (not just via the windowed cron entry
// point) so verification/a manual re-score can target a specific gameweek
// directly, regardless of RESCORE_WINDOW_DAYS. ─────────────────────────

export interface ScoreGameweekResult {
  gameweekId: string;
  squadsScored: number;
  errors: string[];
}

export async function scoreGameweek(gameweekId: string): Promise<ScoreGameweekResult> {
  const sb = sbAdmin();
  const result: ScoreGameweekResult = { gameweekId, squadsScored: 0, errors: [] };

  const { data: gw } = await sb.from("gameweeks").select("id, competition_id, deadline_at").eq("id", gameweekId).maybeSingle();
  if (!gw) { result.errors.push("gameweek not found"); return result; }

  const { byApiPlayerId, finishedMatches } = await buildContributionsForGameweek(sb, gameweekId);
  if (!finishedMatches.length) return result; // nothing finished yet this gameweek — nothing to score

  const { data: leagues } = await sb.from("fantasy_leagues").select("id").eq("competition_id", gw.competition_id);
  const leagueIds = (leagues ?? []).map((l: { id: string }) => l.id);
  if (!leagueIds.length) return result;

  const { data: squads } = await sb.from("fantasy_squads").select("id, user_id").in("fantasy_league_id", leagueIds);
  const allSquads = (squads ?? []) as Array<{ id: string; user_id: string }>;
  if (!allSquads.length) return result;

  const matchIds = finishedMatches.map(m => m.id);
  const { data: oraclePreds } = await sb
    .from("oracle_predictions").select("match_id, predicted_winner").in("match_id", matchIds);
  const oracleByMatchId = new Map(
    ((oraclePreds ?? []) as Array<{ match_id: string; predicted_winner: string }>).map(r => [r.match_id, r.predicted_winner])
  );
  const matchById = new Map(finishedMatches.map(m => [m.id, m]));

  for (const squad of allSquads) {
    try {
      // "As of this gameweek's deadline" squad membership — NOT the squad's
      // current lineup, so a later transfer never rewrites a past
      // gameweek's score (migration 076's explicit reasoning for keeping
      // removed_at rows instead of deleting them).
      const { data: squadPlayerRows } = await sb
        .from("fantasy_squad_players")
        .select("added_at, removed_at, fantasy_players ( id, api_player_id, position )")
        .eq("fantasy_squad_id", squad.id);

      const deadlineMs = new Date(gw.deadline_at).getTime();
      const activePlayers = ((squadPlayerRows ?? []) as unknown as Array<{
        added_at: string; removed_at: string | null;
        fantasy_players: { id: string; api_player_id: number; position: Position };
      }>)
        .filter(r => new Date(r.added_at).getTime() <= deadlineMs && (r.removed_at == null || new Date(r.removed_at).getTime() > deadlineMs))
        .map(r => r.fantasy_players);

      const { data: pickRow } = await sb
        .from("fantasy_gameweek_picks")
        .select("captain_fantasy_player_id, oracle_captain_active")
        .eq("fantasy_squad_id", squad.id)
        .eq("gameweek_id", gameweekId)
        .maybeSingle();
      const pick = pickRow as { captain_fantasy_player_id: string; oracle_captain_active: boolean } | null;

      let basePointsSum = 0;
      const involvedMatchIds = new Set<string>();
      let captainBasePoints: number | null = null;
      let captainMultiplier: number | null = null;
      let captainMatchId: string | null = null;

      for (const player of activePlayers) {
        const contribution = byApiPlayerId.get(player.api_player_id);
        if (!contribution) continue; // this player's match hasn't finished (or they didn't feature) yet

        involvedMatchIds.add(contribution.matchId);
        const basePts = computeBasePoints(player.position, contribution.stats);

        let multiplier = 1;
        if (pick && player.id === pick.captain_fantasy_player_id) {
          multiplier = CAPTAIN_MULTIPLIER;
          if (pick.oracle_captain_active) {
            const match = matchById.get(contribution.matchId)!;
            const actualWinner = match.home_score > match.away_score ? "home" : match.home_score < match.away_score ? "away" : "draw";
            if (oracleByMatchId.get(contribution.matchId) === actualWinner) multiplier = ORACLE_CAPTAIN_MULTIPLIER;
          }
          captainBasePoints = basePts;
          captainMultiplier = multiplier;
          captainMatchId = contribution.matchId;
        }

        basePointsSum += basePts * multiplier;
      }

      let predictionBonus = 0;
      if (involvedMatchIds.size) {
        const { data: hits } = await sb
          .from("group_predictions")
          .select("match_id")
          .eq("user_id", squad.user_id)
          .in("match_id", [...involvedMatchIds])
          .gt("points_earned", 0);
        const distinctHitMatches = new Set(((hits ?? []) as Array<{ match_id: string }>).map(h => h.match_id));
        predictionBonus = distinctHitMatches.size * PREDICTION_BONUS_POINTS;
      }

      const totalPoints = basePointsSum + predictionBonus;

      const { error: upsertErr } = await sb
        .from("fantasy_gameweek_scores")
        .upsert(
          {
            fantasy_squad_id: squad.id, gameweek_id: gameweekId, points: totalPoints, scored_at: new Date().toISOString(),
            captain_fantasy_player_id: pick?.captain_fantasy_player_id ?? null,
            captain_oracle_active: pick?.oracle_captain_active ?? false,
            captain_base_points: captainBasePoints,
            captain_multiplier: captainMultiplier,
            captain_match_id: captainMatchId,
          },
          { onConflict: "fantasy_squad_id,gameweek_id" }
        );
      if (upsertErr) { result.errors.push(`squad ${squad.id}: ${upsertErr.message}`); continue; }

      result.squadsScored++;
    } catch (err) {
      result.errors.push(`squad ${squad.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}

// ── Cron entry point: select which gameweeks are in-window, score each ──

export interface FantasyScoringResult {
  gameweeksProcessed: number;
  squadsScored: number;
  errors: string[];
}

export async function runFantasyScoringCron(): Promise<FantasyScoringResult> {
  const sb = sbAdmin();
  const result: FantasyScoringResult = { gameweeksProcessed: 0, squadsScored: 0, errors: [] };

  const { data: comp } = await sb.from("competitions").select("id").eq("name", "Premier League").maybeSingle();
  if (!comp) return result;

  const windowStart = new Date(Date.now() - RESCORE_WINDOW_DAYS * 24 * 3600_000).toISOString();
  const { data: gameweeks } = await sb
    .from("gameweeks")
    .select("id")
    .eq("competition_id", comp.id)
    .gte("start_at", windowStart);

  for (const gw of (gameweeks ?? []) as Array<{ id: string }>) {
    try {
      const r = await scoreGameweek(gw.id);
      result.gameweeksProcessed++;
      result.squadsScored += r.squadsScored;
      result.errors.push(...r.errors);
    } catch (err) {
      result.errors.push(`gameweek ${gw.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
