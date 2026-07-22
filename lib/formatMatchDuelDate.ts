"use client";

/**
 * Format an ISO match kickoff string for Match Duel UI ("Fri, 12 Jun · 18:00").
 * Kept out of lib/services/match-duels.ts so client components that only need
 * this formatter don't pull in that module's crypto/Supabase admin dependencies.
 */
export function formatMatchDuelDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
