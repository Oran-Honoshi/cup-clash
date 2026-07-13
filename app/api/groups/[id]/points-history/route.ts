export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getPointsHistory } from "@/lib/services/points-history";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const groupId = params.id;
  const admin = sbAdmin();

  const { data: membership } = await admin
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "Not a group member" }, { status: 403 });

  const history = await getPointsHistory(admin, groupId);
  return NextResponse.json(history, { headers: { "Cache-Control": "no-store" } });
}
