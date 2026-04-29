import { NextRequest, NextResponse } from "next/server";

const TIER_MAX_MEMBERS: Record<string, number> = {
  startup:    10,
  pro:        30,
  enterprise: 60,
};

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  try {
    const pkg = "stripe";
    const stripeModule = await import(pkg as string).catch(() => null) as { default: new (key: string, opts: object) => { webhooks: { constructEvent: (body: string, sig: string, secret: string) => { type: string; data: { object: unknown } } } } } | null;
    if (!stripeModule) return NextResponse.json({ error: "stripe not installed" }, { status: 503 });
    const Stripe = stripeModule.default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });
    const event  = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "checkout.session.completed") {
      const session  = event.data.object as { metadata?: { groupId?: string; tier?: string } };
      const groupId  = session.metadata?.groupId;
      const tier     = session.metadata?.tier ?? "startup";
      const maxMembers = TIER_MAX_MEMBERS[tier] ?? 10;

      if (groupId) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createClient } = require("@supabase/supabase-js");
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! // needs service role for webhook
        );
        await sb.from("groups").update({ max_members: maxMembers }).eq("id", groupId);
        console.log(`Unlocked ${maxMembers} slots for group ${groupId} (${tier})`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}