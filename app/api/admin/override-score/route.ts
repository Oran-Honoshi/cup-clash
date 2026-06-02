import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { scoreMatchResult } from "@/lib/services/predictions";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function sbAnon() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  // Authenticate caller
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    groupId:   string;
    matchId:   string;
    homeScore: number;
    awayScore: number;
    note?:     string;
    remove?:   boolean; // true = delete the override and rescore with global score
  };

  const { groupId, matchId, homeScore, awayScore, note, remove } = body;
  if (!groupId || !matchId) {
    return NextResponse.json({ error: "groupId and matchId are required" }, { status: 400 });
  }

  // Verify caller is the group admin
  const { data: group } = await sbAdmin()
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  if (!group || (group as { admin_id: string }).admin_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sb = sbAdmin();

  if (remove) {
    // Delete the override, then rescore using the global match score
    await sb.from("match_overrides")
      .delete()
      .eq("group_id", groupId)
      .eq("match_id",  matchId);

    const { data: match } = await sb
      .from("matches")
      .select("home_score, away_score")
      .eq("id", matchId)
      .maybeSingle();

    const { data: rules } = await sb
      .from("scoring_rules")
      .select("exact_score, correct_outcome")
      .eq("group_id", groupId)
      .maybeSingle();

    const m = match as { home_score: number | null; away_score: number | null } | null;
    const r = rules as { exact_score: number; correct_outcome: number } | null;

    if (m?.home_score != null && m?.away_score != null) {
      await scoreMatchResult({
        matchId,
        groupId,
        homeScore:  m.home_score,
        awayScore:  m.away_score,
        rules: { exactScore: r?.exact_score ?? 25, correctOutcome: r?.correct_outcome ?? 10 },
      });
    }

    return NextResponse.json({ success: true, removed: true, pointsRecalculated: true });
  }

  // Upsert the override
  const { error: upsertErr } = await sb.from("match_overrides").upsert({
    group_id:   groupId,
    match_id:   matchId,
    home_score: homeScore,
    away_score: awayScore,
    admin_id:   user.id,
    note:       note ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "group_id,match_id" });

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // Fetch scoring rules for this group
  const { data: rules } = await sb
    .from("scoring_rules")
    .select("exact_score, correct_outcome")
    .eq("group_id", groupId)
    .maybeSingle();

  const r = rules as { exact_score: number; correct_outcome: number } | null;

  // Immediately rescore all predictions for this match in this group
  await scoreMatchResult({
    matchId,
    groupId,
    homeScore,
    awayScore,
    rules: { exactScore: r?.exact_score ?? 25, correctOutcome: r?.correct_outcome ?? 10 },
  });

  return NextResponse.json({ success: true, pointsRecalculated: true });
}
