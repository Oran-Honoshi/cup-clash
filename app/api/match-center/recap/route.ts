export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { getMatchRecap } from "@/lib/services/match-recaps";
import { getRelatedArticles, type RelatedArticle } from "@/lib/services/news";

// GET /api/match-center/recap?matchId=... — on-demand only, called when a
// user opens Match Center's Overview tab for a finished match. Public read
// (matches has no ownership concept), same as head-to-head/lineups/player-stats.
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const sb = sbAdmin();
  const { data: match } = await sb
    .from("matches")
    .select("home, away, kickoff_at, finished_at, status")
    .eq("id", matchId)
    .maybeSingle();

  if (!match || match.status !== "finished") {
    return NextResponse.json(
      { recapText: null, relatedArticles: [] as RelatedArticle[] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const [recapText, relatedArticles] = await Promise.all([
      getMatchRecap(matchId),
      getRelatedArticles(match.home, match.away, match.kickoff_at, match.finished_at),
    ]);
    return NextResponse.json({ recapText, relatedArticles }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[match-center/recap]", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
