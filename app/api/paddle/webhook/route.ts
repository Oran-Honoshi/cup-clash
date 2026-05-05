import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TIER_MAX_MEMBERS: Record<string, number> = {
  startup:    10,
  pro:        30,
  enterprise: 60,
};

// Verify Paddle webhook signature
// https://developer.paddle.com/webhooks/signature-verification
async function verifyPaddleSignature(
  body: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader) return false;

  try {
    // Paddle sends: ts=timestamp;h1=hash
    const parts = Object.fromEntries(
      signatureHeader.split(";").map(p => p.split("=") as [string, string])
    );
    const ts   = parts["ts"];
    const hash = parts["h1"];
    if (!ts || !hash) return false;

    const signed = `${ts}:${body}`;
    const key    = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
    const computed = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return computed === hash;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("paddle-signature");

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Paddle webhook secret not configured" }, { status: 503 });
  }

  // Verify signature
  const valid = await verifyPaddleSignature(body, signature, webhookSecret);
  if (!valid) {
    console.error("Invalid Paddle webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body) as {
      event_type: string;
      data: {
        id: string;
        status: string;
        custom_data?: {
          groupId?: string;
          groupName?: string;
          tier?: string;
        };
        items?: Array<{ price: { id: string } }>;
      };
    };

    console.log("Paddle webhook:", event.event_type);

    // Transaction completed = payment successful
    if (event.event_type === "transaction.completed") {
      const groupId = event.data.custom_data?.groupId;
      const tier    = event.data.custom_data?.tier ?? "startup";
      const maxMembers = TIER_MAX_MEMBERS[tier] ?? 10;

      if (!groupId) {
        console.warn("Paddle webhook: no groupId in custom_data");
        return NextResponse.json({ received: true });
      }

      // Unlock the group slots in Supabase
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // service role needed for webhook
      );

      const { error } = await sb
        .from("groups")
        .update({
          max_members: maxMembers,
          tier,
          paid: true,
          paid_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("id", groupId);

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log(`Unlocked ${maxMembers} slots for group ${groupId} (${tier})`);
    }

    // Refund — downgrade back to free tier limits
    if (event.event_type === "transaction.refunded") {
      const groupId = event.data.custom_data?.groupId;
      if (groupId) {
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await sb.from("groups")
          .update({ max_members: 3, tier: "free", paid: false } as Record<string, unknown>)
          .eq("id", groupId);
        console.log(`Refund: group ${groupId} downgraded to free`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paddle webhook parse error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}