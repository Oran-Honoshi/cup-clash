import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// $2 per member enrollment fee
const ENROLLMENT_FEE_CENTS = 200;

export async function POST(request: NextRequest) {
  if (!process.env.PADDLE_API_KEY) {
    return NextResponse.json({ error: "Paddle not configured" }, { status: 503 });
  }

  try {
    const { groupId, groupName, adminName, userEmail, passkey } = await request.json() as {
      groupId:   string;
      groupName: string;
      adminName: string;
      userEmail: string;
      passkey:   string;
    };

    if (!groupId || !userEmail) {
      return NextResponse.json({ error: "Missing groupId or email" }, { status: 400 });
    }

    const baseUrl    = process.env.NEXT_PUBLIC_URL ?? "https://cupclash.live";
    const priceId    = process.env.PADDLE_PRICE_ENROLLMENT;

    if (!priceId) {
      return NextResponse.json({ error: "PADDLE_PRICE_ENROLLMENT not configured" }, { status: 503 });
    }

    // Check enrollment deadline
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: group } = await sb
      .from("groups")
      .select("enrollment_deadline, passkey, name")
      .eq("id", groupId)
      .single();

    if (group?.enrollment_deadline && new Date(group.enrollment_deadline) < new Date()) {
      return NextResponse.json({ error: "Enrollment deadline has passed" }, { status: 403 });
    }

    // Check not already paid
    const { data: existing } = await sb
      .from("payments")
      .select("status")
      .eq("group_id", groupId)
      .eq("email", userEmail)
      .single();

    if (existing?.status === "paid") {
      return NextResponse.json({ error: "Already enrolled in this group" }, { status: 409 });
    }

    // Create pending payment record
    await sb.from("payments").upsert({
      group_id: groupId,
      email:    userEmail,
      amount_cents: ENROLLMENT_FEE_CENTS,
      status:   "pending",
    }, { onConflict: "user_id,group_id" });

    // Create Paddle checkout
    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer: { email: userEmail },
        custom_data: {
          groupId,
          groupName,
          adminName,
          userEmail,
          passkey,
        },
        checkout: {
          url: `${baseUrl}/join/${passkey}?payment=success`,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Paddle error:", err);
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    const data = await response.json() as {
      data?: { checkout?: { url: string } };
    };

    const checkoutUrl = data.data?.checkout?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL from Paddle" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Paddle route error:", err);
    return NextResponse.json({ error: "Payment session failed" }, { status: 500 });
  }
}
