import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { scoreMatchResult } from "@/lib/services/predictions";
import type { ScoringRules } from "@/lib/types";

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

const SCORING_RULES_SELECT = [
  "exact_score", "correct_outcome",
  "gs_exact_score", "gs_correct_outcome",
  "r32_exact_score", "r32_correct_outcome",
  "r16_exact_score", "r16_correct_outcome",
  "qf_exact_score", "qf_correct_outcome",
  "sf_exact_score", "sf_correct_outcome",
  "third_exact_score", "third_correct_outcome",
  "final_exact_score", "final_correct_outcome",
  "use_progressive_scoring",
].join(", ");

type ScoringRulesRow = {
  exact_score: number; correct_outcome: number;
  gs_exact_score: number; gs_correct_outcome: number;
  r32_exact_score: number; r32_correct_outcome: number;
  r16_exact_score: number; r16_correct_outcome: number;
  qf_exact_score: number; qf_correct_outcome: number;
  sf_exact_score: number; sf_correct_outcome: number;
  third_exact_score: number; third_correct_outcome: number;
  final_exact_score: number; final_correct_outcome: number;
  use_progressive_scoring: boolean;
};

function buildScoringRules(r: ScoringRulesRow | null): ScoringRules {
  return {
    exactScore:            r?.exact_score            ?? 25,
    correctOutcome:        r?.correct_outcome        ?? 10,
    gsExactScore:          r?.gs_exact_score         ?? 25,
    gsCorrectOutcome:      r?.gs_correct_outcome     ?? 10,
    r32ExactScore:         r?.r32_exact_score        ?? 25,
    r32CorrectOutcome:     r?.r32_correct_outcome    ?? 10,
    r16ExactScore:         r?.r16_exact_score        ?? 25,
    r16CorrectOutcome:     r?.r16_correct_outcome    ?? 10,
    qfExactScore:          r?.qf_exact_score         ?? 25,
    qfCorrectOutcome:      r?.qf_correct_outcome     ?? 10,
    sfExactScore:          r?.sf_exact_score         ?? 25,
    sfCorrectOutcome:      r?.sf_correct_outcome     ?? 10,
    thirdExactScore:       r?.third_exact_score      ?? 25,
    thirdCorrectOutcome:   r?.third_correct_outcome  ?? 10,
    finalExactScore:       r?.final_exact_score      ?? 25,
    finalCorrectOutcome:   r?.final_correct_outcome  ?? 10,
    useProgressiveScoring: Boolean(r?.use_progressive_scoring),
  };
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

  // Verify caller is the group owner or co-admin
  const { data: group } = await sbAdmin()
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  const isOwner = (group as { admin_id: string } | null)?.admin_id === user.id;
  if (!isOwner) {
    const { data: membership } = await sbAdmin()
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();
    const role = (membership as { role: string } | null)?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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

    const { data: rulesRow } = await sb
      .from("scoring_rules")
      .select(SCORING_RULES_SELECT)
      .eq("group_id", groupId)
      .maybeSingle();

    const m = match as { home_score: number | null; away_score: number | null } | null;

    if (m?.home_score != null && m?.away_score != null) {
      await scoreMatchResult({
        matchId,
        groupId,
        homeScore: m.home_score,
        awayScore: m.away_score,
        rules:     buildScoringRules(rulesRow as ScoringRulesRow | null),
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
  const { data: rulesRow2 } = await sb
    .from("scoring_rules")
    .select(SCORING_RULES_SELECT)
    .eq("group_id", groupId)
    .maybeSingle();

  // Immediately rescore all predictions for this match in this group
  await scoreMatchResult({
    matchId,
    groupId,
    homeScore,
    awayScore,
    rules: buildScoringRules(rulesRow2 as ScoringRulesRow | null),
  });

  return NextResponse.json({ success: true, pointsRecalculated: true });
}
