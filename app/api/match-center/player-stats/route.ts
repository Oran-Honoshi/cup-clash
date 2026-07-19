export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { resolveFixtureContext, getPlayerSeasonStats } from "@/lib/services/match-center";

// GET /api/match-center/player-stats?matchId=... — on-demand only, called
// when a user opens Match Center's Stats tab for this specific match. Never
// pre-fetched or cached to Supabase, so cost scales with real opens, not
// with the number of tracked matches.
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const sb = sbAdmin();
  const { data: match } = await sb
    .from("matches").select("api_fixture_id").eq("id", matchId).maybeSingle();
  if (!match?.api_fixture_id) {
    return NextResponse.json({ home: [], away: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const ctx = await resolveFixtureContext(match.api_fixture_id);
    if (!ctx) return NextResponse.json({ home: [], away: [] }, { headers: { "Cache-Control": "no-store" } });

    const [home, away] = await Promise.all([
      getPlayerSeasonStats(ctx.home.id, ctx.leagueId, ctx.season),
      getPlayerSeasonStats(ctx.away.id, ctx.leagueId, ctx.season),
    ]);

    // Enrich with our own players table (nicer full names / photos) where
    // a WC squad row matches by api_player_id — purely cosmetic, falls back
    // to the API-provided name/photo when there's no local row.
    const apiIds = [...home, ...away].map(p => p.apiPlayerId);
    const { data: localPlayers } = apiIds.length
      ? await sb.from("players").select("api_player_id, full_name, photo").in("api_player_id", apiIds)
      : { data: [] as Array<{ api_player_id: number; full_name: string; photo: string | null }> };
    const localById = new Map((localPlayers ?? []).map(p => [p.api_player_id, p]));

    const enrich = (players: typeof home) => players.map(p => {
      const local = localById.get(p.apiPlayerId);
      return local ? { ...p, name: local.full_name, photo: local.photo || p.photo } : p;
    });

    return NextResponse.json(
      { home: enrich(home), away: enrich(away), homeTeamName: ctx.home.name, awayTeamName: ctx.away.name },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[match-center/player-stats]", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
