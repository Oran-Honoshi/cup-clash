// League fixtures/standings/live-scores cron — Premier League, La Liga,
// Serie A, Bundesliga, Ligue 1, UEFA Champions League. Independent of
// app/api/scores/route.ts (the World Cup pipeline) — no shared code path.
// See lib/services/league-football.ts for the fetch/throttle logic.

import { NextRequest, NextResponse } from "next/server";
import { runLeagueScoresCron } from "@/lib/services/league-football";

// No dynamic function is called here, so without this Next's Data Cache
// would default to force-cache on every fetch inside runLeagueScoresCron
// (Supabase reads + API-Football calls) and could serve a stale snapshot
// indefinitely, across deploys.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.API_FOOTBALL_KEY) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY not configured" }, { status: 503 });
  }

  try {
    const result = await runLeagueScoresCron();
    return NextResponse.json({ ok: true, ...result, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[league-scores/cron] failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
