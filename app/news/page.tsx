export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Newspaper, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { getFollowedCompetitionIds, getFollowedTeamIds } from "@/lib/services/follows";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface ArticleRow {
  id: string;
  title: string;
  summary: string | null;
  link_url: string;
  image_url: string | null;
  published_at: string | null;
  source_id: string;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { team?: string; competition?: string; followed?: string };
}) {
  const sbSession = createClient();
  const { data: { user } } = await sbSession.auth.getUser();
  const userId = user?.id ?? null;

  const wantsFollowedOnly = searchParams.followed === "1" && !!userId;
  const [followedTeamIds, followedCompetitionIds] = wantsFollowedOnly
    ? await Promise.all([getFollowedTeamIds(userId), getFollowedCompetitionIds(userId)])
    : [new Set<string>(), new Set<string>()];
  const hasAnyFollow = followedTeamIds.size > 0 || followedCompetitionIds.size > 0;

  const sb = sbAdmin();
  let query = sb
    .from("news_articles")
    .select("id, title, summary, link_url, image_url, published_at, source_id")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);

  // Transient, URL-driven filtering only — never saved without an account.
  if (searchParams.team) query = query.contains("team_ids", [searchParams.team]);
  if (searchParams.competition) query = query.contains("competition_ids", [searchParams.competition]);

  // "Following" toggle — an article matches if it's tagged with ANY followed
  // team OR ANY followed competition (array-overlap OR across both columns).
  if (wantsFollowedOnly) {
    const orParts: string[] = [];
    if (followedTeamIds.size) orParts.push(`team_ids.ov.{${Array.from(followedTeamIds).join(",")}}`);
    if (followedCompetitionIds.size) orParts.push(`competition_ids.ov.{${Array.from(followedCompetitionIds).join(",")}}`);
    query = orParts.length ? query.or(orParts.join(",")) : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const [{ data }, { data: sourceRows }] = await Promise.all([
    query,
    sb.from("news_sources").select("id, name"),
  ]);
  const articles = (data ?? []) as ArticleRow[];
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
              : wantsFollowedOnly
              ? hasAnyFollow
                ? "Stories tagged with your followed teams and competitions."
                : "You aren't following anything yet — showing nothing. Pick some teams first."
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
            {[{ key: "all", label: "All News", href: "/news" }, { key: "followed", label: "Following", href: "/news?followed=1" }].map((t) => {
              const isActive = t.key === "followed" ? wantsFollowedOnly : !wantsFollowedOnly;
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

      {articles.length === 0 ? (
        wantsFollowedOnly && !hasAnyFollow ? (
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
