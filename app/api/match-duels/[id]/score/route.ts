export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitMatchDuelScore } from "@/lib/services/match-duels";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { homeScore?: number; awayScore?: number } | null;
  if (typeof body?.homeScore !== "number" || typeof body?.awayScore !== "number") {
    return NextResponse.json({ error: "invalid_score" }, { status: 400 });
  }

  const result = await submitMatchDuelScore(user.id, params.id, body.homeScore, body.awayScore);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404
      : result.error === "forbidden" ? 403
      : result.error === "invalid_score" ? 400
      : 409;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
