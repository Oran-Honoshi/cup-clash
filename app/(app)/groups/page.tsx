export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { EmptyState } from "@/components/ui/empty-state";
import { GroupCard } from "@/components/groups/group-card";
import { GroupsHeaderActions } from "@/components/groups/groups-header-actions";
import { Trophy, Plus, LogIn } from "lucide-react";
import Link from "next/link";
import { serverT } from "@/lib/server-locale";
import { ENABLE_BETA_FEATURES } from "@/lib/feature-flags";

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
      <div className="space-y-6 pb-32">
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ac)", fontFamily: "var(--font-ui)", marginBottom: 4 }}>Groups</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>{serverT("grp_title")}</h1>
        </div>
        <EmptyState
          icon={<Trophy size={32} style={{ color: "var(--ac)" }} />}
          title={serverT("grp_compete")}
          body={serverT("grp_create_or")}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/signup?next=/create-group">
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "var(--ac)", color: "var(--at)", boxShadow: "0 0 20px color-mix(in srgb, var(--ac) 30%, transparent)" }}
            >
              <Plus size={16} /> {serverT("grp_create")}
            </button>
          </Link>
          <Link href="/signup?next=/join/enter">
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "color-mix(in srgb, var(--ac) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 30%, transparent)", color: "var(--ac)" }}
            >
              <LogIn size={15} /> {serverT("grp_join_pk")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select(`group_id, is_ad_free, groups ( id, name, passkey, max_members, enrollment_fee_cents, admin_id, buy_in_amount, payment_link, group_type )`)
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
    groups: {
      id: string; name: string; passkey: string; max_members: number;
      enrollment_fee_cents: number; admin_id: string; buy_in_amount: number;
      payment_link: string | null; group_type: string | null;
    } | null;
  }>;

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ac)", fontFamily: "var(--font-ui)", marginBottom: 4 }}>{serverT("grp_your")}</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>My Groups</h1>
          {ENABLE_BETA_FEATURES && (
            <Link href="/groups/beta" className="text-[10px] font-bold uppercase tracking-widest inline-block mt-1" style={{ color: "var(--ac)" }}>
              Try the Beta groups view →
            </Link>
          )}
        </div>
        <GroupsHeaderActions />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Trophy size={32} style={{ color: "var(--ac)" }} />}
          title={serverT("grp_none")}
          body={serverT("grp_none_sub")}
          cta={{ label: serverT("grp_create"), href: "/create-group" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((m) => {
            const g = m.groups;
            if (!g) return null;
            return (
              <GroupCard
                key={m.group_id}
                id={g.id}
                name={g.name}
                passkey={g.passkey}
                adminName={userProfile.name}
                memberCount={memberCounts[m.group_id] ?? 0}
                buyInAmount={g.buy_in_amount}
                groupType={g.group_type ?? "tournament"}
                isAdmin={g.admin_id === userProfile.id}
                isAdFree={m.is_ad_free}
                paymentLink={g.payment_link}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
