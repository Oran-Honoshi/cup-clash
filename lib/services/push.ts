import type { SupabaseClient } from "@supabase/supabase-js";
import { TRANSLATIONS, localeFromLanguageCode, type Translations } from "@/lib/i18n";
import { sbAdmin } from "@/lib/supabase/admin";

// Push has no server-known locale column of its own — profiles.telegram_language_code
// (captured from Telegram's message.from.language_code at link time, migration 048) is
// the only per-user locale signal that exists server-side, so it's reused opportunistically
// here too. Users who never linked Telegram fall back to English, same as
// telegramTranslations(null) already does.
export function pushTranslations(languageCode: string | null | undefined): Translations {
  return TRANSLATIONS[localeFromLanguageCode(languageCode)];
}

// ── Preferences ──────────────────────────────────────────────────────────────
// notification_preferences.push is nested alongside .telegram (migration 047) —
// see lib/services/telegram.ts for the sibling channel. goals/results/leaderboard
// default true here (not false, unlike their Telegram counterparts) to match the
// defaults components/notifications/notifications-client.tsx's SETTINGS array has
// always shown in the per-type toggle UI — a server default that disagreed with
// what the UI displays as already-on would silently drop notifications users
// believe they're subscribed to. oracle_duel and match_reminder are genuinely new
// categories (migration 064) and default OFF per the established opt-in pattern.
export type PushPrefKey = "goals" | "results" | "leaderboard" | "chat" | "newmember" | "oracle_duel" | "match_reminder";

export const PUSH_PREF_DEFAULTS: Record<PushPrefKey, boolean> = {
  goals:           true,
  results:         true,
  leaderboard:     true,
  chat:            false,
  newmember:       false,
  oracle_duel:     false,
  match_reminder:  false,
};

type NotificationPreferences = {
  push?:     Partial<Record<PushPrefKey, boolean>>;
  telegram?: Record<string, boolean>;
};

export function isPushPrefEnabled(
  prefs: NotificationPreferences | null | undefined,
  key: PushPrefKey
): boolean {
  const stored = prefs?.push?.[key];
  return stored ?? PUSH_PREF_DEFAULTS[key];
}

// ── Sending ──────────────────────────────────────────────────────────────────

export type PushItem = { title: string; body: string; url?: string; tag?: string };

async function loadWebPush() {
  const pkg = "web-push";
  return await import(pkg as string).catch(() => null) as {
    setVapidDetails: (email: string, publicKey: string, privateKey: string) => void;
    sendNotification: (sub: object, payload: string) => Promise<unknown>;
  } | null;
}

// `sub` here is a raw push_subscriptions row: { endpoint, p256dh, auth_key, ... }.
// Deletes the subscription on 404/410 (gone/expired) — the same self-healing
// convention flushTelegramQueue uses for blocked chats.
async function sendToSubscription(
  webPush: NonNullable<Awaited<ReturnType<typeof loadWebPush>>>,
  sb: SupabaseClient,
  sub: { endpoint: string; p256dh: string; auth_key: string },
  item: PushItem
): Promise<boolean> {
  const payload = JSON.stringify({
    title: item.title,
    body:  item.body,
    url:   item.url ?? "/dashboard",
    tag:   item.tag ?? "cupclash",
    icon:  "/icons/icon-192.png",
  });
  try {
    await webPush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
      payload
    );
    return true;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    }
    return false;
  }
}

// ── Batching ─────────────────────────────────────────────────────────────────
// Mirrors lib/services/telegram.ts's queueTelegramLine/flushTelegramQueue shape,
// but push items stay separate notifications (not joined into one message) since
// stacking N notifications in the OS tray is normal push UX, unlike N Telegram
// chat messages. What IS batched per user is the fan-out across a user's
// subscriptions — one call queues an item once; flush sends it to every device
// (push_subscriptions row) that user currently has registered.

export type PushQueue = Map<string, PushItem[]>;

export function queuePushItem(queue: PushQueue, userId: string, item: PushItem): void {
  const items = queue.get(userId);
  if (items) items.push(item);
  else queue.set(userId, [item]);
}

export async function flushPushQueue(
  queue: PushQueue,
  sb?: SupabaseClient
): Promise<{ sent: number; failed: number; users: number }> {
  if (!queue.size) return { sent: 0, failed: 0, users: 0 };

  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPublic  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidEmail   = process.env.VAPID_EMAIL ?? "mailto:hello@cupclash.live";
  if (!vapidPrivate || !vapidPublic) return { sent: 0, failed: 0, users: 0 };

  const webPush = await loadWebPush();
  if (!webPush) return { sent: 0, failed: 0, users: 0 };
  webPush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const client = sb ?? sbAdmin();
  const userIds = [...queue.keys()];
  const { data: subs } = await client
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth_key")
    .in("user_id", userIds);
  if (!subs?.length) return { sent: 0, failed: 0, users: queue.size };

  const subsByUser = new Map<string, typeof subs>();
  for (const s of subs) {
    const arr = subsByUser.get(s.user_id);
    if (arr) arr.push(s); else subsByUser.set(s.user_id, [s]);
  }

  let sent = 0, failed = 0;
  const sends: Promise<void>[] = [];
  for (const [userId, items] of queue) {
    const userSubs = subsByUser.get(userId);
    if (!userSubs?.length) continue;
    for (const item of items) {
      for (const sub of userSubs) {
        sends.push(
          sendToSubscription(webPush, client, sub, item).then(ok => { ok ? sent++ : failed++; })
        );
      }
    }
  }
  await Promise.allSettled(sends);

  return { sent, failed, users: queue.size };
}

// ── Follower lookup ──────────────────────────────────────────────────────────
// Same shape as getTelegramFollowersForTeam — resolves a team to every user
// following it whose push prefs allow the given category. Whether that user
// actually has a live push_subscriptions row is resolved later, in
// flushPushQueue — this only needs to decide who's *eligible*.

export type PushFollowerRow = { userId: string; t: Translations };

export async function getPushSubscribersForTeam(
  sb: SupabaseClient,
  teamId: string,
  prefKey: PushPrefKey
): Promise<PushFollowerRow[]> {
  const { data } = await sb
    .from("user_follows")
    .select("profiles!inner ( id, notification_preferences, telegram_language_code )")
    .eq("followed_type", "team")
    .eq("followed_id", teamId);

  type Row = {
    profiles: {
      id: string;
      notification_preferences: NotificationPreferences | null;
      telegram_language_code: string | null;
    };
  };
  return ((data ?? []) as unknown as Row[])
    .filter(r => isPushPrefEnabled(r.profiles.notification_preferences, prefKey))
    .map(r => ({
      userId: r.profiles.id,
      t:      pushTranslations(r.profiles.telegram_language_code),
    }));
}

export { sbAdmin as pushSbAdmin };
