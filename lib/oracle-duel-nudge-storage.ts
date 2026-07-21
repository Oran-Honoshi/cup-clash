// Client-side once-per-day cap for the Oracle Duel nudge bottom sheet —
// same shown-today pattern as reengagement-storage.ts, its own key so the
// two caps don't interfere with each other.

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function shownTodayKey(): string {
  return `cupclash_oracle_duel_nudge_shown_${todayKey()}`;
}

export function wasNudgeShownToday(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(shownTodayKey()) === "1";
  } catch {
    return true;
  }
}

export function markNudgeShownToday(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(shownTodayKey(), "1");
  } catch {
    // best-effort — storage full/blocked shouldn't crash the app
  }
}
