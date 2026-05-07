// Live scores API — fetches from API-Football every 5 min, caches to Supabase
// All clients read from Supabase, never directly from the sports API
// This prevents API bill explosions and rate limiting

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const API_FOOTBALL_URL = "https://v3.football.api-sports.io";
const WC2026_LEAGUE_ID = 1;
const WC2026_SEASON    = 2026;
const POLL_INTERVAL_MS = 5 * 60 * 1000;

// Direct API-Football key uses x-apisports-key header (not RapidAPI)
function apiFootballHeaders() {
  return {
    "x-apisports-key": process.env.API_FOOTBALL_KEY!,
  };
}

interface APIFixture {
  fixture: {
    id:     number;
    status: { short: string; elapsed: number | null };
  };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/scores — returns cached live scores from Supabase
export async function GET() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("live_scores")
    .select("*")
    .order("last_fetched", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scores: data ?? [], fetchedAt: new Date().toISOString() });
}

// POST /api/scores — called by cron job every 5 min to refresh from API-Football
// Protect with a shared secret so only Vercel Cron can call it
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.API_FOOTBALL_KEY) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY not configured" }, { status: 503 });
  }

  try {
    const sb = getSupabase();

    // Check when we last fetched — don't allow more often than 5 min
    const { data: latest } = await sb
      .from("live_scores")
      .select("last_fetched")
      .order("last_fetched", { ascending: false })
      .limit(1)
      .single();

    if (latest?.last_fetched) {
      const age = Date.now() - new Date(latest.last_fetched).getTime();
      if (age < POLL_INTERVAL_MS) {
        return NextResponse.json({
          skipped: true,
          nextFetchIn: Math.round((POLL_INTERVAL_MS - age) / 1000) + "s",
        });
      }
    }

    // Fetch live + today's matches from API-Football
    const [liveRes, todayRes] = await Promise.all([
      fetch(`${API_FOOTBALL_URL}/fixtures?live=all&league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}`, {
        headers: apiFootballHeaders(),
      }),
      fetch(`${API_FOOTBALL_URL}/fixtures?league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}&date=${new Date().toISOString().split("T")[0]}`, {
        headers: apiFootballHeaders(),
      }),
    ]);

    const [liveData, todayData] = await Promise.all([
      liveRes.json()  as Promise<{ response: APIFixture[] }>,
      todayRes.json() as Promise<{ response: APIFixture[] }>,
    ]);

    // Merge and deduplicate
    const allFixtures = [
      ...(liveData.response  ?? []),
      ...(todayData.response ?? []),
    ];
    const seen = new Set<number>();
    const fixtures = allFixtures.filter(f => {
      if (seen.has(f.fixture.id)) return false;
      seen.add(f.fixture.id);
      return true;
    });

    if (fixtures.length === 0) {
      return NextResponse.json({ updated: 0, message: "No matches today" });
    }

    // Upsert into Supabase live_scores
    // We match by api_fixture_id — our schedule match_id will be mapped manually
    // once we have the API fixture IDs for WC2026
    const rows = fixtures.map(f => ({
      match_id:       `api_${f.fixture.id}`,
      api_fixture_id: f.fixture.id,
      home_score:     f.goals.home ?? 0,
      away_score:     f.goals.away ?? 0,
      status:         f.fixture.status.short,
      minute:         f.fixture.status.elapsed ?? null,
      last_fetched:   new Date().toISOString(),
      raw_data:       f,
    }));

    const { error } = await sb
      .from("live_scores")
      .upsert(rows, { onConflict: "match_id" });

    if (error) throw error;

    return NextResponse.json({ updated: rows.length, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Score fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}