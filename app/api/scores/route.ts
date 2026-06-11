// Live scores API — fetches from API-Football every 5 min, caches to Supabase.
// All clients read from Supabase; never call the sports API directly from the browser.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const API_BASE      = "https://v3.football.api-sports.io";
const LEAGUE_ID     = 1;     // FIFA World Cup
const SEASON        = 2026;
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Statuses that mean a match is currently in progress
const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"]);
// Statuses that mean a match is definitively over
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

function apiHeaders(): Record<string, string> {
  return { "x-apisports-key": process.env.API_FOOTBALL_KEY! };
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface APIFixture {
  fixture: {
    id:        number;
    date:      string;
    timezone:  string;
    status: {
      long:    string;
      short:   string;
      elapsed: number | null;
      extra:   number | null;
    };
    venue: { id: number | null; name: string | null; city: string | null };
  };
  league: {
    id:     number;
    name:   string;
    season: number;
    round:  string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime:  { home: number | null; away: number | null };
    fulltime:  { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty:   { home: number | null; away: number | null };
  };
}

interface APIEvent {
  time:   { elapsed: number; extra: number | null };
  team:   { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type:   "Goal" | "Card" | "subst" | "Var";
  detail: string;  // "Normal Goal", "Penalty", "Own Goal", "Yellow Card", "Red Card", etc.
  comments: string | null;
}

interface ParsedGoal {
  minute:      number;
  extra:       number | null;
  team_id:     number;
  team_name:   string;
  player_id:   number | null;
  player_name: string | null;
  assist_id:   number | null;
  assist_name: string | null;
  detail:      string;  // "Normal Goal" | "Penalty" | "Own Goal" | "Missed Penalty"
}

interface ParsedCard {
  minute:      number;
  extra:       number | null;
  team_id:     number;
  team_name:   string;
  player_id:   number | null;
  player_name: string | null;
  detail:      string;  // "Yellow Card" | "Red Card" | "Yellow Red Card"
}

async function fetchEvents(fixtureId: number): Promise<APIEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/fixtures/events?fixture=${fixtureId}`, {
      headers: apiHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json() as { response: APIEvent[] };
    return data.response ?? [];
  } catch {
    return [];
  }
}

function parseEvents(events: APIEvent[]): { goals: ParsedGoal[]; cards: ParsedCard[] } {
  const goals: ParsedGoal[] = [];
  const cards: ParsedCard[] = [];

  for (const e of events) {
    if (e.type === "Goal") {
      goals.push({
        minute:      e.time.elapsed,
        extra:       e.time.extra,
        team_id:     e.team.id,
        team_name:   e.team.name,
        player_id:   e.player.id,
        player_name: e.player.name,
        assist_id:   e.assist.id,
        assist_name: e.assist.name,
        detail:      e.detail,
      });
    } else if (e.type === "Card") {
      cards.push({
        minute:      e.time.elapsed,
        extra:       e.time.extra,
        team_id:     e.team.id,
        team_name:   e.team.name,
        player_id:   e.player.id,
        player_name: e.player.name,
        detail:      e.detail,
      });
    }
  }

  return { goals, cards };
}

// ── GET /api/scores — return cached scores from Supabase ───────────────────────

export async function GET() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("live_scores")
    .select("*")
    .order("last_fetched", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scores: data ?? [], fetchedAt: new Date().toISOString() });
}

// ── POST /api/scores — cron endpoint (every 5 min) ────────────────────────────

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.API_FOOTBALL_KEY) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY not configured" }, { status: 503 });
  }

  try {
    const sb   = getSupabase();
    const now  = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD in UTC

    // --- DIAGNOSTIC LOGGING (temporary) ---
    const apiKey = process.env.API_FOOTBALL_KEY ?? "";
    console.log("[scores/cron] API_FOOTBALL_KEY present:", !!apiKey);
    console.log("[scores/cron] API_FOOTBALL_KEY prefix:", apiKey ? apiKey.slice(0, 6) + "…" : "(empty)");

    // Rate-guard: skip if last fetch was < 5 min ago
    const { data: latest } = await sb
      .from("live_scores")
      .select("last_fetched")
      .order("last_fetched", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest?.last_fetched) {
      const age = now.getTime() - new Date(latest.last_fetched).getTime();
      if (age < POLL_INTERVAL) {
        return NextResponse.json({
          skipped:     true,
          nextFetchIn: Math.round((POLL_INTERVAL - age) / 1000) + "s",
        });
      }
    }

    // Fetch live fixtures + today's full schedule in parallel
    const liveUrl  = `${API_BASE}/fixtures?live=all&league=${LEAGUE_ID}&season=${SEASON}`;
    const todayUrl = `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`;
    console.log("[scores/cron] Fetching live URL:", liveUrl);
    console.log("[scores/cron] Fetching today URL:", todayUrl);

    const [liveRes, todayRes] = await Promise.all([
      fetch(liveUrl,  { headers: apiHeaders() }),
      fetch(todayUrl, { headers: apiHeaders() }),
    ]);

    console.log("[scores/cron] live HTTP status:", liveRes.status, liveRes.statusText);
    console.log("[scores/cron] today HTTP status:", todayRes.status, todayRes.statusText);

    const [liveData, todayData] = await Promise.all([
      liveRes.json()  as Promise<{ response: APIFixture[]; errors?: unknown; results?: number }>,
      todayRes.json() as Promise<{ response: APIFixture[]; errors?: unknown; results?: number }>,
    ]);

    console.log("[scores/cron] live API errors:", JSON.stringify(liveData.errors));
    console.log("[scores/cron] live API results count:", liveData.results);
    console.log("[scores/cron] today API errors:", JSON.stringify(todayData.errors));
    console.log("[scores/cron] today API results count:", todayData.results);
    console.log("[scores/cron] live response sample:", JSON.stringify((liveData.response ?? []).slice(0, 1)));
    console.log("[scores/cron] today response sample:", JSON.stringify((todayData.response ?? []).slice(0, 1)));
    // --- END DIAGNOSTIC LOGGING ---

    // Merge and deduplicate by fixture ID
    const seen     = new Set<number>();
    const fixtures = [
      ...(liveData.response  ?? []),
      ...(todayData.response ?? []),
    ].filter(f => {
      if (seen.has(f.fixture.id)) return false;
      seen.add(f.fixture.id);
      return true;
    });

    if (fixtures.length === 0) {
      return NextResponse.json({
        updated: 0,
        message: "No WC2026 matches today",
        _debug: {
          liveErrors:   liveData.errors,
          todayErrors:  todayData.errors,
          liveResults:  liveData.results,
          todayResults: todayData.results,
          liveStatus:   liveRes.status,
          todayStatus:  todayRes.status,
          today,
        },
      });
    }

    // Fetch events for every match that is live OR finished today
    // (events are empty/stable for NS matches so we skip them to save quota)
    const needsEvents = fixtures.filter(
      f => LIVE_STATUSES.has(f.fixture.status.short) || FINISHED_STATUSES.has(f.fixture.status.short)
    );

    const eventsMap = new Map<number, { goals: ParsedGoal[]; cards: ParsedCard[] }>();
    await Promise.all(
      needsEvents.map(async f => {
        const rawEvents = await fetchEvents(f.fixture.id);
        eventsMap.set(f.fixture.id, parseEvents(rawEvents));
      })
    );

    // Build rows
    const rows = fixtures.map(f => {
      const { goals, cards } = eventsMap.get(f.fixture.id) ?? { goals: [], cards: [] };
      const status = f.fixture.status.short;
      const isLive = LIVE_STATUSES.has(status);

      return {
        match_id:       `api_${f.fixture.id}`,
        api_fixture_id: f.fixture.id,
        home_score:     f.goals.home   ?? 0,
        away_score:     f.goals.away   ?? 0,
        status,
        minute:         f.fixture.status.elapsed ?? null,
        last_fetched:   now.toISOString(),
        raw_data: {
          // Core fixture data
          fixture_id:   f.fixture.id,
          date:         f.fixture.date,
          status_long:  f.fixture.status.long,
          status_short: status,
          elapsed:      f.fixture.status.elapsed,
          extra:        f.fixture.status.extra,
          round:        f.league.round,
          venue:        f.fixture.venue.name,
          is_live:      isLive,

          // Teams
          home_team_id:   f.teams.home.id,
          home_team_name: f.teams.home.name,
          home_team_logo: f.teams.home.logo,
          away_team_id:   f.teams.away.id,
          away_team_name: f.teams.away.name,
          away_team_logo: f.teams.away.logo,

          // Scores
          home_score:      f.goals.home,
          away_score:      f.goals.away,
          ht_home:         f.score.halftime.home,
          ht_away:         f.score.halftime.away,
          ft_home:         f.score.fulltime.home,
          ft_away:         f.score.fulltime.away,
          et_home:         f.score.extratime.home,
          et_away:         f.score.extratime.away,
          pen_home:        f.score.penalty.home,
          pen_away:        f.score.penalty.away,

          // Parsed events
          goals,
          cards,
        },
      };
    });

    const { error } = await sb
      .from("live_scores")
      .upsert(rows, { onConflict: "match_id" });

    if (error) throw error;

    const liveCount     = rows.filter(r => LIVE_STATUSES.has(r.status)).length;
    const finishedCount = rows.filter(r => FINISHED_STATUSES.has(r.status)).length;

    return NextResponse.json({
      updated:   rows.length,
      live:      liveCount,
      finished:  finishedCount,
      upcoming:  rows.length - liveCount - finishedCount,
      timestamp: now.toISOString(),
    });

  } catch (err) {
    console.error("Score fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
