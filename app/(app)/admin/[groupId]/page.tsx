export const dynamic = "force-dynamic";

import { redirect }            from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { AdminPanel }          from "@/components/admin/admin-panel";
import { ScoringRulesEditor }  from "@/components/admin/scoring-rules-editor";
import { GroupRulesEditor }    from "@/components/admin/group-rules-editor";
import { PickOverridesPanel }  from "@/components/admin/pick-overrides-panel";
import { WelcomeEmailSender }  from "@/components/admin/welcome-email-sender";
import { WinnerPoster }        from "@/components/export/winner-poster";
import { getGroup, getMembers } from "@/lib/services/groups";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function AdminGroupPage({ params }: { params: { groupId: string } }) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  // Verify this user is actually admin of this group
  const { data: groupCheck } = await sbAdmin()
    .from("groups")
    .select("admin_id, name")
    .eq("id", params.groupId)
    .single();

  if (!groupCheck) redirect("/groups");
  if ((groupCheck as { admin_id: string }).admin_id !== userProfile.id) redirect("/dashboard");

  const groupId = params.groupId;
  const [group, members] = await Promise.all([
    getGroup(groupId),
    getMembers(groupId),
  ]);

  const tournamentLocked = new Date() >= new Date("2026-06-11T20:00:00Z");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link href={`/groups/${groupId}`}
          className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1"
          style={{ color: "#0891B2" }}>
          ← {group.name}
        </Link>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Admin Panel
        </h1>
        {tournamentLocked && (
          <p className="text-sm mt-1 font-bold" style={{ color: "#d97706" }}>
            ⚠ Tournament has started — scoring rules are locked
          </p>
        )}
      </div>

      {/* Member management */}
      <AdminPanel group={group} initialMembers={members} />

      {/* Group settings — buy-in, prize split */}
      <GroupRulesEditor
        groupId={group.id}
        buyInAmount={group.buyInAmount}
        memberCount={members.length}
      />

      {/* Scoring rules — locked after June 11 */}
      {!tournamentLocked ? (
        <ScoringRulesEditor groupId={group.id} />
      ) : (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(217,119,6,0.2)" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#d97706" }}>
            Scoring Rules — Locked
          </div>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Scoring rules are locked once the tournament starts. Members can view them in the group page.
          </p>
        </div>
      )}

      {/* Tournament pick overrides */}
      <div>
        <div className="label-caps mb-3">Tournament Pick Overrides</div>
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <PickOverridesPanel groupId={groupId} adminId={userProfile.id} />
        </div>
      </div>

      {/* Email members */}
      <WelcomeEmailSender group={group} members={members} adminName={userProfile.name} />

      {/* Export */}
      <div>
        <div className="label-caps mb-3">Export & Download</div>
        <WinnerPoster group={group} members={members} />
      </div>
    </div>
  );
}