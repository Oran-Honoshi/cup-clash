import { createClient } from "@supabase/supabase-js";
import { getAllUserGroups } from "@/lib/services/user-group";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface UserGroupSummary {
  groupId:           string;
  groupName:         string;
  groupType:         string;
  memberCount:       number;
  rank:              number;
  userRank:          number;
  totalMembers:      number;
  points:            number;
  userPoints:        number;   // alias for points
  currentEarnings:   number;
  potTotal:          number;
  paidPot:           number;   // alias for potTotal
  buyInAmount:       number;   // enrollment fee in dollars
  adminFeePercent:   number;
  inviteCode:        string;
  isAdmin:           boolean;
  isPaid:            boolean;
  nickname:          string | null;
}

export async function getUserGroups(userId: string): Promise<UserGroupSummary[]> {
  const memberships = await getAllUserGroups(userId);
  if (!memberships.length) return [];

  const results: UserGroupSummary[] = [];

  for (const m of memberships) {
    if (!m.groups) continue;

    const g = m.groups;

    // Get member count
    const { count: memberCount } = await sb()
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", g.id)
      .eq("payment_status", "paid");

    // Get user's points in this group
    const { data: pts } = await sb()
      .from("group_predictions")
      .select("points_earned")
      .eq("group_id", g.id)
      .eq("user_id", userId);

    const userPoints = (pts ?? []).reduce(
      (s: number, p: { points_earned: number }) => s + (p.points_earned ?? 0), 0
    );

    // Get all members' points to calculate rank
    const { data: allPts } = await sb()
      .from("group_predictions")
      .select("user_id, points_earned")
      .eq("group_id", g.id);

    const totals: Record<string, number> = {};
    (allPts ?? []).forEach((p: { user_id: string; points_earned: number }) => {
      totals[p.user_id] = (totals[p.user_id] ?? 0) + (p.points_earned ?? 0);
    });
    const sorted = Object.values(totals).sort((a, b) => b - a);
    const rank   = sorted.findIndex(p => p <= userPoints) + 1;

    // Calculate earnings (60% first / 30% second / 10% third)
    const paid = memberCount ?? 0;
    const pot  = paid * (g.enrollment_fee_cents / 100);
    const payoutPcts = [0.6, 0.3, 0.1];
    const earnings   = rank <= 3 ? Math.round(pot * payoutPcts[rank - 1]) : 0;

    results.push({
      groupId:         g.id,
      groupName:       g.name,
      groupType:       "tournament",
      memberCount:     paid,
      rank:            rank || (paid + 1),
      userRank:        rank || (paid + 1),
      totalMembers:    paid,
      points:          userPoints,
      userPoints:      userPoints,
      currentEarnings: earnings,
      potTotal:        pot,
      paidPot:         pot,
      buyInAmount:     g.enrollment_fee_cents / 100,
      adminFeePercent: 0,
      inviteCode:      g.passkey,
      isAdmin:         g.admin_id === userId,
      isPaid:          m.payment_status === "paid",
      nickname:        null,
    });
  }

  return results;
}

export function calculateTotalEarnings(groups: UserGroupSummary[]): number {
  return groups.reduce((sum, g) => sum + g.currentEarnings, 0);
}