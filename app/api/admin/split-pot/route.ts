import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { sbAnon } from "@/lib/supabase/anon";

const POSITIONS = ["first", "second", "third"] as const;
type Position = (typeof POSITIONS)[number];

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { groupId: string; position: Position; memberIds: string[] | null };
  const { groupId, position, memberIds } = body;
  if (!groupId || !POSITIONS.includes(position)) {
    return NextResponse.json({ error: "groupId and a valid position ('first'|'second'|'third') are required" }, { status: 400 });
  }
  if (memberIds !== null && (!Array.isArray(memberIds) || memberIds.length < 2)) {
    return NextResponse.json({ error: "memberIds must be null (to revoke) or an array of 2+ member ids" }, { status: 400 });
  }

  const sb = sbAdmin();

  // Verify caller is owner or co-admin
  const { data: group } = await sb.from("groups").select("admin_id, payout_splits").eq("id", groupId).single();
  const isOwner = (group as { admin_id: string } | null)?.admin_id === user.id;
  if (!isOwner) {
    const { data: membership } = await sb
      .from("group_members").select("role")
      .eq("group_id", groupId).eq("user_id", user.id).maybeSingle();
    const role = (membership as { role: string } | null)?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const existing = (group as { payout_splits: Record<Position, string[] | null> | null } | null)?.payout_splits
    ?? { first: null, second: null, third: null };
  const updated = { ...existing, [position]: memberIds };

  const { error } = await sb.from("groups").update({ payout_splits: updated }).eq("id", groupId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
