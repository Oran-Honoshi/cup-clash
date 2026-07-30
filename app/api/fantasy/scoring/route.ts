import { NextRequest, NextResponse } from "next/server";
import { runFantasyScoringCron, scoreGameweek } from "@/lib/services/fantasy-scoring";

// Called every 15 min by .github/workflows/fantasy-scoring-cron.yml — same
// CRON_SECRET-gated pattern as every other cron route. Separate file from
// app/api/scores/route.ts, same "distinct concern" precedent as
// oracle-cron/recap-cron being split out.
//
// Optional { gameweekId } body targets a single gameweek directly via
// scoreGameweek(), bypassing runFantasyScoringCron()'s rolling window —
// an ops hook for manually re-scoring one gameweek on demand.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as { gameweekId?: string } | null;
  if (body?.gameweekId) {
    const result = await scoreGameweek(body.gameweekId);
    return NextResponse.json(result);
  }

  const result = await runFantasyScoringCron();
  return NextResponse.json(result);
}
