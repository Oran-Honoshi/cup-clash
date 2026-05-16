import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const PAYPAL_API = "https://api-m.paypal.com";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, groupId } = await request.json() as {
      orderID: string;
      groupId: string;
    };

    // 1 — Capture PayPal payment
    const accessToken = await getAccessToken();
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await captureRes.json() as { status: string };
    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ success: false, error: "Payment not completed" });
    }

    // 2 — Get current user from session cookie
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
      // Payment succeeded but can't identify user — log it for manual resolution
      console.error(`PayPal payment ${orderID} completed but no user session found. Group: ${groupId}`);
      return NextResponse.json({
        success: false,
        error: "Payment received but session expired. Please sign in and contact support.",
      });
    }

    const sb = sbAdmin();

    // 3 — Check if already a member, update or insert
    const { data: existing } = await sb
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Already a member — just mark as paid
      await sb.from("group_members")
        .update({
          payment_status: "paid",
          can_predict:    true,
          paid_at:        new Date().toISOString(),
        })
        .eq("group_id", groupId)
        .eq("user_id", user.id);
    } else {
      // New member — insert
      await sb.from("group_members").insert({
        group_id:       groupId,
        user_id:        user.id,
        payment_status: "paid",
        can_predict:    true,
        paid_at:        new Date().toISOString(),
        joined_at:      new Date().toISOString(),
      });
    }

    // 4 — Log payment
    await sb.from("payments").insert({
      user_id:     user.id,
      group_id:    groupId,
      amount:      200,
      currency:    "USD",
      provider:    "paypal",
      provider_id: orderID,
      status:      "paid",
    }).select().single();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}