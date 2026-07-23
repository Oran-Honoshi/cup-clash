export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { sbAdmin } from "@/lib/supabase/admin";
import { CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CompetitionPicker } from "@/components/leagues/competition-picker";
import { ConsumeFollowParam } from "@/components/leagues/consume-follow-param";
import { MatchList, type ScoreMatch } from "@/components/scores/match-list";
import { EmptyState } from "@/components/ui/empty-state";
import { WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { getCompetitionsCached } from "@/lib/services/reference-cache";
import { getFollowedCompetitionIds } from "@/lib/services/follows";

export const metadata: Metadata = {
  title: "Scores — Cup Clash",
  description: "Live scores and match results for World Cup 2026 and top football leagues.",
};

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: { competition?: string };
}) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? null;

  const [competitions, followedCompetitionIds] = await Promise.all([
    getCompetitionsCached(),
    getFollowedCompetitionIds(userId),
  ]);

  const activeSlug = searchParams.competition ?? WORLD_CUP_SLUG;
  const activeCompetition = competitions.find((c) => c.slug === activeSlug) ?? competitions[0];

  let matches: ScoreMatch[] = [];
  if (activeSlug === WORLD_CUP_SLUG) {
    const { data } = await sbAdmin()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, status, home_score, away_score, minute, stage")
      .neq("home", "TBD")
      .neq("away", "TBD")
      .order("kickoff_at", { ascending: true });

    matches = ((data ?? []) as Array<{
      id: string; home: string; away: string;
      home_flag: string | null; away_flag: string | null;
      kickoff_at: string | null; status: string;
      home_score: number | null; away_score: number | null;
      minute: number | null; stage: string | null;
    }>).map((m) => ({
      id: m.id, home: m.home, away: m.away,
      homeFlagCode: m.home_flag, awayFlagCode: m.away_flag,
      kickoffAt: m.kickoff_at, status: m.status,
      homeScore: m.home_score, awayScore: m.away_score,
      minute: m.minute, stage: m.stage,
    }));
  } else if (activeCompetition) {
    // A full season is ~380 fixtures for the big leagues — show a rolling
    // window (recent results + upcoming) rather than the whole season.
    const now = Date.now();
    const windowStart = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now + 21 * 24 * 60 * 60 * 1000).toISOString();

    const { data } = await sbAdmin()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, status, home_score, away_score, minute, stage")
      .eq("competition_id", activeCompetition.id)
      .gte("kickoff_at", windowStart)
      .lte("kickoff_at", windowEnd)
      .order("kickoff_at", { ascending: true });

    matches = ((data ?? []) as Array<{
      id: string; home: string; away: string;
      home_flag: string | null; away_flag: string | null;
      kickoff_at: string | null; status: string;
      home_score: number | null; away_score: number | null;
      minute: number | null; stage: string | null;
    }>).map((m) => ({
      id: m.id, home: m.home, away: m.away,
      homeFlagCode: m.home_flag, awayFlagCode: m.away_flag,
      kickoffAt: m.kickoff_at, status: m.status,
      homeScore: m.home_score, awayScore: m.away_score,
      minute: m.minute, stage: m.stage,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Scores</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>
          {activeCompetition?.name ?? "Scores"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mt)" }}>
          Pick a competition to see fixtures and results.
        </p>
      </div>

      <ConsumeFollowParam userId={userId} />

      <CompetitionPicker
        competitions={competitions}
        activeSlug={activeSlug}
        basePath="/scores"
        userId={userId}
        followedCompetitionIds={followedCompetitionIds}
      />

      {matches.length > 0 ? (
        <MatchList matches={matches} />
      ) : (
        <EmptyState
          icon={<CalendarClock size={28} style={{ color: "#00D4FF" }} />}
          title="No matches yet"
          body={
            activeSlug === WORLD_CUP_SLUG
              ? "World Cup 2026 fixtures will appear here as they're scheduled."
              : `No ${activeCompetition?.name ?? "competition"} fixtures in the next few weeks. Follow it to get notified when they land.`
          }
        />
      )}
    </div>
  );
}
