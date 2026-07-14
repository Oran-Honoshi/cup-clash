export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getScoreChallengeForDate,
  getClueState,
  checkGuess,
  recordScoreGuess,
  todayISO,
  TRY_LIMIT,
} from "@/lib/services/score-challenge";

// Works for anonymous and signed-in guessers alike — the answer is never
// sent to the client, only per-number ↑/↓/✓ feedback and the next clue
// state. Persistence only happens when signed in (see recordScoreGuess).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { homeGuess?: number; awayGuess?: number; priorWrongGuesses?: number }
    | null;
  const homeGuess = Number(body?.homeGuess);
  const awayGuess = Number(body?.awayGuess);
  if (!Number.isInteger(homeGuess) || !Number.isInteger(awayGuess) || homeGuess < 0 || awayGuess < 0) {
    return NextResponse.json({ error: "homeGuess and awayGuess must be non-negative integers" }, { status: 400 });
  }

  const challengeDate = todayISO();
  const challenge = getScoreChallengeForDate(challengeDate);
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  let guessCount: number;
  let solved: boolean;
  let outOfTries: boolean;
  let homeFeedback: string;
  let awayFeedback: string;

  if (user) {
    const admin = sbAdmin();
    const result = await recordScoreGuess(admin, user.id, challengeDate, homeGuess, awayGuess);
    guessCount = result.guessCount;
    solved = result.solved;
    outOfTries = result.outOfTries;
    const feedback = checkGuess(challenge, homeGuess, awayGuess);
    homeFeedback = feedback.homeFeedback;
    awayFeedback = feedback.awayFeedback;
  } else {
    const feedback = checkGuess(challenge, homeGuess, awayGuess);
    homeFeedback = feedback.homeFeedback;
    awayFeedback = feedback.awayFeedback;
    const priorWrong = Math.max(0, Math.min(TRY_LIMIT, Number(body?.priorWrongGuesses) || 0));
    guessCount = priorWrong + 1;
    solved = feedback.correct;
    outOfTries = !solved && guessCount >= TRY_LIMIT;
  }

  const wrongGuessCount = guessCount - (solved ? 1 : 0);
  const clueState = getClueState(challenge, wrongGuessCount);
  const completed = solved || outOfTries;

  return NextResponse.json(
    {
      correct: solved,
      solved,
      outOfTries,
      guessCount,
      clueState,
      homeFeedback,
      awayFeedback,
      reveal: completed
        ? {
            competition: challenge.competition,
            stage: challenge.stage,
            year: challenge.year,
            homeTeam: challenge.homeTeam,
            awayTeam: challenge.awayTeam,
            homeScore: challenge.homeScore,
            awayScore: challenge.awayScore,
          }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
