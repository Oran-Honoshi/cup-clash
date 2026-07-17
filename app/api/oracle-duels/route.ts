export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOracleDuelDashboard, submitOracleDuel } from "@/lib/services/oracle-duels";

// Oracle Duel requires an account — the prediction is keyed by user_id,
// unlike the fully-anonymous mini-games in Game Room.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dashboard = await getOracleDuelDashboard(user.id);
  return NextResponse.json({ dashboard }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    { matchId?: string; homeScore?: number; awayScore?: number } | null;
  if (!body?.matchId || body.homeScore == null || body.awayScore == null) {
    return NextResponse.json({ error: "matchId, homeScore, and awayScore are required" }, { status: 400 });
  }

  const result = await submitOracleDuel(user.id, body.matchId, body.homeScore, body.awayScore);
  if (!result.ok) {
    const status = result.error === "locked" ? 409 : result.error === "invalid_score" ? 400 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ duel: result.duel }, { headers: { "Cache-Control": "no-store" } });
}
