import { createClient } from "@supabase/supabase-js";
import type { Group, Member } from "@/lib/types";

// Standard anon client for authenticated requests
function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Service role client — bypasses RLS for server-side lookups
function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function mapGroup(d: {
  id: string; name: string; admin_id: string;
  buy_in_amount: number;
  payout_first: number; payout_second: number; payout_third: number;
  enrollment_fee_cents: number; passkey: string;
  max_members: number; enrollment_deadline: string | null;
  corporate_prize: string | null;
  is_corporate_paid: boolean | null;
  currency?: string | null;
  currency_symbol?: string | null;
  payment_link?: string | null;
  enable_group_stage_prize?: boolean | null;
  group_stage_prize_amount?: number | null;
  group_stage_prize_label?: string | null;
  show_prize_split?: boolean | null;
  show_entry_fee?: boolean | null;
  show_prize_pot?: boolean | null;
  show_buy_in_tracker?: boolean | null;
  show_payment_link?: boolean | null;
  group_mode?: string | null;
  winner_message?: string | null;
}): Group {
  return {
    id:                      d.id,
    name:                    d.name,
    admin:                   d.admin_id,
    buyInAmount:             Number(d.buy_in_amount ?? 0),
    passkey:                 d.passkey ?? "",
    maxMembers:              d.max_members ?? 100,
    enrollmentFeeCents:      d.enrollment_fee_cents ?? 200,
    enrollmentDeadline:      d.enrollment_deadline ?? null,
    corporatePrize:          d.corporate_prize ?? null,
    isCorporatePaid:         d.is_corporate_paid ?? false,
    currency:                d.currency ?? "USD",
    currencySymbol:          d.currency_symbol ?? "$",
    paymentLink:             d.payment_link ?? null,
    enableGroupStagePrize:   d.enable_group_stage_prize ?? false,
    groupStagePrizeAmount:   d.group_stage_prize_amount ?? null,
    groupStagePrizeLabel:    d.group_stage_prize_label ?? null,
    showPrizeSplit:          d.show_prize_split ?? true,
    showEntryFee:            d.show_entry_fee ?? true,
    showPrizePot:            d.show_prize_pot ?? true,
    showBuyInTracker:        d.show_buy_in_tracker ?? true,
    showPaymentLink:         d.show_payment_link ?? true,
    groupMode:               d.group_mode ?? "standard",
    winnerMessage:           d.winner_message ?? null,
    payouts: {
      first:  `${d.payout_first  ?? 60}%`,
      second: `${d.payout_second ?? 30}%`,
      third:  `${d.payout_third  ?? 10}%`,
    },
  };
}

const GROUP_SELECT = `
  id, name, admin_id,
  buy_in_amount, payout_first, payout_second, payout_third,
  enrollment_fee_cents, passkey, max_members, enrollment_deadline,
  corporate_prize, is_corporate_paid,
  currency, currency_symbol, payment_link,
  enable_group_stage_prize, group_stage_prize_amount, group_stage_prize_label,
  show_prize_split, show_entry_fee, show_prize_pot, show_buy_in_tracker, show_payment_link,
  group_mode, winner_message
`;

// ── Get group by ID ──────────────────────────────────────────────────────────

export async function getGroup(groupId: string): Promise<Group> {
  const { data, error } = await sb()
    .from("groups")
    .select(GROUP_SELECT)
    .eq("id", groupId)
    .single();

  if (error || !data) throw error ?? new Error("Group not found");
  return mapGroup(data as Parameters<typeof mapGroup>[0]);
}

// ── Get group by passkey (uses admin client to bypass RLS) ───────────────────

export async function getGroupByPasskey(passkey: string): Promise<Group | null> {
  const { data } = await sbAdmin()
    .from("groups")
    .select(GROUP_SELECT)
    .ilike("passkey", passkey.trim())
    .maybeSingle();

  if (!data) return null;
  return mapGroup(data as Parameters<typeof mapGroup>[0]);
}

// Legacy alias
export async function getGroupByInviteCode(code: string): Promise<Group | null> {
  return getGroupByPasskey(code);
}

// ── Members / Leaderboard ────────────────────────────────────────────────────

export async function getMembers(groupId: string): Promise<Member[]> {
  const { data, error } = await sbAdmin()
    .from("group_members")
    .select(`
      user_id, payment_status, can_predict, joined_at, role,
      profiles ( id, name, country, avatar_url )
    `)
    .eq("group_id", groupId);

  if (error) throw error;
  if (!data?.length) return [];

  // Aggregate via SQL function — avoids PostgREST's server-side row cap
  // which silently truncates large groups when fetching raw rows.
  const { data: ptRows } = await sbAdmin()
    .rpc("get_group_member_points", { p_group_id: groupId });

  const pointsMap: Record<string, number> = {};
  ((ptRows ?? []) as { user_id: string; total_points: number }[]).forEach(r => {
    pointsMap[r.user_id] = Number(r.total_points ?? 0);
  });

  return (data as unknown as Array<{
    user_id: string;
    payment_status: string;
    can_predict: boolean;
    joined_at: string;
    role: 'member' | 'admin' | 'owner';
    profiles: { id: string; name: string; country: string | null; avatar_url: string | null } | null;
  }>)
    .filter(row => row.profiles !== null)
    .map(row => ({
      id:         row.user_id,
      name:       row.profiles!.name,
      country:    row.profiles!.country ?? "",
      avatarUrl:  row.profiles!.avatar_url ?? null,
      points:     pointsMap[row.user_id] ?? 0,
      paid:       row.payment_status === "paid",
      canPredict: row.can_predict,
      stakePaid:  false,
      joinedAt:   row.joined_at,
      role:       row.role ?? 'member',
    }))
    .sort((a, b) => b.points - a.points);
}

export async function getLeaderboard(groupId: string, limit = 8): Promise<Member[]> {
  const members = await getMembers(groupId);
  return members.slice(0, limit);
}

// ── Payment status ───────────────────────────────────────────────────────────

export async function getMemberPaymentStatus(
  userId: string,
  groupId: string
): Promise<"unpaid" | "paid" | "refunded"> {
  const { data } = await sb()
    .from("payments")
    .select("status")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .maybeSingle();

  return (data as { status: string } | null)?.status as "unpaid" | "paid" | "refunded" ?? "unpaid";
}

// ── Admin: all payments ──────────────────────────────────────────────────────

export async function getGroupPayments(groupId: string) {
  const { data, error } = await sbAdmin()
    .from("payments")
    .select("id, email, status, stake_paid, payment_timestamp, refund_expiry, amount_cents, user_id")
    .eq("group_id", groupId)
    .order("payment_timestamp", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Create group ─────────────────────────────────────────────────────────────

export async function createGroup(params: {
  name:         string;
  adminId:      string;
  buyInAmount:  number;
  payoutFirst:  number;
  payoutSecond: number;
  payoutThird:  number;
  maxMembers?:  number;
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
      max_members: params.maxMembers ?? 100,
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
      payment_status: "free",
      can_predict:    true,
    }, { onConflict: "user_id,group_id" });

  if (error) throw error;
}

// ── Member count ─────────────────────────────────────────────────────────────

export async function getMemberCount(groupId: string): Promise<number> {
  const { count } = await sbAdmin()
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);
  return count ?? 0;
}