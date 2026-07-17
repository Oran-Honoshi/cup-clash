import { createClient } from "@/lib/supabase/client";

// Client-side prediction upsert shared by the Schedule page's inline score
// inputs and the "copy to other groups" sheet — same shape, same
// onConflict target, so a normal save and a copy always behave identically.
export async function upsertGroupPrediction(params: {
  userId:    string;
  groupId:   string;
  matchId:   string;
  homeScore: number;
  awayScore: number;
}): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb.from("group_predictions").upsert({
    user_id:    params.userId,
    group_id:   params.groupId,
    match_id:   params.matchId,
    home_score: params.homeScore,
    away_score: params.awayScore,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,group_id,match_id" });

  return !error;
}
