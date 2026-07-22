export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getScheduleChunk } from "@/lib/services/schedule-data";

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

// On-demand pagination for Schedule's Upcoming/Done tabs — the initial page
// load only ships a near-term window (see getScheduleWindowBundle()); this
// route fetches one bounded chunk further back (?before=) or further
// forward (?after=) as the viewer navigates past that window.
export async function GET(req: NextRequest) {
  const before = req.nextUrl.searchParams.get("before");
  const after  = req.nextUrl.searchParams.get("after");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limitParam ?? "", 10) || DEFAULT_LIMIT));

  if (!before && !after) {
    return NextResponse.json({ error: "before or after is required" }, { status: 400 });
  }

  const bundle = before
    ? await getScheduleChunk("before", before, limit)
    : await getScheduleChunk("after", after!, limit);

  return NextResponse.json(bundle, { headers: { "Cache-Control": "no-store" } });
}
