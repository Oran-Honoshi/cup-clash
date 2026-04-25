// ARCHIVED — original Stripe server action from project files.
// Move this to `app/actions/stripe.ts` and create `lib/stripe.ts`
// when wiring up Stripe checkout.
//
// You'll also need:
//   npm install stripe
//   STRIPE_SECRET_KEY in .env.local
//   Real Stripe Price IDs (the "price_20_dollars" strings here are placeholders)

"use server";
import { stripe } from "@/lib/stripe";

export async function createGroupSubscription(groupId: string, memberCount: number) {
  let priceId = "";
  // Map your user's tiers to Stripe Price IDs
  if (memberCount <= 10) priceId = "price_20_dollars";
  else if (memberCount <= 30) priceId = "price_50_dollars";
  else priceId = "price_100_dollars";

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment", // One-time payment per tournament
    success_url: `${process.env.NEXT_PUBLIC_URL}/group/${groupId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    metadata: { groupId },
  });

  return { url: session.url };
}
