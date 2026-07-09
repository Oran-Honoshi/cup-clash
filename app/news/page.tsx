export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Newspaper, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

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
  searchParams: { team?: string; competition?: string };
}) {
  const sb = sbAdmin();
  let query = sb
    .from("news_articles")
    .select("id, title, summary, link_url, image_url, published_at, source_id")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);

  // Transient, URL-driven filtering only — never saved without an account.
  if (searchParams.team) query = query.contains("team_ids", [searchParams.team]);
  if (searchParams.competition) query = query.contains("competition_ids", [searchParams.competition]);

  const [{ data }, { data: sourceRows }] = await Promise.all([
    query,
    sb.from("news_sources").select("id, name"),
  ]);
  const articles = (data ?? []) as ArticleRow[];
  const sourceNames = new Map(((sourceRows ?? []) as Array<{ id: string; name: string }>).map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
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
            : "Aggregated from trusted sources. Tap a headline to read the full story."}
        </p>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={28} style={{ color: "var(--ac)" }} />}
          title="No stories yet"
          body="Check back soon — new headlines are fetched every 20 minutes."
        />
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
