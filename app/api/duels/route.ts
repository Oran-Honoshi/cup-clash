export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createDuel, listMyDuelsToday } from "@/lib/services/duels";

// Duels require an account on both sides (a challenge is meaningless
// without an identified opponent) — unlike Daily Challenge/Guess the
// Score, there's no anonymous path here.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const duels = await listMyDuelsToday(sbAdmin(), user.id);
  return NextResponse.json({ duels }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { opponentId?: string } | null;
  if (!body?.opponentId) return NextResponse.json({ error: "opponentId is required" }, { status: 400 });

  const result = await createDuel(sbAdmin(), user.id, body.opponentId);
  if (!result.ok) {
    const status = result.error === "self" ? 400 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ duelId: result.duelId, status: result.status });
}
