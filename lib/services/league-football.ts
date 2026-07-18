// League fixtures/standings cron — fetches the non-World-Cup competitions
// in TRACKED_LEAGUES below (Premier League, La Liga, Serie A, Bundesliga,
// Ligue 1, UEFA Champions League, Copa Libertadores, Copa Sudamericana,
// MLS, Brazil Serie A) from API-Football and caches them to Supabase.
//
// Deliberately separate from app/api/scores/route.ts (the World Cup live
// pipeline) — same conventions, but zero shared code path, so nothing here
// can affect WC scoring/bracket logic. Internally throttled the same way:
// a single cron tick does a cheap DB-only check, and only calls out to
// API-Football when there's actually something to fetch.

import { sbAdmin } from "@/lib/supabase/admin";

const API_BASE = "https://v3.football.api-sports.io";

const LIVE_STATUSES     = new Set(["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

const FIXTURES_REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3h
const LIVE_WINDOW_BEFORE_MS = 3 * 60 * 60 * 1000;  // consider "in window" up to 3h after kickoff
const LIVE_WINDOW_AFTER_MS  = 10 * 60 * 1000;       // ...and up to 10min before kickoff

// competitions.name (must match migration 037/065 seed rows exactly) → API-Football league id
const TRACKED_LEAGUES: Array<{ name: string; apiLeagueId: number }> = [
  { name: "Premier League",          apiLeagueId: 39  },
  { name: "La Liga",                 apiLeagueId: 140 },
  { name: "Serie A",                 apiLeagueId: 135 },
  { name: "Bundesliga",              apiLeagueId: 78  },
  { name: "Ligue 1",                 apiLeagueId: 61  },
  { name: "UEFA Champions League",   apiLeagueId: 2   },
  { name: "Copa Libertadores",       apiLeagueId: 13  },
  { name: "Copa Sudamericana",       apiLeagueId: 11  },
  { name: "MLS",                     apiLeagueId: 253 },
  { name: "Brazil Serie A",          apiLeagueId: 71  },
];

function apiHeaders(): Record<string, string> {
  return { "x-apisports-key": process.env.API_FOOTBALL_KEY! };
}

function getSupabase() {
  return sbAdmin();
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

// ── API-Football response shapes (only the fields we use) ─────────────────

interface APILeagueSeason {
  year: number;
  start: string;
  end: string;
  current: boolean;
}

interface APILeaguesResponse {
  response: Array<{ seasons: APILeagueSeason[] }>;
}

interface APIFixtureTeam { id: number; name: string; logo: string | null }

interface APIFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue: { name: string | null; city: string | null };
  };
  league: { id: number; round: string };
  teams: { home: APIFixtureTeam; away: APIFixtureTeam };
  goals: { home: number | null; away: number | null };
}

interface APIFixturesResponse { response: APIFixture[] }

interface APIStandingRow {
  rank: number;
  team: { id: number; name: string; logo: string | null };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

interface APIStandingsResponse {
  response: Array<{ league: { standings: APIStandingRow[][] } }>;
}

// ── Round/stage mapping ─────────────────────────────────────────────────
// League/group-phase matches all share stage="League" (never collides with
// WC's Group/R32/R16/QF/SF/Final vocabulary). UCL knockout rounds are
// namespaced ("UCL R16", "UCL QF", ...) so they can never be picked up by
// WC bracket/scoring queries that match on stage string alone.

function mapRound(competitionName: string, apiRound: string): { stage: string; roundLabel: string } {
  const r = apiRound.toLowerCase();
  if (competitionName === "UEFA Champions League") {
    if (r.includes("final") && !r.includes("semi") && !r.includes("quarter")) {
      return { stage: "UCL Final", roundLabel: "Final" };
    }
    if (r.includes("semi"))    return { stage: "UCL SF", roundLabel: "Semi-finals" };
    if (r.includes("quarter")) return { stage: "UCL QF", roundLabel: "Quarter-finals" };
    if (r.includes("16"))      return { stage: "UCL R16", roundLabel: "Round of 16" };
  }
  const m = apiRound.match(/(\d+)/);
  return { stage: "League", roundLabel: m ? `Matchday ${m[1]}` : apiRound };
}

function seasonLabel(year: number): string {
  return `${year}/${String(year + 1).slice(2)}`;
}

// ── Season resolution ───────────────────────────────────────────────────

async function resolveCurrentSeasonYear(apiLeagueId: number): Promise<number | null> {
  const data = await apiFetch<APILeaguesResponse>(`/leagues?id=${apiLeagueId}`);
  const seasons = data.response?.[0]?.seasons ?? [];
  const current = seasons.find(s => s.current) ?? seasons[seasons.length - 1];
  return current?.year ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveSeasonRow(sb: any, competitionId: string, year: number): Promise<string> {
  const label = seasonLabel(year);
  const { data: existing } = await sb
    .from("seasons").select("id").eq("competition_id", competitionId).eq("label", label).maybeSingle();
  if (existing) return existing.id;
  const { data: inserted, error } = await sb
    .from("seasons")
    .insert({ competition_id: competitionId, label, status: "active" })
    .select("id").single();
  if (error) throw error;
  return inserted.id;
}

// ── Team resolution (cached per-run, batched per-competition) ─────────
// One competition's fixtures/standings can reference dozens of teams; the
// original implementation resolved each with up to 3 sequential DB round
// trips *per fixture* (not per unique team), which is the dominant cost
// behind the full-refresh timeout below. This batches it to a handful of
// round trips per competition regardless of fixture count. `teams.name`
// is UNIQUE, so the final "insert missing" step uses upsert(onConflict:
// "name") rather than insert() — safe even if the same club (e.g. a team
// that plays in both its domestic league and UCL) is resolved from two
// different competitions' fixture lists.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveTeamIds(sb: any, cache: Map<number, string>, teams: APIFixtureTeam[]): Promise<void> {
  const byApiIdWanted = new Map<number, APIFixtureTeam>();
  for (const t of teams) if (!cache.has(t.id)) byApiIdWanted.set(t.id, t);
  if (byApiIdWanted.size === 0) return;

  const { data: foundByApiId } = await sb
    .from("teams").select("id, api_team_id").in("api_team_id", [...byApiIdWanted.keys()]);
  for (const row of foundByApiId ?? []) {
    cache.set(row.api_team_id, row.id);
    byApiIdWanted.delete(row.api_team_id);
  }
  if (byApiIdWanted.size === 0) return;

  const remaining = [...byApiIdWanted.values()];
  const { data: foundByName } = await sb
    .from("teams").select("id, name").in("name", remaining.map(t => t.name));
  const idByName = new Map((foundByName ?? []).map((r: { id: string; name: string }) => [r.name, r.id]));

  const stillMissing: APIFixtureTeam[] = [];
  for (const t of remaining) {
    const existingId = idByName.get(t.name);
    if (existingId) {
      await sb.from("teams").update({ api_team_id: t.id }).eq("id", existingId);
      cache.set(t.id, existingId as string);
    } else {
      stillMissing.push(t);
    }
  }
  if (stillMissing.length === 0) return;

  const { data: upserted, error } = await sb
    .from("teams")
    .upsert(
      stillMissing.map(t => ({ name: t.name, badge_url: t.logo, api_team_id: t.id })),
      { onConflict: "name" },
    )
    .select("id, api_team_id");
  if (error) throw error;
  for (const row of upserted ?? []) cache.set(row.api_team_id, row.id);
}

function toDbStatus(apiStatusShort: string): "upcoming" | "live" | "finished" {
  if (FINISHED_STATUSES.has(apiStatusShort)) return "finished";
  if (LIVE_STATUSES.has(apiStatusShort)) return "live";
  return "upcoming";
}

// ── Fixtures refresh (one competition) ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refreshCompetitionFixtures(sb: any, competitionId: string, competitionName: string, apiLeagueId: number, year: number, teamCache: Map<number, string>) {
  const seasonId = await resolveSeasonRow(sb, competitionId, year);
  const data = await apiFetch<APIFixturesResponse>(`/fixtures?league=${apiLeagueId}&season=${year}`);
  const fixtures = data.response ?? [];
  if (fixtures.length === 0) return { fixturesUpserted: 0, seasonId };

  await resolveTeamIds(sb, teamCache, fixtures.flatMap(f => [f.teams.home, f.teams.away]));

  // Single batched upsert instead of one select+insert/update pair per
  // fixture — the per-row round trips were the dominant cost behind the
  // full-refresh timing out before reaching leagues later in
  // TRACKED_LEAGUES (see runLeagueScoresCron).
  const payloads = fixtures.map(f => {
    const { stage, roundLabel } = mapRound(competitionName, f.league.round);
    return {
      id: `lg-${f.fixture.id}`,
      home: f.teams.home.name,
      away: f.teams.away.name,
      home_flag: f.teams.home.logo,
      away_flag: f.teams.away.logo,
      kickoff_at: f.fixture.date,
      stage,
      round_label: roundLabel,
      stadium: f.fixture.venue.name,
      city: f.fixture.venue.city,
      home_score: f.goals.home,
      away_score: f.goals.away,
      status: toDbStatus(f.fixture.status.short),
      minute: f.fixture.status.elapsed,
      api_fixture_id: f.fixture.id,
      competition_id: competitionId,
      season_id: seasonId,
      home_team_id: teamCache.get(f.teams.home.id)!,
      away_team_id: teamCache.get(f.teams.away.id)!,
      time_confirmed: true,
    };
  });

  const { error } = await sb.from("matches").upsert(payloads, { onConflict: "id" });
  if (error) throw error;

  return { fixturesUpserted: payloads.length, seasonId };
}

// ── Standings refresh (one competition) ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refreshCompetitionStandings(sb: any, competitionId: string, seasonId: string, apiLeagueId: number, year: number, teamCache: Map<number, string>) {
  const data = await apiFetch<APIStandingsResponse>(`/standings?league=${apiLeagueId}&season=${year}`);
  const groups = data.response?.[0]?.league?.standings ?? [];
  if (groups.length === 0) return 0;

  // API-Football always returns a group label even for single-table leagues
  // (e.g. "Premier League"); we only want a non-null group_label for genuine
  // multi-group competitions (UCL group/league phase).
  const isMultiGroup = groups.length > 1;
  const rows = groups.flat();
  await resolveTeamIds(sb, teamCache, rows.map(r => r.team));

  const updatedAt = new Date().toISOString();
  const payloads = groups.flatMap(group => group.map(row => ({
    competition_id: competitionId,
    season_id: seasonId,
    team_id: teamCache.get(row.team.id)!,
    // "" rather than null for the single-table case — Postgres treats NULL
    // as distinct from NULL for uniqueness/ON CONFLICT purposes, which would
    // silently turn every refresh into new duplicate rows instead of an
    // update.
    group_label: isMultiGroup ? row.group : "",
    position: row.rank,
    played: row.all.played,
    won: row.all.win,
    drawn: row.all.draw,
    lost: row.all.lose,
    goals_for: row.all.goals.for,
    goals_against: row.all.goals.against,
    goal_difference: row.goalsDiff,
    points: row.points,
    form: row.form,
    updated_at: updatedAt,
  })));

  const { error } = await sb
    .from("standings")
    .upsert(payloads, { onConflict: "competition_id,season_id,team_id,group_label" });
  if (error) throw error;
  return payloads.length;
}

