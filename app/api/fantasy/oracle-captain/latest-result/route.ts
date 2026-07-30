export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLatestResolvedOracleCaptainResult } from "@/lib/services/fantasy-gameweek-picks";

// Mirrors app/api/oracle-duels/latest-result/route.ts — mounted app-wide,
// polled once per app-open by OracleCaptainCelebrationTrigger.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ result: null }, { headers: { "Cache-Control": "no-store" } });

  const result = await getLatestResolvedOracleCaptainResult(user.id);
  return NextResponse.json({ result }, { headers: { "Cache-Control": "no-store" } });
}
