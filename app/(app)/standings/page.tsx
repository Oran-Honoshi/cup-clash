export const dynamic = "force-dynamic";

import { BarChart2, Globe } from "lucide-react";
import { GroupStandings } from "@/components/dashboard/group-standings";
import { LeagueTable } from "@/components/leagues/league-table";
import { CompetitionPicker } from "@/components/leagues/competition-picker";
import { ConsumeFollowParam } from "@/components/leagues/consume-follow-param";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUserGroup } from "@/lib/services/user-group";
import { WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { getCompetitionsCached } from "@/lib/services/reference-cache";
import { getFollowedCompetitionIds } from "@/lib/services/follows";
import { getStandings } from "@/lib/services/standings";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: { competition?: string };
}) {
  const { groupId, userId } = await getCurrentUserGroup();

  const [competitions, followedCompetitionIds] = await Promise.all([
    getCompetitionsCached(),
    getFollowedCompetitionIds(userId),
  ]);

  const activeSlug = searchParams.competition ?? WORLD_CUP_SLUG;
  const activeCompetition = competitions.find((c) => c.slug === activeSlug) ?? competitions[0];

  const standingsRows =
    activeSlug !== WORLD_CUP_SLUG && activeCompetition && activeCompetition.type !== "friendly"
      ? await getStandings(activeCompetition.id)
      : [];

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">{activeCompetition?.name ?? "World Cup 2026"}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>
          Standings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mt)" }}>
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
      ) : activeCompetition?.type === "friendly" ? (
        <EmptyState
          icon={<Globe size={28} style={{ color: "#00D4FF" }} />}
          title="No table for friendlies"
          body="Friendlies don't have a league table — every match stands on its own. Head to Schedule to see upcoming and recent fixtures."
          cta={{ label: "Go to Schedule", href: "/schedule" }}
        />
      ) : standingsRows.length > 0 ? (
        <LeagueTable rows={standingsRows} />
      ) : (
        <EmptyState
          icon={<BarChart2 size={28} style={{ color: "#00D4FF" }} />}
          title="No standings yet"
          body={`We haven't fetched a table for ${activeCompetition?.name ?? "this competition"} yet — check back shortly.`}
        />
      )}
    </div>
  );
}
