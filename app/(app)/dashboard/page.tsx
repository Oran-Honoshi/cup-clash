export const dynamic = "force-dynamic";

import { redirect }         from "next/navigation";
import { Leaderboard }      from "@/components/dashboard/leaderboard";
import { NextMatchCard }    from "@/components/dashboard/next-match-card";
import { BuyInStatus }      from "@/components/dashboard/buy-in-status";
import { StatCards }        from "@/components/dashboard/stat-cards";
import { DashboardPopups }  from "@/components/dashboard/dashboard-popups";
import { WallOfShame }      from "@/components/dashboard/wall-of-shame";
import { getLeaderboard, getMembers, getGroup } from "@/lib/services/groups";
import { getNextMatch }     from "@/lib/services/matches";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";

export default async function DashboardPage() {
  const [userGroup, userProfile] = await Promise.all([
    getCurrentUserGroup(),
    getCurrentUserProfile(),
  ]);

  // Not logged in — redirect to sign in
  if (!userProfile) redirect("/signin");

  // No group yet — redirect to create or join
  if (!userGroup.groupId) redirect("/create-group");

  const { groupId, isAdmin, isPaid } = userGroup;

  const [members, top8, group, nextMatch] = await Promise.all([
    getMembers(groupId),
    getLeaderboard(groupId, 8),
    getGroup(groupId),
    getNextMatch(),
  ]);

  const currentMember = members.find(m => m.id === userProfile.id) ?? members[0];
  const rank = members.findIndex(m => m.id === userProfile.id) + 1;

  return (
    <div className="space-y-6">
      <DashboardPopups
        memberName={userProfile.name}
        groupName={group.name}
      />

      <div>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Dashboard
        </h1>
        {!isPaid && (
          <p className="text-sm mt-1" style={{ color: "#d97706" }}>
            Pay the $2 entry fee to unlock predictions and appear on the leaderboard.{" "}
            <a href={`/join/${group.passkey}`} style={{ color: "#0891B2" }} className="underline font-bold">
              Pay now →
            </a>
          </p>
        )}
        {isAdmin && (
          <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>
            You&apos;re the admin · Passkey: <span className="font-mono font-bold">{group.passkey}</span>
          </p>
        )}
      </div>

      <StatCards
        rank={isPaid ? rank : 0}
        points={currentMember?.points ?? 0}
        totalPlayers={members.filter(m => m.paid).length}
        correctPredictions={currentMember?.correctPredictions ?? 0}
        exactScores={currentMember?.exactScores ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <Leaderboard
            members={top8}
            currentUserId={userProfile.id}
            showGhost
          />
          <WallOfShame members={members} totalMatches={48} />
        </div>
        <div className="lg:col-span-5 space-y-5">
          {nextMatch && (
            <NextMatchCard match={nextMatch} groupId={groupId} />
          )}
          <BuyInStatus group={group} members={members} />
        </div>
      </div>
    </div>
  );
}