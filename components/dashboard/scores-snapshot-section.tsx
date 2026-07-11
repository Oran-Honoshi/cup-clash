import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { serverT, interpolate } from "@/lib/server-locale";
import { getCompetitions, WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { getFollowedCompetitionIds } from "@/lib/services/follows";
import { getStandings } from "@/lib/services/standings";
import { getAllMatches } from "@/lib/services/matches";

const DEFAULT_COMPETITION_COUNT = 3;

type SnapshotCard =
  | { competition: Awaited<ReturnType<typeof getCompetitions>>[number]; kind: "result"; home: string; away: string; homeScore: number | null; awayScore: number | null }
  | { competition: Awaited<ReturnType<typeof getCompetitions>>[number]; kind: "leader"; team: string; points: number }
  | { competition: Awaited<ReturnType<typeof getCompetitions>>[number]; kind: "empty" };

// Shown below the DashboardEmptyState chooser for both guests and
// zero-groups-but-authenticated users — a taste of live content before
// they've joined anything. Reuses getAllMatches/getStandings; no new queries.
export async function ScoresSnapshotSection({ userId }: { userId: string | null }) {
  const [competitions, followedCompetitionIds] = await Promise.all([
    getCompetitions(),
    getFollowedCompetitionIds(userId),
  ]);
  if (competitions.length === 0) return null;

  const followed = competitions.filter((c) => followedCompetitionIds.has(c.id));
  const selected = (followed.length > 0 ? followed : competitions).slice(0, DEFAULT_COMPETITION_COUNT);

  const needsMatches = selected.some((c) => c.slug === WORLD_CUP_SLUG);
  const allMatches = needsMatches ? await getAllMatches() : [];

  const cards: SnapshotCard[] = await Promise.all(
    selected.map(async (competition): Promise<SnapshotCard> => {
      if (competition.slug === WORLD_CUP_SLUG) {
        const latest = allMatches
          .filter((m) => m.status === "finished")
          .sort((a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime())[0];
        if (!latest) return { competition, kind: "empty" };
        return {
          competition,
          kind: "result",
          home: latest.home,
          away: latest.away,
          homeScore: latest.home_score ?? null,
          awayScore: latest.away_score ?? null,
        };
      }

      const rows = await getStandings(competition.id);
      const leader = rows.find((r) => r.position === 1) ?? rows[0];
      if (!leader) return { competition, kind: "empty" };
      return { competition, kind: "leader", team: leader.team, points: leader.points };
    })
  );

  return (
    <div
      className="-mx-4 sm:-mx-6 px-4 sm:px-6"
      style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 12, borderBottom: "1px solid var(--br)" }}
    >
      <div className="ta-section-label mb-2">{serverT("dash_scores_title")}</div>

      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {cards.map((card) => (
          <Link
            key={card.competition.id}
            href={`/standings?competition=${card.competition.slug}`}
            className="shrink-0 flex flex-col gap-2 p-3 rounded-xl"
            style={{ width: 220, background: "var(--sf)", border: "1px solid var(--br)", textDecoration: "none" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FlagBadge code={card.competition.logoUrl} label={card.competition.name} size="sm" />
              <div
                className="truncate font-bold flex-1 min-w-0"
                style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--tx)" }}
              >
                {card.competition.name}
              </div>
              <ChevronRight size={14} style={{ color: "var(--mt)" }} />
            </div>

            {card.kind === "leader" && (
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--t2)" }}>
                {interpolate(serverT("dash_scores_leaderLine"), { team: card.team, points: card.points })}
              </div>
            )}

            {card.kind === "result" && (
              <div>
                <div
                  className="uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 700, color: "var(--mt)" }}
                >
                  {serverT("dash_scores_resultLabel")}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--t2)" }}>
                  {card.home} {card.homeScore}–{card.awayScore} {card.away}
                </div>
              </div>
            )}

            {card.kind === "empty" && (
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--mt)" }}>
                {serverT("dash_scores_noData")}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
