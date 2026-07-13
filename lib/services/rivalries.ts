import type { SupabaseClient } from "@supabase/supabase-js";
import { getMembers } from "@/lib/services/groups";

export interface RivalPairing {
  rivalId:      string;
  declaredByMe: boolean; // true if the current user is the one who chose this rivalry
}

// A user's rival in a group is either the person THEY declared, or — if
// they haven't declared anyone — the person who declared THEM. Preferring
// "my own pick" first means each side of a mutual (or one-sided) rivalry
// always sees the pairing framed as relevant to them, without needing an
// accept/reject flow.
export async function getMyRival(sb: SupabaseClient, groupId: string, userId: string): Promise<RivalPairing | null> {
  const { data: mine } = await sb
    .from("rivalries")
    .select("rival_id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();
  if (mine) return { rivalId: (mine as { rival_id: string }).rival_id, declaredByMe: true };

  const { data: theirs } = await sb
    .from("rivalries")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("rival_id", userId)
    .maybeSingle();
  if (theirs) return { rivalId: (theirs as { user_id: string }).user_id, declaredByMe: false };

  return null;
}

export interface RivalSideStats {
  userId:      string;
  name:        string;
  country:     string;
  avatarUrl:   string | null;
  points:      number;
  exactScores: number;
  todayPoints: number;
}

export interface RivalHeadToHead {
  declaredByMe: boolean;
  me:    RivalSideStats;
  rival: RivalSideStats;
}

// Sums points_earned from matches kicking off today (UTC calendar date) —
// the closest concrete meaning of "this matchday" this codebase has, since
// there's no stored matchday-number or historical points snapshot to key
// off instead (see lib/schedule.ts's groupMatchesByDate, the only existing
// date-bucketing primitive).
async function getTodayPoints(sb: SupabaseClient, groupId: string, userIds: string[]): Promise<Record<string, number>> {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const todayEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();

  const { data: todayMatches } = await sb
    .from("matches")
    .select("id")
    .gte("kickoff_at", todayStart)
    .lt("kickoff_at", todayEnd);

  const matchIds = ((todayMatches ?? []) as Array<{ id: string }>).map(m => m.id);
  const out: Record<string, number> = {};
  for (const uid of userIds) out[uid] = 0;
  if (matchIds.length === 0) return out;

  const { data: preds } = await sb
    .from("group_predictions")
    .select("user_id, points_earned")
    .eq("group_id", groupId)
    .eq("pred_type", "match")
    .in("match_id", matchIds)
    .in("user_id", userIds);

  for (const p of (preds ?? []) as Array<{ user_id: string; points_earned: number | null }>) {
    out[p.user_id] = (out[p.user_id] ?? 0) + (p.points_earned ?? 0);
  }
  return out;
}

export async function getHeadToHead(
  sb: SupabaseClient, groupId: string, myUserId: string, rival: RivalPairing
): Promise<RivalHeadToHead | null> {
  const members = await getMembers(groupId);
  const meRow    = members.find(m => m.id === myUserId);
  const rivalRow = members.find(m => m.id === rival.rivalId);
  if (!meRow || !rivalRow) return null;

  const todayPoints = await getTodayPoints(sb, groupId, [myUserId, rival.rivalId]);

  const toSide = (row: typeof meRow): RivalSideStats => ({
    userId:      row.id,
    name:        row.name,
    country:     row.country,
    avatarUrl:   row.avatarUrl ?? null,
    points:      row.points,
    exactScores: row.exactScores ?? 0,
    todayPoints: todayPoints[row.id] ?? 0,
  });

  return { declaredByMe: rival.declaredByMe, me: toSide(meRow), rival: toSide(rivalRow) };
}
