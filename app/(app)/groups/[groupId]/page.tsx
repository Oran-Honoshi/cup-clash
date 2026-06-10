export const dynamic = "force-dynamic";

import { redirect }    from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { GroupDetailClient } from "@/components/groups/group-detail-client";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getGroupDetail(groupId: string) {
  const { data } = await sbAdmin()
    .from("groups")
    .select("id, name, passkey, admin_id, buy_in_amount, payout_first, payout_second, payout_third, max_members, enrollment_fee_cents, is_corporate_paid, max_group_capacity, payment_model, corporate_prize, currency_symbol, payment_link, enable_group_stage_prize, group_stage_prize_amount, group_stage_prize_label")
    .eq("id", groupId)
    .single();
  return data as {
    id: string; name: string; passkey: string; admin_id: string;
    buy_in_amount: number; payout_first: number; payout_second: number;
    payout_third: number; max_members: number; enrollment_fee_cents: number;
    is_corporate_paid: boolean; max_group_capacity: number;
    payment_model: string; corporate_prize: string | null;
    currency_symbol: string | null; payment_link: string | null;
    enable_group_stage_prize: boolean | null;
    group_stage_prize_amount: number | null;
    group_stage_prize_label: string | null;
  } | null;
}

async function getScoringRules(groupId: string) {
  const { data } = await sbAdmin()
    .from("scoring_rules")
    .select("*")
    .eq("group_id", groupId)
    .maybeSingle();
  return data as Record<string, number | boolean> | null;
}

async function getMembers(groupId: string) {
  const { data } = await sbAdmin()
    .from("group_members")
    .select("user_id, payment_status, can_predict, paid, is_ad_free, role, profiles(name, country, avatar_url)")
    .eq("group_id", groupId);
  return (data ?? []) as unknown as Array<{
    user_id: string; payment_status: string; can_predict: boolean;
    paid: boolean; is_ad_free: boolean; role: string;
    profiles: { name: string; country: string | null; avatar_url: string | null } | null;
  }>;
}

export default async function GroupDetailPage({ params, searchParams }: { params: { groupId: string }; searchParams: { tab?: string } }) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup");

  const [group, rules, members] = await Promise.all([
    getGroupDetail(params.groupId),
    getScoringRules(params.groupId),
    getMembers(params.groupId),
  ]);

  if (!group) redirect("/groups");

  const myMembership = members.find(m => m.user_id === userProfile.id);
  const isAdmin  = group.admin_id === userProfile.id ||
    myMembership?.role === "admin" || myMembership?.role === "owner";
  const isMember = Boolean(myMembership);

  return (
    <GroupDetailClient
      group={group}
      rules={rules}
      members={members}
      currentUserId={userProfile.id}
      isAdmin={isAdmin}
      isMember={isMember}
      initialTab={searchParams.tab === "chat" ? "chat" : "overview"}
    />
  );
}