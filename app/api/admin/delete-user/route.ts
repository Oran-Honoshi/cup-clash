import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { sbAnon } from "@/lib/supabase/anon";

const SUPER_ADMIN_EMAILS = ["lipinksy19@gmail.com", "oransch@gmail.com", "oran@honoshi.co.il"];

/** GET ?email=xxx — look up user by email and return their name + groups (no mutation) */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!SUPER_ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: "email param required" }, { status: 400 });

  const sb = sbAdmin();

  // Find auth user by email
  const { data: usersData } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUser = usersData?.users?.find((u) => u.email?.toLowerCase() === email);
  if (!authUser) return NextResponse.json({ error: "No user found with that email" }, { status: 404 });

  const { data: profile } = await sb
    .from("profiles")
    .select("name, is_deleted")
    .eq("id", authUser.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if ((profile as { name: string; is_deleted: boolean }).is_deleted) {
    return NextResponse.json({ error: "User is already deleted" }, { status: 400 });
  }

  const { data: memberships } = await sb
    .from("group_members")
    .select("groups(name)")
    .eq("user_id", authUser.id);

  const groups = (memberships ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any) => (Array.isArray(m.groups) ? m.groups[0]?.name : m.groups?.name) as string | undefined)
    .filter((n): n is string => !!n);

  return NextResponse.json({
    userId: authUser.id,
    name: (profile as { name: string }).name,
    groups,
  });
}

/** POST { userId, reason? } — archive and soft-delete a user */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!SUPER_ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as { userId: string; reason?: string };
  const { userId, reason } = body;
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const sb = sbAdmin();

  // Fetch all data to archive
  const [
    { data: authUserData },
    { data: profile },
    { data: memberships },
    { data: predictions },
  ] = await Promise.all([
    sb.auth.admin.getUserById(userId),
    sb.from("profiles").select("*").eq("id", userId).single(),
    sb.from("group_members").select("*").eq("user_id", userId),
    sb.from("predictions").select("*").eq("user_id", userId),
  ]);

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if ((profile as { is_deleted: boolean }).is_deleted) {
    return NextResponse.json({ error: "User is already deleted" }, { status: 400 });
  }

  const email = authUserData?.user?.email ?? "";

  // Archive to deleted_accounts
  const { error: archiveErr } = await sb.from("deleted_accounts").insert({
    original_user_id: userId,
    email,
    name: (profile as { name: string }).name,
    deleted_by: user.id,
    reason: reason ?? null,
    group_memberships: memberships ?? [],
    predictions: predictions ?? [],
    profile_data: profile,
  });

  if (archiveErr) return NextResponse.json({ error: archiveErr.message }, { status: 500 });

  // Mark profile as deleted
  await sb
    .from("profiles")
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq("id", userId);

  // Remove from all groups so they don't appear in leaderboards
  await sb.from("group_members").delete().eq("user_id", userId);

  // Invalidate all sessions (best-effort)
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}/logout`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "global" }),
      }
    );
  } catch {
    // Non-critical — middleware is_deleted check blocks them regardless
  }

  return NextResponse.json({ success: true, name: (profile as { name: string }).name });
}
