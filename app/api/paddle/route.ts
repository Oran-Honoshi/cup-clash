import { NextRequest, NextResponse } from "next/server";

// Paddle price IDs — set in Paddle dashboard → Catalog → Products
// Format: pri_xxxxxxxxxxxxxxxx
const PRICE_IDS: Record<string, string> = {
  startup:    process.env.PADDLE_PRICE_STARTUP    ?? "",
  pro:        process.env.PADDLE_PRICE_PRO        ?? "",
  enterprise: process.env.PADDLE_PRICE_ENTERPRISE ?? "",
};

export async function POST(request: NextRequest) {
  if (!process.env.PADDLE_API_KEY) {
    return NextResponse.json({ error: "Paddle not configured" }, { status: 503 });
  }

  try {
    const { tier, groupId, groupName } = await request.json() as {
      tier: string;
      groupId: string;
      groupName: string;
    };

    if (!tier || tier === "") {
      // Free tier — no payment needed
      return NextResponse.json({ url: null, free: true });
    }

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier or price not configured" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://cupclash.vercel.app";

    // Paddle Billing API — create a transaction (checkout session equivalent)
    // https://developer.paddle.com/api-reference/transactions/create-transaction
    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        checkout: {
          url: `${baseUrl}/create-group?payment=success&group=${groupId}`,
        },
        custom_data: {
          groupId,
          groupName,
          tier,
        },
        // Return URLs
        success_url: `${baseUrl}/dashboard?payment=success&group=${groupId}`,
        // Paddle uses checkout URL directly — user is redirected there
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Paddle API error:", errBody);
      return NextResponse.json({ error: "Failed to create Paddle checkout" }, { status: 500 });
    }

    const data = await response.json() as {
      data?: {
        id: string;
        checkout?: { url: string };
      };
    };

    const checkoutUrl = data.data?.checkout?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL returned from Paddle" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Paddle route error:", err);
    return NextResponse.json({ error: "Payment session failed" }, { status: 500 });
  }
}