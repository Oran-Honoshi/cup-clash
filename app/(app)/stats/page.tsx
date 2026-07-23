export const dynamic = "force-dynamic";

import Link from "next/link";
import { BarChart2 } from "lucide-react";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";
import { ZONES } from "@/lib/zones";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { getCompetitionsCached } from "@/lib/services/reference-cache";
import { getStandings, type StandingsRow } from "@/lib/services/standings";
import { GroupTable, type TeamStanding } from "@/components/predictions/group-stage-predictions";
import { AccuracyChart } from "@/components/stats/accuracy-chart";
import { CompetitionFilterChips } from "@/components/stats/competition-filter-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { GroupStandings } from "@/components/dashboard/group-standings";

function toTeamStandings(rows: StandingsRow[]): TeamStanding[] {
  return rows.map((r) => ({
    name: r.team,
    flagCode: "", // club badges, not national flags — FlaggedTeam degrades to text-only, which is correct here
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    gf: r.goalsFor,
    ga: r.goalsAgainst,
    gd: r.goalDifference,
    pts: r.points,
  }));
}

// Statistician zone — real content for Phase 3 (Phase 1 shipped a
// placeholder). Personal accuracy is gated behind an account (it's "your"
// data); the competition chips + standings table stay public, same
// never-block-browsing rule as the rest of the app.
export default async function StatsPage({
  searchParams,
}: {
  searchParams: { competition?: string };
}) {
  const zone = ZONES.find((z) => z.key === "stats")!;
  const profile = await getCurrentUserProfile();
  const competitions = await getCompetitionsCached();

  let activeCompetition = searchParams.competition
    ? competitions.find((c) => c.slug === searchParams.competition) ?? null
    : null;

  if (!activeCompetition) {
    // Default to the first competition (excluding World Cup, which has its
    // own live-computed table below rather than a synced `standings` row)
    // that actually has a synced table, rather than landing on an empty one.
    for (const c of competitions) {
      if (c.slug === WORLD_CUP_SLUG) continue;
      const rows = await getStandings(c.id);
      if (rows.length > 0) {
        activeCompetition = c;
        break;
      }
    }
    if (!activeCompetition) {
      activeCompetition = competitions.find((c) => c.slug !== WORLD_CUP_SLUG) ?? competitions[0] ?? null;
    }
  }

  const isWorldCup = activeCompetition?.slug === WORLD_CUP_SLUG;
  // World Cup standings are never written to the generic `standings` table
  // (see comment above) — computed live from `matches` instead, via the
  // same GroupStandings widget the standalone /standings route uses.
  const standingsRows = activeCompetition && !isWorldCup ? await getStandings(activeCompetition.id) : [];
  const teamStandings = toTeamStandings(standingsRows);

  return (
    <div className={`space-y-6 ${zoneFontVars}`}>
      <div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: zone.accent, marginBottom: 4 }}>
          Statistician
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
          Your Stats
        </h1>
        <p style={{ fontSize: 14, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          Personal accuracy, plus every competition's live table.
        </p>
      </div>

      {profile ? (
        <AccuracyChart />
      ) : (
        <div
          className="flex items-center gap-3 p-4"
          style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 }}
        >
          <BarChart2 size={22} style={{ color: zone.accent }} />
          <div className="flex-1">
            <div className="text-sm font-black" style={{ color: "var(--tx)" }}>Your accuracy, tracked over time</div>
            <p className="text-xs mt-0.5" style={{ color: "var(--t2)" }}>
              <Link href="/signup" style={{ color: zone.accent, textDecoration: "underline" }}>Sign in</Link> to see your personal prediction accuracy across every group you're in.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--t2)" }}>
          Standings
        </div>
        <CompetitionFilterChips competitions={competitions} activeSlug={activeCompetition?.slug} />
        {isWorldCup ? (
          <GroupStandings />
        ) : teamStandings.length > 0 ? (
          <GroupTable standings={teamStandings} highlightTopN={0} />
        ) : (
          <EmptyState
            icon={<BarChart2 size={28} style={{ color: zone.accent }} />}
            title="No standings yet"
            body={`We haven't synced a table for ${activeCompetition?.name ?? "this competition"} yet — check back shortly.`}
          />
        )}
      </div>
    </div>
  );
}
