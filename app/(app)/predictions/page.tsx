import { Target, Trophy, Star, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Flag } from "@/components/ui/flag";
import { getUpcomingMatches } from "@/lib/services/matches";
import { ALL_COUNTRIES } from "@/lib/countries";

// Mock prediction data — will come from Supabase
const TOURNAMENT_PICKS = {
  winner:    { code: "ARG", name: "Argentina",  locked: true  },
  topScorer: { name: "Lionel Messi", team: "Argentina", locked: true },
  topAssist: { name: "Kylian Mbappé", team: "France",  locked: true },
};

export const dynamic = "force-dynamic";

export default async function PredictionsPage() {
  const upcoming = await getUpcomingMatches();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="label-caps mb-1">Tech Titans World Cup</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          My Predictions
        </h1>
      </div>

      {/* Tournament-level picks */}
      <section>
        <div className="label-caps mb-3 flex items-center gap-2">
          <Trophy size={12} />
          Tournament Picks — Locked before kickoff
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Winner */}
          <Card variant="glass-accent" className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} style={{ color: "#D4AF37" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-pitch-400">
                Tournament Winner
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Flag code="ar" size="md" />
              <div>
                <div className="font-display text-xl uppercase text-white">
                  {TOURNAMENT_PICKS.winner.name}
                </div>
                <div className="text-[11px] text-success font-bold uppercase tracking-wider">
                  +100 pts if correct
                </div>
              </div>
            </div>
          </Card>

          {/* Top scorer */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-warning" />
              <span className="text-xs font-bold uppercase tracking-widest text-pitch-400">
                Top Scorer
              </span>
            </div>
            <div>
              <div className="font-display text-xl uppercase text-white">
                {TOURNAMENT_PICKS.topScorer.name}
              </div>
              <div className="text-xs text-pitch-400">
                {TOURNAMENT_PICKS.topScorer.team}
              </div>
              <div className="text-[11px] text-success font-bold uppercase tracking-wider mt-1">
                +50 pts if correct
              </div>
            </div>
          </Card>

          {/* Top assister */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} style={{ color: "rgb(var(--accent-glow))" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-pitch-400">
                Top Assister
              </span>
            </div>
            <div>
              <div className="font-display text-xl uppercase text-white">
                {TOURNAMENT_PICKS.topAssist.name}
              </div>
              <div className="text-xs text-pitch-400">
                {TOURNAMENT_PICKS.topAssist.team}
              </div>
              <div className="text-[11px] text-success font-bold uppercase tracking-wider mt-1">
                +50 pts if correct
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Upcoming match predictions */}
      <section>
        <div className="label-caps mb-3 flex items-center gap-2">
          <Target size={12} />
          Upcoming Matches — Enter your predictions
        </div>
        <div className="space-y-3">
          {upcoming.map((match) => (
            <Card key={match.id} variant="glass" className="p-5">
              <div className="flex items-center gap-4">
                {/* Home */}
                <div className="flex-1 flex items-center gap-3">
                  <Flag code={match.homeFlagCode ?? "un"} size="sm" />
                  <span className="font-display text-lg uppercase text-white hidden sm:block">
                    {match.home}
                  </span>
                  <span className="font-display text-lg uppercase text-white sm:hidden">
                    {match.home.slice(0, 3)}
                  </span>
                </div>

                {/* Score boxes */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center font-display text-2xl text-pitch-500">
                    ?
                  </div>
                  <span className="font-display text-xl text-pitch-600">–</span>
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center font-display text-2xl text-pitch-500">
                    ?
                  </div>
                </div>

                {/* Away */}
                <div className="flex-1 flex items-center justify-end gap-3">
                  <span className="font-display text-lg uppercase text-white hidden sm:block">
                    {match.away}
                  </span>
                  <span className="font-display text-lg uppercase text-white sm:hidden">
                    {match.away.slice(0, 3)}
                  </span>
                  <Flag code={match.awayFlagCode ?? "un"} size="sm" />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-pitch-500">
                <span>{match.stage} Stage</span>
                <span className="font-mono">
                  {new Date(match.time).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short",
                  })}{" "}
                  · 20:00 UTC
                </span>
                <span
                  className="font-bold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  style={{ color: "rgb(var(--accent-glow))" }}
                >
                  Enter prediction →
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}