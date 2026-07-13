import type { SupabaseClient } from "@supabase/supabase-js";
import { getMembers } from "@/lib/services/groups";

// Called once/day from the scores cron (app/api/scores/route.ts) — records
// every member's current live total (get_group_member_points, the same
// source the Leaderboard reads) as today's data point. Upsert means a
// re-run on the same day just overwrites today's row rather than
// duplicating it.
export async function snapshotGroupPoints(sb: SupabaseClient, groupId: string, dateStr: string): Promise<void> {
  const members = await getMembers(groupId);
  if (!members.length) return;
  const rows = members.map(m => ({
    group_id:      groupId,
    user_id:       m.id,
    points:        m.points,
    snapshot_date: dateStr,
  }));
  await sb.from("points_snapshots").upsert(rows, { onConflict: "group_id,user_id,snapshot_date" });
}

export interface PointsHistoryMember {
  userId:    string;
  name:      string;
  avatarUrl: string | null;
}

// Stable join-order, NOT the points-ranked order getMembers() returns — chart
// line colors are assigned by array index client-side, and "color follows
// the entity, never its rank" means that index must never shuffle just
// because someone's score changed.
function byJoinOrder(a: { joinedAt?: string }, b: { joinedAt?: string }): number {
  return (a.joinedAt ?? "").localeCompare(b.joinedAt ?? "");
}

export interface PointsHistoryRow {
  date:   string; // YYYY-MM-DD
  values: Record<string, number>; // userId -> cumulative points as of this date
}

export interface PointsHistory {
  members:     PointsHistoryMember[];
  rows:        PointsHistoryRow[];
  // false when there's only a single ("today") data point — no cron tick
  // has recorded a prior day yet, so there's nothing to draw a line
  // between. The chart falls back to a "starts filling in from today"
  // message in that case rather than a 1-point line.
  hasHistory:  boolean;
}

// Builds a complete (no-gaps) per-date series for every current member,
// forward-filling from each member's most recent known snapshot (0 before
// their first) — a member who joined after the group's earliest snapshot
// date otherwise leaves a hole in that date's row.
export async function getPointsHistory(sb: SupabaseClient, groupId: string): Promise<PointsHistory> {
  const members = await getMembers(groupId);

  const { data: snapshots } = await sb
    .from("points_snapshots")
    .select("user_id, points, snapshot_date")
    .eq("group_id", groupId)
    .order("snapshot_date", { ascending: true });

  const byDate = new Map<string, Record<string, number>>();
  for (const s of (snapshots ?? []) as Array<{ user_id: string; points: number; snapshot_date: string }>) {
    const bucket = byDate.get(s.snapshot_date) ?? {};
    bucket[s.user_id] = s.points;
    byDate.set(s.snapshot_date, bucket);
  }

  const today = new Date().toISOString().split("T")[0];
  // Always overlay LIVE current totals for "today" — the stored snapshot
  // (if the cron already ran today) is at most a few minutes stale; live
  // data is strictly more current and costs nothing extra since
  // getMembers() was already called above.
  const todayBucket: Record<string, number> = {};
  for (const m of members) todayBucket[m.id] = m.points;
  byDate.set(today, todayBucket);

  const dates = [...byDate.keys()].sort();

  const lastKnown: Record<string, number> = {};
  for (const m of members) lastKnown[m.id] = 0;

  const rows: PointsHistoryRow[] = dates.map(date => {
    const bucket = byDate.get(date)!;
    const values: Record<string, number> = {};
    for (const m of members) {
      if (bucket[m.id] !== undefined) lastKnown[m.id] = bucket[m.id];
      values[m.id] = lastKnown[m.id];
    }
    return { date, values };
  });

  const orderedMembers = [...members].sort(byJoinOrder);

  return {
    members: orderedMembers.map(m => ({ userId: m.id, name: m.name, avatarUrl: m.avatarUrl ?? null })),
    rows,
    hasHistory: dates.length > 1,
  };
}
