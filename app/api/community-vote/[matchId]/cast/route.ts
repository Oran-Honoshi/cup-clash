export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { castVote, getMatchVoteState } from "@/lib/services/community-vote";

export async function POST(req: NextRequest, { params }: { params: { matchId: string } }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { voteId?: string; optionId?: string } | null;
  if (!body?.voteId || !body.optionId) {
    return NextResponse.json({ error: "voteId and optionId are required" }, { status: 400 });
  }

  const admin = sbAdmin();
  const result = await castVote(admin, user.id, body.voteId, body.optionId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const state = await getMatchVoteState(admin, params.matchId, user.id);
  return NextResponse.json({ open: true, ...state }, { headers: { "Cache-Control": "no-store" } });
}
