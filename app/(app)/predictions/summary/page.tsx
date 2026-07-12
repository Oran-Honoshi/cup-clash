export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PredictionsSummaryClient } from "@/components/predictions/predictions-summary-client";
import { getAllUserGroups } from "@/lib/services/user-group";
import { getAllMatches } from "@/lib/services/matches";
import Link from "next/link";

export default async function PredictionsSummaryPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/signin");

  const memberships = await getAllUserGroups(user.id);
  const groups = memberships
    .filter(m => m.groups)
    .map(m => ({ id: m.groups!.id, name: m.groups!.name }));

  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-6">
        <div className="text-5xl">🏆</div>
        <h2 className="font-display text-2xl font-black uppercase" style={{ color: "var(--tx)" }}>No Groups Yet</h2>
        <p className="text-sm" style={{ color: "var(--t2)" }}>
          Join or create a group to see your predictions summary.
        </p>
        <Link href="/groups"
          className="px-6 py-3 rounded-2xl font-bold text-sm"
          style={{ background: "var(--ac)", color: "var(--at)" }}>
          Find a Group
        </Link>
      </div>
    );
  }

  const matches = await getAllMatches();

  // Competitions that actually have scheduled matches — only these are worth
  // offering in the "no group selected" league filter.
  const competitionIdsWithMatches = new Set(matches.map(m => m.competitionId).filter(Boolean));

  // Each group's competition — derived from which competition the group's
  // already-saved match predictions belong to (groups aren't scoped to a
  // competition_id in the schema yet). Falls back to World Cup 2026, the
  // only competition currently wired into group prediction flows, for a
  // brand-new group with no predictions yet.
  const matchCompetitionMap = new Map(matches.map(m => [m.id, m.competitionId]));

  const [{ data: competitionRows }, { data: predRows }] = await Promise.all([
    sb.from("competitions").select("id, name").in("id", [...competitionIdsWithMatches] as string[]),
    sb.from("group_predictions")
      .select("group_id, match_id")
      .eq("user_id", user.id)
      .eq("pred_type", "match")
      .in("group_id", groups.map(g => g.id)),
  ]);
  const competitions = (competitionRows ?? []) as Array<{ id: string; name: string }>;
  const worldCupId = competitions.find(c => c.name === "World Cup 2026")?.id ?? null;

  const groupCompetitionTally: Record<string, Record<string, number>> = {};
  for (const p of (predRows ?? []) as Array<{ group_id: string; match_id: string }>) {
    const compId = matchCompetitionMap.get(p.match_id);
    if (!compId) continue;
    const tally = (groupCompetitionTally[p.group_id] ??= {});
    tally[compId] = (tally[compId] ?? 0) + 1;
  }
  const groupCompetitionMap: Record<string, string> = {};
  for (const g of groups) {
    const tally = groupCompetitionTally[g.id];
    const topCompId = tally
      ? Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0]
      : null;
    groupCompetitionMap[g.id] = topCompId ?? worldCupId ?? "";
  }

  return (
    <div className="pb-32">
      <PredictionsSummaryClient
        userId={user.id}
        groups={groups}
        matches={matches}
        competitions={competitions}
        groupCompetitionMap={groupCompetitionMap}
      />
    </div>
  );
}
