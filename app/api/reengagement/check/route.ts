export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAllUserGroups } from "@/lib/services/user-group";
import { getFollowCount } from "@/lib/services/follows";
import { getMembers } from "@/lib/services/groups";
import { sortMembersForRanking } from "@/lib/leaderboard-sort";
import { isWorldCupStage } from "@/lib/schedule";

const GAP_MS = 30 * 60 * 1000;

type ReengagementResponse =
  | { eligible: false }
  | { eligible: true; persona: "following-no-group"; hasFollows: boolean }
  | { eligible: true; persona: "group-member"; matchLabel: string; groups: Array<{ groupId: string; groupName: string; rank: number }> };

// Auth-only — anonymous users have no profile row to track last_seen_at
// against, so that persona is handled entirely client-side (see
// lib/reengagement-storage.ts) and never calls this route.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ eligible: false } satisfies ReengagementResponse, { headers: { "Cache-Control": "no-store" } });

  const admin = sbAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("last_seen_at")
    .eq("id", user.id)
    .maybeSingle();

  const previousLastSeenAt = (profile as { last_seen_at: string | null } | null)?.last_seen_at ?? null;

  // Reset the clock on every app-open, before any early return, regardless
  // of whether this particular open ends up eligible.
  await admin.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);

  const gapMs = previousLastSeenAt ? Date.now() - new Date(previousLastSeenAt).getTime() : null;
  if (gapMs === null || gapMs < GAP_MS) {
    return NextResponse.json({ eligible: false } satisfies ReengagementResponse, { headers: { "Cache-Control": "no-store" } });
  }

  const allGroups = await getAllUserGroups(user.id);

  if (allGroups.length === 0) {
    const hasFollows = (await getFollowCount(user.id)) > 0;
    return NextResponse.json(
      { eligible: true, persona: "following-no-group", hasFollows } satisfies ReengagementResponse,
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data: candidateMatches } = await admin
    .from("matches")
    .select("id, home, away, stage, finished_at")
    .eq("status", "finished")
    .gt("finished_at", previousLastSeenAt)
    .order("finished_at", { ascending: false });

  const relevantMatches = ((candidateMatches ?? []) as Array<{ id: string; home: string; away: string; stage: string; finished_at: string }>)
    .filter(m => isWorldCupStage(m.stage));

  if (relevantMatches.length === 0) {
    return NextResponse.json({ eligible: false } satisfies ReengagementResponse, { headers: { "Cache-Control": "no-store" } });
  }

  const matchLabel = `${relevantMatches[0].home} vs ${relevantMatches[0].away}`;

  const groups = await Promise.all(
    allGroups
      .filter(g => g.groups)
      .map(async g => {
        const members = sortMembersForRanking(await getMembers(g.group_id));
        const rank = members.findIndex(m => m.id === user.id) + 1;
        return { groupId: g.group_id, groupName: g.groups!.name, rank };
      })
  );

  return NextResponse.json(
    { eligible: true, persona: "group-member", matchLabel, groups } satisfies ReengagementResponse,
    { headers: { "Cache-Control": "no-store" } }
  );
}
