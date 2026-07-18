// Client-side gating for the house-group join-invite bottom sheet — shown
// at most once ever per browser (not daily, unlike reengagement-storage.ts's
// shown-today cap): dismissed permanently on explicit close or on join.

const DISMISSED_KEY = "cupclash_house_invite_dismissed";

export function wasHouseInviteDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissHouseInvite(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // best-effort — storage full/blocked shouldn't crash the app
  }
}
