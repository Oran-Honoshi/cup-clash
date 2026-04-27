import type { Group, Member } from "@/lib/types";
import { MOCK_GROUP, MOCK_MEMBERS } from "@/lib/mocks/data";

function getSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getGroup(groupId: string): Promise<Group> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("groups")
        .select("id, name, admin_id, buy_in_amount, payout_first, payout_second, payout_third")
        .eq("id", groupId)
        .single();
      if (error || !data) throw error;
      return {
        id: data.id,
        name: data.name,
        admin: data.admin_id,
        buyInAmount: Number(data.buy_in_amount),
        payouts: {
          first:  `${data.payout_first}%`,
          second: `${data.payout_second}%`,
          third:  `${data.payout_third}%`,
        },
      };
    } catch (e) {
      console.warn("getGroup fell back to mock:", (e as Error)?.message);
    }
  }
  return MOCK_GROUP;
}

export async function getMembers(groupId: string): Promise<Member[]> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("leaderboard")
        .select("user_id, name, country, paid, total_points")
        .eq("group_id", groupId)
        .order("total_points", { ascending: false });
      if (error || !data) throw error;
      return (data as Array<{
        user_id: string;
        name: string;
        country: string | null;
        paid: boolean;
        total_points: number;
      }>).map((row) => ({
        id: row.user_id,
        name: row.name,
        points: Number(row.total_points),
        paid: row.paid,
        country: row.country ?? "",
      }));
    } catch (e) {
      console.warn("getMembers fell back to mock:", (e as Error)?.message);
    }
  }
  return [...MOCK_MEMBERS].sort((a, b) => b.points - a.points);
}

export async function getLeaderboard(groupId: string, limit = 8): Promise<Member[]> {
  const members = await getMembers(groupId);
  return members.slice(0, limit);
}

export async function getGroupByInviteCode(code: string): Promise<Group | null> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data } = await sb
        .from("groups")
        .select("id, name, admin_id, buy_in_amount, payout_first, payout_second, payout_third")
        .eq("invite_code", code)
        .single();
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        admin: data.admin_id,
        buyInAmount: Number(data.buy_in_amount),
        payouts: {
          first:  `${data.payout_first}%`,
          second: `${data.payout_second}%`,
          third:  `${data.payout_third}%`,
        },
      };
    } catch (e) {
      console.warn("getGroupByInviteCode error:", (e as Error)?.message);
    }
  }
  return null;
}