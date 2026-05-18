export const dynamic = "force-dynamic";

import { redirect }        from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Leaderboard }     from "@/components/dashboard/leaderboard";
import { NextMatchCard }   from "@/components/dashboard/next-match-card";
import { BuyInStatus }     from "@/components/dashboard/buy-in-status";
import { StatCards }       from "@/components/dashboard/stat-cards";
import { DashboardPopups } from "@/components/dashboard/dashboard-popups";
import { WallOfShame }     from "@/components/dashboard/wall-of-shame";
import { DashboardGroupPicker } from "@/components/dashboard/dashboard-group-picker";
import { WelcomeModal }    from "@/components/ui/welcome-modal";
import { getLeaderboard, getMembers, getGroup } from "@/lib/services/groups";
import { getNextMatch }    from "@/lib/services/matches";
import { getCurrentUserProfile } from "@/lib/services/user-group";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  // Get all groups this user belongs to
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id, payment_status, groups(id, name, passkey)")
    .eq("user_id", userProfile.id)
    .eq("payment_status", "paid")
    .order("joined_at", { ascending: false });

  const allGroups = (memberships ?? [])
    .map((m: unknown) => {
      const row = m as { group_id: string; groups: { id: string; name: string; passkey: string } | null };
      return row.groups ? { id: row.groups.id, name: row.groups.name, passkey: row.groups.passkey } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  // No groups — show rich empty state with clear paths
  if (!allGroups.length) {
    return (
      <div className="space-y-6">
        <WelcomeModal forceOpen={false} />

        <div>
          <div className="label-caps mb-1">Welcome to Cup Clash</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
            How would you like to play?
          </h1>
          <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>
            Pick your path — you can always change later.
          </p>
        </div>

        {/* Primary tiles */}
        <div className="grid sm:grid-cols-2 gap-4">
          <a href="/create-group?model=pay_per_member"
            className="rounded-3xl overflow-hidden transition-all hover:-translate-y-1 block"
            style={{ background: "white", border: "2px solid rgba(0,255,136,0.25)", boxShadow: "0 4px 24px rgba(0,255,136,0.08)" }}>
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF)" }} />
            <div className="p-7">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
                <span className="text-3xl">👥</span>
              </div>
              <div className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>Friend Circle</div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>
                Free for you to create. Every member pays a flat <strong style={{ color: "#0F172A" }}>$2 entry fee</strong> individually when joining.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Fantasy leagues", "Friend groups", "Family", "Bar buddies"].map((t: string) => (
                  <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,255,136,0.08)", color: "#059669", border: "1px solid rgba(0,255,136,0.15)" }}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="font-bold text-sm" style={{ color: "#059669" }}>Create a Friend Group →</div>
            </div>
          </a>

          <a href="/create-group?model=corporate_sponsored"
            className="rounded-3xl overflow-hidden transition-all hover:-translate-y-1 block"
            style={{ background: "white", border: "2px solid rgba(0,212,255,0.3)", boxShadow: "0 4px 24px rgba(0,212,255,0.1)" }}>
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
            <div className="p-7">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <span className="text-3xl">🏢</span>
              </div>
              <div className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>Corporate Sponsor</div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>
                Cover the whole team with a <strong style={{ color: "#0F172A" }}>single flat rate</strong>. Everyone you invite joins for <strong style={{ color: "#0F172A" }}>$0 — zero friction</strong>.
              </p>
              <div className="flex gap-3 mb-5">
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2" }}>$75 · 50 members</span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(217,119,6,0.08)", color: "#d97706" }}>$130 · 100 members</span>
              </div>
              <div className="font-bold text-sm" style={{ color: "#0891B2" }}>Set Up Corporate Group →</div>
            </div>
          </a>
        </div>

        {/* Secondary row */}
        <div className="grid grid-cols-2 gap-4">
          <a href="/join/enter"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 block"
            style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <span className="text-xl">🔑</span>
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#0F172A" }}>Join a Group</div>
              <div className="text-xs" style={{ color: "#94a3b8" }}>Enter a passkey</div>
            </div>
          </a>
          <a href="/predictions"
            className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 block"
            style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#0F172A" }}>Solo Predictions</div>
              <div className="text-xs" style={{ color: "#94a3b8" }}>Play on your own</div>
            </div>
          </a>
        </div>
      </div>
    );
  }

  // Active group from URL param or first group
  const activeGroupId = searchParams.group && allGroups.find(g => g.id === searchParams.group)
    ? searchParams.group
    : allGroups[0].id;

  const activeGroup = allGroups.find(g => g.id === activeGroupId)!;

  const [members, top8, group, nextMatch] = await Promise.all([
    getMembers(activeGroupId),
    getLeaderboard(activeGroupId, 8),
    getGroup(activeGroupId),
    getNextMatch(),
  ]);

  const currentMember = members.find(m => m.id === userProfile.id) ?? members[0];
  const rank          = members.findIndex(m => m.id === userProfile.id) + 1;
  const isPaid        = members.find(m => m.id === userProfile.id)?.paid ?? false;
  const isAdmin       = group.admin === userProfile.id;

  return (
    <div className="space-y-6">
      <WelcomeModal />
      <DashboardPopups groupId={activeGroupId} userId={userProfile.id} />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="label-caps mb-1">{group.name}</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
            Dashboard
          </h1>
          {isAdmin && (
            <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>
              Admin · Passkey: <span className="font-mono font-bold">{group.passkey}</span>
            </p>
          )}
        </div>
        {allGroups.length > 1 && (
          <DashboardGroupPicker
            groups={allGroups}
            activeGroupId={activeGroupId}
          />
        )}
      </div>

      <StatCards
        rank={isPaid ? rank : 0}
        points={currentMember?.points ?? 0}
        totalPlayers={members.filter(m => m.paid).length}
        correctPredictions={currentMember?.correctPredictions ?? 0}
        exactScores={currentMember?.exactScores ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <Leaderboard
            members={top8}
            currentUserId={userProfile.id}
            groupId={activeGroupId}
            showGhost
          />
          <WallOfShame members={members} totalMatches={48} />
        </div>
        <div className="lg:col-span-5 space-y-5">
          {nextMatch && <NextMatchCard match={nextMatch} groupId={activeGroupId} />}
          <BuyInStatus group={group} members={members} />
        </div>
      </div>
    </div>
  );
}