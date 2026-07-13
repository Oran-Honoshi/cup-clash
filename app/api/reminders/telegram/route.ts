import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import {
  isTelegramPrefEnabled,
  queueTelegramLine,
  flushTelegramQueue,
  telegramTranslations,
  type TelegramQueue,
} from "@/lib/services/telegram";
import { interpolate } from "@/lib/i18n";

// Called every ~10-15 min by .github/workflows/telegram-reminders-cron.yml —
// Vercel Hobby caps vercel.json crons at 2/day, so like scores-cron.yml this
// route is pinged externally rather than scheduled in vercel.json. A daily
// vercel cron previously "covered" this route but only actually caught a
// match if it happened to kick off inside that one daily run's 1-hour lookahead.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 503 });
  }

  const sb = sbAdmin();

  // 1. Find matches kicking off in the next hour that are still upcoming
  const { data: matches } = await sb
    .from("matches")
    .select("id, home, away")
    .eq("status", "upcoming")
    .gt("kickoff_at",  new Date().toISOString())
    .lte("kickoff_at", new Date(Date.now() + 60 * 60 * 1000).toISOString());

  if (!matches?.length) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: "no upcoming matches in window" });
  }

  const queue: TelegramQueue = new Map();
  let queued  = 0;
  let skipped = 0;

  for (const match of matches as Array<{ id: string; home: string; away: string }>) {
    // 2. Find group_members who can predict and are in a group covering this tournament match
    //    (tournament groups — not single_match groups for different matches)
    const { data: members } = await sb
      .from("group_members")
      .select(`
        user_id,
        groups!inner ( id, group_type ),
        profiles!inner ( telegram_chat_id, notification_preferences, telegram_language_code )
      `)
      .eq("can_predict", true)
      .eq("groups.group_type", "tournament");

    if (!members?.length) continue;

    type MemberRow = {
      user_id:  string;
      groups:   { id: string; group_type: string };
      profiles: { telegram_chat_id: string | null; notification_preferences: unknown; telegram_language_code: string | null };
    };

    const eligible = (members as unknown as MemberRow[]).filter(
      m => m.profiles?.telegram_chat_id && isTelegramPrefEnabled(
        m.profiles.notification_preferences as Parameters<typeof isTelegramPrefEnabled>[0],
        "locking_reminder"
      )
    );

    if (!eligible.length) continue;

    // 3. Find who has already predicted this match
    const userIds = eligible.map(m => m.user_id);
    const { data: existingPreds } = await sb
      .from("group_predictions")
      .select("user_id")
      .eq("match_id", match.id)
      .in("user_id",  userIds);

    const predictedSet = new Set(
      (existingPreds as Array<{ user_id: string }> ?? []).map(p => p.user_id)
    );

    // 4. Queue reminders for those who haven't predicted (batched per user —
    //    a user in multiple groups covering the same match still gets one line)
    for (const member of eligible) {
      if (predictedSet.has(member.user_id)) { skipped++; continue; }

      const groupId = member.groups.id;
      const t = telegramTranslations(member.profiles.telegram_language_code);
      const url = `https://cupclash.live/dashboard?group=${groupId}`;
      const line =
        interpolate(t.notif_bot_locking, { home: match.home, away: match.away }) + "\n" +
        interpolate(t.notif_bot_locking_cta, { url });

      queueTelegramLine(queue, member.profiles.telegram_chat_id!, line);
      queued++;
    }
  }

  const { sent, failed, blocked } = await flushTelegramQueue(queue, sb);
  return NextResponse.json({ queued, sent, failed, blocked, skipped });
}
