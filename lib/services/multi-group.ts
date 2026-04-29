// lib/services/multi-group.ts
// Fetches all groups a user belongs to, with their current rank and pot info.

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export interface UserGroupSummary {
  groupId: string;
  groupName: string;
  groupType: "tournament" | "single_match";
  memberCount: number;
  maxMembers: number;
  buyInAmount: number;
  adminFeePercent: number;
  userRank: number;
  userPoints: number;
  totalPot: number;
  paidPot: number;         // only paid members' buy-ins
  payoutFirst: number;
  payoutSecond: number;
  payoutThird: number;
  currentEarnings: number; // estimated payout if user keeps current rank
  inviteCode: string;
  isAdmin: boolean;
  nickname: string | null;
}

export async function getUserGroups(userId: string): Promise<UserGroupSummary[]> {
  const sb = getSupabaseClient();
  if (!sb) return getMockGroups();

  try {
    // Get all group memberships
    const { data: memberships } = await sb
      .from("group_members")
      .select("group_id, nickname")
      .eq("user_id", userId);

    if (!memberships || memberships.length === 0) return [];

    const groupIds = (memberships as Array<{ group_id: string; nickname: string | null }>)
      .map(m => m.group_id);

    // Get group details
    const { data: groups } = await sb
      .from("groups")
      .select("id, name, admin_id, buy_in_amount, payout_first, payout_second, payout_third, max_members, invite_code, admin_fee_percent, group_type")
      .in("id", groupIds);

    if (!groups) return [];

    const results: UserGroupSummary[] = [];

    for (const group of groups as Array<{
      id: string; name: string; admin_id: string;
      buy_in_amount: number; payout_first: number; payout_second: number; payout_third: number;
      max_members: number; invite_code: string; admin_fee_percent: number; group_type: string;
    }>) {
      const membership = (memberships as Array<{ group_id: string; nickname: string | null }>)
        .find(m => m.group_id === group.id);

      // Get leaderboard for this group
      const { data: leaderboard } = await sb
        .from("leaderboard")
        .select("user_id, total_points, rank, paid")
        .eq("group_id", group.id)
        .order("total_points", { ascending: false });

      const lb = leaderboard as Array<{ user_id: string; total_points: number; rank: number; paid: boolean }> ?? [];
      const userEntry = lb.find(r => r.user_id === userId);
      const paidCount = lb.filter(r => r.paid).length;
      const paidPot = paidCount * group.buy_in_amount;
      const totalPot = lb.length * group.buy_in_amount;
      const adminFee = (group.admin_fee_percent || 0) / 100;
      const netPot = paidPot * (1 - adminFee);

      const rank = userEntry ? lb.findIndex(r => r.user_id === userId) + 1 : 0;
      let currentEarnings = 0;
      if (rank === 1) currentEarnings = Math.round(netPot * group.payout_first / 100);
      else if (rank === 2) currentEarnings = Math.round(netPot * group.payout_second / 100);
      else if (rank === 3) currentEarnings = Math.round(netPot * group.payout_third / 100);

      results.push({
        groupId:         group.id,
        groupName:       group.name,
        groupType:       (group.group_type ?? "tournament") as "tournament" | "single_match",
        memberCount:     lb.length,
        maxMembers:      group.max_members,
        buyInAmount:     group.buy_in_amount,
        adminFeePercent: group.admin_fee_percent || 0,
        userRank:        rank,
        userPoints:      userEntry ? Number(userEntry.total_points) : 0,
        totalPot,
        paidPot,
        payoutFirst:     group.payout_first,
        payoutSecond:    group.payout_second,
        payoutThird:     group.payout_third,
        currentEarnings,
        inviteCode:      group.invite_code,
        isAdmin:         group.admin_id === userId,
        nickname:        membership?.nickname ?? null,
      });
    }

    return results.sort((a, b) => a.groupName.localeCompare(b.groupName));
  } catch (e) {
    console.warn("getUserGroups error:", e);
    return getMockGroups();
  }
}

function getMockGroups(): UserGroupSummary[] {
  return [
    {
      groupId: "grp_titans", groupName: "Tech Titans World Cup", groupType: "tournament",
      memberCount: 3, maxMembers: 10, buyInAmount: 50, adminFeePercent: 0,
      userRank: 1, userPoints: 145, totalPot: 150, paidPot: 100,
      payoutFirst: 60, payoutSecond: 30, payoutThird: 10,
      currentEarnings: 60, inviteCode: "grp_titans", isAdmin: true, nickname: null,
    },
  ];
}

export function calculateTotalEarnings(groups: UserGroupSummary[]): {
  totalCurrentEarnings: number;
  totalPot: number;
  groupCount: number;
} {
  return {
    totalCurrentEarnings: groups.reduce((sum, g) => sum + g.currentEarnings, 0),
    totalPot: groups.reduce((sum, g) => sum + g.paidPot, 0),
    groupCount: groups.length,
  };
}
