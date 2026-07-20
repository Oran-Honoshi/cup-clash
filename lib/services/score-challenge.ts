import type { SupabaseClient } from "@supabase/supabase-js";
import { HISTORIC_SCORES, type HistoricScore, type TeamKind } from "@/lib/data/historic-scores";

// "Guess the Score" — a historic match's final score, guessed like a
// Wordle-for-numbers: each guess is a (home, away) goal pair, and every
// wrong guess gets ↑/↓/✓ feedback per number PLUS unlocks the next
// fixture-identifying clue (year, then each team's crest/flag). Competition
// +stage is shown from the start. See lib/data/historic-scores.ts for the
// pool. Additionally, each side (home/away) independently "locks" the first
// time its number is guessed correctly — from then on that side is pinned
// to the real score for every subsequent guess, regardless of what's
// resubmitted for it, so a player can nail one side early and keep
// narrowing down the other.

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

export type TeamBadgeClue = { url: string; kind: TeamKind };

export type ClueState = {
  cluesUnlocked: ClueField[];
  values: { year?: number; homeTeam?: TeamBadgeClue; awayTeam?: TeamBadgeClue };
};

export function getClueState(challenge: HistoricScore, wrongGuessCount: number): ClueState {
  const cluesUnlocked = CLUE_ORDER.slice(0, Math.min(wrongGuessCount, CLUE_ORDER.length));
  const values: ClueState["values"] = {};
  for (const clue of cluesUnlocked) {
    if (clue === "year") values.year = challenge.year;
    if (clue === "homeTeam") values.homeTeam = { url: challenge.homeBadgeUrl, kind: challenge.homeTeamKind };
    if (clue === "awayTeam") values.awayTeam = { url: challenge.awayBadgeUrl, kind: challenge.awayTeamKind };
  }
  return { cluesUnlocked, values };
}

export type LockState = { home: boolean; away: boolean };

export function getLockState(guesses: ScoreGuessRecord[]): LockState {
  return {
    home: guesses.some((g) => g.home_feedback === "correct"),
    away: guesses.some((g) => g.away_feedback === "correct"),
  };
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
  homeFeedback: NumberFeedback;
  awayFeedback: NumberFeedback;
  homeLocked: boolean;
  awayLocked: boolean;
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

  const priorGuesses = ((existing?.guesses as ScoreGuessRecord[] | null) ?? []).filter(Boolean);

  if (existing?.completed_at) {
    const feedback = checkGuess(challenge, homeGuess, awayGuess);
    const lock = getLockState(priorGuesses);
    return {
      guessCount: existing.guess_count,
      solved: existing.solved,
      outOfTries: !existing.solved,
      homeFeedback: feedback.homeFeedback,
      awayFeedback: feedback.awayFeedback,
      homeLocked: lock.home,
      awayLocked: lock.away,
    };
  }

  // A side that's already locked (guessed correctly in a prior attempt)
  // stays pinned to the real score from here on, no matter what's
  // resubmitted for it — the client stops letting the player edit it, but
  // this is the source of truth so a stray resubmission can't un-solve it.
  const priorLock = getLockState(priorGuesses);
  const effectiveHome = priorLock.home ? challenge.homeScore : homeGuess;
  const effectiveAway = priorLock.away ? challenge.awayScore : awayGuess;

  const { homeFeedback, awayFeedback } = checkGuess(challenge, effectiveHome, effectiveAway);
  const guesses: ScoreGuessRecord[] = [
    ...priorGuesses,
    { home: effectiveHome, away: effectiveAway, home_feedback: homeFeedback, away_feedback: awayFeedback },
  ];
  const lock = getLockState(guesses);
  const solved = lock.home && lock.away;
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

  return {
    guessCount: guesses.length,
    solved,
    outOfTries,
    homeFeedback,
    awayFeedback,
    homeLocked: lock.home,
    awayLocked: lock.away,
  };
}
