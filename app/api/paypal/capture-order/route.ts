import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYPAL_API = "https://api-m.paypal.com";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAccessToken(): Promise<string> {
  const clientId     = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method:  "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type":  "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, groupId } = await request.json() as { orderID: string; groupId: string };
    const accessToken = await getAccessToken();

    // Capture the payment
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type":  "application/json",
      },
    });

    const capture = await res.json() as {
      status: string;
      purchase_units: Array<{ custom_id?: string }>;
    };

    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ success: false, error: "Payment not completed" });
    }

    // Get current user from session
    const sb = sbAdmin();

    // Get user from auth header
    const authHeader = request.headers.get("cookie") ?? "";
    const { data: { user } } = await sb.auth.getUser(
      authHeader.match(/sb-[^=]+=([^;]+)/)?.[1] ?? ""
    );

    // Update group_members — mark as paid
    if (user) {
      await sb.from("group_members")
        .update({
          payment_status: "paid",
          can_predict:    true,
          paid_at:        new Date().toISOString(),
        })
        .eq("group_id", groupId)
        .eq("user_id",  user.id);

      // Log the payment
      await sb.from("payments").insert({
        user_id:    user.id,
        group_id:   groupId,
        amount:     200, // cents
        currency:   "USD",
        provider:   "paypal",
        provider_id: orderID,
        status:     "paid",
      }).select().single();
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}