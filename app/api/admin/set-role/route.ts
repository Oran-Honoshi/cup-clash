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

  const body = await req.json() as { groupId: string; targetUserId: string; role: string };
  const { groupId, targetUserId, role } = body;

  if (!groupId || !targetUserId || !role) {
    return NextResponse.json({ error: "groupId, targetUserId, and role are required" }, { status: 400 });
  }
  if (!["member", "admin"].includes(role)) {
    return NextResponse.json({ error: "role must be 'member' or 'admin'" }, { status: 400 });
  }

  const sb = sbAdmin();

  // Only the owner can manage roles
  const { data: group } = await sb
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  if (!group || (group as { admin_id: string }).admin_id !== user.id) {
    return NextResponse.json({ error: "Forbidden — only the group owner can manage roles" }, { status: 403 });
  }

  // Cannot change owner's own role
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const { error } = await sb
    .from("group_members")
    .update({ role })
    .eq("group_id", groupId)
    .eq("user_id", targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
