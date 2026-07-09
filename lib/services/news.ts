import { XMLParser } from "fast-xml-parser";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface NewsSource {
  id: string;
  name: string;
  rss_url: string;
}

interface ParsedItem {
  title: string;
  summary: string | null;
  linkUrl: string;
  imageUrl: string | null;
  publishedAt: string | null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// 1-2 sentences max, fair-use excerpt only — never the full article body.
function toExcerpt(raw: string): string {
  const text = stripHtml(raw);
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  const excerpt = sentences.slice(0, 2).join(" ").trim();
  return excerpt.length > 280 ? `${excerpt.slice(0, 277)}…` : excerpt;
}

function firstImgSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

function safeIso(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function parseRss(channel: Record<string, unknown>): ParsedItem[] {
  const items = asArray(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
  return items.map((item) => {
    const title = typeof item.title === "string" ? item.title : String(item.title ?? "");
    const link = typeof item.link === "string" ? item.link : String(item.link ?? "");
    const description = typeof item.description === "string" ? item.description : "";
    const pubDate = typeof item.pubDate === "string" ? item.pubDate : null;

    const enclosure = item.enclosure as { "@_url"?: string; "@_type"?: string } | undefined;
    const mediaContent = item["media:content"] as { "@_url"?: string } | undefined;
    const mediaThumb = item["media:thumbnail"] as { "@_url"?: string } | undefined;
    const imageUrl =
      (enclosure?.["@_type"]?.startsWith("image") ? enclosure["@_url"] : undefined) ??
      mediaContent?.["@_url"] ??
      mediaThumb?.["@_url"] ??
      firstImgSrc(description) ??
      null;

    return {
      title: stripHtml(title),
      summary: description ? toExcerpt(description) : null,
      linkUrl: link.trim(),
      imageUrl,
      publishedAt: safeIso(pubDate),
    };
  }).filter((i) => i.title && i.linkUrl);
}

function parseAtom(feed: Record<string, unknown>): ParsedItem[] {
  const entries = asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[] | undefined);
  return entries.map((entry) => {
    const titleRaw = entry.title as string | { "#text": string } | undefined;
    const title = typeof titleRaw === "string" ? titleRaw : titleRaw?.["#text"] ?? "";

    const linkRaw = entry.link as { "@_href"?: string } | { "@_href"?: string }[] | undefined;
    const links = asArray(linkRaw);
    const link = links.find((l) => l["@_href"])?.["@_href"] ?? "";

    const summaryRaw = entry.summary ?? entry.content;
    const summaryText = typeof summaryRaw === "string" ? summaryRaw : (summaryRaw as { "#text"?: string } | undefined)?.["#text"] ?? "";
    const updated = typeof entry.updated === "string" ? entry.updated : typeof entry.published === "string" ? entry.published : null;

    return {
      title: stripHtml(title),
      summary: summaryText ? toExcerpt(summaryText) : null,
      linkUrl: link.trim(),
      imageUrl: summaryText ? firstImgSrc(summaryText) : null,
      publishedAt: safeIso(updated),
    };
  }).filter((i) => i.title && i.linkUrl);
}

async function fetchAndParseFeed(rssUrl: string): Promise<ParsedItem[]> {
  const res = await fetch(rssUrl, {
    headers: { "User-Agent": "CupClashNewsBot/1.0 (+https://cupclash.live)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const doc = parser.parse(xml) as Record<string, unknown>;

  if (doc.rss) {
    const rss = doc.rss as Record<string, unknown>;
    return parseRss(rss.channel as Record<string, unknown>);
  }
  if (doc.feed) {
    return parseAtom(doc.feed as Record<string, unknown>);
  }
  return [];
}

interface Taggables {
  teams: Array<{ id: string; name: string }>;
  competitions: Array<{ id: string; name: string }>;
}

function tag(text: string, taggables: Taggables) {
  const haystack = text.toLowerCase();
  const teamIds = taggables.teams.filter((t) => haystack.includes(t.name.toLowerCase())).map((t) => t.id);
  const competitionIds = taggables.competitions.filter((c) => haystack.includes(c.name.toLowerCase())).map((c) => c.id);
  return { teamIds, competitionIds };
}

export interface NewsFetchResult {
  sourcesProcessed: number;
  sourcesFailed: Array<{ name: string; error: string }>;
  itemsSeen: number;
  itemsInserted: number;
}

export async function fetchAndStoreNews(): Promise<NewsFetchResult> {
  const sb = sbAdmin();

  const [{ data: sources }, { data: teams }, { data: competitions }] = await Promise.all([
    sb.from("news_sources").select("id, name, rss_url").eq("enabled", true),
    sb.from("teams").select("id, name"),
    sb.from("competitions").select("id, name"),
  ]);

  const taggables: Taggables = {
    teams: (teams ?? []) as Array<{ id: string; name: string }>,
    competitions: (competitions ?? []) as Array<{ id: string; name: string }>,
  };

  const result: NewsFetchResult = { sourcesProcessed: 0, sourcesFailed: [], itemsSeen: 0, itemsInserted: 0 };
  const rows: Array<{
    source_id: string;
    title: string;
    summary: string | null;
    link_url: string;
    image_url: string | null;
    published_at: string | null;
    team_ids: string[];
    competition_ids: string[];
  }> = [];

  for (const source of (sources ?? []) as NewsSource[]) {
    try {
      const items = await fetchAndParseFeed(source.rss_url);
      result.itemsSeen += items.length;
      for (const item of items) {
        const { teamIds, competitionIds } = tag(`${item.title} ${item.summary ?? ""}`, taggables);
        rows.push({
          source_id: source.id,
          title: item.title,
          summary: item.summary,
          link_url: item.linkUrl,
          image_url: item.imageUrl,
          published_at: item.publishedAt,
          team_ids: teamIds,
          competition_ids: competitionIds,
        });
      }
      result.sourcesProcessed++;
    } catch (err) {
      result.sourcesFailed.push({ name: source.name, error: err instanceof Error ? err.message : String(err) });
    }
  }

  if (rows.length > 0) {
    const { data: inserted, error } = await sb
      .from("news_articles")
      .upsert(rows, { onConflict: "link_url", ignoreDuplicates: true })
      .select("id");
    if (error) throw error;
    result.itemsInserted = inserted?.length ?? 0;
  }

  return result;
}
