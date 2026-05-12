import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { groupId } = await request.json();
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  // Get current user via SSR cookies
  const cookieStore = cookies();
  const sbServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string)                          { return cookieStore.get(name)?.value; },
        set(name: string, value: string, opts: Record<string, unknown>) { try { cookieStore.set({ name, value, ...opts }); } catch {} },
        remove(name: string, opts: Record<string, unknown>)             { try { cookieStore.set({ name, value: "", ...opts }); } catch {} },
      },
    }
  );

  const { data: { user }, error: authError } = await sbServer.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use admin client to bypass RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Upsert member as paid
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
    console.error("Member upsert error:", memberError);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Mock payment record
  await admin.from("payments").upsert({
    user_id:           user.id,
    group_id:          groupId,
    email:             user.email ?? "",
    status:            "paid",
    amount_cents:      0,
    stake_paid:        false,
    payment_timestamp: new Date().toISOString(),
  } as Record<string, unknown>, { onConflict: "user_id,group_id" });

  return NextResponse.json({ success: true });
}