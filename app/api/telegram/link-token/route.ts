import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000;
const BOT_USERNAME = "CupClashBot";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function sbFromCookies() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  );
}

// Generates a one-time, expiring token for the Telegram /start deep link —
// see migration 047 for why this replaced passing the raw profile id.
export async function POST() {
  const { data: { user } } = await sbFromCookies().auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  const { error } = await sbAdmin()
    .from("profiles")
    .update({ telegram_link_token: token, telegram_link_token_expires_at: expiresAt })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: "Could not generate link" }, { status: 500 });

  return NextResponse.json({ deepLink: `https://t.me/${BOT_USERNAME}?start=${token}` });
}