// ── Live-window guard ───────────────────────────────────────────────────
// Cheap DB-only check: is any tracked-competition match currently in (or
// about to enter) its match window? Only if so do we spend an API call.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchLiveUpdates(sb: any, competitionIdByApiLeagueId: Map<number, string>) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - LIVE_WINDOW_BEFORE_MS).toISOString();
  const windowEnd    = new Date(now.getTime() + LIVE_WINDOW_AFTER_MS).toISOString();

  const trackedCompetitionIds = [...competitionIdByApiLeagueId.values()];
  const { data: inWindow } = await sb
    .from("matches")
    .select("id")
    .in("competition_id", trackedCompetitionIds)
    .neq("status", "finished")
    .gte("kickoff_at", windowStart)
    .lte("kickoff_at", windowEnd)
    .limit(1);

  if (!inWindow || inWindow.length === 0) return { checked: true, updated: 0 };

  const data = await apiFetch<APIFixturesResponse>(`/fixtures?live=all`);
  const trackedApiLeagueIds = new Set(TRACKED_LEAGUES.map(l => l.apiLeagueId));
  const relevant = (data.response ?? []).filter(f => trackedApiLeagueIds.has(f.league.id));

  let updated = 0;
  for (const f of relevant) {
    const id = `lg-${f.fixture.id}`;
    const { error } = await sb
      .from("matches")
      .update({
        home_score: f.goals.home,
        away_score: f.goals.away,
        status: toDbStatus(f.fixture.status.short),
        minute: f.fixture.status.elapsed,
      })
      .eq("id", id);
    if (!error) updated++;
  }
  return { checked: true, updated };
}

