import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// TESTING ONLY — bypasses Paddle payment
// Remove or disable this route before going live with real payments
// Protected by NEXT_PUBLIC_DEMO_MODE env var

export async function POST(request: NextRequest) {
  // Only allow in demo/testing mode
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { groupId } = await request.json();
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  // Get current user
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use admin client to bypass RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Add/update member as paid
  const { error: memberError } = await admin
    .from("group_members")
    .upsert({
      group_id:       groupId,
      user_id:        user.id,
      payment_status: "paid",
      can_predict:    true,
      joined_at:      new Date().toISOString(),
    }, { onConflict: "user_id,group_id" });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Create a mock payment record
  await admin.from("payments").upsert({
    user_id:           user.id,
    group_id:          groupId,
    email:             user.email ?? "",
    status:            "paid",
    amount_cents:      200,
    stake_paid:        false,
    payment_timestamp: new Date().toISOString(),
  } as Record<string, unknown>, { onConflict: "user_id,group_id" });

  return NextResponse.json({ success: true });
}