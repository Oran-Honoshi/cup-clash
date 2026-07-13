export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getMyRival, getHeadToHead } from "@/lib/services/rivalries";

// GET /api/rivalries?groupId=... — the caller's current rival pairing (if
// any) in that group, plus a live head-to-head comparison (see
// lib/services/rivalries.ts — no separate scoring, just group_predictions
// filtered to these two users).
export async function GET(req: NextRequest) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const groupId = req.nextUrl.searchParams.get("groupId");
  if (!groupId) return NextResponse.json({ error: "groupId is required" }, { status: 400 });

  const admin = sbAdmin();
  const rival = await getMyRival(admin, groupId, user.id);
  if (!rival) {
    return NextResponse.json({ rival: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const headToHead = await getHeadToHead(admin, groupId, user.id, rival);
  return NextResponse.json({ rival: headToHead }, { headers: { "Cache-Control": "no-store" } });
}

// POST /api/rivalries — declare (or replace) the caller's rival in a group.
export async function POST(req: NextRequest) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null) as { groupId?: string; rivalId?: string } | null;
  const groupId = body?.groupId;
  const rivalId = body?.rivalId;
  if (!groupId || !rivalId) {
    return NextResponse.json({ error: "groupId and rivalId are required" }, { status: 400 });
  }
  if (rivalId === user.id) {
    return NextResponse.json({ error: "cannot_rival_self" }, { status: 400 });
  }

  const admin = sbAdmin();
  const { data: members } = await admin
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .in("user_id", [user.id, rivalId]);
  if ((members ?? []).length < 2) {
    return NextResponse.json({ error: "not_group_members" }, { status: 400 });
  }

  const { error } = await admin.from("rivalries").upsert({
    group_id:   groupId,
    user_id:    user.id,
    rival_id:   rivalId,
    created_at: new Date().toISOString(),
  }, { onConflict: "group_id,user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rival = await getMyRival(admin, groupId, user.id);
  const headToHead = rival ? await getHeadToHead(admin, groupId, user.id, rival) : null;
  return NextResponse.json({ rival: headToHead }, { headers: { "Cache-Control": "no-store" } });
}

// DELETE /api/rivalries?groupId=... — clear the caller's declared rival.
export async function DELETE(req: NextRequest) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const groupId = req.nextUrl.searchParams.get("groupId");
  if (!groupId) return NextResponse.json({ error: "groupId is required" }, { status: 400 });

  const admin = sbAdmin();
  await admin.from("rivalries").delete().eq("group_id", groupId).eq("user_id", user.id);
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
