import { createClient } from "@supabase/supabase-js";

function sb() {
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
  const { data: match } = await sb()
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

  const { error } = await sb()
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
  const { data } = await sb()
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

export async function getMatchPredictions(matchId: string, groupId: string) {
  const { data } = await sb()
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

export async function scoreMatchResult(params: {
  matchId:    string;
  groupId:    string;
  homeScore:  number;
  awayScore:  number;
  rules:      { exactScore: number; correctOutcome: number };
}): Promise<void> {
  const predictions = await getMatchPredictions(params.matchId, params.groupId);
  if (!predictions.length) return;

  const updates = predictions.map(pred => {
    const isExact =
      pred.home_score === params.homeScore &&
      pred.away_score === params.awayScore;

    const predWinner = pred.home_score > pred.away_score ? "H"
      : pred.home_score < pred.away_score ? "A" : "D";
    const realWinner = params.homeScore > params.awayScore ? "H"
      : params.homeScore < params.awayScore ? "A" : "D";
    const isOutcome = !isExact && predWinner === realWinner;

    const pts = isExact ? params.rules.exactScore
      : isOutcome ? params.rules.correctOutcome : 0;

    return {
      user_id:      pred.user_id,
      group_id:     params.groupId,
      match_id:     params.matchId,
      home_score:   pred.home_score,
      away_score:   pred.away_score,
      points_earned: pts,
      is_exact:     isExact,
    };
  });

  await sb()
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