// Oracle predictions cron — generates AI pre-match predictions for World Cup
// knockout fixtures. See lib/services/oracle.ts for the generation logic.

import { NextRequest, NextResponse } from "next/server";
import { runOracleCron } from "@/lib/services/oracle";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runOracleCron();
    return NextResponse.json({ ok: true, ...result, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[oracle/cron] failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
