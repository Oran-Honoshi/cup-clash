export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { acceptMatchDuelInvite } from "@/lib/services/match-duels";

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await acceptMatchDuelInvite(user.id, params.token);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : result.error === "self" ? 400 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, duelId: result.duelId });
}
