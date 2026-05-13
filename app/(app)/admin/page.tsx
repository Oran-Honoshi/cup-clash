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
  if (!userProfile) redirect("/signin");

  // Get all groups where this user is admin
  const { data: adminGroups } = await sbAdmin()
    .from("groups")
    .select("id, name, passkey, max_members")
    .eq("admin_id", userProfile.id)
    .order("created_at", { ascending: false });

  if (!adminGroups?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Shield size={40} style={{ color: "#e2e8f0" }} />
        <h1 className="font-display text-3xl uppercase font-black" style={{ color: "#0F172A" }}>
          No groups to manage
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
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

  // Multiple groups — show picker
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <div className="label-caps mb-1">Admin</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Your Groups
        </h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Select a group to manage.
        </p>
      </div>

      <div className="space-y-3">
        {(adminGroups as Array<{ id: string; name: string; passkey: string; max_members: number }>).map(g => (
          <Link key={g.id} href={`/admin/${g.id}`}>
            <div className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.1))", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Shield size={20} style={{ color: "#0891B2" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-xl uppercase font-black truncate" style={{ color: "#0F172A" }}>
                  {g.name}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs font-mono font-bold" style={{ color: "#0891B2" }}>{g.passkey}</span>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>·</span>
                  <span className="text-xs flex items-center gap-1" style={{ color: "#94a3b8" }}>
                    <Users size={11} /> Up to {g.max_members}
                  </span>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: "#0891B2" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}