export const dynamic = "force-dynamic";

import { LeaderboardTabs } from "@/components/dashboard/leaderboard-tabs";
import { getMembers } from "@/lib/services/groups";

export default async function LeaderboardPage() {
  const members = await getMembers("grp_titans");
  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Tech Titans World Cup</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Leaderboards
        </h1>
      </div>
      <LeaderboardTabs members={members} />
    </div>
  );
}
