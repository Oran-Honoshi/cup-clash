export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sbAdmin } from "@/lib/supabase/admin";

interface HouseGroupsCheckResponse {
  eligible: boolean;
  group?: { id: string; name: string; memberCount: number };
}

// Powers the join-invite bottom sheet (components/house-groups/house-group-invite-sheet.tsx).
// Server-side because groups isn't directly readable by the anon client
// (migration 044 closed that) — list_public_groups() doesn't expose
// rules_mode/competition_id, so a dedicated route is simpler than adding
// those to the general-purpose RPC's return shape.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ eligible: false } satisfies HouseGroupsCheckResponse, { headers: { "Cache-Control": "no-store" } });
  }

  const admin = sbAdmin();

  const { data: houseGroups } = await admin
    .from("groups")
    .select("id, name")
    .eq("rules_mode", "house_rules")
    .eq("is_public", true)
    .order("created_at", { ascending: true });

  if (!houseGroups?.length) {
    return NextResponse.json({ eligible: false } satisfies HouseGroupsCheckResponse, { headers: { "Cache-Control": "no-store" } });
  }

  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id)
    .in("group_id", houseGroups.map(g => g.id));

  const joinedIds = new Set((memberships ?? []).map(m => m.group_id));
  const notJoined = houseGroups.find(g => !joinedIds.has(g.id));
  if (!notJoined) {
    return NextResponse.json({ eligible: false } satisfies HouseGroupsCheckResponse, { headers: { "Cache-Control": "no-store" } });
  }

  const { count } = await admin
    .from("group_members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", notJoined.id);

  return NextResponse.json(
    { eligible: true, group: { id: notJoined.id, name: notJoined.name, memberCount: count ?? 0 } } satisfies HouseGroupsCheckResponse,
    { headers: { "Cache-Control": "no-store" } }
  );
}
