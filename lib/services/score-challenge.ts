import type { SupabaseClient } from "@supabase/supabase-js";
import { HISTORIC_SCORES, type HistoricScore } from "@/lib/data/historic-scores";

// "Guess the Score" — a historic match's final score, guessed like a
// Wordle-for-numbers: each guess is a (home, away) goal pair, and every
// wrong guess gets ↑/↓/✓ feedback per number PLUS unlocks the next
// fixture-identifying clue (year, then each team name). Competition+stage
// is shown from the start. See lib/data/historic-scores.ts for the pool.

export const TRY_LIMIT = 4;
export const CLUE_ORDER = ["year", "homeTeam", "awayTeam"] as const;
export type ClueField = (typeof CLUE_ORDER)[number];

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayOfYear(dateISO: string): number {
  const d = new Date(`${dateISO}T00:00:00Z`);
  const startOfYear = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d.getTime() - startOfYear) / 86_400_000);
}

export function getScoreChallengeForDate(dateISO: string): HistoricScore {
  const idx = dayOfYear(dateISO) % HISTORIC_SCORES.length;
  return HISTORIC_SCORES[idx];
}

export type NumberFeedback = "correct" | "too_high" | "too_low";

export function feedbackFor(guess: number, actual: number): NumberFeedback {
  if (guess === actual) return "correct";
  return guess > actual ? "too_high" : "too_low";
}

export type ScoreGuessRecord = {
  home: number;
  away: number;
  home_feedback: NumberFeedback;
  away_feedback: NumberFeedback;
};

export function checkGuess(
  challenge: HistoricScore,
  homeGuess: number,
  awayGuess: number
): { correct: boolean; homeFeedback: NumberFeedback; awayFeedback: NumberFeedback } {
  const homeFeedback = feedbackFor(homeGuess, challenge.homeScore);
  const awayFeedback = feedbackFor(awayGuess, challenge.awayScore);
  return { correct: homeFeedback === "correct" && awayFeedback === "correct", homeFeedback, awayFeedback };
}

export type ClueState = {
  cluesUnlocked: ClueField[];
  values: { year?: number; homeTeam?: string; awayTeam?: string };
};

export function getClueState(challenge: HistoricScore, wrongGuessCount: number): ClueState {
  const cluesUnlocked = CLUE_ORDER.slice(0, Math.min(wrongGuessCount, CLUE_ORDER.length));
  const values: ClueState["values"] = {};
  for (const clue of cluesUnlocked) {
    if (clue === "year") values.year = challenge.year;
    if (clue === "homeTeam") values.homeTeam = challenge.homeTeam;
    if (clue === "awayTeam") values.awayTeam = challenge.awayTeam;
  }
  return { cluesUnlocked, values };
}

export type ScoreAttemptRow = {
  guesses: ScoreGuessRecord[];
  guess_count: number;
  solved: boolean;
  completed_at: string | null;
};

export type RecordScoreGuessResult = {
  guessCount: number;
  solved: boolean;
  outOfTries: boolean;
};

// Persists an authenticated guesser's attempt. Anonymous play stays
// entirely client-side (localStorage) — see lib/score-challenge-storage.ts
// — with no signup-time migration, since (unlike Daily Challenge) this
// game has no group-streak or leaderboard tie-in that would need it.
export async function recordScoreGuess(
  sb: SupabaseClient,
  userId: string,
  challengeDate: string,
  homeGuess: number,
  awayGuess: number
): Promise<RecordScoreGuessResult> {
  const challenge = getScoreChallengeForDate(challengeDate);
  const { data: existing } = await sb
    .from("score_challenge_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_date", challengeDate)
    .maybeSingle();

  if (existing?.completed_at) {
    return { guessCount: existing.guess_count, solved: existing.solved, outOfTries: !existing.solved };
  }

  const { correct, homeFeedback, awayFeedback } = checkGuess(challenge, homeGuess, awayGuess);
  const priorGuesses = ((existing?.guesses as ScoreGuessRecord[] | null) ?? []).filter(Boolean);
  const guesses: ScoreGuessRecord[] = [
    ...priorGuesses,
    { home: homeGuess, away: awayGuess, home_feedback: homeFeedback, away_feedback: awayFeedback },
  ];
  const solved = correct;
  const outOfTries = !solved && guesses.length >= TRY_LIMIT;
  const completed = solved || outOfTries;

  await sb.from("score_challenge_attempts").upsert(
    {
      id: existing?.id,
      user_id: userId,
      challenge_date: challengeDate,
      guesses,
      guess_count: guesses.length,
      solved,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,challenge_date" }
  );

  return { guessCount: guesses.length, solved, outOfTries };
}
