export const dynamic = "force-dynamic";

import { MultiGroupDashboard } from "@/components/groups/multi-group-dashboard";
import { getUserGroups, calculateTotalEarnings } from "@/lib/services/multi-group";
import { getCurrentUserProfile } from "@/lib/services/user-group";

export default async function GroupsPage() {
  const userProfile = await getCurrentUserProfile();
  const userId = userProfile?.id ?? "1";

  const groups = await getUserGroups(userId);
  const totalEarnings = calculateTotalEarnings(groups);
  const totalPot = groups.reduce((s, g) => s + g.potTotal, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">My leagues</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Groups
        </h1>
      </div>

      <MultiGroupDashboard
        groups={groups}
        totalEarnings={totalEarnings}
        totalPot={totalPot}
      />
    </div>
  );
}