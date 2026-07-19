export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { resolveFixtureContext, getHeadToHead } from "@/lib/services/match-center";

// GET /api/match-center/head-to-head?matchId=... — on-demand only, called
// when a user opens Match Center's Overview tab for this specific match.
// Public read (matches has no ownership concept), so no auth check — same
// as the match row itself, which schedule/news already surface to guests.
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const sb = sbAdmin();
  const { data: match } = await sb
    .from("matches").select("api_fixture_id").eq("id", matchId).maybeSingle();
  if (!match?.api_fixture_id) {
    return NextResponse.json({ matches: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const ctx = await resolveFixtureContext(match.api_fixture_id);
    if (!ctx) return NextResponse.json({ matches: [] }, { headers: { "Cache-Control": "no-store" } });

    const matches = await getHeadToHead(ctx.home.id, ctx.away.id, 10);
    return NextResponse.json({ matches }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[match-center/head-to-head]", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
