// Client-side guess storage for anonymous "Guess the Score" play — mirrors
// lib/daily-challenge-storage.ts's pattern for the Daily Challenge.

export type LocalScoreGuess = { home: number; away: number; homeFeedback: string; awayFeedback: string; correct: boolean };
export type LocalScoreAttempt = { guesses: LocalScoreGuess[] };

function storageKey(challengeDate: string): string {
  return `cupclash_score_challenge_${challengeDate}`;
}

export function loadLocalScoreAttempt(challengeDate: string): LocalScoreAttempt {
  if (typeof window === "undefined") return { guesses: [] };
  try {
    const raw = window.localStorage.getItem(storageKey(challengeDate));
    if (!raw) return { guesses: [] };
    const parsed = JSON.parse(raw) as Partial<LocalScoreAttempt>;
    return { guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [] };
  } catch {
    return { guesses: [] };
  }
}

export function saveLocalScoreAttempt(challengeDate: string, attempt: LocalScoreAttempt): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(challengeDate), JSON.stringify(attempt));
  } catch {
    // best-effort — storage full/blocked shouldn't crash the game
  }
}
