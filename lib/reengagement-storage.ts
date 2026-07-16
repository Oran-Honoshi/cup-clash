// Client-side gating for the re-engagement bottom sheet — the shown-today
// cap (account-agnostic, browser-local is fine per spec) and the anonymous
// last-seen timestamp (no profile row to hang a server-side one off).

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function shownTodayKey(): string {
  return `cupclash_reengagement_shown_${todayKey()}`;
}

export function wasShownToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(shownTodayKey()) === "1";
  } catch {
    return false;
  }
}

export function markShownToday(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(shownTodayKey(), "1");
  } catch {
    // best-effort — storage full/blocked shouldn't crash the app
  }
}

const ANON_LAST_SEEN_KEY = "cupclash_anon_last_seen";

// Returns the previous timestamp (or null if never recorded) and stamps
// "now" in the same call, mirroring the read-then-write the server route
// does for logged-in users' profiles.last_seen_at.
export function touchAnonLastSeen(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const previous = window.localStorage.getItem(ANON_LAST_SEEN_KEY);
    window.localStorage.setItem(ANON_LAST_SEEN_KEY, new Date().toISOString());
    return previous;
  } catch {
    return null;
  }
}
