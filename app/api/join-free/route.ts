import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { groupId } = await request.json() as { groupId: string };

    // Get user from session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }

    const sb = sbAdmin();

    // Check if already a member
    const { data: existing } = await sb
      .from("group_members")
      .select("id, payment_status, can_predict")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.can_predict) {
      return NextResponse.json({ success: true }); // Already a participant
    }

    if (existing) {
      await sb.from("group_members")
        .update({ payment_status: "free", can_predict: true, joined_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await sb.from("group_members").insert({
        group_id:       groupId,
        user_id:        user.id,
        payment_status: "free",
        can_predict:    true,
        joined_at:      new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("join-free error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}