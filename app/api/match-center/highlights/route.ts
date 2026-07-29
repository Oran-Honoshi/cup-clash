export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { getMatchHighlight, type MatchHighlight } from "@/lib/services/highlights";

// GET /api/match-center/highlights?matchId=... — on-demand only, called when
// a user opens Match Center's Overview tab for a finished match. Public read
// (matches has no ownership concept), same as recap/head-to-head/lineups.
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const sb = sbAdmin();
  const { data: match } = await sb
    .from("matches")
    .select("home, away, kickoff_at, status, competition_id")
    .eq("id", matchId)
    .maybeSingle();

  if (!match || match.status !== "finished") {
    return NextResponse.json(
      { highlight: null as MatchHighlight | null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  let countryName: string | null = null;
  if (match.competition_id) {
    const { data: competition } = await sb
      .from("competitions")
      .select("country")
      .eq("id", match.competition_id)
      .maybeSingle();
    countryName = (competition as { country: string | null } | null)?.country ?? null;
  }

  try {
    const highlight = await getMatchHighlight(match.home, match.away, match.kickoff_at, countryName);
    return NextResponse.json({ highlight }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[match-center/highlights]", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
