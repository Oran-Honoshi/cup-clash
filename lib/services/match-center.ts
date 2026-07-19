// On-demand API-Football lookups for Match Center's Stats / Overview / Lineups
// tabs — player season stats, head-to-head, and lineups. Deliberately
// separate from lib/services/league-football.ts (the fixtures/standings cron)
// and app/api/scores/route.ts (the WC live pipeline): nothing here writes to
// Supabase or runs on a schedule. Every export is called from a Next.js route
// handler in direct response to a user opening a Match Center tab — never
// pre-fetched, never cached to the DB, so cost scales with actual usage
// rather than with the number of tracked matches.

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

// ── Fixture → team/league/season resolution ────────────────────────────────
// Every match row (World Cup or tracked league) has api_fixture_id set, but
// home_team_id/away_team_id are null for WC's SF/3rd/Final placeholders (see
// lib/services/oracle.ts's getNextOracleMatch comment for the same gotcha).
// Resolving straight from API-Football by fixture id sidesteps that gap
// entirely and works uniformly for every match.

export interface FixtureTeam { id: number; name: string; logo: string | null }

export interface FixtureContext {
  leagueId: number;
  season:   number;
  home:     FixtureTeam;
  away:     FixtureTeam;
}

interface APIFixtureResponse {
  response: Array<{
    league: { id: number; season: number };
    teams:  { home: FixtureTeam; away: FixtureTeam };
  }>;
}

export async function resolveFixtureContext(apiFixtureId: number): Promise<FixtureContext | null> {
  const data = await apiFetch<APIFixtureResponse>(`/fixtures?id=${apiFixtureId}`);
  const f = data.response?.[0];
  if (!f) return null;
  return { leagueId: f.league.id, season: f.league.season, home: f.teams.home, away: f.teams.away };
}

// ── Player season stats ─────────────────────────────────────────────────────
// GET /players?team=&league=&season= — scoped to the match's own competition
// so a player who also appears in another tournament this season doesn't
// pull in unrelated numbers. Capped at 2 pages (~40 players) per team, which
// comfortably covers any real squad size and bounds worst-case call count.

export interface PlayerSeasonStat {
  apiPlayerId:      number;
  name:             string;
  photo:            string | null;
  position:         string | null;
  appearances:      number | null;
  minutes:          number | null;
  goals:            number | null;
  assists:          number | null;
  yellowCards:      number | null;
  redCards:         number | null;
  shotsTotal:       number | null;
  keyPasses:        number | null;
  dribblesAttempts: number | null;
  tacklesTotal:     number | null;
}

interface APIPlayersResponse {
  paging: { current: number; total: number };
  response: Array<{
    player: { id: number; name: string; photo: string | null };
    statistics: Array<{
      games:    { appearences: number | null; minutes: number | null; position: string | null };
      goals:    { total: number | null; assists: number | null };
      cards:    { yellow: number | null; red: number | null };
      shots:    { total: number | null };
      passes:   { key: number | null };
      dribbles: { attempts: number | null };
      tackles:  { total: number | null };
    }>;
  }>;
}

const MAX_PLAYER_PAGES = 2;

export async function getPlayerSeasonStats(teamId: number, leagueId: number, season: number): Promise<PlayerSeasonStat[]> {
  const out: PlayerSeasonStat[] = [];
  for (let page = 1; page <= MAX_PLAYER_PAGES; page++) {
    const data = await apiFetch<APIPlayersResponse>(`/players?team=${teamId}&league=${leagueId}&season=${season}&page=${page}`);
    for (const row of data.response ?? []) {
      const stats = row.statistics?.[0];
      if (!stats) continue;
      out.push({
        apiPlayerId:      row.player.id,
        name:             row.player.name,
        photo:            row.player.photo,
        position:         stats.games.position,
        appearances:      stats.games.appearences,
        minutes:          stats.games.minutes,
        goals:            stats.goals.total,
        assists:          stats.goals.assists,
        yellowCards:      stats.cards.yellow,
        redCards:         stats.cards.red,
        shotsTotal:       stats.shots.total,
        keyPasses:        stats.passes.key,
        dribblesAttempts: stats.dribbles.attempts,
        tacklesTotal:     stats.tackles.total,
      });
    }
    if (page >= (data.paging?.total ?? 1)) break;
  }
  return out;
}
