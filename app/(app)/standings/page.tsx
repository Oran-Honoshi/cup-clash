export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { GroupStandings } from "@/components/dashboard/group-standings";
import { getCurrentUserGroup } from "@/lib/services/user-group";

export default async function StandingsPage() {
  const { groupId, userId } = await getCurrentUserGroup();
  if (!userId) redirect("/signin");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">World Cup 2026</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Group Standings
        </h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          All 12 groups · Updated after every match · Top 2 + 8 best 3rd-place teams advance
        </p>
      </div>
      <GroupStandings groupId={groupId ?? "none"} />
    </div>
  );
}