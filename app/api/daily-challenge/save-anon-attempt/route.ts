export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { saveAnonymousAttempt } from "@/lib/services/daily-challenge";

// Called once, right after signup, by <ConsumeDailyChallengeParam> — persists
// the guess history an anonymous player built up in localStorage before they
// had an account. Requires auth; never accepts a userId from the body.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { challengeDate?: string; guesses?: { player_id: string }[] }
    | null;
  if (!body?.challengeDate || !Array.isArray(body.guesses)) {
    return NextResponse.json({ error: "challengeDate and guesses are required" }, { status: 400 });
  }

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const admin = sbAdmin();
  const { data: challenge } = await admin
    .from("daily_challenges")
    .select("*")
    .eq("challenge_date", body.challengeDate)
    .maybeSingle();
  if (!challenge) {
    return NextResponse.json({ error: "Unknown challenge date" }, { status: 404 });
  }

  const result = await saveAnonymousAttempt(admin, user.id, challenge, body.guesses);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
