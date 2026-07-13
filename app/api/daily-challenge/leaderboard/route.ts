export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { getOrCreateTodayChallenge } from "@/lib/services/daily-challenge";
import { getDailyLeaderboard, getAllTimeLeaderboard } from "@/lib/services/daily-leaderboard";

// Public — leaderboards are part of the universal, no-signup-required game.
// ?scope=global|group (default global), ?groupId=... (required if scope=group)
// ?range=daily|alltime (default daily)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") === "group" ? "group" : "global";
  const range = url.searchParams.get("range") === "alltime" ? "alltime" : "daily";
  const groupId = url.searchParams.get("groupId");

  if (scope === "group" && !groupId) {
    return NextResponse.json({ error: "groupId is required for scope=group" }, { status: 400 });
  }

  const sb = sbAdmin();

  let memberIds: string[] | undefined;
  if (scope === "group" && groupId) {
    const { data: members } = await sb.from("group_members").select("user_id").eq("group_id", groupId);
    memberIds = (members ?? []).map(m => m.user_id as string);
  }

  if (range === "alltime") {
    const rows = await getAllTimeLeaderboard(sb, memberIds);
    return NextResponse.json({ scope, range, rows }, { headers: { "Cache-Control": "no-store" } });
  }

  const challenge = await getOrCreateTodayChallenge(sb);
  const rows = await getDailyLeaderboard(sb, challenge.id, memberIds);
  return NextResponse.json(
    { scope, range, challengeDate: challenge.challenge_date, rows },
    { headers: { "Cache-Control": "no-store" } }
  );
}
