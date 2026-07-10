/**
 * One-time backfill: recomputes player_tournament_stats and matches.match_events
 * from already-cached live_scores.raw_data, applying two fixes that shipped
 * after this data was first written:
 *   1. "Missed Penalty" events were being counted as goals (golden boot bug).
 *   2. Player names are now normalized to the canonical players.full_name
 *      spelling instead of whatever raw API spelling a given event used.
 *
 * Pure DB-to-DB recompute — does not call API-Football, so it works even
 * while the API-Football account is suspended.
 *
 * Usage: npx tsx scripts/backfill-scorer-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

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
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const FINISHED_STATUSES = ["FT", "AET", "PEN", "AWD", "WO"];

interface GoalEntry {
  minute: number; extra: number | null;
  player_id: number | null; player_name: string | null;
  assist_id: number | null; assist_name: string | null;
  detail: string; team_name: string | null;
}
interface CardEntry {
  minute: number; extra: number | null;
  player_id: number | null; player_name: string | null;
  detail: string; team_name: string | null;
}
interface SubEntry {
  minute: number; extra: number | null;
  player_in_id: number | null; player_in_name: string | null;
  player_out_id: number | null; player_out_name: string | null;
  team_name: string | null;
}
function canonicalPlayerName(id: number | null, raw: string | null, byId: Map<number, string>): string | null {
  if (id != null) {
    const canon = byId.get(id);
    if (canon) return canon;
  }
  return raw;
}

async function main() {
  const { data: playerRows, error: playerErr } = await sb.from("players").select("api_player_id, full_name");
  if (playerErr) throw playerErr;
  const playerNameById = new Map<number, string>(
    ((playerRows ?? []) as Array<{ api_player_id: number; full_name: string }>)
      .map(p => [p.api_player_id, p.full_name])
  );
  console.log(`Loaded ${playerNameById.size} canonical player name(s)`);

  const { data: liveRows, error: liveErr } = await sb
    .from("live_scores")
    .select("api_fixture_id, raw_data")
    .in("status", FINISHED_STATUSES);
  if (liveErr) throw liveErr;
  console.log(`Found ${liveRows?.length ?? 0} finished live_scores row(s)`);

  // ── 1. Recompute player_tournament_stats ──────────────────────────────────

  type Tally = { name: string; team: string; goals: number; assists: number };
  const tally = new Map<number, Tally>();

  for (const row of liveRows ?? []) {
    const goals = ((row.raw_data as Record<string, unknown>)?.goals ?? []) as GoalEntry[];
    for (const g of goals) {
      if (g.detail === "Own Goal" || g.detail === "Missed Penalty") continue;
      if (g.player_id && g.player_name) {
        const curr = tally.get(g.player_id) ?? { name: g.player_name, team: g.team_name ?? "", goals: 0, assists: 0 };
        tally.set(g.player_id, { ...curr, goals: curr.goals + 1 });
      }
      if (g.assist_id && g.assist_name) {
        const curr = tally.get(g.assist_id) ?? { name: g.assist_name, team: g.team_name ?? "", goals: 0, assists: 0 };
        tally.set(g.assist_id, { ...curr, assists: curr.assists + 1 });
      }
    }
  }

  const statsRows = [...tally.entries()].map(([id, t]) => {
    const canonicalName = playerNameById.get(id) ?? null;
    return {
      api_player_id: id,
      player_name:   canonicalName ?? t.name,
      full_name:     canonicalName,
      team_name:     t.team,
      goals:         t.goals,
      assists:       t.assists,
      updated_at:    new Date().toISOString(),
    };
  });

  console.log(`Recomputed tallies for ${statsRows.length} player(s)`);
  const mbappe = statsRows.find(r => r.api_player_id === 278);
  const messi  = statsRows.find(r => r.api_player_id === 154);
  console.log("Mbappé:", mbappe);
  console.log("Messi:", messi);

  const { error: statsErr } = await sb.from("player_tournament_stats").upsert(statsRows, { onConflict: "api_player_id" });
  if (statsErr) throw statsErr;
  console.log(`✓ player_tournament_stats upserted (${statsRows.length} rows)`);

  // ── 2. Recompute matches.match_events for every finished match ────────────

  const { data: matchRows, error: matchErr } = await sb
    .from("matches")
    .select("id, api_fixture_id")
    .not("api_fixture_id", "is", null)
    .eq("status", "finished");
  if (matchErr) throw matchErr;

  const liveByFixtureId = new Map(
    (liveRows ?? []).map(r => [r.api_fixture_id as number, r.raw_data as Record<string, unknown>])
  );

  let updated = 0;
  for (const m of (matchRows ?? []) as Array<{ id: string; api_fixture_id: number }>) {
    const raw = liveByFixtureId.get(m.api_fixture_id);
    if (!raw) continue;

    const goals = (raw.goals ?? []) as GoalEntry[];
    const cards = (raw.cards ?? []) as CardEntry[];
    const subs  = (raw.subs  ?? []) as SubEntry[];

    const entries = [
      ...goals.map(g => ({
        minute: g.minute, extra: g.extra,
        player: canonicalPlayerName(g.player_id, g.player_name, playerNameById),
        assist: canonicalPlayerName(g.assist_id, g.assist_name, playerNameById),
        team:   g.team_name,
        type: g.detail === "Own Goal"      ? "own_goal"
            : g.detail === "Missed Penalty" ? "missed_penalty"
            : g.detail === "Penalty"        ? "penalty"
            : "goal",
      })),
      ...cards.map(c => ({
        minute: c.minute, extra: c.extra,
        player: canonicalPlayerName(c.player_id, c.player_name, playerNameById),
        assist: null, team: c.team_name,
        type: c.detail.toLowerCase().includes("red") ? "red_card" : "yellow_card",
      })),
      ...subs.map(s => ({
        minute: s.minute, extra: s.extra,
        player: canonicalPlayerName(s.player_in_id,  s.player_in_name,  playerNameById),
        assist: canonicalPlayerName(s.player_out_id, s.player_out_name, playerNameById),
        team:   s.team_name,
        type:   "sub",
      })),
    ];
    entries.sort((a, b) => (a.minute - b.minute) || ((a.extra ?? 0) - (b.extra ?? 0)));

    const { error: updErr } = await sb.from("matches").update({ match_events: entries }).eq("id", m.id);
    if (updErr) {
      console.error(`✗ ${m.id}:`, updErr);
    } else {
      updated++;
    }
  }

  console.log(`✓ match_events recomputed for ${updated} match(es)`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
