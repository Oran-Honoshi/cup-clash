import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sbAdmin } from "@/lib/supabase/admin";
import { sbAnon } from "@/lib/supabase/anon";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { groupId: string };
  const { groupId } = body;
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const sb = sbAdmin();

  const { data: group } = await sb
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  const isOwner = (group as { admin_id: string } | null)?.admin_id === user.id;
  if (!isOwner) {
    const { data: membership } = await sb
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();
    const role = (membership as { role: string } | null)?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Same generation scheme as the DB column default: encode(gen_random_bytes(6), 'hex')
  let newPasskey = randomBytes(6).toString("hex");
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await sb
      .from("groups")
      .select("id")
      .eq("passkey", newPasskey)
      .maybeSingle();
    if (!existing) break;
    newPasskey = randomBytes(6).toString("hex");
  }

  const { error } = await sb
    .from("groups")
    .update({ passkey: newPasskey })
    .eq("id", groupId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, passkey: newPasskey });
}
