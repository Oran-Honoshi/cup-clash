export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { getGroupStreak } from "@/lib/services/daily-challenge";

// Group Streak for the Daily Challenge — always the shared
// getGroupStreak() computation (see lib/services/daily-challenge.ts),
// never recomputed inline here or anywhere else.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = sbAdmin();
  const result = await getGroupStreak(sb, params.id);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
