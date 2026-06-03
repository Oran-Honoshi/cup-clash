import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPER_ADMIN_EMAILS = ["lipinksy19@gmail.com", "oransch@gmail.com", "oran@honoshi.co.il"];

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
    );

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: group } = await sbAdmin()
      .from("groups")
      .select("admin_id")
      .eq("id", params.id)
      .single();

    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isGroupAdmin  = group.admin_id === user.id;
    const isSuperAdmin  = SUPER_ADMIN_EMAILS.includes(user.email ?? "");
    if (!isGroupAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await sbAdmin().from("groups").delete().eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete group error:", e);
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}
