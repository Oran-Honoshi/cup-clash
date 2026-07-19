export const dynamic = "force-dynamic";

import { redirect }    from "next/navigation";
import { sbAdmin } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { getGroup as getAdminGroupData, getMembers as getLeaderboardMembers } from "@/lib/services/groups";
import { getAllMatches } from "@/lib/services/matches";
import { GroupDetailClient } from "@/components/groups/group-detail-client";
import { matchInGroupScope } from "@/lib/schedule";
import type { Group as AdminGroup, Member as LeaderboardMember } from "@/lib/types";

async function getGroupDetail(groupId: string) {
  const { data } = await sbAdmin()
    .from("groups")
    .select("id, name, passkey, admin_id, buy_in_amount, payout_first, payout_second, payout_third, max_members, enrollment_fee_cents, is_corporate_paid, max_group_capacity, payment_model, corporate_prize, currency_symbol, payment_link, enable_group_stage_prize, group_stage_prize_amount, group_stage_prize_label, show_prize_split, show_entry_fee, show_prize_pot, show_buy_in_tracker, show_payment_link, group_mode, winner_message, competition_id, competitions(name)")
    .eq("id", groupId)
    .single();
  return data as unknown as {
    id: string; name: string; passkey: string; admin_id: string;
    buy_in_amount: number; payout_first: number; payout_second: number;
    payout_third: number; max_members: number; enrollment_fee_cents: number;
    is_corporate_paid: boolean; max_group_capacity: number;
    payment_model: string; corporate_prize: string | null;
    currency_symbol: string | null; payment_link: string | null;
    enable_group_stage_prize: boolean | null;
    group_stage_prize_amount: number | null;
    group_stage_prize_label: string | null;
    show_prize_split: boolean | null;
    show_entry_fee: boolean | null;
    show_prize_pot: boolean | null;
    show_buy_in_tracker: boolean | null;
    show_payment_link: boolean | null;
    group_mode: string | null;
    winner_message: string | null;
    competition_id: string | null;
    competitions: { name: string } | null;
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

export type SubSector = "predictions" | "leaderboard" | "group-predictions" | "bracket" | "chat" | "admin" | "info";
const VALID_TABS: SubSector[] = ["predictions", "leaderboard", "group-predictions", "bracket", "chat", "admin", "info"];

function resolveInitialTab(requested: string | undefined, isAdmin: boolean): SubSector {
  if (requested === "results") return "group-predictions"; // legacy — results matrix now lives in Group Predictions
  if (requested === "overview") return "info";
  if (requested === "rules") return "info"; // legacy — Rules is now a collapsible section inside Info
  if (requested && (VALID_TABS as string[]).includes(requested) && (requested !== "admin" || isAdmin)) {
    return requested as SubSector;
  }
  return "predictions";
}

export default async function GroupDetailPage({ params, searchParams }: { params: { groupId: string }; searchParams: { tab?: string } }) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup");

  const [group, rules, members, leaderboardMembers, allMatches, membershipsRes, adStatusRes] = await Promise.all([
    getGroupDetail(params.groupId),
    getScoringRules(params.groupId),
    getMembers(params.groupId),
    getLeaderboardMembers(params.groupId),
    getAllMatches(),
    sbAdmin()
      .from("group_members")
      .select("group_id, groups(id, name, passkey)")
      .eq("user_id", userProfile.id)
      .order("joined_at", { ascending: false }),
    sbAdmin()
      .from("group_members")
      .select("is_ad_free, groups(is_corporate_paid)")
      .eq("user_id", userProfile.id)
      .eq("group_id", params.groupId)
      .maybeSingle(),
  ]);

  if (!group) redirect("/groups");

  const myMembership = members.find(m => m.user_id === userProfile.id);
  const isAdmin  = group.admin_id === userProfile.id ||
    myMembership?.role === "admin" || myMembership?.role === "owner";
  const isMember = Boolean(myMembership);

  const allGroups = (membershipsRes.data ?? [])
    .map((m: unknown) => (m as { groups: { id: string; name: string; passkey: string } | null }).groups)
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  type AdStatus = { is_ad_free: boolean; groups: { is_corporate_paid: boolean } | null } | null;
  const adStatus = adStatusRes.data as AdStatus;
  const isAdFree    = adStatus?.is_ad_free ?? false;
  const isCorporate = adStatus?.groups?.is_corporate_paid ?? false;

  // Scope matches to this group's own competition — allMatches comes from
  // getAllMatches() (every competition), so every consumer downstream
  // (Predictions tabs, Group Predictions matrix, etc.) would otherwise see
  // every other competition's fixtures too. null competition_id = World Cup
  // 2026 (legacy groups), matching matchInGroupScope's fallback.
  const groupMatches = allMatches.filter(m => matchInGroupScope(m.stage, m.competitionId, group.competition_id));

  let adminData: { group: AdminGroup; members: LeaderboardMember[]; isOwner: boolean; finalLocked: boolean } | null = null;
  if (isAdmin) {
    // The "final" match id is a World Cup-only concept (single bracket
    // final) — non-WC groups have no such match, so finalLocked is always
    // false for them (nothing to lock).
    const [adminGroup, finalMatch] = await Promise.all([
      getAdminGroupData(params.groupId),
      group.competition_id
        ? Promise.resolve({ data: null })
        : sbAdmin().from("matches").select("status").eq("id", "final").maybeSingle(),
    ]);
    adminData = {
      group: adminGroup,
      members: leaderboardMembers,
      isOwner: group.admin_id === userProfile.id,
      finalLocked: (finalMatch.data as { status: string } | null)?.status === "finished",
    };
  }

  const initialTab = resolveInitialTab(searchParams.tab, isAdmin);

  return (
    <GroupDetailClient
      group={group}
      rules={rules}
      members={members}
      leaderboardMembers={leaderboardMembers}
      allMatches={groupMatches}
      allGroups={allGroups}
      currentUserId={userProfile.id}
      currentUserName={userProfile.name}
      isAdmin={isAdmin}
      isMember={isMember}
      isAdFree={isAdFree}
      isCorporate={isCorporate}
      adminData={adminData}
      initialTab={initialTab}
    />
  );
}
