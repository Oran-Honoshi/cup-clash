export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import {
  fetchEvents, parseEvents, buildMatchEvents,
  type MatchEventEntry,
} from "@/lib/services/match-events";

// Once-daily reconciliation for matches.match_events. The live scores cron
// (app/api/scores/route.ts) only re-polls a finished match's events within a
// short grace window (STEP 1c there) — this is the backstop for corrections
// API-Football publishes later than that, over a longer 7-day look-back.
//
// Cards/subs diffs are auto-applied (low-stakes, purely cosmetic on the
// Match Center timeline). Any diff touching a goal event is NEVER
// auto-applied — goals feed the Golden Guess tiebreaker and get
// cross-referenced against live_scores' own goal tally by hand when this
// happens, so a wrong auto-write here would be worse than a manual review
// queue. It's only logged, clearly, for a human to check.
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const GOAL_TYPES = new Set(["goal", "own_goal", "penalty", "missed_penalty"]);

function signature(e: MatchEventEntry): string {
  return `${e.type}|${e.minute}|${e.extra ?? ""}|${e.team ?? ""}|${e.player ?? ""}|${e.assist ?? ""}`;
}

// Order-insensitive equality — both sides are built by the same
// buildMatchEvents sort, but comparing as sorted signature sets guards
// against any incidental reordering from the API.
function eventsDiffer(a: MatchEventEntry[], b: MatchEventEntry[]): boolean {
  const sa = a.map(signature).sort();
  const sb = b.map(signature).sort();
  return JSON.stringify(sa) !== JSON.stringify(sb);
}

interface MatchRow {
  id: string;
  home: string;
  away: string;
  api_fixture_id: number;
  match_events: MatchEventEntry[] | null;
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.API_FOOTBALL_KEY) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY not configured" }, { status: 503 });
  }

  const sb = sbAdmin();
  const now = new Date();

  console.log("[match-events-reconcile] ═══════════════════════════════════");
  console.log("[match-events-reconcile] START", now.toISOString());

  const { data: matchRows, error: matchErr } = await sb
    .from("matches")
    .select("id, home, away, api_fixture_id, match_events")
    .eq("status", "finished")
    .not("api_fixture_id", "is", null)
    .gte("finished_at", new Date(now.getTime() - SEVEN_DAYS_MS).toISOString());

  if (matchErr) {
    console.error("[match-events-reconcile] matches fetch error:", matchErr);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }

  const matches = (matchRows ?? []) as MatchRow[];
  console.log(`[match-events-reconcile] Checking ${matches.length} match(es) finished in the last 7 days`);

  if (matches.length === 0) {
    return NextResponse.json({ checked: 0, unchanged: 0, applied: 0, flagged: 0, skippedFetchFailure: 0 });
  }

  const { data: playerNameRows } = await sb.from("players").select("api_player_id, full_name");
  const playerNameById = new Map<number, string>(
    ((playerNameRows ?? []) as Array<{ api_player_id: number; full_name: string }>)
      .map(p => [p.api_player_id, p.full_name])
  );

  let unchanged = 0;
  let applied = 0;
  let flagged = 0;
  let skippedFetchFailure = 0;

  await Promise.all(matches.map(async match => {
    const stored = match.match_events ?? [];

    const rawEvents = await fetchEvents(match.api_fixture_id);

    // An empty response can mean "this match really has no events" or "the
    // API call failed" (fetchEvents swallows both non-OK responses and
    // network errors into []) — those are indistinguishable here, so if we
    // already have stored events, never treat a 0-event response as the new
    // truth. Wiping/flagging real data off a transient API hiccup would be
    // exactly the noisy false positive this job must not produce.
    if (rawEvents.length === 0 && stored.length > 0) {
      console.warn(`[match-events-reconcile] Match ${match.id} (${match.home} vs ${match.away}): API returned 0 events but ${stored.length} stored — treating as fetch failure, skipping`);
      skippedFetchFailure++;
      return;
    }

    const fresh = buildMatchEvents(parseEvents(rawEvents), playerNameById) ?? [];

    const storedGoals = stored.filter(e => GOAL_TYPES.has(e.type));
    const storedOther = stored.filter(e => !GOAL_TYPES.has(e.type));
    const freshGoals  = fresh.filter(e => GOAL_TYPES.has(e.type));
    const freshOther  = fresh.filter(e => !GOAL_TYPES.has(e.type));

    const goalsDiffer = eventsDiffer(storedGoals, freshGoals);
    const othersDiffer = eventsDiffer(storedOther, freshOther);

    if (!goalsDiffer && !othersDiffer) {
      unchanged++;
      return;
    }

    if (goalsDiffer) {
      flagged++;
      console.error(`[match-events-reconcile] GOAL DIFF — MANUAL REVIEW NEEDED — match ${match.id} (${match.home} vs ${match.away}), fixture ${match.api_fixture_id}`);
      console.error(`[match-events-reconcile]   stored goals: ${JSON.stringify(storedGoals)}`);
      console.error(`[match-events-reconcile]   fresh  goals: ${JSON.stringify(freshGoals)}`);
      if (othersDiffer) {
        console.error(`[match-events-reconcile]   cards/subs also differ on this match but were NOT auto-applied — a goal diff blocks the whole match, review together`);
      }
      return; // never auto-write when a goal event is involved
    }

    // Only cards/subs differ — safe to auto-apply.
    const { error: updErr } = await sb
      .from("matches")
      .update({ match_events: fresh })
      .eq("id", match.id);

    if (updErr) {
      console.error(`[match-events-reconcile] FAILED to auto-apply cards/subs diff for match ${match.id}:`, updErr);
      return;
    }

    applied++;
    console.log(`[match-events-reconcile] Auto-applied cards/subs diff for match ${match.id} (${match.home} vs ${match.away})`);
    console.log(`[match-events-reconcile]   stored: ${JSON.stringify(storedOther)}`);
    console.log(`[match-events-reconcile]   fresh : ${JSON.stringify(freshOther)}`);
  }));

  console.log(`[match-events-reconcile] DONE — checked: ${matches.length}, unchanged: ${unchanged}, applied: ${applied}, flagged: ${flagged}, skippedFetchFailure: ${skippedFetchFailure}`);
  console.log("[match-events-reconcile] ═══════════════════════════════════");

  return NextResponse.json({
    checked: matches.length,
    unchanged,
    applied,
    flagged,
    skippedFetchFailure,
    timestamp: now.toISOString(),
  });
}
