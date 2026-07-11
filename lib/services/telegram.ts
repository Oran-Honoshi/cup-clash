import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { TRANSLATIONS, localeFromLanguageCode, type Translations } from "@/lib/i18n";

// Bot-sent messages route through the same i18n system as the rest of the
// app — see profiles.telegram_language_code (migration 048), captured from
// Telegram's own message.from.language_code at link time.
export function telegramTranslations(languageCode: string | null | undefined): Translations {
  return TRANSLATIONS[localeFromLanguageCode(languageCode)];
}

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Preferences ──────────────────────────────────────────────────────────────
// notification_preferences is nested by channel: {"push": {...}, "telegram": {...}}
// so push/Telegram can carry different category sets and different defaults
// without key collisions. Missing keys fall back to these per-key defaults —
// an empty '{}' column (every row, pre-this-feature) must not silently opt
// everyone into every category.

export type TelegramPrefKey = "goals" | "results" | "locking_reminder" | "weekly_digest" | "leaderboard";

export const TELEGRAM_PREF_DEFAULTS: Record<TelegramPrefKey, boolean> = {
  goals:             false,
  results:           false,
  locking_reminder:  true,
  weekly_digest:     false,
  leaderboard:       false,
};

type NotificationPreferences = {
  push?:     Record<string, boolean>;
  telegram?: Partial<Record<TelegramPrefKey, boolean>>;
};

export function isTelegramPrefEnabled(
  prefs: NotificationPreferences | null | undefined,
  key: TelegramPrefKey
): boolean {
  const stored = prefs?.telegram?.[key];
  return stored ?? TELEGRAM_PREF_DEFAULTS[key];
}

// ── Sending ──────────────────────────────────────────────────────────────────

type SendResult = { ok: boolean; blocked: boolean };

export async function sendTelegramMessage(chatId: string | number, text: string): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, blocked: false };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    if (res.ok) return { ok: true, blocked: false };
    // 403 here means the user blocked the bot (verified against the live API) —
    // distinct from a transient failure, so callers can stop retrying a dead chat.
    const blocked = res.status === 403;
    return { ok: false, blocked };
  } catch {
    return { ok: false, blocked: false };
  }
}

// ── Batching ─────────────────────────────────────────────────────────────────
// A single cron tick can generate multiple events for the same user (e.g. 3
// goals across 2 followed teams). Queue per-user lines and flush once at the
// end of the tick so each user gets at most one message per tick per queue,
// not one message per event.

export type TelegramQueue = Map<string, string[]>;

export function queueTelegramLine(queue: TelegramQueue, chatId: string, line: string): void {
  const lines = queue.get(chatId);
  if (lines) lines.push(line);
  else queue.set(chatId, [line]);
}

// `sb`, when passed, clears telegram_chat_id for any user who has blocked the
// bot — self-heals dead chats instead of retrying them forever.
export async function flushTelegramQueue(
  queue: TelegramQueue,
  sb?: SupabaseClient
): Promise<{ sent: number; failed: number; blocked: number }> {
  let sent = 0, failed = 0, blocked = 0;
  await Promise.all(
    [...queue.entries()].map(async ([chatId, lines]) => {
      const result = await sendTelegramMessage(chatId, lines.join("\n\n"));
      if (result.ok) { sent++; return; }
      failed++;
      if (result.blocked) {
        blocked++;
        if (sb) await sb.from("profiles").update({ telegram_chat_id: null }).eq("telegram_chat_id", chatId);
      }
    })
  );
  return { sent, failed, blocked };
}

// ── Follower lookup ──────────────────────────────────────────────────────────
// Resolves a team (by teams.id, per matches.home_team_id/away_team_id) to the
// chat_id + relevant pref of every user following that team who has Telegram
// linked. Filtering by the given pref key happens here so callers never have
// to remember to gate — passing a wrong/missing key just returns nobody.

export type FollowerRow = { chat_id: string; t: Translations };

export async function getTelegramFollowersForTeam(
  sb: SupabaseClient,
  teamId: string,
  prefKey: TelegramPrefKey
): Promise<FollowerRow[]> {
  const { data } = await sb
    .from("user_follows")
    .select("profiles!inner ( telegram_chat_id, notification_preferences, telegram_language_code )")
    .eq("followed_type", "team")
    .eq("followed_id", teamId)
    .not("profiles.telegram_chat_id", "is", null);

  type Row = {
    profiles: {
      telegram_chat_id: string | null;
      notification_preferences: NotificationPreferences | null;
      telegram_language_code: string | null;
    };
  };
  return ((data ?? []) as unknown as Row[])
    .filter(r => isTelegramPrefEnabled(r.profiles.notification_preferences, prefKey))
    .map(r => ({
      chat_id: r.profiles.telegram_chat_id as string,
      t:       telegramTranslations(r.profiles.telegram_language_code),
    }));
}

export { sbAdmin as telegramSbAdmin };
