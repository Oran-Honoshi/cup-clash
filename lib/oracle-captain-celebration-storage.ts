// Mirrors lib/oracle-duel-celebration-storage.ts — single "last shown" slot,
// not a set/history.
const KEY = "cupclash_oracle_captain_last_celebrated";

export function wasCelebrated(scoreId: string): boolean {
  if (typeof window === "undefined") return true;
  try { return window.localStorage.getItem(KEY) === scoreId; } catch { return true; }
}

export function markCelebrated(scoreId: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, scoreId); } catch {}
}
