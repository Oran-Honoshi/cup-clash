// Client-side guess storage for anonymous Daily Challenge play — the one
// place that defines the localStorage key/shape, shared by the puzzle page
// and <ConsumeDailyChallengeParam> so they can never drift out of sync.

export type LocalGuess = { player_id: string; correct: boolean };
export type LocalAttempt = { guesses: LocalGuess[] };

function storageKey(challengeDate: string): string {
  return `cupclash_daily_challenge_${challengeDate}`;
}

export function loadLocalAttempt(challengeDate: string): LocalAttempt {
  if (typeof window === "undefined") return { guesses: [] };
  try {
    const raw = window.localStorage.getItem(storageKey(challengeDate));
    if (!raw) return { guesses: [] };
    const parsed = JSON.parse(raw) as Partial<LocalAttempt>;
    return { guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [] };
  } catch {
    return { guesses: [] };
  }
}

export function saveLocalAttempt(challengeDate: string, attempt: LocalAttempt): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(challengeDate), JSON.stringify(attempt));
  } catch {
    // best-effort — storage full/blocked shouldn't crash the game
  }
}

export function clearLocalAttempt(challengeDate: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(challengeDate));
  } catch {
    // no-op
  }
}
