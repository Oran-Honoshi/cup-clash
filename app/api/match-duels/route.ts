export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMatchDuel, listMyMatchDuels } from "@/lib/services/match-duels";

// Match Duel requires an account on both sides, same as daily_duels — see
// createMatchDuel in lib/services/match-duels.ts for the pairing rules.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const duels = await listMyMatchDuels(user.id);
  return NextResponse.json({ duels }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { opponentId?: string; matchId?: string } | null;
  if (!body?.opponentId || !body?.matchId) {
    return NextResponse.json({ error: "opponentId and matchId are required" }, { status: 400 });
  }

  const result = await createMatchDuel(user.id, body.opponentId, body.matchId);
  if (!result.ok) {
    const status = result.error === "self" ? 400 : result.error === "locked" ? 409 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ duelId: result.duelId, status: result.status });
}
