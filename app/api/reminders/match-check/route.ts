export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { REMINDER_TIERS, reminderWindow, findPendingReminders } from "@/lib/services/match-reminders";

export interface PendingMatchReminder {
  matchId: string;
  tier: "24h" | "1h";
  home: string;
  away: string;
  kickoffAt: string;
  missingGroupCount: number;
}

// Powers the in-app match-reminder bottom sheet
// (components/reminders/match-reminder-sheet.tsx), shown on next app open.
// Shares eligibility/scoping logic with the Telegram cron
// (lib/services/match-reminders.ts) so the two channels never disagree
// about who's eligible. This channel's own dedup is client-side
// (localStorage), consistent with every other sheet — no server "shown"
// state needed here, unlike Telegram which has no client feedback loop.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ reminders: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const admin = sbAdmin();
  const reminders: PendingMatchReminder[] = [];

  for (const tier of REMINDER_TIERS) {
    const { from, to } = reminderWindow(tier);
    const { data: matches } = await admin
      .from("matches")
      .select("id, home, away, stage, competition_id, kickoff_at")
      .eq("status", "upcoming")
      .gte("kickoff_at", from)
      .lte("kickoff_at", to);

    if (!matches?.length) continue;

    const pending = await findPendingReminders(admin, matches, { userId: user.id });
    const entry = pending.get(user.id);
    if (!entry) continue;

    for (const item of entry.items) {
      reminders.push({
        matchId:           item.match.id,
        tier,
        home:              item.match.home,
        away:              item.match.away,
        kickoffAt:         item.match.kickoff_at,
        missingGroupCount: item.missingGroupIds.length,
      });
    }
  }

  return NextResponse.json({ reminders }, { headers: { "Cache-Control": "no-store" } });
}
