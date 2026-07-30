import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sbAdmin } from "@/lib/supabase/admin";

// Mirrors app/api/join-free/route.ts for groups. fantasy_league_members'
// insert RLS policy (migration 076) only checks auth.uid() = user_id — no
// is_public/max_members gating at the DB level — so this route enforces
// both server-side before inserting, same defense-in-depth reasoning as
// the public-group join flow it mirrors.
export async function POST(request: NextRequest) {
  try {
    const { fantasyLeagueId } = await request.json() as { fantasyLeagueId: string };

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }

    const sb = sbAdmin();

    const { data: league } = await sb
      .from("fantasy_leagues")
      .select("id, is_public, max_members")
      .eq("id", fantasyLeagueId)
      .maybeSingle();
    const l = league as { id: string; is_public: boolean; max_members: number } | null;

    if (!l || !l.is_public) {
      return NextResponse.json({ success: false, error: "League not found" }, { status: 404 });
    }

    const { data: existing } = await sb
      .from("fantasy_league_members")
      .select("id")
      .eq("fantasy_league_id", fantasyLeagueId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true }); // already a member
    }

    const { count } = await sb
      .from("fantasy_league_members")
      .select("id", { count: "exact", head: true })
      .eq("fantasy_league_id", fantasyLeagueId);

    if ((count ?? 0) >= l.max_members) {
      return NextResponse.json({ success: false, error: "This league is full" }, { status: 400 });
    }

    const { error: insErr } = await sb.from("fantasy_league_members").insert({
      fantasy_league_id: fantasyLeagueId,
      user_id: user.id,
      role: "member",
    });
    if (insErr) {
      return NextResponse.json({ success: false, error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("fantasy join-free error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
