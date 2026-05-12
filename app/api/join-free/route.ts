import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Demo mode not enabled" }, { status: 403 });
  }

  // Check env vars exist
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  let body: { groupId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { groupId } = body;
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  // Get current user
  const cookieStore = cookies();
  const sbServer = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set() {},
      remove() {},
    },
  });

  const { data: { user } } = await sbServer.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated — please sign in first" }, { status: 401 });
  }

  // Use service role if available, fallback to anon
  const adminKey = serviceKey ?? anonKey;
  const admin = createClient(supabaseUrl, adminKey);

  // Add member as paid
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
    return NextResponse.json({ error: `DB error: ${memberError.message}` }, { status: 500 });
  }

  // Mock payment record — ignore errors (table might not have all columns)
  try {
    await admin.from("payments").upsert({
      user_id:           user.id,
      group_id:          groupId,
      email:             user.email ?? "",
      status:            "paid",
      amount_cents:      0,
      stake_paid:        false,
      payment_timestamp: new Date().toISOString(),
    } as Record<string, unknown>, { onConflict: "user_id,group_id" });
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true, userId: user.id, groupId });
}