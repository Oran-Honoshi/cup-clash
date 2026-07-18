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
import { REMINDER_TIERS, reminderWindow, findPendingReminders, type ReminderTier } from "@/lib/services/match-reminders";

// Called every ~10-15 min by .github/workflows/match-reminder-cron.yml —
// same external-ping pattern as telegram-reminders-cron.yml (Vercel Hobby
// caps vercel.json at 2 crons/day). This is a distinct, new opt-in Telegram
// category ("match_reminder", default OFF) covering a 24h AND a 1h tier
// before kickoff — separate from the existing "locking_reminder" category
// (1h-only, default ON), so the two can briefly overlap near the 1h mark for
// a user with both enabled. Also backs the in-app reminder sheet, which
// reads the same eligibility via /api/reminders/match-check.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 503 });
  }

  const sb = sbAdmin();
  const queue: TelegramQueue = new Map();
  const sentRows: { user_id: string; match_id: string; tier: ReminderTier }[] = [];
  let queued = 0;
  let skipped = 0;

  for (const tier of REMINDER_TIERS) {
    const { from, to } = reminderWindow(tier);
    const { data: matches } = await sb
      .from("matches")
      .select("id, home, away, stage, competition_id, kickoff_at")
      .eq("status", "upcoming")
      .gte("kickoff_at", from)
      .lte("kickoff_at", to);

    if (!matches?.length) continue;

    const pending = await findPendingReminders(sb, matches);
    if (!pending.size) continue;

    const matchIds = matches.map(m => m.id);
    const userIds  = [...pending.keys()];
    const { data: already } = await sb
      .from("match_reminder_sent")
      .select("user_id, match_id")
      .eq("tier", tier)
      .in("match_id", matchIds)
      .in("user_id", userIds);
    const alreadySent = new Set(
      (already as Array<{ user_id: string; match_id: string }> ?? []).map(r => `${r.user_id}:${r.match_id}`)
    );

    for (const [userId, entry] of pending) {
      if (!entry.profile.telegram_chat_id) continue;
      if (!isTelegramPrefEnabled(
        entry.profile.notification_preferences as Parameters<typeof isTelegramPrefEnabled>[0],
        "match_reminder"
      )) continue;

      for (const item of entry.items) {
        if (alreadySent.has(`${userId}:${item.match.id}`)) { skipped++; continue; }

        const t = telegramTranslations(entry.profile.telegram_language_code);
        const url = "https://cupclash.live/predictions";
        const template = tier === "24h" ? t.notif_bot_match_reminder_24h : t.notif_bot_match_reminder_1h;
        const line =
          interpolate(template, { home: item.match.home, away: item.match.away, count: String(item.missingGroupIds.length) }) + "\n" +
          interpolate(t.notif_bot_match_reminder_cta, { url });

        queueTelegramLine(queue, entry.profile.telegram_chat_id, line);
        sentRows.push({ user_id: userId, match_id: item.match.id, tier });
        queued++;
      }
    }
  }

  const { sent, failed, blocked } = await flushTelegramQueue(queue, sb);

  // Marked sent optimistically alongside queueing (not gated on individual
  // per-message flush success) — a best-effort reminder, not a transactional
  // send; a rare transient failure just means one tier is silently skipped
  // for that match, not retried forever.
  if (sentRows.length) {
    await sb.from("match_reminder_sent").upsert(sentRows, { onConflict: "user_id,match_id,tier", ignoreDuplicates: true });
  }

  return NextResponse.json({ queued, sent, failed, blocked, skipped });
}
