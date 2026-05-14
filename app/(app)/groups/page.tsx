export const dynamic = "force-dynamic";

import { redirect }   from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { ShareGroup } from "@/components/sharing/share-group";
import { Trophy, Users, DollarSign, ArrowRight, Plus, LogIn } from "lucide-react";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function GroupsPage() {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  // Get all memberships with group info + real member count
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select(`
      group_id, payment_status,
      groups ( id, name, passkey, max_members, enrollment_fee_cents, admin_id, buy_in_amount )
    `)
    .eq("user_id", userProfile.id)
    .order("joined_at", { ascending: false });

  // Get real member counts for each group
  const groupIds = (memberships ?? [])
    .map((m: unknown) => (m as { group_id: string }).group_id);

  const memberCounts: Record<string, number> = {};
  if (groupIds.length > 0) {
    const { data: counts } = await sbAdmin()
      .from("group_members")
      .select("group_id")
      .in("group_id", groupIds)
      .eq("payment_status", "paid");
    (counts ?? []).forEach((row: unknown) => {
      const r = row as { group_id: string };
      memberCounts[r.group_id] = (memberCounts[r.group_id] ?? 0) + 1;
    });
  }

  const groups = (memberships ?? []) as unknown as Array<{
    group_id: string;
    payment_status: string;
    groups: {
      id: string; name: string; passkey: string;
      max_members: number; enrollment_fee_cents: number;
      admin_id: string; buy_in_amount: number;
    } | null;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps mb-1">Your groups</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
            My Groups
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/join/enter">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
              <LogIn size={15} /> Join Group
            </button>
          </Link>
          <Link href="/create-group">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              <Plus size={16} /> New Group
            </button>
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <Trophy size={28} style={{ color: "#0891B2" }} />
          </div>
          <div>
            <h2 className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>No groups yet</h2>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>Create a group or join one with a passkey.</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link href="/create-group">
              <button className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                Create Group
              </button>
            </Link>
            <Link href="/join/enter">
              <button className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
                style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
                Join with Passkey
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((m) => {
            const g = m.groups;
            if (!g) return null;
            const isAdmin     = g.admin_id === userProfile.id;
            const isPaid      = m.payment_status === "paid";
            const memberCount = memberCounts[m.group_id] ?? 0;

            return (
              <div key={m.group_id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)", boxShadow: "0 2px 12px rgba(0,212,255,0.06)" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl uppercase font-black truncate" style={{ color: "#0F172A" }}>
                        {g.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {isAdmin && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(217,119,6,0.1)", color: "#d97706" }}>Admin</span>
                        )}
                        {isPaid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>✓ Enrolled</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Passkey</div>
                      <div className="font-mono font-black text-lg" style={{ color: "#0891B2" }}>{g.passkey}</div>
                    </div>
                  </div>
                </div>

                {/* Stats — shows REAL member count */}
                <div className="grid grid-cols-3 divide-x divide-slate-100">
                  {[
                    { icon: Users,      label: "Members",   value: `${memberCount}` },
                    { icon: DollarSign, label: "Entry",     value: `$${(g.enrollment_fee_cents / 100).toFixed(0)}` },
                    { icon: Trophy,     label: "Type",      value: "Tournament" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="px-4 py-3 text-center">
                      <Icon size={16} className="mx-auto mb-1" style={{ color: "#0891B2" }} />
                      <div className="font-display text-lg font-black" style={{ color: "#0F172A" }}>{value}</div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 flex gap-2 border-t" style={{ borderColor: "#f1f5f9" }}>
                  <Link href={`/groups/${m.group_id}`} className="flex-1">
                    <button className="w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                      View Group <ArrowRight size={14} />
                    </button>
                  </Link>
                  <ShareGroup groupName={g.name} adminName={userProfile.name} passkey={g.passkey} />
                  {isAdmin && (
                    <Link href={`/admin/${m.group_id}`}>
                      <button className="px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
                        style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
                        Admin
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}