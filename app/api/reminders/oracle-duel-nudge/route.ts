export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { isPushPrefEnabled, queuePushItem, flushPushQueue, pushTranslations, type PushQueue } from "@/lib/services/push";
import { interpolate } from "@/lib/i18n";
import { getFeaturedOracleDuelMatch } from "@/lib/services/oracle-duels";

const STALE_MS = 20 * 60 * 60 * 1000;

// Once-daily push nudge for users who haven't opened the app — the in-app
// OracleDuelNudgeSheet only ever fires for someone who *did* open the app,
// so the two channels are naturally mutually exclusive per day; this route
// covers the other half via profiles.last_seen_at (migration 058). Meant to
// be pinged externally like match-reminder-cron.yml, once/day — see
// last_oracle_nudge_sent_at (migration 067) for the same-day dedup that
// protects against a retried/duplicate run.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const featured = await getFeaturedOracleDuelMatch();
  if (!featured) {
    return NextResponse.json({ queued: 0, reason: "no_featured_match" });
  }

  const sb = sbAdmin();
  const staleIso = new Date(Date.now() - STALE_MS).toISOString();

  const { data: candidateRows } = await sb
    .from("profiles")
    .select("id, notification_preferences, telegram_language_code")
    .or(`last_seen_at.is.null,last_seen_at.lt.${staleIso}`)
    .or(`last_oracle_nudge_sent_at.is.null,last_oracle_nudge_sent_at.lt.${staleIso}`);

  const candidates = (candidateRows ?? []) as Array<{
    id: string; notification_preferences: unknown; telegram_language_code: string | null;
  }>;
  if (!candidates.length) return NextResponse.json({ queued: 0, reason: "no_candidates" });

  const eligible = candidates.filter(p => isPushPrefEnabled(
    p.notification_preferences as Parameters<typeof isPushPrefEnabled>[0], "oracle_duel"
  ));
  if (!eligible.length) return NextResponse.json({ queued: 0, reason: "no_opted_in_candidates" });

  const { data: alreadyPredicted } = await sb
    .from("oracle_duels")
    .select("user_id")
    .eq("match_id", featured.match.id)
    .in("user_id", eligible.map(p => p.id));
  const predictedIds = new Set((alreadyPredicted ?? []).map((r: { user_id: string }) => r.user_id));

  const toNudge = eligible.filter(p => !predictedIds.has(p.id));
  if (!toNudge.length) return NextResponse.json({ queued: 0, reason: "all_already_predicted" });

  const pushQueue: PushQueue = new Map();
  for (const profile of toNudge) {
    const pt = pushTranslations(profile.telegram_language_code);
    queuePushItem(pushQueue, profile.id, {
      title: pt.notif_push_oracle_duel_nudge_title,
      body: interpolate(pt.notif_push_oracle_duel_nudge_body, { home: featured.match.home, away: featured.match.away }),
      url: "/game/oracle-duel",
      tag: "cupclash-oracle-duel-nudge",
    });
  }

  const pushResult = await flushPushQueue(pushQueue, sb);

  await sb.from("profiles")
    .update({ last_oracle_nudge_sent_at: new Date().toISOString() })
    .in("id", toNudge.map(p => p.id));

  return NextResponse.json({ queued: toNudge.length, push: pushResult });
}
