import { createClient } from "@supabase/supabase-js";
import type { Group, Member } from "@/lib/types";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Group ────────────────────────────────────────────────────────────────────

export async function getGroup(groupId: string): Promise<Group> {
  const { data, error } = await sb()
    .from("groups")
    .select(`
      id, name, admin_id,
      buy_in_amount, payout_first, payout_second, payout_third,
      enrollment_fee_cents, passkey, max_members,
      enrollment_deadline, enrollment_deadline_type
    `)
    .eq("id", groupId)
    .single();

  if (error || !data) throw error ?? new Error("Group not found");

  const d = data as {
    id: string; name: string; admin_id: string;
    buy_in_amount: number;
    payout_first: number; payout_second: number; payout_third: number;
    enrollment_fee_cents: number;
    passkey: string | null; max_members: number;
    enrollment_deadline: string | null;
    enrollment_deadline_type: string | null;
  };

  return {
    id:          d.id,
    name:        d.name,
    admin:       d.admin_id,
    buyInAmount: Number(d.buy_in_amount ?? 0),
    passkey:     d.passkey ?? "",
    maxMembers:  d.max_members ?? 100,
    enrollmentFeeCents: d.enrollment_fee_cents ?? 200,
    enrollmentDeadline: d.enrollment_deadline ?? null,
    payouts: {
      first:  `${d.payout_first  ?? 60}%`,
      second: `${d.payout_second ?? 30}%`,
      third:  `${d.payout_third  ?? 10}%`,
    },
  };
}

// ── Members / Leaderboard ────────────────────────────────────────────────────

export async function getMembers(groupId: string): Promise<Member[]> {
  // Join group_members → profiles → payments for payment status
  const { data, error } = await sb()
    .from("group_members")
    .select(`
      user_id, payment_status, can_predict, joined_at,
      profiles ( id, name, country, avatar_url ),
      payments ( status, stake_paid )
    `)
    .eq("group_id", groupId);

  if (error) throw error;
  if (!data?.length) return [];

  // Get points from group_predictions scoring
  const { data: points } = await sb()
    .from("group_predictions")
    .select("user_id, points_earned")
    .eq("group_id", groupId);

  const pointsMap: Record<string, number> = {};
  (points ?? []).forEach((p: { user_id: string; points_earned: number }) => {
    pointsMap[p.user_id] = (pointsMap[p.user_id] ?? 0) + p.points_earned;
  });

  return (data as unknown as Array<{
    user_id: string;
    payment_status: string;
    can_predict: boolean;
    joined_at: string;
    profiles: { id: string; name: string; country: string | null; avatar_url: string | null } | null;
    payments: Array<{ status: string; stake_paid: boolean }> | null;
  }>)
    .filter(row => row.profiles !== null)
    .map(row => ({
      id:           row.user_id,
      name:         row.profiles!.name,
      country:      row.profiles!.country ?? "",
      avatarUrl:    row.profiles!.avatar_url ?? null,
      points:       pointsMap[row.user_id] ?? 0,
      paid:         row.payment_status === "paid",
      canPredict:   row.can_predict,
      stakePaid:    row.payments?.[0]?.stake_paid ?? false,
      joinedAt:     row.joined_at,
    }))
    .sort((a, b) => b.points - a.points);
}

export async function getLeaderboard(groupId: string, limit = 8): Promise<Member[]> {
  const members = await getMembers(groupId);
  return members.slice(0, limit);
}

// ── Group lookup by passkey ──────────────────────────────────────────────────

export async function getGroupByPasskey(passkey: string): Promise<Group | null> {
  const { data } = await sb()
    .from("groups")
    .select(`
      id, name, admin_id,
      buy_in_amount, payout_first, payout_second, payout_third,
      enrollment_fee_cents, passkey, max_members, enrollment_deadline
    `)
    .eq("passkey", passkey.toUpperCase())
    .single();

  if (!data) return null;

  const d = data as {
    id: string; name: string; admin_id: string;
    buy_in_amount: number;
    payout_first: number; payout_second: number; payout_third: number;
    enrollment_fee_cents: number; passkey: string;
    max_members: number; enrollment_deadline: string | null;
  };

  return {
    id:          d.id,
    name:        d.name,
    admin:       d.admin_id,
    buyInAmount: Number(d.buy_in_amount ?? 0),
    passkey:     d.passkey,
    maxMembers:  d.max_members ?? 100,
    enrollmentFeeCents: d.enrollment_fee_cents ?? 200,
    enrollmentDeadline: d.enrollment_deadline ?? null,
    payouts: {
      first:  `${d.payout_first  ?? 60}%`,
      second: `${d.payout_second ?? 30}%`,
      third:  `${d.payout_third  ?? 10}%`,
    },
  };
}

// Legacy — kept for any code still using invite_code
export async function getGroupByInviteCode(code: string): Promise<Group | null> {
  return getGroupByPasskey(code);
}

// ── Payment status check ─────────────────────────────────────────────────────

export async function getMemberPaymentStatus(
  userId: string,
  groupId: string
): Promise<"unpaid" | "paid" | "refunded"> {
  const { data } = await sb()
    .from("payments")
    .select("status")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .single();

  return (data as { status: string } | null)?.status as "unpaid" | "paid" | "refunded" ?? "unpaid";
}

// ── Admin: all payment details ───────────────────────────────────────────────

export async function getGroupPayments(groupId: string) {
  const { data, error } = await sb()
    .from("payments")
    .select(`
      id, email, status, stake_paid,
      payment_timestamp, refund_expiry, amount_cents,
      profiles ( name, country, avatar_url )
    `)
    .eq("group_id", groupId)
    .order("payment_timestamp", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Create group ─────────────────────────────────────────────────────────────

export async function createGroup(params: {
  name:        string;
  adminId:     string;
  buyInAmount: number;
  payoutFirst: number;
  payoutSecond:number;
  payoutThird: number;
}): Promise<string> {
  const { data, error } = await sb()
    .from("groups")
    .insert({
      name:           params.name,
      admin_id:       params.adminId,
      buy_in_amount:  params.buyInAmount,
      payout_first:   params.payoutFirst,
      payout_second:  params.payoutSecond,
      payout_third:   params.payoutThird,
      enrollment_fee_cents: 200,
      max_members:    100,
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create group");
  return (data as { id: string }).id;
}

// ── Join group ───────────────────────────────────────────────────────────────

export async function joinGroup(userId: string, groupId: string): Promise<void> {
  const { error } = await sb()
    .from("group_members")
    .upsert({
      user_id:        userId,
      group_id:       groupId,
      payment_status: "unpaid",
      can_predict:    false,
    }, { onConflict: "user_id,group_id" });

  if (error) throw error;
}