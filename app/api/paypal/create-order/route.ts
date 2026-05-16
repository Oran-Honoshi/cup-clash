import { NextRequest, NextResponse } from "next/server";

const PAYPAL_API = "https://api-m.paypal.com"; // live
// const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // sandbox

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
    const { groupId, amount } = await request.json() as { groupId: string; amount: number };
    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
          description: `Cup Clash — Group Access`,
          custom_id: groupId,
        }],
        application_context: {
          brand_name:          "Cup Clash",
          landing_page:        "NO_PREFERENCE",
          user_action:         "PAY_NOW",
          return_url:          `${process.env.NEXT_PUBLIC_URL}/dashboard`,
          cancel_url:          `${process.env.NEXT_PUBLIC_URL}/join`,
        },
      }),
    });

    const order = await res.json() as { id: string };
    return NextResponse.json({ id: order.id });

  } catch (err) {
    console.error("PayPal create-order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}