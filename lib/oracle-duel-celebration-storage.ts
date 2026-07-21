// Client-side "already celebrated" gate for the Oracle Duel win-celebration
// popup — one localStorage slot holding the last duelId shown, mirroring
// reengagement-storage.ts's browser-local, account-agnostic approach rather
// than adding a `celebration_seen_at` column for a purely cosmetic concern.

const KEY = "cupclash_oracle_duel_last_celebrated";

export function wasCelebrated(duelId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === duelId;
  } catch {
    return true;
  }
}

export function markCelebrated(duelId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, duelId);
  } catch {
    // best-effort — storage full/blocked shouldn't crash the app
  }
}
