import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sbAdmin } from "@/lib/supabase/admin";
import { sbAnon } from "@/lib/supabase/anon";

// Generates fantasy_leagues.passkey app-side using the same generate ->
// check -> retry loop as app/api/admin/regenerate-code/route.ts, backed by
// the real unique index on fantasy_leagues.passkey (migration 076) — not
// groups.passkey's unguarded live-only trigger.
//
// This has to run server-side with sbAdmin(): fantasy_leagues' SELECT RLS
// policy only lets a user see leagues they admin or are a member of, so a
// collision check made with the browser's anon-key client would always
// come back "no match" even when the candidate collides with someone
// else's league — a false negative, not a real uniqueness check.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { name?: string; competitionId?: string; isPublic?: boolean };
  const name = (body.name ?? "").trim();
  const competitionId = body.competitionId;
  const isPublic = body.isPublic === true;

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  if (!competitionId) {
    return NextResponse.json({ error: "competitionId required" }, { status: 400 });
  }

  const sb = sbAdmin();

  let passkey = randomBytes(6).toString("hex");
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await sb
      .from("fantasy_leagues")
      .select("id")
      .eq("passkey", passkey)
      .maybeSingle();
    if (!existing) break;
    passkey = randomBytes(6).toString("hex");
  }

  const { data: league, error: insertErr } = await sb
    .from("fantasy_leagues")
    .insert({
      name,
      admin_id: user.id,
      competition_id: competitionId,
      is_public: isPublic,
      passkey,
    } as Record<string, unknown>)
    .select("id, passkey")
    .single();

  if (insertErr || !league) {
    return NextResponse.json({ error: insertErr?.message ?? "Failed to create fantasy league" }, { status: 500 });
  }

  const { id: leagueId } = league as { id: string; passkey: string };

  const { error: memberErr } = await sb.from("fantasy_league_members").insert({
    fantasy_league_id: leagueId,
    user_id: user.id,
    role: "admin",
  } as Record<string, unknown>);

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, leagueId, passkey });
}
