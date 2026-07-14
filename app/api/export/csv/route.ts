import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { sortMembersForRanking, findPayoutTieGroups, PAYOUT_POSITIONS, type PayoutPosition } from "@/lib/leaderboard-sort";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const sb = sbAdmin();

  // Fetch members with their points and payment status
  const { data: members, error } = await sb
    .from("group_members")
    .select(`
      user_id, payment_status, joined_at,
      profiles ( name, country ),
      payments ( stake_paid )
    `)
    .eq("group_id", groupId);

  if (error || !members) {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }

  // Fetch points per user, plus everything needed for the tiebreaker chain:
  // exact-score counts, correct Tournament Winner picks, and Golden Guess
  // (Final first-goal minute) predictions.
  const [predsRes, finalRes, groupRes] = await Promise.all([
    sb.from("group_predictions")
      .select("user_id, pred_type, pred_value, is_exact, points_earned")
      .eq("group_id", groupId),
    sb.from("matches").select("final_first_goal_minute").eq("id", "final").maybeSingle(),
    sb.from("groups").select("buy_in_amount, payout_first, payout_second, payout_third").eq("id", groupId).maybeSingle(),
  ]);
  const preds = predsRes.data ?? [];
  const actualFinalGoalMinute = (finalRes.data as { final_first_goal_minute: number | null } | null)
    ?.final_first_goal_minute ?? null;
  const groupRow = groupRes.data as { buy_in_amount: number; payout_first: number; payout_second: number; payout_third: number } | null;
  const buyInAmount = groupRow?.buy_in_amount ?? 0;
  const payoutPct: Record<PayoutPosition, number> = {
    first:  groupRow?.payout_first  ?? 60,
    second: groupRow?.payout_second ?? 30,
    third:  groupRow?.payout_third  ?? 10,
  };

  const pointsMap: Record<string, number> = {};
  const exactScoresMap: Record<string, number> = {};
  const correctWinnerMap: Record<string, boolean> = {};
  const predictedMinuteMap: Record<string, number> = {};

  (preds as Array<{ user_id: string; pred_type: string | null; pred_value: string | null; is_exact: boolean | null; points_earned: number }>).forEach(p => {
    pointsMap[p.user_id] = (pointsMap[p.user_id] ?? 0) + (p.points_earned ?? 0);
    if (p.pred_type === "match" && p.is_exact) {
      exactScoresMap[p.user_id] = (exactScoresMap[p.user_id] ?? 0) + 1;
    }
    if (p.pred_type === "winner" && (p.points_earned ?? 0) > 0) {
      correctWinnerMap[p.user_id] = true;
    }
    if (p.pred_type === "final_goal_minute" && p.pred_value) {
      const minute = parseInt(p.pred_value, 10);
      if (!Number.isNaN(minute)) predictedMinuteMap[p.user_id] = minute;
    }
  });

  const ranked = sortMembersForRanking(
    (members as unknown as Array<{
      user_id: string;
      payment_status: string;
      joined_at: string;
      profiles: { name: string; country: string | null } | null;
      payments: Array<{ stake_paid: boolean }> | null;
    }>)
      .filter(m => m.profiles)
      .map(m => {
        const predictedMinute = predictedMinuteMap[m.user_id];
        const finalGoalMinuteDistance = actualFinalGoalMinute != null && predictedMinute != null
          ? Math.abs(predictedMinute - actualFinalGoalMinute)
          : undefined;
        return {
          name:    m.profiles!.name,
          country: m.profiles!.country ?? "",
          points:  pointsMap[m.user_id] ?? 0,
          paid:    m.payment_status === "paid",
          paidLabel: m.payment_status,
          stake:   m.payments?.[0]?.stake_paid ? "Yes" : "No",
          joined:  m.joined_at ? new Date(m.joined_at).toLocaleDateString("en-GB") : "",
          exactScores: exactScoresMap[m.user_id] ?? 0,
          correctWinnerPick: correctWinnerMap[m.user_id] ?? false,
          finalGoalMinuteDistance,
        };
      })
  );

  // Prize per member — accounts for genuine ties at a payout position by
  // splitting that position's (or positions', if the tie spans several)
  // combined percentage evenly across the tied members.
  const pool = ranked.filter(m => m.paid).length * buyInAmount;
  const prizeMap = new Map<(typeof ranked)[number], number>();
  ranked.forEach((m, i) => {
    const position = PAYOUT_POSITIONS[i];
    prizeMap.set(m, position ? Math.floor((pool * payoutPct[position]) / 100) : 0);
  });
  for (const group of findPayoutTieGroups(ranked)) {
    const combinedPct = group.positions.reduce((sum, pos) => sum + payoutPct[pos], 0);
    const perMember = Math.floor((pool * combinedPct) / 100 / group.members.length);
    group.members.forEach(m => prizeMap.set(m, perMember));
  }

  // Build CSV rows — Prize/Payment/Entry Paid columns are money-adjacent and
  // only meaningful when the group actually has a buy-in.
  const header = buyInAmount > 0
    ? ["Rank", "Name", "Country", "Points", "Prize", "Payment", "Entry Paid", "Joined"]
    : ["Rank", "Name", "Country", "Points", "Joined"];
  const rows = ranked.map((m, i) => buyInAmount > 0
    ? [i + 1, m.name, m.country, m.points, prizeMap.get(m) ?? 0, m.paidLabel, m.stake, m.joined]
    : [i + 1, m.name, m.country, m.points, m.joined]);

  const csv = [header, ...rows]
    .map(row => row.map(c => `"${c}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="cupclash-${groupId}.csv"`,
    },
  });
}