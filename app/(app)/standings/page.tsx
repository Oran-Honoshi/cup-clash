export const dynamic = "force-dynamic";

import { GroupStandings } from "@/components/dashboard/group-standings";

export default function StandingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">World Cup 2026</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Group Standings
        </h1>
        <p className="text-pitch-400 text-sm mt-1">
          All 12 groups · Updated after every match · Top 2 + 8 best 3rd-place teams advance
        </p>
      </div>
      <GroupStandings />
    </div>
  );
}
