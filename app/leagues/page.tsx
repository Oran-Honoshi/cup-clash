export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CompetitionPicker } from "@/components/leagues/competition-picker";
import { ConsumeFollowParam } from "@/components/leagues/consume-follow-param";
import { LeaguesTabs } from "@/components/leagues/leagues-tabs";
import { TeamPicker } from "@/components/teams/team-picker";
import { getCompetitions } from "@/lib/services/competitions";
import { getFollowedCompetitionIds, getFollowedTeamIds } from "@/lib/services/follows";
import { getTeamsByCompetition } from "@/lib/services/teams";

export default async function LeaguesPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? null;
  const activeTab = searchParams.tab === "teams" ? "teams" : "competitions";

  const [competitions, followedCompetitionIds, teamGroups, followedTeamIds] = await Promise.all([
    getCompetitions(),
    getFollowedCompetitionIds(userId),
    activeTab === "teams" ? getTeamsByCompetition() : Promise.resolve([]),
    activeTab === "teams" ? getFollowedTeamIds(userId) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ac)", marginBottom: 4 }}>
          {activeTab === "teams" ? "Choose your teams" : "Choose your leagues"}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
          Follow what you care about
        </h1>
        <p style={{ fontSize: 14, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          {activeTab === "teams"
            ? "Follow a team to personalize your news feed and see their results on Home."
            : "Follow a competition to personalize your news feed."}{" "}
          {!userId && "You'll be asked to create a free account to save it."}
        </p>
      </div>

      <LeaguesTabs active={activeTab} basePath="/leagues" />

      <ConsumeFollowParam userId={userId} />

      {activeTab === "teams" ? (
        <TeamPicker groups={teamGroups} userId={userId} followedTeamIds={followedTeamIds} />
      ) : (
        <CompetitionPicker
          competitions={competitions}
          activeSlug=""
          basePath="/leagues"
          userId={userId}
          followedCompetitionIds={followedCompetitionIds}
          variant="cards"
        />
      )}
    </div>
  );
}
