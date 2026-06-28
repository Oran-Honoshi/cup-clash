/**
 * Returns true once the prediction window has closed.
 * Predictions lock 5 minutes before kickoff.
 */
export function isMatchLocked(kickoffIso: string): boolean {
  return Date.now() >= new Date(kickoffIso).getTime() - 5 * 60 * 1000;
}
