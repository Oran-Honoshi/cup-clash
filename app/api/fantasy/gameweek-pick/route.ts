import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { sbAnon } from "@/lib/supabase/anon";

// Saves a squad's captain + Oracle Captain toggle for one gameweek. A
// dedicated route (not a direct client-side write, unlike the squad
// builder's transfer save) because the deadline check needs to be
// enforced server-side — same reasoning saveGroupPrediction() checks the
// 5-min-before-kickoff deadline itself rather than trusting the client,
// since fantasy_gameweek_picks' RLS update policy only gates on
// `locked_at is null`, which this feature deliberately never sets (same
// "read-only once deadline passes" convention as group_predictions —
// enforced at the write layer, not via a literal DB flag flip).
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    fantasySquadId?: string; gameweekId?: string;
    captainFantasyPlayerId?: string; oracleCaptainActive?: boolean;
  };
  const { fantasySquadId, gameweekId, captainFantasyPlayerId } = body;
  const oracleCaptainActive = body.oracleCaptainActive === true;

  if (!fantasySquadId || !gameweekId || !captainFantasyPlayerId) {
    return NextResponse.json({ error: "fantasySquadId, gameweekId and captainFantasyPlayerId required" }, { status: 400 });
  }

  const sb = sbAdmin();

  const { data: squad } = await sb.from("fantasy_squads").select("id, user_id").eq("id", fantasySquadId).maybeSingle();
  if (!squad || squad.user_id !== user.id) {
    return NextResponse.json({ error: "Not your squad" }, { status: 403 });
  }

  const { data: gw } = await sb.from("gameweeks").select("id, deadline_at").eq("id", gameweekId).maybeSingle();
  if (!gw) {
    return NextResponse.json({ error: "Gameweek not found" }, { status: 404 });
  }
  if (new Date(gw.deadline_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "This gameweek's deadline has passed" }, { status: 400 });
  }

  const { data: activePlayers } = await sb
    .from("fantasy_squad_players")
    .select("fantasy_player_id")
    .eq("fantasy_squad_id", fantasySquadId)
    .is("removed_at", null);
  const isOnSquad = (activePlayers ?? []).some((p: { fantasy_player_id: string }) => p.fantasy_player_id === captainFantasyPlayerId);
  if (!isOnSquad) {
    return NextResponse.json({ error: "Captain must be a current squad player" }, { status: 400 });
  }

  const { error: upsertErr } = await sb
    .from("fantasy_gameweek_picks")
    .upsert(
      { fantasy_squad_id: fantasySquadId, gameweek_id: gameweekId, captain_fantasy_player_id: captainFantasyPlayerId, oracle_captain_active: oracleCaptainActive },
      { onConflict: "fantasy_squad_id,gameweek_id" }
    );
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
