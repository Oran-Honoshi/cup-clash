import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  // Fetch points per user
  const { data: pts } = await sb
    .from("group_predictions")
    .select("user_id, points_earned")
    .eq("group_id", groupId);

  const pointsMap: Record<string, number> = {};
  (pts ?? []).forEach((p: { user_id: string; points_earned: number }) => {
    pointsMap[p.user_id] = (pointsMap[p.user_id] ?? 0) + p.points_earned;
  });

  // Build CSV rows
  const header = ["Rank", "Name", "Country", "Points", "Payment", "Stake Paid", "Joined"];
  const rows = (members as unknown as Array<{
    user_id: string;
    payment_status: string;
    joined_at: string;
    profiles: { name: string; country: string | null } | null;
    payments: Array<{ stake_paid: boolean }> | null;
  }>)
    .filter(m => m.profiles)
    .map(m => ({
      name:    m.profiles!.name,
      country: m.profiles!.country ?? "",
      points:  pointsMap[m.user_id] ?? 0,
      paid:    m.payment_status,
      stake:   m.payments?.[0]?.stake_paid ? "Yes" : "No",
      joined:  m.joined_at ? new Date(m.joined_at).toLocaleDateString("en-GB") : "",
    }))
    .sort((a, b) => b.points - a.points)
    .map((m, i) => [i + 1, m.name, m.country, m.points, m.paid, m.stake, m.joined]);

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