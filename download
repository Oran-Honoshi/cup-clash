import type { Match } from "@/lib/types";
import { MOCK_MATCHES } from "@/lib/mocks/data";

// See lib/services/groups.ts for the swap-to-Supabase pattern.

export async function getUpcomingMatches(): Promise<Match[]> {
  const now = Date.now();
  return MOCK_MATCHES
    .filter((m) => new Date(m.time).getTime() > now)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export async function getNextMatch(): Promise<Match | null> {
  const upcoming = await getUpcomingMatches();
  return upcoming[0] ?? null;
}

// Tournament kickoff — used by the hero countdown.
// Hardcoded for now; in production this comes from a tournament config row.
export function getTournamentStart(): Date {
  return new Date("2026-06-11T16:00:00Z");
}
