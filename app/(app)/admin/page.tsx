export const dynamic = "force-dynamic";

import { redirect }   from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { Shield, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function AdminPage() {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup");

  // Get all groups where this user is admin
  const { data: adminGroups } = await sbAdmin()
    .from("groups")
    .select("id, name, passkey, max_members")
    .eq("admin_id", userProfile.id)
    .order("created_at", { ascending: false });

  if (!adminGroups?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Shield size={40} style={{ color: "rgba(255,255,255,0.3)" }} />
        <h1 className="font-display text-3xl uppercase font-black text-white">
          No groups to manage
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          You&apos;re not an admin of any groups yet.
        </p>
        <Link href="/create-group">
          <button className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Create a Group
          </button>
        </Link>
      </div>
    );
  }

  // If only one group, redirect directly to that admin page
  if (adminGroups.length === 1) {
    redirect(`/admin/${adminGroups[0].id}`);
  }

  // Multiple groups: show picker
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <div className="label-caps mb-1">Admin</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
          Your Groups
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          Select a group to manage.
        </p>
      </div>

      <div className="space-y-3">
        {(adminGroups as Array<{ id: string; name: string; passkey: string; max_members: number }>).map(g => (
          <Link key={g.id} href={`/admin/${g.id}`}>
            <div
              className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all"
              style={{
                background: "rgba(12, 18, 32, 0.78)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,255,136,0.12))", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Shield size={20} style={{ color: "#00D4FF" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-xl uppercase font-black truncate text-white">
                  {g.name}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs font-mono font-bold" style={{ color: "#00D4FF" }}>{g.passkey}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
                  <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Users size={11} /> Up to {g.max_members}
                  </span>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
