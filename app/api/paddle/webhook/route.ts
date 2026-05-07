import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function verifyPaddleSignature(body: string, sig: string | null, secret: string) {
  if (!sig) return false;
  try {
    const parts = Object.fromEntries(sig.split(";").map(p => p.split("=") as [string, string]));
    const signed = `${parts["ts"]}:${body}`;
    const key    = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const raw    = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
    const computed = Array.from(new Uint8Array(raw)).map(b => b.toString(16).padStart(2, "0")).join("");
    return computed === parts["h1"];
  } catch { return false; }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get("paddle-signature");

  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const valid = await verifyPaddleSignature(body, sig, process.env.PADDLE_WEBHOOK_SECRET);
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const event = JSON.parse(body) as {
      event_type: string;
      data: {
        id: string;
        customer?: { email?: string };
        custom_data?: { groupId?: string; userEmail?: string; passkey?: string };
      };
    };

    const groupId   = event.data.custom_data?.groupId;
    const userEmail = event.data.custom_data?.userEmail ?? event.data.customer?.email;
    const txId      = event.data.id;

    if (event.event_type === "transaction.completed" && groupId && userEmail) {
      const now      = new Date();
      const refundEx = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Find user by email
      const { data: profile } = await sb
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      const userId = profile?.id ?? null;

      // Upsert payment record
      await sb.from("payments").upsert({
        user_id:           userId,
        group_id:          groupId,
        email:             userEmail,
        paddle_tx_id:      txId,
        amount_cents:      200,
        status:            "paid",
        payment_timestamp: now.toISOString(),
        refund_expiry:     refundEx.toISOString(),
      }, { onConflict: "paddle_tx_id" });

      // Update group_member — unlock predictions
      if (userId) {
        await sb.from("group_members").upsert({
          user_id:        userId,
          group_id:       groupId,
          payment_status: "paid",
          can_predict:    true,
          joined_at:      now.toISOString(),
        }, { onConflict: "user_id,group_id" });
      }

      console.log(`Payment confirmed: ${userEmail} → group ${groupId}`);
    }

    if (event.event_type === "transaction.refunded" && groupId && userEmail) {
      await sb.from("payments")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("group_id", groupId)
        .eq("email", userEmail);

      // Revoke prediction access
      const { data: profile } = await sb.from("profiles").select("id").eq("email", userEmail).single();
      if (profile?.id) {
        await sb.from("group_members")
          .update({ payment_status: "refunded", can_predict: false })
          .eq("user_id", profile.id)
          .eq("group_id", groupId);
      }

      console.log(`Refund processed: ${userEmail} → group ${groupId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 400 });
  }
}
