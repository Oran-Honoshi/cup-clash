export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { WORLD_CUP_STAGE_LIST } from "@/lib/schedule";

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

  // All World Cup matches (every stage, every status) — the Results tab
  // shows the group's complete picture: finished results, live-in-progress,
  // and upcoming matches with the prediction already locked in but no points
  // yet. Scoped to World Cup stages only (not the multi-league expansion's
  // "League"/"UCL R16" etc. rows) — groups aren't scoped to a competition_id
  // yet, so without this a World Cup group's Results tab would get flooded
  // with hundreds of unrelated league/UCL fixtures.
  const { data: matches, error: matchErr } = await sb
    .from("matches")
    .select("id, home, away, home_score, away_score, home_score_et, away_score_et, home_flag, away_flag, kickoff_at, stage, group_letter, status")
    .in("stage", WORLD_CUP_STAGE_LIST)
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

  // Grand totals per member across ALL prediction types (match, tournament picks,
  // best-third, bonus questions) so this matches the totals shown in the
  // Leaderboard / My Stats / Player Drawer instead of only match-grid points.
  const [{ data: allPoints }, { data: bonusPoints }] = await Promise.all([
    sb.from("group_predictions").select("user_id, points_earned").eq("group_id", groupId),
    sb.from("bonus_answers").select("user_id, points_earned").eq("group_id", groupId),
  ]);

  const totals: Record<string, number> = {};
  for (const r of (allPoints ?? []) as { user_id: string; points_earned: number | null }[]) {
    totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.points_earned ?? 0);
  }
  for (const r of (bonusPoints ?? []) as { user_id: string; points_earned: number | null }[]) {
    totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.points_earned ?? 0);
  }

  return NextResponse.json(
    { matches: matches ?? [], predictions: predictions ?? [], totals },
    { headers: { "Cache-Control": "no-store" } }
  );
}
