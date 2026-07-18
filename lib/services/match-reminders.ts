import type { SupabaseClient } from "@supabase/supabase-js";
import { matchInGroupScope } from "@/lib/schedule";

export const REMINDER_TIERS = ["24h", "1h"] as const;
export type ReminderTier = typeof REMINDER_TIERS[number];

// Windows are wider than the ~10-15min cron cadence so a missed/delayed tick
// still catches every match once; match_reminder_sent (migration 062) is
// what actually prevents a match firing more than once per tier, not window
// width — the same window logic backs the in-app popup check.
const TIER_WINDOW_MINUTES: Record<ReminderTier, { from: number; to: number }> = {
  "24h": { from: 23 * 60 + 45, to: 24 * 60 + 15 },
  "1h":  { from: 45,           to: 75 },
};

export function reminderWindow(tier: ReminderTier): { from: string; to: string } {
  const { from, to } = TIER_WINDOW_MINUTES[tier];
  const now = Date.now();
  return {
    from: new Date(now + from * 60_000).toISOString(),
    to:   new Date(now + to   * 60_000).toISOString(),
  };
}

export type ReminderMatch = {
  id: string;
  home: string;
  away: string;
  stage: string;
  competition_id: string | null;
  kickoff_at: string;
};

export type PendingReminderItem = { match: ReminderMatch; missingGroupIds: string[] };

export type PendingReminderProfile = {
  telegram_chat_id: string | null;
  notification_preferences: unknown;
  telegram_language_code: string | null;
};

export type PendingReminderEntry = { profile: PendingReminderProfile; items: PendingReminderItem[] };

type MemberRow = {
  user_id:  string;
  groups:   { id: string; group_type: string; competition_id: string | null };
  profiles: PendingReminderProfile;
};

// Core scoping + "hasn't predicted in ALL eligible groups" logic shared by
// the Telegram cron (app/api/reminders/match/route.ts) and the in-app
// popup check (app/api/reminders/match-check/route.ts) so the two channels
// can never disagree about who's eligible. A user in two groups covering
// the same match is only skipped once they've predicted in every one of
// them — predicting in just one group still surfaces a reminder for the
// others (this fixes a known simplification in the existing locking_reminder
// route, which treats "predicted in ANY group" as fully done).
export async function findPendingReminders(
  sb: SupabaseClient,
  matches: ReminderMatch[],
  opts?: { userId?: string }
): Promise<Map<string, PendingReminderEntry>> {
  const result = new Map<string, PendingReminderEntry>();
  if (!matches.length) return result;

  let membersQuery = sb
    .from("group_members")
    .select(`
      user_id,
      groups!inner ( id, group_type, competition_id ),
      profiles!inner ( telegram_chat_id, notification_preferences, telegram_language_code )
    `)
    .eq("can_predict", true)
    .eq("groups.group_type", "tournament");
  if (opts?.userId) membersQuery = membersQuery.eq("user_id", opts.userId);

  const { data: membersData } = await membersQuery;
  const members = (membersData ?? []) as unknown as MemberRow[];
  if (!members.length) return result;

  const matchIds = matches.map(m => m.id);
  const { data: predsData } = await sb
    .from("group_predictions")
    .select("user_id, group_id, match_id")
    .in("match_id", matchIds);
  const predicted = new Set(
    (predsData as Array<{ user_id: string; group_id: string; match_id: string }> ?? [])
      .map(p => `${p.user_id}:${p.group_id}:${p.match_id}`)
  );

  for (const match of matches) {
    const eligible = members.filter(m => matchInGroupScope(match.stage, match.competition_id, m.groups.competition_id));
    if (!eligible.length) continue;

    const byUser = new Map<string, MemberRow[]>();
    for (const m of eligible) {
      const arr = byUser.get(m.user_id);
      if (arr) arr.push(m); else byUser.set(m.user_id, [m]);
    }

    for (const [userId, rows] of byUser) {
      const missingGroupIds = rows
        .filter(r => !predicted.has(`${userId}:${r.groups.id}:${match.id}`))
        .map(r => r.groups.id);
      if (!missingGroupIds.length) continue; // predicted in every eligible group already

      const entry = result.get(userId) ?? { profile: rows[0].profiles, items: [] };
      entry.items.push({ match, missingGroupIds });
      result.set(userId, entry);
    }
  }

  return result;
}
