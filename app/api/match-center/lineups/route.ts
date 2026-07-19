export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { getLineups, isInLineupsWindow } from "@/lib/services/match-center";

// GET /api/match-center/lineups?matchId=... — on-demand only, called when a
// user opens Match Center's Lineups tab. The client already gates the call
// on kickoff proximity so it's never issued more than ~1h out; this route
// re-checks the same window server-side as defense-in-depth against a direct
// hit, so a match far from kickoff never costs an API-Football call either
// way. "state" tells the client which of the three placeholder states to
// render:
//   - "early"     — more than ~1h before kickoff, not fetched
//   - "pending"   — in window, but API-Football has no lineup yet (unannounced)
//   - "available" — real lineups returned
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const sb = sbAdmin();
  const { data: match } = await sb
    .from("matches").select("api_fixture_id, kickoff_at, status").eq("id", matchId).maybeSingle();
  if (!match?.api_fixture_id) {
    return NextResponse.json({ state: "early", lineups: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!isInLineupsWindow(match.kickoff_at, match.status)) {
    return NextResponse.json({ state: "early", lineups: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const lineups = await getLineups(match.api_fixture_id);
    return NextResponse.json(
      { state: lineups.length > 0 ? "available" : "pending", lineups },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[match-center/lineups]", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
