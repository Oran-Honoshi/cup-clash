export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchUpcomingMatchesForDuel } from "@/lib/services/match-duels";

// Step 1 of the challenge flow — pick which upcoming match to duel over,
// before picking an opponent. Requires auth purely to match the rest of
// the match-duels API surface; the query itself has no per-user scoping.
export async function GET(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q");
  const matches = await searchUpcomingMatchesForDuel(q);
  return NextResponse.json({ matches }, { headers: { "Cache-Control": "no-store" } });
}
