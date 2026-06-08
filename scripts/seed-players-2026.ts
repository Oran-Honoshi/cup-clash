/**
 * Fetches all WC2026 squad data from API-Football and upserts into the players table.
 * Usage: npx tsx scripts/seed-players-2026.ts
 * Requires: API_FOOTBALL_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (mirrors existing seed-players.ts pattern)
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

// ── Position mapping ───────────────────────────────────────────────────────────

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

// ── Types ──────────────────────────────────────────────────────────────────────

interface ApiPlayer {
  id:       number;
  name:     string;
  age:      number;
  number:   number | null;
  position: string;
  photo:    string;
}

interface ApiTeam {
  id:      number;
  name:    string;
  country: string;
  logo:    string;
}

interface PlayerRow {
  full_name:      string;
  country:        string;
  position:       "GK" | "DEF" | "MID" | "FWD";
  club:           string;
  photo:          string;
  api_player_id:  number;
  api_team_id:    number;
}

// ── Main ───────────────────────────────────────────────────────────────────────
//
// API-Football free plan covers seasons ≤ 2024.
// WC2026 (league=1, season=2026) requires a paid subscription.
//
// Best available free-tier dataset:
//   league=1  season=2022 — actual 32-team World Cup Qatar squads
//
// To use WC2026 data: upgrade to the Pro plan and change LEAGUE/SEASON below.
//
const LEAGUE = parseInt(process.env.API_FOOTBALL_LEAGUE ?? "1",  10);
const SEASON = parseInt(process.env.API_FOOTBALL_SEASON ?? "2022", 10);

async function main() {
  console.log(`Using league=${LEAGUE} season=${SEASON}`);
  console.log("(Override with API_FOOTBALL_LEAGUE= and API_FOOTBALL_SEASON=)\n");

  // 1. Fetch all teams for this league/season
  console.log("Fetching teams…");
  const teamsResp = await apiFetch(`/teams?league=${LEAGUE}&season=${SEASON}`);

  if (teamsResp.errors && JSON.stringify(teamsResp.errors) !== "{}") {
    console.error("✗ API error:", JSON.stringify(teamsResp.errors));
    console.error("  Free plan is limited to seasons 2022–2024.");
    console.error("  Upgrade to Pro for WC2026, or set API_FOOTBALL_SEASON=2022 for Qatar data.");
    process.exit(1);
  }

  const teams = (teamsResp.response as Array<{ team: ApiTeam }>) ?? [];

  if (!teams.length) {
    console.error("✗ No teams returned.");
    process.exit(1);
  }
  console.log(`✓ ${teams.length} teams found\n`);

  // 2. Fetch squads for each team
  const allPlayers: PlayerRow[] = [];
  const teamSummary: { name: string; count: number }[] = [];

  for (let i = 0; i < teams.length; i++) {
    const { team } = teams[i];
    try {
      const squadResp = await apiFetch(`/players/squads?team=${team.id}`);
      const squadArr  = (squadResp.response as Array<{ team: ApiTeam; players: ApiPlayer[] }>) ?? [];
      const players   = squadArr[0]?.players ?? [];

      const rows: PlayerRow[] = players.map(p => ({
        full_name:     p.name,
        country:       team.name,
        position:      mapPosition(p.position),
        club:          "",          // squad endpoint doesn't provide club; placeholder
        photo:         p.photo ?? "",
        api_player_id: p.id,
        api_team_id:   team.id,
      }));

      console.log(`  [${String(i + 1).padStart(2)}/${teams.length}] ${team.name.padEnd(24)} ${rows.length} players`);
      allPlayers.push(...rows);
      teamSummary.push({ name: team.name, count: rows.length });
    } catch (err) {
      console.warn(`  [${i + 1}/${teams.length}] ✗ ${team.name}: ${err}`);
      teamSummary.push({ name: team.name, count: 0 });
    }

    // Free tier: 10 req/min → one request every 6 s to stay safe
    if (i < teams.length - 1) await sleep(6200);
  }

  console.log(`\nTotal players fetched: ${allPlayers.length}\n`);

  if (!allPlayers.length) {
    console.error("✗ No players fetched — aborting before clearing existing data");
    process.exit(1);
  }

  // 3. Clear existing players (abort if delete fails to avoid losing data)
  console.log("Clearing existing players table…");
  const { error: delErr } = await sb
    .from("players")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

  if (delErr) {
    console.error("✗ Delete failed:", delErr.message);
    process.exit(1);
  }
  console.log("✓ Table cleared\n");

  // 4. Insert in batches of 100
  const BATCH = 100;
  let inserted = 0;
  let failed   = 0;

  for (let i = 0; i < allPlayers.length; i += BATCH) {
    const batch = allPlayers.slice(i, i + BATCH);
    const { error } = await sb.from("players").insert(batch);
    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`);
      failed += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  // 5. Summary
  console.log("─".repeat(50));
  console.log(`✓ Inserted: ${inserted}  ✗ Failed: ${failed}`);
  console.log("─".repeat(50));

  // Position breakdown
  const byPos = allPlayers.reduce<Record<string, number>>((acc, p) => {
    acc[p.position] = (acc[p.position] ?? 0) + 1;
    return acc;
  }, {});
  console.log("By position:", byPos);

  // Teams with unexpected squad sizes
  const odd = teamSummary.filter(t => t.count !== 0 && (t.count < 20 || t.count > 30));
  if (odd.length) {
    console.log("\nTeams with unexpected squad sizes:");
    odd.forEach(t => console.log(`  ${t.name}: ${t.count}`));
  }
}

main().catch(err => {
  console.error("✗ Fatal:", err);
  process.exit(1);
});
