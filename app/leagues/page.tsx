export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CompetitionPicker } from "@/components/leagues/competition-picker";
import { CountryPicker } from "@/components/leagues/country-picker";
import { ConsumeFollowParam } from "@/components/leagues/consume-follow-param";
import { LeaguesTabs } from "@/components/leagues/leagues-tabs";
import { TeamPicker } from "@/components/teams/team-picker";
import { getFollowedCompetitionIds, getFollowedCountryIds, getFollowedTeamIds } from "@/lib/services/follows";
import { getTeamsByCompetition } from "@/lib/services/teams";
import { getCompetitionsCached, getCountriesCached } from "@/lib/services/reference-cache";

export default async function LeaguesPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? null;
  const activeTab = searchParams.tab === "teams" ? "teams" : searchParams.tab === "countries" ? "countries" : "competitions";

  const [competitions, followedCompetitionIds, teamGroups, followedTeamIds, countries, followedCountryIds] = await Promise.all([
    getCompetitionsCached(),
    getFollowedCompetitionIds(userId),
    activeTab === "teams" ? getTeamsByCompetition() : Promise.resolve([]),
    activeTab === "teams" ? getFollowedTeamIds(userId) : Promise.resolve(new Set<string>()),
    activeTab === "countries" ? getCountriesCached() : Promise.resolve([]),
    activeTab === "countries" ? getFollowedCountryIds(userId) : Promise.resolve(new Set<string>()),
  ]);

  // Country name -> all tracked competitions from that country, for the
  // "Also follow [country]'s other competitions?" suggestion chip in
  // CountryPicker (most tracked countries now have 2-3: a league + cup(s)).
  const countryLeagues: Record<string, { id: string; name: string }[]> = {};
  for (const c of competitions) {
    if (c.country) (countryLeagues[c.country] ??= []).push({ id: c.id, name: c.name });
  }

  return (
    <div className="space-y-6">
      <div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ac)", marginBottom: 4 }}>
          {activeTab === "teams" ? "Choose your teams" : activeTab === "countries" ? "Choose your countries" : "Choose your leagues"}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
          Follow what you care about
        </h1>
        <p style={{ fontSize: 14, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          {activeTab === "teams"
            ? "Follow a team to personalize your news feed and see their results on Home."
            : activeTab === "countries"
            ? "Follow a country to personalize your news feed and get suggested its major league."
            : "Follow a competition to personalize your news feed."}{" "}
          {!userId && "You'll be asked to create a free account to save it."}
        </p>
      </div>

      <LeaguesTabs active={activeTab} basePath="/leagues" />

      <ConsumeFollowParam userId={userId} />

      {activeTab === "teams" ? (
        <TeamPicker groups={teamGroups} userId={userId} followedTeamIds={followedTeamIds} />
      ) : activeTab === "countries" ? (
        <CountryPicker
          countries={countries}
          userId={userId}
          followedCountryIds={followedCountryIds}
          countryLeagues={countryLeagues}
          followedCompetitionIds={followedCompetitionIds}
        />
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
