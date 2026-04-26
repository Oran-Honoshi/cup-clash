import { Leaderboard } from "@/components/dashboard/leaderboard";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { BuyInStatus } from "@/components/dashboard/buy-in-status";
import { StatCards } from "@/components/dashboard/stat-cards";
import { getLeaderboard, getMembers, getGroup } from "@/lib/services/groups";
import { getNextMatch } from "@/lib/services/matches";

export default async function DashboardPage() {
  const [members, top8, group, nextMatch] = await Promise.all([
    getMembers("grp_titans"),
    getLeaderboard("grp_titans", 8),
    getGroup("grp_titans"),
    getNextMatch(),
  ]);

  // Mock: current user is Amit (id: "1"), rank 1
  const currentUser = members.find((m) => m.id === "1")!;
  const rank = members.findIndex((m) => m.id === "1") + 1;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="label-caps mb-1">Tech Titans World Cup</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* Stat cards */}
      <StatCards
        rank={rank}
        points={currentUser.points}
        totalPlayers={members.length}
        correctPredictions={12}
        exactScores={3}
      />

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left col — leaderboard */}
        <div className="lg:col-span-7 space-y-5">
          <Leaderboard members={top8} currentUserId="1" />
        </div>

        {/* Right col — match + buy-in */}
        <div className="lg:col-span-5 space-y-5">
          {nextMatch && <NextMatchCard match={nextMatch} />}
          <BuyInStatus group={group} members={members} />
        </div>
      </div>
    </div>
  );
}
