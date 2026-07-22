export const dynamic = "force-dynamic";

import Link from "next/link";
import { sbAdmin } from "@/lib/supabase/admin";
import { Newspaper, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { getFollowedCompetitionIds, getFollowedTeamIds } from "@/lib/services/follows";
import { getFollowedCompetitionIdsViaCountry } from "@/lib/services/countries";
import { getCompetitions } from "@/lib/services/competitions";
import { getMatchVoteState } from "@/lib/services/community-vote";
import { relativeTime } from "@/lib/relative-time";
import { StoryRingRail } from "@/components/news/story-ring-rail";
import { NewsMvpTeaserCard, type MvpTeaserData } from "@/components/news/news-mvp-teaser-card";

interface ArticleRow {
  id: string;
  title: string;
  summary: string | null;
  link_url: string;
  image_url: string | null;
  published_at: string | null;
  source_id: string;
}

type FeedMode = "foryou" | "following" | "all";

async function getMvpTeaser(sb: ReturnType<typeof sbAdmin>, userId: string | null): Promise<MvpTeaserData | null> {
  const { data: match } = await sb
    .from("matches")
    .select("id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city")
    .eq("status", "finished")
    .order("kickoff_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!match) return null;

  const vote = await getMatchVoteState(sb, match.id, userId);
  if (!vote) return null; // shouldn't happen for a finished match, but be defensive

  // Only surface a "leading" pick once there's at least one real vote to back
  // it — otherwise ties at 0% would crown an arbitrary candidate as "leading".
  const topResult = vote.totalVotes > 0
    ? [...vote.results].sort((a, b) => b.votes - a.votes)[0]
    : null;
  const topOption = topResult ? vote.options.find((o) => o.optionId === topResult.optionId) ?? null : null;

  return {
    matchId: match.id,
    home: match.home,
    away: match.away,
    homeFlagCode: match.home_flag ?? undefined,
    awayFlagCode: match.away_flag ?? undefined,
    kickoffAt: match.kickoff_at,
    stage: match.stage ?? undefined,
    group: match.group_letter ?? undefined,
    stadium: match.stadium ?? undefined,
    city: match.city ?? undefined,
    topPick: topOption ? { name: topOption.fullName, photo: topOption.photo, pct: topResult!.pct } : null,
    totalVotes: vote.totalVotes,
    closed: vote.closed,
  };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { team?: string; competition?: string; followed?: string; feed?: string };
}) {
  const sbSession = createClient();
  const { data: { user } } = await sbSession.auth.getUser();
  const userId = user?.id ?? null;

  // Back-compat: old `?followed=1` links (Home dashboard, bookmarks) keep
  // resolving to the "Following" tab. Anonymous visitors always get "all" —
  // there's nothing to personalize without an account.
  const requestedFeed: FeedMode =
    searchParams.feed === "following" || searchParams.followed === "1" ? "following" :
    searchParams.feed === "all" ? "all" :
    "foryou";
  const feed: FeedMode = userId ? requestedFeed : "all";

  const [followedTeamIds, followedCompetitionIdsOwn, followedCompetitionIdsViaCountry] = userId
    ? await Promise.all([getFollowedTeamIds(userId), getFollowedCompetitionIds(userId), getFollowedCompetitionIdsViaCountry(userId)])
    : [new Set<string>(), new Set<string>(), new Set<string>()];
  // A country-follow (e.g. "Israel") counts a match/article as followed via
  // its resolved domestic league (e.g. Ligat Ha'al) — merged straight into
  // the competition-id set so followedOrClause() needs no separate branch.
  const followedCompetitionIds = new Set([...followedCompetitionIdsOwn, ...followedCompetitionIdsViaCountry]);
  const hasAnyFollow = followedTeamIds.size > 0 || followedCompetitionIds.size > 0;

  const sb = sbAdmin();

  function baseQuery() {
    // Transient, URL-driven filtering only — never saved without an account.
    let q = sb
      .from("news_articles")
      .select("id, title, summary, link_url, image_url, published_at, source_id")
      .order("published_at", { ascending: false, nullsFirst: false });
    if (searchParams.team) q = q.contains("team_ids", [searchParams.team]);
    if (searchParams.competition) q = q.contains("competition_ids", [searchParams.competition]);
    return q;
  }

  // An article matches "followed" if it's tagged with ANY followed team OR
  // ANY followed competition (array-overlap OR across both columns).
  function followedOrClause(): string | null {
    const orParts: string[] = [];
    if (followedTeamIds.size) orParts.push(`team_ids.ov.{${Array.from(followedTeamIds).join(",")}}`);
    if (followedCompetitionIds.size) orParts.push(`competition_ids.ov.{${Array.from(followedCompetitionIds).join(",")}}`);
    return orParts.length ? orParts.join(",") : null;
  }

  let articles: ArticleRow[];

  if (feed === "following") {
    const orClause = followedOrClause();
    const { data } = orClause
      ? await baseQuery().or(orClause).limit(60)
      : { data: [] as ArticleRow[] };
    articles = (data ?? []) as ArticleRow[];
  } else if (feed === "foryou" && hasAnyFollow) {
    // "For You" = followed-tagged stories first, backfilled with the general
    // recent feed until we hit the page size, deduped by id. There's no
    // engagement/view-tracking in this app yet, so "trending" is a recency
    // proxy rather than a true popularity signal — see Phase 3 report.
    const orClause = followedOrClause()!;
    const [{ data: followedData }, { data: recentData }] = await Promise.all([
      baseQuery().or(orClause).limit(30),
      baseQuery().limit(60),
    ]);
    const seen = new Set<string>();
    articles = [];
    for (const a of (followedData ?? []) as ArticleRow[]) {
      if (!seen.has(a.id)) { seen.add(a.id); articles.push(a); }
    }
    for (const a of (recentData ?? []) as ArticleRow[]) {
      if (articles.length >= 60) break;
      if (!seen.has(a.id)) { seen.add(a.id); articles.push(a); }
    }
  } else {
    // "all", or "foryou" with nothing followed yet — general recent feed.
    const { data } = await baseQuery().limit(60);
    articles = (data ?? []) as ArticleRow[];
  }

  const [{ data: sourceRows }, competitions, mvpTeaser] = await Promise.all([
    sb.from("news_sources").select("id, name"),
    getCompetitions(),
    getMvpTeaser(sb, userId),
  ]);
  const sourceNames = new Map(((sourceRows ?? []) as Array<{ id: string; name: string }>).map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ac)", marginBottom: 4 }}>
            Intel
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
            Football News
          </h1>
          <p style={{ fontSize: 14, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
            {(searchParams.team || searchParams.competition)
              ? "Filtered feed — clear the filter to see everything."
              : feed === "following"
              ? hasAnyFollow
                ? "Stories tagged with your followed teams and competitions."
                : "You aren't following anything yet — showing nothing. Pick some teams first."
              : feed === "foryou"
              ? "A mix of your followed teams and the latest headlines."
              : "Aggregated from trusted sources. Tap a headline to read the full story."}
          </p>
        </div>

        {userId && (
          <div
            style={{
              background: "var(--nv, var(--sf))",
              borderRadius: 10,
              border: "1px solid var(--br)",
              overflow: "hidden",
              padding: 3,
              gap: 2,
              display: "flex",
              flexShrink: 0,
            }}
          >
            {[
              { key: "foryou" as const, label: "For You", href: "/news?feed=foryou" },
              { key: "following" as const, label: "Following", href: "/news?feed=following" },
              { key: "all" as const, label: "All", href: "/news?feed=all" },
            ].map((t) => {
              const isActive = t.key === feed;
              return (
                <Link
                  key={t.key}
                  href={t.href}
                  style={{
                    padding: "7px 14px",
                    textAlign: "center",
                    borderRadius: 7,
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    background: isActive ? "color-mix(in srgb, var(--ac) 15%, transparent)" : "transparent",
                    color: isActive ? "var(--ac)" : "var(--mt)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <StoryRingRail competitions={competitions} activeCompetitionId={searchParams.competition} />

      {mvpTeaser && !searchParams.team && !searchParams.competition && (
        <NewsMvpTeaserCard teaser={mvpTeaser} />
      )}

      {articles.length === 0 ? (
        feed === "following" && !hasAnyFollow ? (
          <EmptyState
            icon={<Newspaper size={28} style={{ color: "var(--ac)" }} />}
            title="Nothing followed yet"
            body="Follow a few teams or competitions and their stories will show up here."
            cta={{ label: "Pick your teams", href: "/leagues?tab=teams" }}
          />
        ) : (
          <EmptyState
            icon={<Newspaper size={28} style={{ color: "var(--ac)" }} />}
            title="No stories yet"
            body="Check back soon — new headlines are fetched every 20 minutes."
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <a
              key={a.id}
              href={a.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)", textDecoration: "none" }}
            >
              {a.image_url && (
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9", background: "var(--ip)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image_url} alt="" loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              )}
              <div className="flex flex-col flex-1 p-4 gap-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ac)" }}>
                    {sourceNames.get(a.source_id) ?? "Source"}
                  </span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--ft)" }}>
                    {relativeTime(a.published_at)}
                  </span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)", margin: 0, lineHeight: 1.3 }}>
                  {a.title}
                </h3>
                {a.summary && (
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--t2)", margin: 0, lineHeight: 1.5, flex: 1 }}>
                    {a.summary}
                  </p>
                )}
                <span className="inline-flex items-center gap-1" style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, color: "var(--mt)", marginTop: "auto" }}>
                  Read on {sourceNames.get(a.source_id) ?? "source"} <ExternalLink size={11} />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
