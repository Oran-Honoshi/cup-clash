export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAllUserGroups } from "@/lib/services/user-group";
import { getFollowCount } from "@/lib/services/follows";
import { getMembers } from "@/lib/services/groups";
import { sortMembersForRanking } from "@/lib/leaderboard-sort";
import { matchInGroupScope } from "@/lib/schedule";

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
    .select("id, home, away, stage, competition_id, finished_at")
    .eq("status", "finished")
    .gt("finished_at", previousLastSeenAt)
    .order("finished_at", { ascending: false });

  // Only a match belonging to one of the user's OWN groups' competitions is
  // "relevant" — a Bundesliga result finishing shouldn't trigger a
  // World Cup group's reengagement nudge, and vice versa.
  const memberCompetitionIds = new Set(allGroups.filter(g => g.groups).map(g => g.groups!.competition_id));
  const relevantMatches = ((candidateMatches ?? []) as Array<{ id: string; home: string; away: string; stage: string; competition_id: string | null; finished_at: string }>)
    .filter(m => [...memberCompetitionIds].some(competitionId => matchInGroupScope(m.stage, m.competition_id, competitionId)));

  if (relevantMatches.length === 0) {
    return NextResponse.json({ eligible: false } satisfies ReengagementResponse, { headers: { "Cache-Control": "no-store" } });
  }

  const headlineMatch = relevantMatches[0];
  const matchLabel = `${headlineMatch.home} vs ${headlineMatch.away}`;

  // Only surface groups the headline match is actually relevant to.
  const groups = await Promise.all(
    allGroups
      .filter(g => g.groups && matchInGroupScope(headlineMatch.stage, headlineMatch.competition_id, g.groups.competition_id))
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
