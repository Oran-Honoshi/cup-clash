import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";

// Weekly free-transfer rollover — the confirmed ruleset (1 free transfer
// banked per week, capped at 2) from the squad builder/transfer flow
// (app/(app)/fantasy/[leagueId]/squad/page.tsx, fantasy_squads.free_transfers_banked,
// migration 076). Called by .github/workflows/fantasy-transfer-rollover-cron.yml,
// same SCORES_APP_URL/CRON_SECRET pattern as every other cron in this repo.
const MAX_BANKED_TRANSFERS = 2;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = sbAdmin();

  const { data: squads, error } = await sb
    .from("fantasy_squads")
    .select("id, free_transfers_banked")
    .lt("free_transfers_banked", MAX_BANKED_TRANSFERS);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (squads ?? []) as Array<{ id: string; free_transfers_banked: number }>;

  const results = await Promise.all(rows.map(s =>
    sb.from("fantasy_squads")
      .update({ free_transfers_banked: Math.min(MAX_BANKED_TRANSFERS, s.free_transfers_banked + 1) })
      .eq("id", s.id)
  ));

  const failed = results.filter(r => r.error).length;

  return NextResponse.json({ rolled: rows.length - failed, failed });
}
