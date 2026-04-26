import { Leaderboard } from "@/components/dashboard/leaderboard";
import { getMembers } from "@/lib/services/groups";

export default async function LeaderboardPage() {
  const members = await getMembers("grp_titans");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Tech Titans World Cup</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Full Table
        </h1>
      </div>
      <Leaderboard members={members} currentUserId="1" />
    </div>
  );
}
