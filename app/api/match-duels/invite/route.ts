export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMatchDuelInvite } from "@/lib/services/match-duels";

// Creates the opponent-less row a share link points at — see
// getInviteByToken/acceptMatchDuelInvite in lib/services/match-duels.ts for
// the public claim side of this flow.
export async function POST(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { matchId?: string } | null;
  if (!body?.matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const result = await createMatchDuelInvite(user.id, body.matchId);
  if (!result.ok) {
    const status = result.error === "locked" ? 409 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ token: result.token, duelId: result.duelId });
}
