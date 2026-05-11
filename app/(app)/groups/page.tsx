export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserGroup, getCurrentUserProfile, getAllUserGroups } from "@/lib/services/user-group";
import { ShareGroup } from "@/components/sharing/share-group";
import { Trophy, Users, DollarSign, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export default async function GroupsPage() {
  const [userGroup, userProfile] = await Promise.all([
    getCurrentUserGroup(),
    getCurrentUserProfile(),
  ]);

  if (!userProfile) redirect("/signin");

  // Get all groups for this user directly
  const memberships = userProfile.id ? await getAllUserGroups(userProfile.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="label-caps mb-1">Your groups</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
            My Groups
          </h1>
        </div>
        <Link href="/create-group">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            <Plus size={16} /> New Group
          </button>
        </Link>
      </div>

      {memberships.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <Trophy size={28} style={{ color: "#0891B2" }} />
          </div>
          <div>
            <h2 className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>No groups yet</h2>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>Create a group or join one with a passkey.</p>
          </div>
          <div className="flex gap-3">
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
          {memberships.map((m) => {
            const g = m.groups;
            if (!g) return null;
            const isAdmin = g.admin_id === userProfile.id;
            const isPaid  = m.payment_status === "paid";

            return (
              <div key={m.group_id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)", boxShadow: "0 2px 12px rgba(0,212,255,0.06)" }}>
                {/* Header */}
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={isPaid ? {
                            background: "rgba(0,255,136,0.1)", color: "#059669",
                          } : {
                            background: "rgba(220,38,38,0.08)", color: "#dc2626",
                          }}>
                          {isPaid ? "✓ Enrolled" : "Unpaid — $2 to join"}
                        </span>
                      </div>
                    </div>
                    {/* Passkey badge */}
                    <div className="shrink-0 text-center">
                      <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Passkey</div>
                      <div className="font-mono font-black text-lg tracking-widest" style={{ color: "#0891B2" }}>{g.passkey}</div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x px-0"
                  style={{ borderColor: "rgba(0,212,255,0.08)" }}>
                  {[
                    { icon: Users,     label: "Members",  value: `${g.max_members}` },
                    { icon: DollarSign, label: "Entry",   value: `$${(g.enrollment_fee_cents / 100).toFixed(0)}` },
                    { icon: Trophy,    label: "Type",     value: "Tournament" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="px-4 py-3 text-center">
                      <Icon size={14} className="mx-auto mb-1" style={{ color: "#0891B2" }} />
                      <div className="font-bold text-sm" style={{ color: "#0F172A" }}>{value}</div>
                      <div className="text-[10px]" style={{ color: "#94a3b8" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t flex gap-2"
                  style={{ borderColor: "rgba(0,212,255,0.08)", background: "rgba(248,250,252,0.5)" }}>
                  <Link href="/dashboard" className="flex-1">
                    <button className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                      Open Group <ArrowRight size={13} />
                    </button>
                  </Link>
                  {/* Share button */}
                  <ShareGroup
                    groupName={g.name}
                    adminName={userProfile.name}
                    passkey={g.passkey}
                    compact
                  />
                  {isAdmin && (
                    <Link href="/admin">
                      <button className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
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