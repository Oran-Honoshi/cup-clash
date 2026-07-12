export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";

export interface MemberPrediction {
  matchId:      string;
  home:         string;
  away:         string;
  homeFlagCode: string;
  awayFlagCode: string;
  predicted:    string;
  actual:       string;
  pts:          number;
  type:         "exact" | "correct" | "wrong";
  stage:        string;
  groupLetter:  string | null;
}

// A saved prediction for a match that hasn't finished yet — no result/points
// to show, just what the member picked (or nothing, if unpredicted).
export interface UpcomingPrediction {
  matchId:      string;
  home:         string;
  away:         string;
  homeFlagCode: string;
  awayFlagCode: string;
  predicted:    string | null;
  stage:        string;
  groupLetter:  string | null;
  kickoffAt:    string;
  status:       string;
}

export interface BestThirdPick {
  slot:         number;
  team:         string;
  pointsEarned: number;
  correct:      boolean;
}

export interface TournamentPick {
  predType:     string;
  predValue:    string | null;
  pointsEarned: number;
  status:       "pending" | "correct" | "wrong";
}

export interface MemberPredictionsResponse {
  stats: {
    totalPoints:   number;
    exactCount:    number;
    outcomeCount:  number;
    missedCount:   number;
    gsPts:         number;
    knockoutPts:   number;
    bestThirdPts:  number;
    bonusPts:      number;
  };
  history: MemberPrediction[];
  upcoming: UpcomingPrediction[];
  bestThird: {
    picks:         BestThirdPick[];
    correctCount:  number;
    pointsPerPick: number;
    enabled:       boolean;
  };
  tournamentPicks: TournamentPick[];
}

type PredRow = {
  match_id:      string;
  home_score:    number | null;
  away_score:    number | null;
  points_earned: number | null;
  is_exact:      boolean | null;
};

type MatchRow = {
  id:            string;
  home:          string;
  away:          string;
  home_flag:     string | null;
  away_flag:     string | null;
  home_score:    number | null;
  away_score:    number | null;
  home_score_et: number | null;
  away_score_et: number | null;
  status:        string;
  stage:         string;
  group_letter:  string | null;
  kickoff_at:    string;
};

type TournamentRow = {
  pred_type:     string;
  pred_value:    string | null;
  points_earned: number | null;
};

type RulesRow = {
  best_third:        number | null;
  enable_best_third: boolean | null;
};

// A finished knockout match that went to extra time shows both the 90-minute
// and final (AET) result, consistent with how the app stores both internally.
// Kept compact (no "(90')"/"(AET)" verbosity) since the only current consumer
// (Player Drawer) splices this inline between two team names on one line.
function formatActualScore(m: MatchRow): string {
  const home90 = m.home_score ?? 0;
  const away90 = m.away_score ?? 0;
  if (m.home_score_et == null || m.away_score_et == null) {
    return `${home90}–${away90}`;
  }
  return `${home90}–${away90}→${m.home_score_et}–${m.away_score_et} AET`;
}