// ── Entry point ─────────────────────────────────────────────────────────

export interface LeagueScoresResult {
  fullRefresh: boolean;
  competitionsProcessed: number;
  fixturesUpserted: number;
  standingsUpserted: number;
  liveUpdated: number;
  errors: Array<{ competition: string; error: string }>;
}

export async function runLeagueScoresCron(): Promise<LeagueScoresResult> {
  const sb = getSupabase();
  const result: LeagueScoresResult = {
    fullRefresh: false, competitionsProcessed: 0, fixturesUpserted: 0,
    standingsUpserted: 0, liveUpdated: 0, errors: [],
  };

  const { data: competitions } = await sb
    .from("competitions")
    .select("id, name")
    .in("name", TRACKED_LEAGUES.map(l => l.name));

  const competitionByName = new Map<string, string>((competitions ?? []).map((c: { id: string; name: string }) => [c.name, c.id]));
  const competitionIdByApiLeagueId = new Map<number, string>();
  for (const l of TRACKED_LEAGUES) {
    const id = competitionByName.get(l.name);
    if (id) competitionIdByApiLeagueId.set(l.apiLeagueId, id);
  }

  const teamCache = new Map<number, string>();

  // Full fixtures+standings refresh, throttled to ~every 3h via the most
  // recent standings.updated_at as a proxy "last full refresh" marker.
  const { data: lastStanding } = await sb
    .from("standings").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const needsFullRefresh = !lastStanding ||
    (Date.now() - new Date(lastStanding.updated_at).getTime()) > FIXTURES_REFRESH_INTERVAL_MS;

  if (needsFullRefresh) {
    result.fullRefresh = true;
    for (const league of TRACKED_LEAGUES) {
      const competitionId = competitionByName.get(league.name);
      if (!competitionId) continue;
      try {
        const year = await resolveCurrentSeasonYear(league.apiLeagueId);
        if (year != null) {
          const { fixturesUpserted, seasonId } = await refreshCompetitionFixtures(sb, competitionId, league.name, league.apiLeagueId, year, teamCache);
          result.fixturesUpserted += fixturesUpserted;
          result.standingsUpserted += await refreshCompetitionStandings(sb, competitionId, seasonId, league.apiLeagueId, year, teamCache);
        }
        result.competitionsProcessed++;
      } catch (err) {
        result.errors.push({ competition: league.name, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  try {
    const { updated } = await fetchLiveUpdates(sb, competitionIdByApiLeagueId);
    result.liveUpdated = updated;
  } catch (err) {
    result.errors.push({ competition: "live-window", error: err instanceof Error ? err.message : String(err) });
  }

  return result;
}
