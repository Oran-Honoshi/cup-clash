export const dynamic = "force-dynamic";

import { getGroup, getMembers } from "@/lib/services/groups";
import { getNextMatch } from "@/lib/services/matches";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { BuyInStatus } from "@/components/dashboard/buy-in-status";
import { StatCards } from "@/components/dashboard/stat-cards";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: { groupId: string };
}

export default async function GroupDetailPage({ params }: Props) {
  const { groupId } = params;

  const [group, members, nextMatch, userProfile] = await Promise.all([
    getGroup(groupId),
    getMembers(groupId),
    getNextMatch(),
    getCurrentUserProfile(),
  ]);

  const top8 = members.slice(0, 8);
  const currentMember = userProfile
    ? members.find(m => m.id === userProfile.id) ?? members[0]
    : members[0];
  const rank = userProfile
    ? members.findIndex(m => m.id === userProfile.id) + 1
    : 1;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/groups"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pitch-500 hover:text-white transition-colors">
        <ArrowLeft size={13} /> All groups
      </Link>

      <div>
        <div className="label-caps mb-1">Group</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          {group.name}
        </h1>
      </div>

      <StatCards
        rank={rank}
        points={currentMember?.points ?? 0}
        totalPlayers={members.length}
        correctPredictions={0}
        exactScores={0}
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
