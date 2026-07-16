export const dynamic = "force-dynamic";

import { getCurrentUserProfile } from "@/lib/services/user-group";
import { getAllUserGroups } from "@/lib/services/user-group";
import { getFollowedTeamIds, getFollowedCompetitionIds } from "@/lib/services/follows";
import { getTeamsByIds } from "@/lib/services/teams";
import { getRecentResultsByTeam, getNextMatch } from "@/lib/services/matches";
import { getHeroArticle } from "@/lib/services/news";
import { getCompetitions } from "@/lib/services/competitions";
import { getMembers, getGroup } from "@/lib/services/groups";
import { pickGameTypeForDate, todayISO, getGroupStreak } from "@/lib/services/daily-challenge";
import { sbAdmin } from "@/lib/supabase/admin";
import { MyTeamsSection, type MyTeamEntry } from "@/components/dashboard/my-teams-section";
import { NewsHeroSection } from "@/components/dashboard/news-hero-section";
import { PersonaHero, type HomePersona } from "@/components/home/persona-hero";
import { CompetitionsChipRow } from "@/components/home/competitions-chip-row";
import { DailyChallengeTeaser } from "@/components/home/daily-challenge-teaser";
import { OracleTeaser } from "@/components/home/oracle-teaser";
import { getNextOracleMatch, getUserOraclePicks } from "@/lib/services/oracle";
import { GroupNudgeCard } from "@/components/home/group-nudge-card";
import { ZoneJumpGrid } from "@/components/home/zone-jump-grid";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";

export default async function HomePage() {
  const userProfile = await getCurrentUserProfile();
  const gameType = pickGameTypeForDate(todayISO());

  // Anonymous — no follow graph yet, never blocked from browsing.
  if (!userProfile) {
    const [heroArticle, competitions, oracleMatch] = await Promise.all([
      getHeroArticle(null), getCompetitions(), getNextOracleMatch(),
    ]);
    return (
      <div className={`space-y-6 pb-32 ${zoneFontVars}`}>
        <PersonaHero persona="anonymous" nextMatch={null} />
        <CompetitionsChipRow competitions={competitions} followedIds={new Set()} />
        <NewsHeroSection article={heroArticle} />
        <DailyChallengeTeaser gameType={gameType} />
        {oracleMatch && <OracleTeaser match={oracleMatch.match} prediction={oracleMatch.prediction} userPrediction={null} />}
        <GroupNudgeCard />
        <ZoneJumpGrid />
      </div>
    );
  }

  const [allGroups, followedTeamIds, followedCompetitionIds, heroArticle, competitions, nextMatch, oracleMatch] = await Promise.all([
    getAllUserGroups(userProfile.id),
    getFollowedTeamIds(userProfile.id),
    getFollowedCompetitionIds(userProfile.id),
    getHeroArticle(userProfile.id),
    getCompetitions(),
    getNextMatch(),
    getNextOracleMatch(),
  ]);

  const followedTeamIdList = Array.from(followedTeamIds);
  const [followedTeams, resultsByTeam] = await Promise.all([
    getTeamsByIds(followedTeamIdList),
    getRecentResultsByTeam(followedTeamIdList, 5),
  ]);
  const myTeams: MyTeamEntry[] = followedTeams.map((team) => ({
    team,
    results: resultsByTeam.get(team.id) ?? [],
  }));

  const hasGroup = allGroups.length > 0;
  const persona: HomePersona = hasGroup ? "group-member" : "following-no-group";

  let groupInfo: { name: string; rank: number; totalPlayers: number } | null = null;
  let groupStreak: number | null = null;
  let oracleUserPrediction: { homeScore: number; awayScore: number } | null = null;
  if (hasGroup) {
    const primaryGroupId = allGroups[0].group_id;
    const [members, group, streak, oraclePicks] = await Promise.all([
      getMembers(primaryGroupId),
      getGroup(primaryGroupId),
      getGroupStreak(sbAdmin(), primaryGroupId),
      oracleMatch ? getUserOraclePicks(userProfile.id, primaryGroupId, [oracleMatch.match.id]) : Promise.resolve(new Map()),
    ]);
    const rank = members.findIndex((m) => m.id === userProfile.id) + 1;
    groupInfo = { name: group.name, rank: rank || members.length, totalPlayers: members.length };
    groupStreak = streak.currentStreak;
    oracleUserPrediction = oracleMatch ? oraclePicks.get(oracleMatch.match.id) ?? null : null;
  }

  return (
    <div className={`space-y-6 pb-32 ${zoneFontVars}`}>
      <PersonaHero persona={persona} nextMatch={nextMatch} group={groupInfo} />
      <MyTeamsSection teams={myTeams} teamCountry={userProfile.country} />
      <CompetitionsChipRow competitions={competitions} followedIds={followedCompetitionIds} />
      <NewsHeroSection article={heroArticle} />
      <DailyChallengeTeaser gameType={gameType} groupStreak={groupStreak} />
      {oracleMatch && (
        <OracleTeaser match={oracleMatch.match} prediction={oracleMatch.prediction} userPrediction={oracleUserPrediction} />
      )}
      {!hasGroup && <GroupNudgeCard />}
      <ZoneJumpGrid />
    </div>
  );
}
