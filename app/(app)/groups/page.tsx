export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { ShareGroup } from "@/components/sharing/share-group";
import { NeonBar } from "@/components/ui/neon-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy, Users, DollarSign, ArrowRight, Plus, LogIn, KeyRound } from "lucide-react";
import Link from "next/link";
import { serverT } from "@/lib/server-locale";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function GroupsPage() {
  const userProfile = await getCurrentUserProfile();

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00D4FF", fontFamily: "var(--font-ui)", marginBottom: 4 }}>Groups</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">{serverT("grp_title")}</h1>
        </div>
        <EmptyState
          icon={<Trophy size={32} style={{ color: "#00D4FF" }} />}
          title={serverT("grp_compete")}
          body={serverT("grp_create_or")}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/signin?next=/create-group">
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 0 20px rgba(0,255,136,0.25)" }}
            >
              <Plus size={16} /> {serverT("grp_create")}
            </button>
          </Link>
          <Link href="/signin?next=/join/enter">
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF" }}
            >
              <KeyRound size={15} /> {serverT("grp_join_pk")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select(`group_id, is_ad_free, groups ( id, name, passkey, max_members, enrollment_fee_cents, admin_id, buy_in_amount )`)
    .eq("user_id", userProfile.id)
    .order("joined_at", { ascending: false });

  const groupIds = (memberships ?? []).map((m: unknown) => (m as { group_id: string }).group_id);
  const memberCounts: Record<string, number> = {};
  if (groupIds.length > 0) {
    const { data: counts } = await sbAdmin()
      .from("group_members").select("group_id")
      .in("group_id", groupIds);
    (counts ?? []).forEach((row: unknown) => {
      const r = row as { group_id: string };
      memberCounts[r.group_id] = (memberCounts[r.group_id] ?? 0) + 1;
    });
  }

  const groups = (memberships ?? []) as unknown as Array<{
    group_id: string; is_ad_free: boolean;
    groups: { id: string; name: string; passkey: string; max_members: number; enrollment_fee_cents: number; admin_id: string; buy_in_amount: number } | null;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00D4FF", fontFamily: "var(--font-ui)", marginBottom: 4 }}>{serverT("grp_your")}</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">My Groups</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/join/enter">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF" }}>
              <LogIn size={15} /> Join Group
            </button>
          </Link>
          <Link href="/create-group">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 0 20px rgba(0,255,136,0.25)" }}>
              <Plus size={16} /> {serverT("common_new_group")}
            </button>
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Trophy size={32} style={{ color: "#00D4FF" }} />}
          title={serverT("grp_none")}
          body={serverT("grp_none_sub")}
          cta={{ label: serverT("grp_create"), href: "/create-group" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((m) => {
            const g = m.groups;
            if (!g) return null;
            const isAdmin   = g.admin_id === userProfile.id;
            const isAdFree  = m.is_ad_free;
            const memberCount = memberCounts[m.group_id] ?? 0;
            return (
              <div key={m.group_id} className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "rgba(18,14,38,0.32)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", border: "1px solid rgba(255,255,255,0.14)" }}>
                <NeonBar />
                <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl uppercase font-black truncate text-white">{g.name}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {isAdmin && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>Admin</span>}
                        {isAdFree && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88",  border: "1px solid rgba(0,255,136,0.2)"  }}>★ Ad-free</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Passkey</div>
                      <div className="font-mono font-black text-lg" style={{ color: "#00D4FF" }}>{g.passkey}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {[
                    { icon: Users,      label: "Members", value: `${memberCount}` },
                    { icon: DollarSign, label: "Entry",   value: "Free · $2 removes ads" },
                    { icon: Trophy,     label: "Type",    value: "2026 World Cup" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="px-4 py-3 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <Icon size={15} className="mx-auto mb-1" style={{ color: "#00D4FF" }} />
                      <div className="font-display text-lg font-black text-white">{value}</div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 flex gap-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <Link href={`/groups/${m.group_id}`} className="flex-1">
                    <button className="w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                      {serverT("common_view_group")} <ArrowRight size={14} />
                    </button>
                  </Link>
                  <ShareGroup groupName={g.name} adminName={userProfile.name} passkey={g.passkey} compact />
                  {isAdmin && (
                    <Link href={`/admin/${m.group_id}`}>
                      <button className="px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
                        style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
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