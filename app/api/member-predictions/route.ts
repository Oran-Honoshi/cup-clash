export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface MemberPrediction {
  matchId:      string;
  home:         string;
  away:         string;
  homeFlagCode: string;
  awayFlagCode: string;
  predicted:    string;
  actual:       string;
  pts:          number;
  type:         "exact" | "correct";
}

export interface BestThirdPick {
  slot:         number;   // 1–8
  team:         string;
  pointsEarned: number;
  correct:      boolean;  // true if points_earned > 0
}

export interface MemberPredictionsResponse {
  stats: {
    totalPoints:   number;
    exactCount:    number;
    outcomeCount:  number;
    missedCount:   number;
  };
  history: MemberPrediction[];
  bestThird: {
    picks:            BestThirdPick[];
    correctCount:     number;
    pointsPerPick:    number;
    enabled:          boolean;
  };
}

type PredRow = {
  match_id:      string;
  home_score:    number | null;
  away_score:    number | null;
  points_earned: number | null;
  is_exact:      boolean | null;
};

type MatchRow = {
  id:         string;
  home:       string;
  away:       string;
  home_flag:  string | null;
  away_flag:  string | null;
  home_score: number | null;
  away_score: number | null;
  status:     string;
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

export async function GET(req: NextRequest) {
  const userId  = req.nextUrl.searchParams.get("userId");
  const groupId = req.nextUrl.searchParams.get("groupId");

  if (!userId || !groupId) {
    return NextResponse.json({ error: "userId and groupId are required" }, { status: 400 });
  }

  const sb = sbAdmin();

  // Fetch match predictions and tournament picks in parallel
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

  // Fetch match metadata for scored match predictions
  const matchIds = [...new Set(preds.map(p => p.match_id).filter(Boolean))];
  const matchMap: Record<string, MatchRow> = {};
  if (matchIds.length > 0) {
    const { data: matchRows } = await sb
      .from("matches")
      .select("id, home, away, home_flag, away_flag, home_score, away_score, status")
      .in("id", matchIds);
    for (const m of (matchRows ?? []) as MatchRow[]) {
      matchMap[m.id] = m;
    }
  }

  // Tally points from each source
  const bonusPoints      = bonusRows.reduce((s, b) => s + (b.points_earned ?? 0), 0);
  const tournamentPoints = tournamentRows.reduce((s, r) => s + (r.points_earned ?? 0), 0);

  // Build best_third section
  const bestThirdRows = tournamentRows.filter(r => r.pred_type?.startsWith("best_third_"));
  const bestThirdPicks: BestThirdPick[] = bestThirdRows
    .map(r => ({
      slot:         parseInt(r.pred_type.replace("best_third_", ""), 10),
      team:         r.pred_value ?? "",
      pointsEarned: r.points_earned ?? 0,
      correct:      (r.points_earned ?? 0) > 0,
    }))
    .sort((a, b) => a.slot - b.slot);
  const bestThirdCorrectCount = bestThirdPicks.filter(p => p.correct).length;

  // Build match prediction history
  console.log("[member-predictions] userId:", userId, "groupId:", groupId,
    "matchPreds:", preds.length, "tournamentPicks:", tournamentRows.length,
    "bonusPoints:", bonusPoints);

  let matchPoints  = 0;
  let exactCount   = 0;
  let outcomeCount = 0;
  let missedCount  = 0;
  const history: MemberPrediction[] = [];

  for (const p of preds) {
    const m = matchMap[p.match_id];
    if (!m || m.status !== "finished") continue;

    const pts  = p.points_earned ?? 0;
    const isEx = p.is_exact ?? false;

    matchPoints += pts;

    if (isEx) {
      exactCount++;
    } else if (pts > 0) {
      outcomeCount++;
    } else {
      missedCount++;
    }

    if (pts > 0) {
      history.push({
        matchId:      p.match_id,
        home:         m.home,
        away:         m.away,
        homeFlagCode: m.home_flag ?? "",
        awayFlagCode: m.away_flag ?? "",
        predicted:    `${p.home_score ?? 0}–${p.away_score ?? 0}`,
        actual:       `${m.home_score ?? 0}–${m.away_score ?? 0}`,
        pts,
        type:         isEx ? "exact" : "correct",
      });
    }
  }

  const body: MemberPredictionsResponse = {
    stats: {
      totalPoints:  matchPoints + tournamentPoints + bonusPoints,
      exactCount,
      outcomeCount,
      missedCount,
    },
    history,
    bestThird: {
      picks:         bestThirdPicks,
      correctCount:  bestThirdCorrectCount,
      pointsPerPick: rules?.best_third ?? 0,
      enabled:       rules?.enable_best_third ?? false,
    },
  };

  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
