export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getScoreChallengeForDate, getClueState, todayISO, TRY_LIMIT, type ScoreGuessRecord } from "@/lib/services/score-challenge";

// Public, anonymous-playable — no auth required. The answer (teams/score)
// is never sent to the client except via the gated clue state, same
// contract as /api/daily-challenge.
export async function GET(req: Request) {
  const challengeDate = todayISO();
  const challenge = getScoreChallengeForDate(challengeDate);

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  let attempt: { guessCount: number; solved: boolean; outOfTries: boolean; guesses: ScoreGuessRecord[] } | null = null;

  if (user) {
    const admin = sbAdmin();
    const { data } = await admin
      .from("score_challenge_attempts")
      .select("guess_count, solved, completed_at, guesses")
      .eq("user_id", user.id)
      .eq("challenge_date", challengeDate)
      .maybeSingle();
    if (data) {
      attempt = {
        guessCount: data.guess_count,
        solved: data.solved,
        outOfTries: !data.solved && !!data.completed_at,
        guesses: (data.guesses as ScoreGuessRecord[] | null) ?? [],
      };
    }
  }

  const wrongGuessesParam = new URL(req.url).searchParams.get("wrongGuesses");
  const wrongGuessCount = attempt
    ? attempt.guesses.filter(g => g.home_feedback !== "correct" || g.away_feedback !== "correct").length
    : Math.max(0, Math.min(TRY_LIMIT, Number(wrongGuessesParam) || 0));

  const clueState = getClueState(challenge, wrongGuessCount);

  return NextResponse.json(
    {
      challengeDate,
      competition: challenge.competition,
      stage: challenge.stage,
      tryLimit: TRY_LIMIT,
      clueState,
      attempt,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
