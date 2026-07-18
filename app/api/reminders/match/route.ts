import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import {
  isTelegramPrefEnabled,
  queueTelegramLine,
  flushTelegramQueue,
  telegramTranslations,
  type TelegramQueue,
} from "@/lib/services/telegram";
import {
  isPushPrefEnabled,
  queuePushItem,
  flushPushQueue,
  pushTranslations,
  type PushQueue,
} from "@/lib/services/push";
import { interpolate } from "@/lib/i18n";
import { REMINDER_TIERS, reminderWindow, findPendingReminders, type ReminderTier } from "@/lib/services/match-reminders";

// Called every ~10-15 min by .github/workflows/match-reminder-cron.yml —
// same external-ping pattern as telegram-reminders-cron.yml (Vercel Hobby
// caps vercel.json at 2 crons/day). This is a distinct, new opt-in category
// ("match_reminder", default OFF on both channels) covering a 24h AND a 1h
// tier before kickoff — separate from the existing "locking_reminder"
// Telegram category (1h-only, default ON), so the two can briefly overlap
// near the 1h mark for a user with both enabled. Also backs the in-app
// reminder sheet, which reads the same eligibility via
// /api/reminders/match-check. Telegram and push are independent opt-ins —
// a user with only push enabled (or only Telegram) still gets reminded on
// whichever channel(s) they've turned on; TELEGRAM_BOT_TOKEN being unset
// only disables the Telegram half, not the whole route.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const telegramEnabled = !!process.env.TELEGRAM_BOT_TOKEN;

  const sb = sbAdmin();
  const queue: TelegramQueue = new Map();
  const pushQueue: PushQueue = new Map();
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
      const wantsTelegram = telegramEnabled && !!entry.profile.telegram_chat_id && isTelegramPrefEnabled(
        entry.profile.notification_preferences as Parameters<typeof isTelegramPrefEnabled>[0], "match_reminder"
      );
      const wantsPush = isPushPrefEnabled(
        entry.profile.notification_preferences as Parameters<typeof isPushPrefEnabled>[0], "match_reminder"
      );
      if (!wantsTelegram && !wantsPush) continue;

      for (const item of entry.items) {
        if (alreadySent.has(`${userId}:${item.match.id}`)) { skipped++; continue; }

        const vars = { home: item.match.home, away: item.match.away, count: String(item.missingGroupIds.length) };

        if (wantsTelegram) {
          const t = telegramTranslations(entry.profile.telegram_language_code);
          const url = "https://cupclash.live/predictions";
          const template = tier === "24h" ? t.notif_bot_match_reminder_24h : t.notif_bot_match_reminder_1h;
          const line =
            interpolate(template, vars) + "\n" +
            interpolate(t.notif_bot_match_reminder_cta, { url });
          queueTelegramLine(queue, entry.profile.telegram_chat_id!, line);
        }

        if (wantsPush) {
          const pt = pushTranslations(entry.profile.telegram_language_code);
          const title = tier === "24h" ? pt.notif_push_match_reminder_24h_title : pt.notif_push_match_reminder_1h_title;
          queuePushItem(pushQueue, userId, {
            title,
            body: interpolate(pt.notif_push_match_reminder_body, vars),
            url:  "/predictions",
            tag:  "cupclash-match-reminder",
          });
        }

        sentRows.push({ user_id: userId, match_id: item.match.id, tier });
        queued++;
      }
    }
  }

  const [{ sent, failed, blocked }, pushResult] = await Promise.all([
    flushTelegramQueue(queue, sb),
    flushPushQueue(pushQueue, sb),
  ]);

  // Marked sent optimistically alongside queueing (not gated on individual
  // per-message flush success) — a best-effort reminder, not a transactional
  // send; a rare transient failure just means one tier is silently skipped
  // for that match, not retried forever. One shared row per (user, match,
  // tier) regardless of channel — it means "we attempted this user for this
  // match/tier," not "every enabled channel definitely delivered."
  if (sentRows.length) {
    await sb.from("match_reminder_sent").upsert(sentRows, { onConflict: "user_id,match_id,tier", ignoreDuplicates: true });
  }

  return NextResponse.json({ queued, sent, failed, blocked, skipped, push: pushResult });
}
