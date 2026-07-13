import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sbAdmin } from "@/lib/supabase/admin";

const PAYPAL_API = "https://api-m.paypal.com";

async function getPayPalToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method:  "POST",
    headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body:    "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, groupId, capacity } = await request.json() as {
      orderID:  string;
      groupId:  string;
      capacity: number;
    };

    // 1 — Capture PayPal payment
    const token = await getPayPalToken();
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method:  "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const capture = await captureRes.json() as { status: string };
    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ success: false, error: "Payment not completed" });
    }

    // 2 — Get current user
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
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" });

    const sb = sbAdmin();

    // 3 — Update group to corporate
    const { error: updateError } = await sb.from("groups")
      .update({
        is_corporate_paid:  true,
        max_group_capacity: capacity,
      })
      .eq("id", groupId)
      .eq("admin_id", user.id); // only the admin can unlock

    if (updateError) {
      console.error("Corporate unlock error:", updateError);
      return NextResponse.json({ success: false, error: updateError.message });
    }

    // 4 — Log payment
    await sb.from("payments").upsert({
      user_id:     user.id,
      group_id:    groupId,
      amount:      capacity === 50 ? 7500 : 13000,
      currency:    "USD",
      provider:    "paypal",
      provider_id: orderID,
      status:      "paid",
    }, { onConflict: "provider_id" });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Corporate capture error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}