export async function GET(req: NextRequest) {
  const userId  = req.nextUrl.searchParams.get("userId");
  const groupId = req.nextUrl.searchParams.get("groupId");

  if (!userId || !groupId) {
    return NextResponse.json({ error: "userId and groupId are required" }, { status: 400 });
  }

  const sb = sbAdmin();

  const [predRes, tournamentRes, bonusRes, rulesRes] = await Promise.all([
    sb
      .from("group_predictions")
      .select("match_id, home_score, away_score, points_earned, is_exact")
      .eq("user_id", userId)
      .eq("group_id", groupId)
      .eq("pred_type", "match"),

    sb
      .from("group_predictions")
      .select("pred_type, pred_value, points_earned")
      .eq("user_id", userId)
      .eq("group_id", groupId)
      .neq("pred_type", "match"),

    sb
      .from("bonus_answers")
      .select("points_earned")
      .eq("user_id", userId)
      .eq("group_id", groupId),

    sb
      .from("scoring_rules")
      .select("best_third, enable_best_third")
      .eq("group_id", groupId)
      .maybeSingle(),
  ]);

  const preds          = (predRes.data ?? []) as PredRow[];
  const tournamentRows = (tournamentRes.data ?? []) as TournamentRow[];
  const bonusRows      = (bonusRes.data ?? []) as { points_earned: number | null }[];
  const rules          = (rulesRes.data ?? null) as RulesRow | null;

  // Fetch match metadata for all match predictions
  const matchIds = [...new Set(preds.map(p => p.match_id).filter(Boolean))];
  const matchMap: Record<string, MatchRow> = {};
  if (matchIds.length > 0) {
    const { data: matchRows } = await sb
      .from("matches")
      .select("id, home, away, home_flag, away_flag, home_score, away_score, home_score_et, away_score_et, status, stage, group_letter, kickoff_at")
      .in("id", matchIds);
    for (const m of (matchRows ?? []) as MatchRow[]) {
      matchMap[m.id] = m;
    }
  }

  // Tally bonus points
  const bonusPoints = bonusRows.reduce((s, b) => s + (b.points_earned ?? 0), 0);

  // Separate best_third from other tournament picks
  const bestThirdRows = tournamentRows.filter(r => r.pred_type?.startsWith("best_third_"));
  const otherTournamentRows = tournamentRows.filter(r => !r.pred_type?.startsWith("best_third_"));

  // Build best_third section
  const bestThirdPicks: BestThirdPick[] = bestThirdRows
    .map(r => ({
      slot:         parseInt(r.pred_type.replace("best_third_", ""), 10),
      team:         r.pred_value ?? "",
      pointsEarned: r.points_earned ?? 0,
      correct:      (r.points_earned ?? 0) > 0,
    }))
    .sort((a, b) => a.slot - b.slot);
  const bestThirdCorrectCount = bestThirdPicks.filter(p => p.correct).length;
  const bestThirdPts = bestThirdRows.reduce((s, r) => s + (r.points_earned ?? 0), 0);

  // Build tournament picks section (winner, top_scorer, top_assister, etc.)
  const tournamentPicks: TournamentPick[] = otherTournamentRows
    .filter(r => ["winner", "top_scorer", "top_assister"].includes(r.pred_type))
    .map(r => ({
      predType:     r.pred_type,
      predValue:    r.pred_value,
      pointsEarned: r.points_earned ?? 0,
      status:       r.points_earned === null
        ? "pending"
        : r.points_earned > 0
          ? "correct"
          : "wrong",
    }));

  const bonusPts = otherTournamentRows.reduce((s, r) => s + (r.points_earned ?? 0), 0) + bonusPoints;

  // Build match prediction history (ALL finished matches)
  let gsPts        = 0;
  let knockoutPts  = 0;
  let exactCount   = 0;
  let outcomeCount = 0;
  let missedCount  = 0;
  const history: MemberPrediction[] = [];

  for (const p of preds) {
    const m = matchMap[p.match_id];
    if (!m || m.status !== "finished") continue;
    // Skip predictions not yet scored by the cron (match just finished, scoring step pending).
    // points_earned=null means unscored; =0 means genuinely wrong.
    if (p.points_earned === null) continue;

    const pts  = p.points_earned;
    const isEx = p.is_exact ?? false;
    const stage = m.stage ?? "Group";

    if (stage === "Group") gsPts += pts;
    else knockoutPts += pts;

    if (isEx) {
      exactCount++;
    } else if (pts > 0) {
      outcomeCount++;
    } else {
      missedCount++;
    }

    const type: MemberPrediction["type"] = isEx ? "exact" : pts > 0 ? "correct" : "wrong";

    history.push({
      matchId:      p.match_id,
      home:         m.home,
      away:         m.away,
      homeFlagCode: m.home_flag ?? "",
      awayFlagCode: m.away_flag ?? "",
      predicted:    `${p.home_score ?? 0}–${p.away_score ?? 0}`,
      actual:       formatActualScore(m),
      pts,
      type,
      stage,
      groupLetter:  m.group_letter ?? null,
    });
  }

  // Saved picks for matches not yet finished — no result to grade, just the pick itself.
  const upcoming: UpcomingPrediction[] = [];
  for (const p of preds) {
    const m = matchMap[p.match_id];
    if (!m || m.status === "finished") continue;
    upcoming.push({
      matchId:      p.match_id,
      home:         m.home,
      away:         m.away,
      homeFlagCode: m.home_flag ?? "",
      awayFlagCode: m.away_flag ?? "",
      predicted:    p.home_score != null && p.away_score != null ? `${p.home_score}–${p.away_score}` : null,
      stage:        m.stage ?? "Group",
      groupLetter:  m.group_letter ?? null,
      kickoffAt:    m.kickoff_at,
      status:       m.status,
    });
  }

  const totalPoints = gsPts + knockoutPts + bestThirdPts + bonusPts;

  const body: MemberPredictionsResponse = {
    stats: {
      totalPoints,
      exactCount,
      outcomeCount,
      missedCount,
      gsPts,
      knockoutPts,
      bestThirdPts,
      bonusPts,
    },
    history,
    upcoming,
    bestThird: {
      picks:         bestThirdPicks,
      correctCount:  bestThirdCorrectCount,
      pointsPerPick: rules?.best_third ?? 0,
      enabled:       rules?.enable_best_third ?? false,
    },
    tournamentPicks,
  };

  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
