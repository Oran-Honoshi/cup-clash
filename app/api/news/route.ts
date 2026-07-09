// News aggregation cron — fetches enabled RSS/Atom feeds from news_sources,
// stores short excerpts (never full article bodies) into news_articles.
// See lib/services/news.ts for parsing/tagging/dedupe logic.

import { NextRequest, NextResponse } from "next/server";
import { fetchAndStoreNews } from "@/lib/services/news";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await fetchAndStoreNews();
    return NextResponse.json({ ok: true, ...result, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[news/cron] failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
