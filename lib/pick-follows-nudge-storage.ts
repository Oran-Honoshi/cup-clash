// Client-side cadence for the "pick your follows" nudge bottom sheet —
// same shown-today pattern as reengagement-storage.ts / oracle-duel-nudge-storage.ts,
// its own key so the caps don't interfere with each other. Also adds a
// permanent opt-out flag (undated key) for "Don't ask again", separate
// from the daily cadence key.

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function shownTodayKey(): string {
  return `cupclash_pick_follows_nudge_shown_${todayKey()}`;
}

const OPT_OUT_KEY = "cupclash_pick_follows_nudge_optout";

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

export function isNudgeOptedOut(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return true;
  }
}

export function setNudgeOptedOut(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OPT_OUT_KEY, "1");
  } catch {
    // best-effort — storage full/blocked shouldn't crash the app
  }
}
