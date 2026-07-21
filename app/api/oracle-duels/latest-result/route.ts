export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLatestResolvedOracleDuel } from "@/lib/services/oracle-duels";

// Lightweight, mounted app-wide (unlike the full dashboard GET above) — the
// win-celebration popup polls this once per app-open to decide whether to
// show, without paying for nextChallenge + a 10-row history join every time.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ result: null }, { headers: { "Cache-Control": "no-store" } });

  const result = await getLatestResolvedOracleDuel(user.id);
  return NextResponse.json({ result }, { headers: { "Cache-Control": "no-store" } });
}
