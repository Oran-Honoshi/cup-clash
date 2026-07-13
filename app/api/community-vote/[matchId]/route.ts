export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getMatchVoteState } from "@/lib/services/community-vote";

// Public read — anonymous visitors can see the poll, only signed-in users
// can cast. Lazily opens the poll (creates the community_votes row) the
// first time anyone asks about a now-finished match, same on-demand pattern
// as getOrCreateTodayChallenge for the Daily Challenge.
export async function GET(_req: NextRequest, { params }: { params: { matchId: string } }) {
  const admin = sbAdmin();
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  const state = await getMatchVoteState(admin, params.matchId, user?.id ?? null);
  if (!state) {
    return NextResponse.json({ open: false }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ open: true, ...state }, { headers: { "Cache-Control": "no-store" } });
}
