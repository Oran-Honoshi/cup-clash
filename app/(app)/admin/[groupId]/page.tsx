export const dynamic = "force-dynamic";

import { redirect }            from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { AdminPanel }          from "@/components/admin/admin-panel";
import { ScoringRulesEditor }  from "@/components/admin/scoring-rules-editor";
import { GroupRulesEditor }    from "@/components/admin/group-rules-editor";
import { PickOverridesPanel }  from "@/components/admin/pick-overrides-panel";
import { MatchOverridePanel }  from "@/components/admin/match-override-panel";
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
  if (!userProfile) redirect("/signup");

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
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "white" }}>
          Admin Panel
        </h1>
        {tournamentLocked && (
          <p className="text-sm mt-1 font-bold" style={{ color: "#d97706" }}>
            ⚠ Tournament has started. Scoring rules are locked.
          </p>
        )}
      </div>

      {/* Member management */}
      <AdminPanel group={group} initialMembers={members} />

      {/* Group settings: buy-in, prize split */}
      <GroupRulesEditor
        groupId={group.id}
        buyInAmount={group.buyInAmount}
        memberCount={members.length}
      />

      {/* Scoring rules: locked after June 11 */}
      {!tournamentLocked ? (
        <ScoringRulesEditor groupId={group.id} />
      ) : (
        <div className="rounded-2xl p-5"
          style={{
            background: "rgba(18,14,38,0.32)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(217,119,6,0.2)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
            borderRadius: 28,
          }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#d97706" }}>
            Scoring Rules (Locked)
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Scoring rules are locked once the tournament starts. Members can view them in the group page.
          </p>
        </div>
      )}

      {/* Match score overrides */}
      <div>
        <div className="label-caps mb-3">Correct a Match Result</div>
        <div className="rounded-2xl p-5"
          style={{
            background: "rgba(18,14,38,0.32)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(251,191,36,0.15)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
            borderRadius: 28,
          }}>
          <MatchOverridePanel groupId={groupId} />
        </div>
      </div>

      {/* Tournament pick overrides */}
      <div>
        <div className="label-caps mb-3">Tournament Pick Overrides</div>
        <div className="rounded-2xl p-5"
          style={{
            background: "rgba(18,14,38,0.32)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
            borderRadius: 28,
          }}>
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