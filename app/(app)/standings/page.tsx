export const dynamic = "force-dynamic";

import { BarChart2 } from "lucide-react";
import { GroupStandings } from "@/components/dashboard/group-standings";
import { CompetitionPicker } from "@/components/leagues/competition-picker";
import { ConsumeFollowParam } from "@/components/leagues/consume-follow-param";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUserGroup } from "@/lib/services/user-group";
import { getCompetitions, WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { getFollowedCompetitionIds } from "@/lib/services/follows";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: { competition?: string };
}) {
  const { groupId, userId } = await getCurrentUserGroup();

  const [competitions, followedCompetitionIds] = await Promise.all([
    getCompetitions(),
    getFollowedCompetitionIds(userId),
  ]);

  const activeSlug = searchParams.competition ?? WORLD_CUP_SLUG;
  const activeCompetition = competitions.find((c) => c.slug === activeSlug) ?? competitions[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">{activeCompetition?.name ?? "World Cup 2026"}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
          Standings
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          {activeSlug === WORLD_CUP_SLUG
            ? "All 12 groups · Updated after every match · Top 2 + 8 best 3rd-place teams advance"
            : "Pick a competition to see its table."}
        </p>
      </div>

      <ConsumeFollowParam userId={userId} />

      <CompetitionPicker
        competitions={competitions}
        activeSlug={activeSlug}
        basePath="/standings"
        userId={userId}
        followedCompetitionIds={followedCompetitionIds}
      />

      {activeSlug === WORLD_CUP_SLUG ? (
        <GroupStandings groupId={groupId ?? "none"} />
      ) : (
        <EmptyState
          icon={<BarChart2 size={28} style={{ color: "#00D4FF" }} />}
          title="Standings coming soon"
          body={`We're still wiring up the table for ${activeCompetition?.name ?? "this competition"}. Follow it to get notified when it lands.`}
        />
      )}
    </div>
  );
}
