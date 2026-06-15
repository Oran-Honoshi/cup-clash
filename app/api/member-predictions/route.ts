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

export interface MemberPredictionsResponse {
  stats: {
    totalPoints:  number;
    exactCount:   number;
    outcomeCount: number;
    missedCount:  number;
  };
  history: MemberPrediction[];
}

type RawRow = {
  match_id:      string;
  home_score:    number | null;
  away_score:    number | null;
  points_earned: number | null;
  is_exact:      boolean | null;
  matches: {
    home:       string;
    away:       string;
    home_flag:  string | null;
    away_flag:  string | null;
    home_score: number | null;
    away_score: number | null;
    status:     string;
  } | null;
};

export async function GET(req: NextRequest) {
  const userId  = req.nextUrl.searchParams.get("userId");
  const groupId = req.nextUrl.searchParams.get("groupId");

  if (!userId || !groupId) {
    return NextResponse.json({ error: "userId and groupId are required" }, { status: 400 });
  }

  const sb = sbAdmin();

  const { data: rows, error } = await sb
    .from("group_predictions")
    .select(`
      match_id, home_score, away_score, points_earned, is_exact,
      matches ( home, away, home_flag, away_flag, home_score, away_score, status )
    `)
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .not("match_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const finished = ((rows ?? []) as unknown as RawRow[])
    .filter(p => p.matches?.status === "finished");

  let totalPoints  = 0;
  let exactCount   = 0;
  let outcomeCount = 0;
  let missedCount  = 0;

  const history: MemberPrediction[] = [];

  for (const p of finished) {
    const m   = p.matches!;
    const pts = p.points_earned ?? 0;
    const isEx = p.is_exact ?? false;

    totalPoints += pts;

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
    stats: { totalPoints, exactCount, outcomeCount, missedCount },
    history,
  };

  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
