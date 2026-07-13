import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { sbAnon } from "@/lib/supabase/anon";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { groupId: string; newAdminUserId: string };
  const { groupId, newAdminUserId } = body;

  if (!groupId || !newAdminUserId) {
    return NextResponse.json({ error: "groupId and newAdminUserId are required" }, { status: 400 });
  }

  const sb = sbAdmin();

  // Verify caller is current admin
  const { data: group } = await sb
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  if (!group || (group as { admin_id: string }).admin_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (newAdminUserId === user.id) {
    return NextResponse.json({ error: "You are already the admin" }, { status: 400 });
  }

  // Verify newAdminUserId is a member of the group
  const { data: membership } = await sb
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", newAdminUserId)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "User is not a member of this group" }, { status: 400 });
  }

  // Transfer admin role
  const { error: updateErr } = await sb
    .from("groups")
    .update({ admin_id: newAdminUserId } as Record<string, string>)
    .eq("id", groupId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
