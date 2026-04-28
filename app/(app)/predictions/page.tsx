export const dynamic = "force-dynamic";

import { TournamentPicks } from "@/components/dashboard/tournament-picks";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { getNextMatch } from "@/lib/services/matches";

export default async function PredictionsPage() {
  const nextMatch = await getNextMatch();

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">My Bets</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Predictions
        </h1>
        <p className="text-pitch-400 text-sm mt-1">
          Tournament picks lock at the first kickoff · Match picks lock 5 min before each game
        </p>
      </div>

      {/* Next match prediction */}
      {nextMatch && (
        <section>
          <div className="label-caps mb-3">Next match</div>
          <div className="max-w-md">
            <NextMatchCard match={nextMatch} />
          </div>
        </section>
      )}

      {/* Tournament-level picks */}
      <section>
        <div className="label-caps mb-3">Tournament picks — before June 11</div>
        <TournamentPicks groupId="grp_titans" locked={false} />
      </section>
    </div>
  );
}
