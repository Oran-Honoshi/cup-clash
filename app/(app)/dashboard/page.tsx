export const dynamic = "force-dynamic";

import { Leaderboard } from "@/components/dashboard/leaderboard";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { BuyInStatus } from "@/components/dashboard/buy-in-status";
import { StatCards } from "@/components/dashboard/stat-cards";
import { DashboardPopups } from "@/components/dashboard/dashboard-popups";
import { WallOfShame } from "@/components/dashboard/wall-of-shame";
import { getLeaderboard, getMembers, getGroup } from "@/lib/services/groups";
import { getNextMatch } from "@/lib/services/matches";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";

// Inject mock rank deltas + accuracy stats until real match data flows
function injectMockDeltas(members: ReturnType<typeof Array.prototype.map>) {
  const MOCK_DELTAS = [0, 2, -1, 1, -2, 0, 3, -1];
  const MOCK_EXACT  = [8, 6, 4, 3, 5, 2, 7, 1];
  const MOCK_CORRECT = [24, 22, 18, 15, 20, 12, 19, 10];
  return (members as Array<{
    id: string; name: string; points: number; paid: boolean;
    country: string; avatarUrl?: string | null;
  }>).map((m, i) => ({
    ...m,
    rankDelta:          MOCK_DELTAS[i % MOCK_DELTAS.length],
    exactScores:        MOCK_EXACT[i % MOCK_EXACT.length],
    correctPredictions: MOCK_CORRECT[i % MOCK_CORRECT.length],
  }));
}

export default async function DashboardPage() {
  const [{ groupId, isMock }, userProfile] = await Promise.all([
    getCurrentUserGroup(),
    getCurrentUserProfile(),
  ]);

  const [members, top8, group, nextMatch] = await Promise.all([
    getMembers(groupId),
    getLeaderboard(groupId, 8),
    getGroup(groupId),
    getNextMatch(),
  ]);

  const membersWithStats = injectMockDeltas(members) as typeof members;
  const top8WithStats    = injectMockDeltas(top8)    as typeof top8;

  const currentMember = userProfile
    ? membersWithStats.find((m) => m.id === userProfile.id) ?? membersWithStats[0]
    : membersWithStats[0];
  const rank = userProfile
    ? membersWithStats.findIndex((m) => m.id === userProfile.id) + 1
    : 1;

  return (
    <div className="space-y-6">
      <DashboardPopups
        memberName={userProfile?.name ?? currentMember?.name ?? "Champion"}
        groupName={group.name}
      />

      <div>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Dashboard
        </h1>
        {isMock && (
          <p className="text-[11px] text-warning mt-1">
            Preview mode — <a href="/create-group" className="underline">create a group</a> to see live data
          </p>
        )}
      </div>

      <StatCards
        rank={rank}
        points={currentMember?.points ?? 0}
        totalPlayers={members.length}
        correctPredictions={currentMember?.correctPredictions ?? 0}
        exactScores={currentMember?.exactScores ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <Leaderboard members={top8WithStats} currentUserId={userProfile?.id ?? "1"} showGhost />
          <WallOfShame members={membersWithStats} totalMatches={20} />
        </div>
        <div className="lg:col-span-5 space-y-5">
          {nextMatch && <NextMatchCard match={nextMatch} groupId={groupId} />}
          <BuyInStatus group={group} members={members} />
        </div>
      </div>
    </div>
  );
}
