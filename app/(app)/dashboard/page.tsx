export const dynamic = "force-dynamic";

import { Leaderboard } from "@/components/dashboard/leaderboard";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { BuyInStatus } from "@/components/dashboard/buy-in-status";
import { StatCards } from "@/components/dashboard/stat-cards";
import { DashboardPopups } from "@/components/dashboard/dashboard-popups";
import { getLeaderboard, getMembers, getGroup } from "@/lib/services/groups";
import { getNextMatch } from "@/lib/services/matches";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";

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

  // Find current user in leaderboard
  const currentMember = userProfile
    ? members.find((m) => m.id === userProfile.id) ?? members[0]
    : members[0];
  const rank = userProfile
    ? members.findIndex((m) => m.id === userProfile.id) + 1
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
        correctPredictions={12}
        exactScores={3}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <Leaderboard members={top8} currentUserId={userProfile?.id ?? "1"} />
        </div>
        <div className="lg:col-span-5 space-y-5">
          {nextMatch && <NextMatchCard match={nextMatch} groupId={groupId} />}
          <BuyInStatus group={group} members={members} />
        </div>
      </div>
    </div>
  );
}
