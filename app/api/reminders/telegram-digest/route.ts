import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  isTelegramPrefEnabled,
  queueTelegramLine,
  flushTelegramQueue,
  telegramTranslations,
  type TelegramQueue,
} from "@/lib/services/telegram";
import { interpolate, type Translations } from "@/lib/i18n";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function formatKickoff(iso: string): string {
  // Locale-agnostic (no Intl formatting per-language needed for a timestamp) —
  // "2026-07-14 18:00 UTC".
  return `${iso.replace("T", " ").slice(0, 16)} UTC`;
}

// Weekly digest — scheduled via vercel.json (0 8 * * 1, Monday 08:00 UTC).
// Summarizes each followed team's WC2026 fixtures over the next 7 days,
// which is the only fixture data this app ingests (no club fixtures beyond
// standings — see migration 037's notes on matches.home/away staying
// authoritative display text for the tournament).
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 503 });
  }

  const sb = sbAdmin();
  const now     = new Date();
  const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Upcoming fixtures in the next 7 days
  const { data: matches } = await sb
    .from("matches")
    .select("id, home, away, home_team_id, away_team_id, kickoff_at")
    .eq("status", "upcoming")
    .gte("kickoff_at", now.toISOString())
    .lte("kickoff_at", weekOut.toISOString())
    .order("kickoff_at", { ascending: true });

  type MatchRow = { id: string; home: string; away: string; home_team_id: string | null; away_team_id: string | null; kickoff_at: string };
  const matchesByTeam = new Map<string, MatchRow[]>();
  for (const m of (matches ?? []) as MatchRow[]) {
    for (const teamId of [m.home_team_id, m.away_team_id]) {
      if (!teamId) continue;
      const list = matchesByTeam.get(teamId);
      if (list) list.push(m); else matchesByTeam.set(teamId, [m]);
    }
  }

  // 2. Users with Telegram linked, digest opted in, and at least one followed team
  const { data: follows } = await sb
    .from("user_follows")
    .select("user_id, followed_id, profiles!inner ( telegram_chat_id, notification_preferences, telegram_language_code )")
    .eq("followed_type", "team")
    .not("profiles.telegram_chat_id", "is", null);

  type FollowRow = {
    user_id:     string;
    followed_id: string;
    profiles: { telegram_chat_id: string; notification_preferences: unknown; telegram_language_code: string | null };
  };

  const userTeams = new Map<string, { chatId: string; t: Translations; teamIds: Set<string> }>();
  for (const row of ((follows ?? []) as unknown as FollowRow[])) {
    if (!isTelegramPrefEnabled(row.profiles.notification_preferences as Parameters<typeof isTelegramPrefEnabled>[0], "weekly_digest")) continue;
    let entry = userTeams.get(row.user_id);
    if (!entry) {
      entry = { chatId: row.profiles.telegram_chat_id, t: telegramTranslations(row.profiles.telegram_language_code), teamIds: new Set() };
      userTeams.set(row.user_id, entry);
    }
    entry.teamIds.add(row.followed_id);
  }

  const queue: TelegramQueue = new Map();
  let digestsQueued = 0;

  for (const { chatId, t, teamIds } of userTeams.values()) {
    const seenMatchIds = new Set<string>();
    const userMatches: MatchRow[] = [];
    for (const teamId of teamIds) {
      for (const m of matchesByTeam.get(teamId) ?? []) {
        if (seenMatchIds.has(m.id)) continue;
        seenMatchIds.add(m.id);
        userMatches.push(m);
      }
    }
    userMatches.sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at));

    const lines = [t.notif_bot_digest_header];
    if (userMatches.length) {
      for (const m of userMatches) {
        lines.push(interpolate(t.notif_bot_digest_line, { home: m.home, away: m.away, when: formatKickoff(m.kickoff_at) }));
      }
    } else {
      lines.push(t.notif_bot_digest_none);
    }

    queueTelegramLine(queue, chatId, lines.join("\n"));
    digestsQueued++;
  }

  const { sent, failed, blocked } = await flushTelegramQueue(queue, sb);
  return NextResponse.json({ digestsQueued, sent, failed, blocked });
}
