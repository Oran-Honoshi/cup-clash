import type { Match } from "@/lib/types";
import { MOCK_MATCHES } from "@/lib/mocks/data";

function getSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getUpcomingMatches(): Promise<Match[]> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, stage")
      .eq("status", "upcoming")
      .order("kickoff_at", { ascending: true })
      .limit(20);
    if (error || !data) throw error ?? new Error("Could not load matches");
    return (data as Array<{
      id: string;
      home: string;
      away: string;
      home_flag: string | null;
      away_flag: string | null;
      kickoff_at: string;
      stage: string;
    }>).map((m) => ({
      id: m.id,
      home: m.home,
      away: m.away,
      homeFlagCode: m.home_flag ?? undefined,
      awayFlagCode: m.away_flag ?? undefined,
      time: m.kickoff_at,
      stage: m.stage as Match["stage"],
    }));
  }
  const now = Date.now();
  return MOCK_MATCHES
    .filter((m) => new Date(m.time).getTime() > now)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export async function getNextMatch(): Promise<Match | null> {
  const upcoming = await getUpcomingMatches();
  return upcoming[0] ?? null;
}

export function getTournamentStart(): Date {
  return new Date("2026-06-11T22:00:00Z");
}