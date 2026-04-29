import { NextRequest, NextResponse } from "next/server";

// Stripe price IDs — set these in your Stripe dashboard and add to env
const PRICE_IDS: Record<string, string> = {
  startup:    process.env.STRIPE_PRICE_STARTUP    ?? "price_startup",
  pro:        process.env.STRIPE_PRICE_PRO        ?? "price_pro",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "price_enterprise",
};

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const { tier, groupId, groupName } = await request.json() as {
      tier: string;
      groupId: string;
      groupName: string;
    };

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const pkg = "stripe";
    const stripeModule = await import(pkg as string).catch(() => null) as { default: new (key: string, opts: object) => { checkout: { sessions: { create: (opts: object) => Promise<{ url: string }> } } } } | null;
    if (!stripeModule) {
      return NextResponse.json({ error: "stripe package not installed — run: npm install stripe" }, { status: 503 });
    }
    const Stripe = stripeModule.default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=success&group=${groupId}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_URL}/create-group?cancelled=true`,
      metadata: { groupId, groupName, tier },
      payment_intent_data: {
        metadata: { groupId, tier },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Payment session failed" }, { status: 500 });
  }
}