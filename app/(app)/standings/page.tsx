export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { GroupStandings } from "@/components/dashboard/group-standings";
import { getCurrentUserGroup } from "@/lib/services/user-group";
import { serverT } from "@/lib/server-locale";

export default async function StandingsPage() {
  const { groupId, userId } = await getCurrentUserGroup();
  if (!userId) redirect("/signup");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">World Cup 2026</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
          Group Standings
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          All 12 groups · Updated after every match · Top 2 + 8 best 3rd-place teams advance
        </p>
      </div>
      <GroupStandings groupId={groupId ?? "none"} />
    </div>
  );
}