import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Demo mode not enabled" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  let groupId: string;
  try {
    const body = await request.json();
    groupId = body.groupId;
    if (!groupId) throw new Error("no groupId");
  } catch {
    return NextResponse.json({ error: "Invalid body — groupId required" }, { status: 400 });
  }

  // Get user from session cookie
  let userId: string;
  let userEmail: string;
  try {
    const cookieStore = cookies();
    const sbServer = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    });
    const { data: { user }, error } = await sbServer.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Not authenticated — please sign in" }, { status: 401 });
    }
    userId    = user.id;
    userEmail = user.email ?? "";
  } catch (e) {
    return NextResponse.json({ error: `Auth error: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }

  // Admin client — bypasses RLS
  const admin = createClient(supabaseUrl, serviceKey ?? anonKey);

  // Step 1: Upsert group member
  const { error: memberError } = await admin
    .from("group_members")
    .upsert({
      group_id:       groupId,
      user_id:        userId,
      payment_status: "paid",
      can_predict:    true,
      joined_at:      new Date().toISOString(),
    }, { onConflict: "user_id,group_id" });

  if (memberError) {
    return NextResponse.json({ error: `Member error: ${memberError.message}` }, { status: 500 });
  }

  // Step 2: Payment record — skip columns that might not exist
  try {
    await admin.from("payments").upsert({
      user_id:   userId,
      group_id:  groupId,
      email:     userEmail,
      status:    "paid",
      amount_cents: 0,
    } as Record<string, unknown>, { onConflict: "user_id,group_id" });
  } catch {
    // Non-fatal — member was already added
    console.warn("Payment record insert failed — continuing");
  }

  return NextResponse.json({ success: true });
}