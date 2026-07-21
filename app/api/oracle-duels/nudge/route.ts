export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFeaturedOracleDuelMatch, getMyDuelForMatch } from "@/lib/services/oracle-duels";

export type NudgeResponse =
  | { eligible: false }
  | {
      eligible: true;
      match: { home: string; away: string; homeFlagCode: string | null; awayFlagCode: string | null; kickoffAt: string };
      prediction: { homeScore: number; awayScore: number };
    };

// Backs the once-per-day Oracle Duel nudge sheet — anonymous users are never
// eligible (the duel is keyed by user_id), and a user who already predicted
// today's featured match has already engaged, so there's nothing to nudge.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ eligible: false } satisfies NudgeResponse, { headers: { "Cache-Control": "no-store" } });

  const featured = await getFeaturedOracleDuelMatch();
  if (!featured) return NextResponse.json({ eligible: false } satisfies NudgeResponse, { headers: { "Cache-Control": "no-store" } });

  const existing = await getMyDuelForMatch(user.id, featured.match.id);
  if (existing) return NextResponse.json({ eligible: false } satisfies NudgeResponse, { headers: { "Cache-Control": "no-store" } });

  return NextResponse.json(
    {
      eligible: true,
      match: {
        home: featured.match.home, away: featured.match.away,
        homeFlagCode: featured.match.homeFlagCode, awayFlagCode: featured.match.awayFlagCode,
        kickoffAt: featured.match.kickoffAt,
      },
      prediction: { homeScore: featured.prediction.predicted_home_score, awayScore: featured.prediction.predicted_away_score },
    } satisfies NudgeResponse,
    { headers: { "Cache-Control": "no-store" } }
  );
}
