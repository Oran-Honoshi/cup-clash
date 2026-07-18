// Client-side gating for the match-reminder bottom sheet — dismissal is
// keyed per (matchId, tier) so the 24h and 1h reminders for the same match
// are independent: dismissing the 24h one must not suppress the later 1h
// nudge (and vice versa), while opening the app again before the next tier
// never re-shows a tier already seen.

const KEY = "cupclash_match_reminders_shown";

function readShown(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function wasMatchReminderShown(matchId: string, tier: string): boolean {
  return Boolean(readShown()[`${matchId}:${tier}`]);
}

export function markMatchReminderShown(matchId: string, tier: string): void {
  if (typeof window === "undefined") return;
  try {
    const shown = readShown();
    shown[`${matchId}:${tier}`] = true;
    window.localStorage.setItem(KEY, JSON.stringify(shown));
  } catch {
    // best-effort — storage full/blocked shouldn't crash the app
  }
}
