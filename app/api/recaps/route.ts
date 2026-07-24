// Match recap cron — generates AI recap paragraphs for finished matches.
// See lib/services/match-recaps.ts for the generation logic.

import { NextRequest, NextResponse } from "next/server";
import { runRecapCron } from "@/lib/services/match-recaps";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRecapCron();
    return NextResponse.json({ ok: true, ...result, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[recaps/cron] failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
