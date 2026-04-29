export const dynamic = "force-dynamic";

import { AdminPanel } from "@/components/admin/admin-panel";
import { ScoringRulesEditor } from "@/components/admin/scoring-rules-editor";
import { GroupRulesEditor } from "@/components/admin/group-rules-editor";
import { WelcomeEmailSender } from "@/components/admin/welcome-email-sender";
import { WinnerPoster } from "@/components/export/winner-poster";
import { getGroup, getMembers } from "@/lib/services/groups";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";

export default async function AdminPage() {
  const { groupId } = await getCurrentUserGroup();
  const userProfile  = await getCurrentUserProfile();
  const [group, members] = await Promise.all([
    getGroup(groupId),
    getMembers(groupId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Admin Panel
        </h1>
      </div>
      <AdminPanel group={group} initialMembers={members} />
      <GroupRulesEditor
        groupId={group.id}
        buyInAmount={group.buyInAmount}
        memberCount={members.length}
      />
      <ScoringRulesEditor groupId={group.id} />
      <WelcomeEmailSender
        group={group}
        members={members}
        adminName={userProfile?.name ?? "Admin"}
      />
      <div>
        <div className="label-caps mb-3">Export & Download</div>
        <WinnerPoster group={group} members={members} />
      </div>
    </div>
  );
}
