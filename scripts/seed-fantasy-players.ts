/**
 * Seeds fantasy_players from API-Football for Premier League.
 * Usage: npx tsx scripts/seed-fantasy-players.ts
 * Requires: API_FOOTBALL_KEY in .env.local
 *
 * Idempotent by design (NOT delete-and-reload, unlike seed-players-2026.ts):
 * fantasy_players is referenced by fantasy_squad_players.fantasy_player_id,
 * so a delete+insert would generate new UUIDs and orphan every existing
 * squad. This upserts on (competition_id, api_player_id) instead, omitting
 * `id` so existing rows keep their UUID and only credit_cost/photo/team_name
 * refresh on a re-run.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (mirrors seed-players-2026.ts pattern)
const envPath = resolve(process.cwd(), ".env.local");
try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local may not exist in CI — fall through to check vars below
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_KEY      = process.env.API_FOOTBALL_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!API_KEY) {
  console.error("✗ Missing API_FOOTBALL_KEY in .env.local");
  process.exit(1);
}

const sb       = createClient(SUPABASE_URL, SUPABASE_KEY);
const API_BASE = "https://v3.football.api-sports.io";

// ── API helpers ────────────────────────────────────────────────────────────────

async function apiFetch(path: string): Promise<Record<string, unknown>> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers: { "x-apisports-key": API_KEY! } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<Record<string, unknown>>;
}

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

function hasApiError(resp: Record<string, unknown>): boolean {
  const errs = resp.errors;
  return Array.isArray(errs) ? errs.length > 0 : Object.keys((errs as object) ?? {}).length > 0;
}

// ── Position mapping (verbatim from seed-players-2026.ts) ─────────────────────

function mapPosition(apiPos: string): "GK" | "DEF" | "MID" | "FWD" {
  switch (apiPos?.toLowerCase()) {
    case "goalkeeper":  return "GK";
    case "defender":    return "DEF";
    case "midfielder":  return "MID";
    case "attacker":
    case "forward":     return "FWD";
    default:
      console.warn(`  Unknown position "${apiPos}" — defaulting to MID`);
      return "MID";
  }
}

// ── credit_cost heuristic (Step 1.2 of the proposed plan) ─────────────────────

const PRICE_BANDS: Record<"GK" | "DEF" | "MID" | "FWD", { floor: number; ceiling: number }> = {
  GK:  { floor: 4.0, ceiling: 6.0  },
  DEF: { floor: 4.0, ceiling: 7.5  },
  MID: { floor: 4.5, ceiling: 10.5 },
  FWD: { floor: 5.0, ceiling: 12.5 },
};

const GOAL_WEIGHT:   Record<"DEF" | "MID" | "FWD", number> = { DEF: 6, MID: 4, FWD: 3 };
const ASSIST_WEIGHT: Record<"DEF" | "MID" | "FWD", number> = { DEF: 3, MID: 3, FWD: 2 };
const POSITION_CAP:  Record<"DEF" | "MID" | "FWD", number> = { DEF: 12, MID: 24, FWD: 30 };

const MINUTES_NAILED_ON = 3000;

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

function computeCreditCost(
  position: "GK" | "DEF" | "MID" | "FWD",
  minutes: number,
  goals: number,
  assists: number
): number {
  const band = PRICE_BANDS[position];
  const minutesRatio = Math.min(1, minutes / MINUTES_NAILED_ON);

  let performanceScore: number;
  if (position === "GK") {
    performanceScore = minutesRatio;
  } else {
    const weighted = goals * GOAL_WEIGHT[position] + assists * ASSIST_WEIGHT[position];
    const contributionRatio = Math.min(1, weighted / POSITION_CAP[position]);
    performanceScore = 0.5 * minutesRatio + 0.5 * contributionRatio;
  }

  const raw = band.floor + (band.ceiling - band.floor) * performanceScore;
  return roundToHalf(raw);
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ApiTeam {
  id:   number;
  name: string;
}

interface ApiSquadPlayer {
  id:       number;
  name:     string;
  position: string;
  photo:    string;
}

interface ApiSeasonStatsPlayer {
  player: { id: number; name: string; photo: string };
  statistics: Array<{
    team:  { id: number; name: string };
    games: { minutes: number | null; position: string };
    goals: { total: number | null; assists: number | null };
  }>;
}

interface FantasyPlayerRow {
  competition_id: string;
  api_player_id:  number;
  api_team_id:    number;
  full_name:      string;
  team_name:      string;
  position:       "GK" | "DEF" | "MID" | "FWD";
  photo:          string | null;
  credit_cost:    number;
}

const LEAGUE_ID = 39; // Premier League — lib/services/league-football.ts
// Explicit constant, not "current − 1": /teams?league=39&season=2026 already
// marks season 2026 as `"current":true` even though it hasn't kicked off —
// an auto-resolved "current season" would grab the wrong (statless) season.
const SEASON = parseInt(process.env.SEASON ?? "2025", 10);
const UPCOMING_SEASON = SEASON + 1; // 2026 — the real about-to-start 20-club list

// Pro plan: stay under 30 req/min → one request every ~2.1s
const THROTTLE_MS = 2100;

// ── Per-club fetch: season-stats primary source, live-squad union for gaps ────

interface ClubFetchResult {
  rows: FantasyPlayerRow[];
  // Every player id API-Football currently lists on this club's live squad —
  // the source of truth for "which club owns this player right now", used to
  // dedupe players whose season-2025 stats show up at a stale ex-club (a
  // mid-season PL-to-PL transfer produces a stats row at BOTH clubs).
  currentSquadIds: number[];
}

async function fetchClubPlayers(team: ApiTeam, isPromoted: boolean): Promise<ClubFetchResult> {
  const rows: FantasyPlayerRow[] = [];
  const seenPlayerIds = new Set<number>();

  if (!isPromoted) {
    // Primary source: season-2025 stats, paginated.
    let page = 1;
    let totalPages = 1;
    do {
      const resp = await apiFetch(`/players?league=${LEAGUE_ID}&season=${SEASON}&team=${team.id}&page=${page}`);
      if (hasApiError(resp)) throw new Error(`API error fetching players for ${team.name}: ${JSON.stringify(resp.errors)}`);

      const paging = resp.paging as { current: number; total: number } | undefined;
      totalPages = paging?.total ?? 1;

      const players = (resp.response as ApiSeasonStatsPlayer[]) ?? [];
      for (const p of players) {
        const stats = p.statistics[0];
        if (!stats) continue;
        const position = mapPosition(stats.games.position);
        const minutes = stats.games.minutes ?? 0;
        const goals = stats.goals.total ?? 0;
        const assists = stats.goals.assists ?? 0;

        rows.push({
          competition_id: "", // filled in by caller
          api_player_id:  p.player.id,
          api_team_id:    team.id,
          full_name:      p.player.name,
          team_name:      team.name,
          position,
          photo:          p.player.photo ?? null,
          credit_cost:    computeCreditCost(position, minutes, goals, assists),
        });
        seenPlayerIds.add(p.player.id);
      }

      page++;
      if (page <= totalPages) await sleep(THROTTLE_MS);
    } while (page <= totalPages);
  }

  // Live squad: primary source for the 3 promoted clubs (no season-2025 PL
  // stats exist), and the fallback union for anyone missing from the above
  // (mid-window signings/call-ups with zero stats at this club).
  if (!isPromoted) await sleep(THROTTLE_MS);
  const squadResp = await apiFetch(`/players/squads?team=${team.id}`);
  if (hasApiError(squadResp)) throw new Error(`API error fetching squad for ${team.name}: ${JSON.stringify(squadResp.errors)}`);

  const squadArr = (squadResp.response as Array<{ team: ApiTeam; players: ApiSquadPlayer[] }>) ?? [];
  const squad = squadArr[0]?.players ?? [];
  const gapPlayers = squad.filter(p => !seenPlayerIds.has(p.id));

  for (const p of gapPlayers) {
    const position = mapPosition(p.position);

    if (isPromoted) {
      // No PL stats possible — floor-price (defensible v1 simplification,
      // promoted-club players are typically lower fantasy value anyway).
      rows.push({
        competition_id: "",
        api_player_id:  p.id,
        api_team_id:    team.id,
        full_name:      p.name,
        team_name:      team.name,
        position,
        photo:          p.photo ?? null,
        credit_cost:    PRICE_BANDS[position].floor,
      });
      continue;
    }

    // Fallback: no-team-filter call to find this player's production at
    // whatever club they were actually at last season (real signing/call-up).
    await sleep(THROTTLE_MS);
    let priced = false;
    try {
      const fallbackResp = await apiFetch(`/players?id=${p.id}&season=${SEASON}`);
      if (!hasApiError(fallbackResp)) {
        const fallbackPlayers = (fallbackResp.response as ApiSeasonStatsPlayer[]) ?? [];
        // A no-team-filter lookup can return one statistics entry PER
        // COMPETITION the player appeared in that season (e.g. Championship +
        // FA Cup + League Cup) — [0] isn't reliably their main league form.
        // Pick the entry with the most minutes to get their real domestic
        // season, not a small cup cameo.
        const allStats = fallbackPlayers[0]?.statistics ?? [];
        const stats = allStats.reduce<typeof allStats[number] | undefined>((best, cur) => {
          const curMinutes = cur.games.minutes ?? 0;
          const bestMinutes = best?.games.minutes ?? -1;
          return curMinutes > bestMinutes ? cur : best;
        }, undefined);
        if (stats) {
          const minutes = stats.games.minutes ?? 0;
          const goals = stats.goals.total ?? 0;
          const assists = stats.goals.assists ?? 0;
          rows.push({
            competition_id: "",
            api_player_id:  p.id,
            api_team_id:    team.id,
            full_name:      p.name,
            team_name:      team.name,
            position,
            photo:          p.photo ?? null,
            credit_cost:    computeCreditCost(position, minutes, goals, assists),
          });
          priced = true;
        }
      }
    } catch (err) {
      console.warn(`    fallback price lookup failed for ${p.name} (${p.id}): ${err}`);
    }

    if (!priced) {
      // Genuine academy debutant / no prior-season data anywhere — correctly floor-priced.
      rows.push({
        competition_id: "",
        api_player_id:  p.id,
        api_team_id:    team.id,
        full_name:      p.name,
        team_name:      team.name,
        position,
        photo:          p.photo ?? null,
        credit_cost:    PRICE_BANDS[position].floor,
      });
    }
  }

  return { rows, currentSquadIds: squad.map(p => p.id) };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding fantasy_players — league=${LEAGUE_ID} (Premier League), stats season=${SEASON}, roster season=${UPCOMING_SEASON}\n`);

  // 1. Resolve competition_id
  const { data: comp, error: compErr } = await sb
    .from("competitions")
    .select("id")
    .eq("name", "Premier League")
    .single();

  if (compErr || !comp) {
    console.error("✗ Could not resolve Premier League competition_id:", compErr?.message);
    process.exit(1);
  }
  const competitionId = comp.id as string;
  console.log(`✓ competition_id = ${competitionId}\n`);

  // 2. Real next-season 20-club list (promotion/relegation already resolved)
  console.log(`Fetching ${UPCOMING_SEASON} club list…`);
  const teamsResp = await apiFetch(`/teams?league=${LEAGUE_ID}&season=${UPCOMING_SEASON}`);
  if (hasApiError(teamsResp)) {
    console.error("✗ API error:", JSON.stringify(teamsResp.errors));
    process.exit(1);
  }
  const teams = ((teamsResp.response as Array<{ team: ApiTeam }>) ?? []).map(t => t.team);
  if (!teams.length) {
    console.error("✗ No teams returned.");
    process.exit(1);
  }
  console.log(`✓ ${teams.length} clubs found\n`);
  await sleep(THROTTLE_MS);

  // 3. Determine which clubs are newly promoted (no season-2025 PL stats).
  //    Cross-reference against season-2025 standings team list.
  console.log(`Fetching ${SEASON} club list (to detect promoted clubs)…`);
  const prevTeamsResp = await apiFetch(`/teams?league=${LEAGUE_ID}&season=${SEASON}`);
  if (hasApiError(prevTeamsResp)) {
    console.error("✗ API error:", JSON.stringify(prevTeamsResp.errors));
    process.exit(1);
  }
  const prevTeamIds = new Set(((prevTeamsResp.response as Array<{ team: ApiTeam }>) ?? []).map(t => t.team.id));
  await sleep(THROTTLE_MS);

  const promotedTeams = teams.filter(t => !prevTeamIds.has(t.id));
  console.log(`✓ Promoted clubs (floor-priced): ${promotedTeams.map(t => t.name).join(", ") || "none"}\n`);

  // 4. Per club (throttled)
  const allRows: FantasyPlayerRow[] = [];
  const clubSummary: { name: string; count: number }[] = [];
  // playerId -> teamId, from every club's live /players/squads listing —
  // the current-ownership source of truth used to dedupe stale-club rows.
  const currentSquadMap = new Map<number, number>();

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const isPromoted = promotedTeams.some(t => t.id === team.id);
    try {
      const { rows, currentSquadIds } = await fetchClubPlayers(team, isPromoted);
      rows.forEach(r => (r.competition_id = competitionId));
      currentSquadIds.forEach(id => currentSquadMap.set(id, team.id));
      console.log(`  [${String(i + 1).padStart(2)}/${teams.length}] ${team.name.padEnd(24)} ${rows.length} players${isPromoted ? "  (promoted — floor priced)" : ""}`);
      allRows.push(...rows);
      clubSummary.push({ name: team.name, count: rows.length });
    } catch (err) {
      console.warn(`  [${i + 1}/${teams.length}] ✗ ${team.name}: ${err}`);
      clubSummary.push({ name: team.name, count: 0 });
    }

    if (i < teams.length - 1) await sleep(THROTTLE_MS);
  }

  console.log(`\nTotal players fetched (pre-dedupe): ${allRows.length}\n`);

  if (!allRows.length) {
    console.error("✗ No players fetched — aborting.");
    process.exit(1);
  }

  // Dedupe: a mid-2025/26-season PL-to-PL transfer produces a season-stats
  // row at BOTH the old and new club (each club's /players fetch sees them).
  // (competition_id, api_player_id) is unique in the DB, so keep only the
  // row matching the player's CURRENT club per live squad membership; if
  // neither duplicate matches (shouldn't happen — every duplicate case
  // found here was a stats-only stale entry), keep the last one seen and warn.
  const byPlayerId = new Map<number, FantasyPlayerRow[]>();
  for (const row of allRows) {
    const list = byPlayerId.get(row.api_player_id) ?? [];
    list.push(row);
    byPlayerId.set(row.api_player_id, list);
  }

  const dedupedRows: FantasyPlayerRow[] = [];
  let duplicatesResolved = 0;
  for (const [playerId, candidates] of byPlayerId) {
    if (candidates.length === 1) {
      dedupedRows.push(candidates[0]);
      continue;
    }
    duplicatesResolved++;
    const currentTeamId = currentSquadMap.get(playerId);
    const match = candidates.find(c => c.api_team_id === currentTeamId);
    const chosen = match ?? candidates[candidates.length - 1];
    console.warn(`  Duplicate resolved: ${chosen.full_name} (${playerId}) — clubs [${candidates.map(c => c.team_name).join(", ")}] → kept ${chosen.team_name}${match ? "" : " (no live-squad match, kept last)"}`);
    dedupedRows.push(chosen);
  }

  if (duplicatesResolved > 0) {
    console.log(`\n✓ Resolved ${duplicatesResolved} cross-club duplicate(s); ${dedupedRows.length} unique players remain.\n`);
  }

  // 5. Upsert in batches of 100, keyed on (competition_id, api_player_id) —
  //    NOT delete-and-reload, to preserve existing fantasy_players UUIDs
  //    (referenced by fantasy_squad_players.fantasy_player_id).
  const BATCH = 100;
  let upserted = 0;
  let failed   = 0;

  for (let i = 0; i < dedupedRows.length; i += BATCH) {
    const batch = dedupedRows.slice(i, i + BATCH);
    const { error } = await sb
      .from("fantasy_players")
      .upsert(batch, { onConflict: "competition_id,api_player_id" });
    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`);
      failed += batch.length;
    } else {
      upserted += batch.length;
    }
  }

  // 6. Summary
  console.log("─".repeat(50));
  console.log(`✓ Upserted: ${upserted}  ✗ Failed: ${failed}`);
  console.log("─".repeat(50));

  const byPos = dedupedRows.reduce<Record<string, { count: number; min: number; max: number; sum: number }>>((acc, p) => {
    const cur = acc[p.position] ?? { count: 0, min: Infinity, max: -Infinity, sum: 0 };
    cur.count += 1;
    cur.min = Math.min(cur.min, p.credit_cost);
    cur.max = Math.max(cur.max, p.credit_cost);
    cur.sum += p.credit_cost;
    acc[p.position] = cur;
    return acc;
  }, {});

  console.log("\nPrice distribution by position:");
  for (const [pos, stats] of Object.entries(byPos)) {
    console.log(`  ${pos.padEnd(4)} count=${stats.count.toString().padEnd(4)} min=${stats.min.toFixed(1)} max=${stats.max.toFixed(1)} avg=${(stats.sum / stats.count).toFixed(2)}`);
  }

  const oddClubs = clubSummary.filter(t => t.count !== 0 && (t.count < 15 || t.count > 45));
  if (oddClubs.length) {
    console.log("\nClubs with unexpected squad sizes:");
    oddClubs.forEach(t => console.log(`  ${t.name}: ${t.count}`));
  }
}

main().catch(err => {
  console.error("✗ Fatal:", err);
  process.exit(1);
});
