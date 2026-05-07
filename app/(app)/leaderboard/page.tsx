export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { LeaderboardTabs } from "@/components/dashboard/leaderboard-tabs";
import { getMembers, getGroup } from "@/lib/services/groups";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";

export default async function LeaderboardPage() {
  const [userGroup, userProfile] = await Promise.all([
    getCurrentUserGroup(),
    getCurrentUserProfile(),
  ]);

  if (!userProfile) redirect("/signin");
  if (!userGroup.groupId) redirect("/create-group");

  const groupId = userGroup.groupId;
  const [members, group] = await Promise.all([
    getMembers(groupId),
    getGroup(groupId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Leaderboard
        </h1>
      </div>
      <LeaderboardTabs members={members} currentUserId={userProfile.id} />
    </div>
  );
}