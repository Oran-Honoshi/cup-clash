import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const FREE_MEMBER_LIMIT = 2; // First 2 non-admin members join free

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const demoMode    = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  let groupId: string;
  try {
    const body = await request.json();
    groupId = body.groupId;
    if (!groupId) throw new Error("no groupId");
  } catch {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  // Get current user
  const cookieStore = cookies();
  const sbServer = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set() {}, remove() {},
    },
  });
  const { data: { user } } = await sbServer.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createClient(supabaseUrl, serviceKey ?? anonKey);

  // Check if user is admin of this group (admins always free)
  const { data: group } = await admin
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  const isAdmin = (group as { admin_id: string } | null)?.admin_id === user.id;

  // Check if within free member limit
  let isFree = isAdmin || demoMode;

  if (!isFree) {
    // Count current non-admin paid/free members
    const { count } = await admin
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .neq("user_id", (group as { admin_id: string }).admin_id);

    isFree = (count ?? 0) < FREE_MEMBER_LIMIT;
  }

  if (!isFree) {
    return NextResponse.json({
      error: "Payment required",
      requiresPayment: true,
      message: `The first ${FREE_MEMBER_LIMIT} members join free. Payment is required to join this group.`
    }, { status: 402 });
  }

  // Add member as free
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

  return NextResponse.json({ success: true, free: true });
}