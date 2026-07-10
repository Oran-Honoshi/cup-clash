// lib/sound-preference.ts
// Global UI sound on/off toggle. Device-local only (localStorage) — unlike
// theme_preference this doesn't need to be account-synced.

const STORAGE_KEY = "cupclash_sound_enabled";

export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {}
}
