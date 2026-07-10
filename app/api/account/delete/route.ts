import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GoTrue's admin API has no literal "forever" ban — a duration far past any
// realistic account lifetime is the standard way to make it permanent.
const PERMANENT_BAN_DURATION = "876000h";

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

/** Groups this user owns (groups.admin_id) that still have other members — deletion must block on these. */
async function getBlockingGroups(admin: ReturnType<typeof sbAdmin>, userId: string) {
  const { data: ownedGroups } = await admin
    .from("groups")
    .select("id, name")
    .eq("admin_id", userId);

  const blocking: { id: string; name: string }[] = [];
  for (const g of (ownedGroups ?? []) as { id: string; name: string }[]) {
    const { count } = await admin
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", g.id)
      .neq("user_id", userId);
    if ((count ?? 0) > 0) blocking.push({ id: g.id, name: g.name });
  }
  return blocking;
}

/** GET — pre-check: can this user delete their account right now, or are they a blocking sole admin somewhere? */
export async function GET() {
  const { data: { user } } = await sbFromCookies().auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blockingGroups = await getBlockingGroups(sbAdmin(), user.id);
  return NextResponse.json({ blockingGroups });
}

/** POST { confirm: "DELETE" } — anonymize the account and permanently ban the credential. */
export async function POST(req: NextRequest) {
  const { data: { user } } = await sbFromCookies().auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Confirmation text does not match" }, { status: 400 });
  }

  const admin = sbAdmin();
  const userId = user.id;

  const { data: profile } = await admin.from("profiles").select("*").eq("id", userId).single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if ((profile as { is_deleted: boolean }).is_deleted) {
    return NextResponse.json({ error: "Account is already deleted" }, { status: 400 });
  }

  // Re-check server-side — never trust that the client's earlier GET is still true.
  const blockingGroups = await getBlockingGroups(admin, userId);
  if (blockingGroups.length > 0) {
    return NextResponse.json({ error: "Sole admin of one or more groups", blockingGroups }, { status: 409 });
  }

  const [{ data: memberships }, { data: predictions }] = await Promise.all([
    admin.from("group_members").select("*").eq("user_id", userId),
    admin.from("predictions").select("*").eq("user_id", userId),
  ]);

  const { error: archiveErr } = await admin.from("deleted_accounts").insert({
    original_user_id: userId,
    email: user.email ?? "",
    name: (profile as { name: string }).name,
    deleted_by: userId, // self-service: deleted_by === original_user_id
    reason: "self_service",
    group_memberships: memberships ?? [],
    predictions: predictions ?? [],
    profile_data: profile,
  });
  if (archiveErr) return NextResponse.json({ error: archiveErr.message }, { status: 500 });

  // Best-effort: remove any uploaded avatar file from storage.
  try {
    const { data: files } = await admin.storage.from("avatars").list(userId);
    if (files?.length) {
      await admin.storage.from("avatars").remove(files.map(f => `${userId}/${f.name}`));
    }
  } catch {
    // Non-critical — profiles.avatar_url is scrubbed regardless.
  }

  // Scrub PII on the profile; keep the row (and its id) alive so every
  // group_predictions/predictions/payments row it's joined from still
  // resolves — that's what protects other members' leaderboard/buy-in
  // history from being wiped out.
  await admin.from("profiles").update({
    name: "Deleted User",
    country: null,
    avatar_url: null,
    telegram_chat_id: null,
    auto_fill_enabled: false,
    auto_fill_home: 1,
    auto_fill_away: 0,
    primary_group_id: null,
    is_deleted: true,
    deleted_at: new Date().toISOString(),
  }).eq("id", userId);

  // Revoke any co-admin/owner role — the account is banned and can never act on it again.
  await admin.from("group_members").update({ role: "member" }).eq("user_id", userId).neq("role", "member");

  // Device-linked data with no historical value.
  await admin.from("push_subscriptions").delete().eq("user_id", userId);
  await admin.from("user_follows").delete().eq("user_id", userId);

  // Scrub the payer's email from any payment records while keeping amount/status for financial reconciliation.
  await admin.from("payments").update({ email: `deleted-${userId}@deleted.cupclash.invalid` }).eq("user_id", userId);

  // Permanently ban the credential and scramble the auth email so it can't be reused to sign back in or re-register.
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: PERMANENT_BAN_DURATION,
    email: `deleted-${userId}@deleted.cupclash.invalid`,
    user_metadata: {},
  });

  // Best-effort global session invalidation.
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}/logout`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: "global" }),
    });
  } catch {
    // Non-critical — the ban blocks them regardless.
  }

  return NextResponse.json({ success: true });
}
