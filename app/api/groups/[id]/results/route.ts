export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: groupId } = params;
  const sb = sbAdmin();

  const { data: matches, error: matchErr } = await sb
    .from("matches")
    .select("id, home, away, home_score, away_score, home_score_et, away_score_et, home_flag, away_flag, kickoff_at, stage, group_letter, status")
    .in("status", ["finished", "live"])
    .order("kickoff_at", { ascending: false });

  if (matchErr) {
    return NextResponse.json({ error: matchErr.message }, { status: 500 });
  }

  const matchIds = (matches ?? []).map((m: { id: string }) => m.id);
  if (matchIds.length === 0) {
    return NextResponse.json({ matches: [], predictions: [] });
  }

  const { data: predictions, error: predErr } = await sb
    .from("group_predictions")
    .select("user_id, match_id, home_score, away_score, points_earned, is_exact")
    .eq("group_id", groupId)
    .in("match_id", matchIds);

  if (predErr) {
    return NextResponse.json({ error: predErr.message }, { status: 500 });
  }

  return NextResponse.json(
    { matches: matches ?? [], predictions: predictions ?? [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
