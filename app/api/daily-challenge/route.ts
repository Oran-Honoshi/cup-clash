export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTodayChallenge, getClueState, TRY_LIMIT, type GuessRecord } from "@/lib/services/daily-challenge";

// Public, anonymous-playable — no auth required. Returns today's puzzle
// metadata and clue state, plus the caller's saved attempt if signed in.
// `wrongGuesses` lets a signed-out visitor reconstruct clue state after a
// page refresh from their own client-side guess history, without the
// server ever needing to store (or reveal) anything for them.
export async function GET(req: Request) {
  const admin = sbAdmin();
  const challenge = await getOrCreateTodayChallenge(admin);

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  let attempt: {
    guessCount: number;
    solved: boolean;
    outOfTries: boolean;
    guesses: GuessRecord[];
    shareText: string | null;
  } | null = null;

  if (user) {
    // lib/supabase/types.ts's Database type doesn't cover this table yet
    // (it's stale relative to the real schema — see players/chat_messages
    // etc.), so table reads go through sbAdmin() rather than fighting that
    // type; `user.id` from the verified session is the security boundary.
    const { data } = await admin
      .from("daily_challenge_attempts")
      .select("guess_count, solved, completed_at, guesses, share_text")
      .eq("user_id", user.id)
      .eq("challenge_id", challenge.id)
      .maybeSingle();
    if (data) {
      attempt = {
        guessCount: data.guess_count,
        solved: data.solved,
        outOfTries: !data.solved && !!data.completed_at,
        guesses: (data.guesses as GuessRecord[] | null) ?? [],
        shareText: data.share_text,
      };
    }
  }

  const wrongGuessesParam = new URL(req.url).searchParams.get("wrongGuesses");
  const wrongGuessCount = attempt
    ? attempt.guesses.filter(g => !g.correct).length
    : Math.max(0, Math.min(TRY_LIMIT, Number(wrongGuessesParam) || 0));

  const clueState = await getClueState(admin, challenge, wrongGuessCount);

  return NextResponse.json(
    {
      challengeId: challenge.id,
      challengeDate: challenge.challenge_date,
      gameType: challenge.game_type,
      tryLimit: TRY_LIMIT,
      clueOrder: challenge.clue_order,
      clueState,
      attempt,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
