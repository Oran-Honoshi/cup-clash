import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ScoringRules, Match } from "@/lib/types";
import { getStagePoints } from "@/lib/scoring";

function defaultSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Save group stage prediction ───────────────────────────────────────────────

export async function saveGroupPrediction(params: {
  userId:    string;
  groupId:   string;
  matchId:   string;
  homeScore: number;
  awayScore: number;
}): Promise<{ success: boolean; locked: boolean }> {
  // Check if match is locked (within 5 min of kickoff)
  const { data: match } = await defaultSb()
    .from("matches")
    .select("kickoff_at")
    .eq("id", params.matchId)
    .single();

  if (match) {
    const kickoff  = new Date((match as { kickoff_at: string }).kickoff_at).getTime();
    const fiveMin  = 5 * 60 * 1000;
    if (Date.now() >= kickoff - fiveMin) {
      return { success: false, locked: true };
    }
  }

  const { error } = await defaultSb()
    .from("group_predictions")
    .upsert({
      user_id:    params.userId,
      group_id:   params.groupId,
      match_id:   params.matchId,
      home_score: params.homeScore,
      away_score: params.awayScore,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,group_id,match_id" });

  if (error) {
    console.error("saveGroupPrediction error:", error);
    return { success: false, locked: false };
  }

  return { success: true, locked: false };
}

// ── Get user's predictions for a group ───────────────────────────────────────

export async function getUserPredictions(
  userId:  string,
  groupId: string
): Promise<Record<string, { homeScore: string; awayScore: string }>> {
  const { data } = await defaultSb()
    .from("group_predictions")
    .select("match_id, home_score, away_score, locked_at")
    .eq("user_id",  userId)
    .eq("group_id", groupId);

  const map: Record<string, { homeScore: string; awayScore: string }> = {};
  (data ?? []).forEach((p: {
    match_id: string; home_score: number; away_score: number; locked_at: string | null;
  }) => {
    map[p.match_id] = {
      homeScore: String(p.home_score),
      awayScore: String(p.away_score),
    };
  });
  return map;
}

// ── Get all predictions for a match (for scoring) ────────────────────────────

export async function getMatchPredictions(
  matchId: string,
  groupId: string,
  client?: SupabaseClient,
) {
  const c = client ?? defaultSb();
  const { data } = await c
    .from("group_predictions")
    .select("user_id, home_score, away_score, points_earned, is_exact")
    .eq("match_id", matchId)
    .eq("group_id", groupId);

  return (data ?? []) as Array<{
    user_id: string; home_score: number; away_score: number;
    points_earned: number; is_exact: boolean;
  }>;
}

// ── Score a match result (called after match ends) ───────────────────────────
// Pass sbClient (service role) when calling from server-side cron to bypass RLS.
// homeScore/awayScore are the 90-minute scores.
// homeScoreET/awayScoreET are the scores after extra time (null if no ET).

export async function scoreMatchResult(params: {
  matchId:        string;
  groupId:        string;
  homeScore:      number;
  awayScore:      number;
  homeScoreET?:   number | null;
  awayScoreET?:   number | null;
  rules:          ScoringRules;
  sbClient?:      SupabaseClient;
}): Promise<void> {
  const c = params.sbClient ?? defaultSb();
  const predictions = await getMatchPredictions(params.matchId, params.groupId, c);
  if (!predictions.length) return;

  // Fetch match stage in one query
  const { data: matchRow } = await c
    .from("matches")
    .select("stage")
    .eq("id", params.matchId)
    .maybeSingle();
  type MatchRow = { stage: string } | null;
  const stage = ((matchRow as MatchRow)?.stage ?? "Group") as Match["stage"];

  const { correctOutcome, exactScore } = getStagePoints(stage, params.rules, params.rules.useProgressiveScoring);

  // Check for a group-level admin override — use it instead of the global score if present
  const { data: overrideRow } = await c
    .from("match_overrides")
    .select("home_score, away_score")
    .eq("match_id", params.matchId)
    .eq("group_id", params.groupId)
    .maybeSingle();

  // Admin overrides always take precedence over policy-based score selection.
  // For knockout matches without an override, apply the group's knockout_policy:
  //   inc_extra_time → use ET score if available, else fall back to 90-min
  //   regular_90     → always use the 90-min score
  const isKnockoutStage = stage !== "Group";
  const policy = params.rules.knockoutPolicy ?? 'regular_90';
  let policyHome = params.homeScore;
  let policyAway = params.awayScore;
  if (isKnockoutStage && policy === 'inc_extra_time' && params.homeScoreET != null && params.awayScoreET != null) {
    policyHome = params.homeScoreET;
    policyAway = params.awayScoreET;
  }

  const effectiveHome = (overrideRow as { home_score: number } | null)?.home_score ?? policyHome;
  const effectiveAway = (overrideRow as { away_score: number } | null)?.away_score ?? policyAway;

  // A penalty shootout never changes the effective score for match-prediction
  // grading — it only decides bracket advancement, which is scored separately.
  const effectiveRealWinner: "H" | "A" | "D" =
    effectiveHome > effectiveAway ? "H"
    : effectiveHome < effectiveAway ? "A" : "D";

  const updates = predictions.map(pred => {
    const isExact =
      pred.home_score === effectiveHome &&
      pred.away_score === effectiveAway;

    const predWinner = pred.home_score > pred.away_score ? "H"
      : pred.home_score < pred.away_score ? "A" : "D";
    const isOutcome = !isExact && predWinner === effectiveRealWinner;

    // exactScore is always the TOTAL for an exact prediction (flat or progressive).
    // getStagePoints() already selects the stage-specific value when progressive.
    const pts = isExact ? exactScore : isOutcome ? correctOutcome : 0;

    return {
      user_id:       pred.user_id,
      group_id:      params.groupId,
      match_id:      params.matchId,
      home_score:    pred.home_score,
      away_score:    pred.away_score,
      points_earned: pts,
      is_exact:      isExact,
    };
  });

  await c
    .from("group_predictions")
    .upsert(updates, { onConflict: "user_id,group_id,match_id" });
}

// ── Live leaderboard recalculation ───────────────────────────────────────────
// Returns current points per user based on live match score

export function calcLivePoints(
  prediction: { homeScore: number; awayScore: number },
  liveHome:   number,
  liveAway:   number,
  rules = { exactScore: 25, correctOutcome: 10 }
): { pts: number; type: "exact" | "outcome" | "none" } {
  if (prediction.homeScore === liveHome && prediction.awayScore === liveAway) {
    return { pts: rules.exactScore, type: "exact" };
  }
  const predW = prediction.homeScore > prediction.awayScore ? "H"
    : prediction.homeScore < prediction.awayScore ? "A" : "D";
  const liveW = liveHome > liveAway ? "H" : liveHome < liveAway ? "A" : "D";
  if (predW === liveW) return { pts: rules.correctOutcome, type: "outcome" };
  return { pts: 0, type: "none" };
}