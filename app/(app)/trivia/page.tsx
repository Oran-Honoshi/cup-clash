export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { TriviaPageClient } from "@/components/trivia/trivia-page-client";
import { getGroup } from "@/lib/services/groups";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";
import { NoGroupScreen } from "@/components/app/no-group-screen";

export default async function TriviaPage() {
  const [userGroup, userProfile] = await Promise.all([
    getCurrentUserGroup(),
    getCurrentUserProfile(),
  ]);

  if (!userProfile) redirect("/signin");
  if (!userGroup.groupId) return <NoGroupScreen name={userProfile?.name ?? ""} />;

  const groupId = userGroup.groupId;
  const group   = await getGroup(groupId);

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Trivia
        </h1>
      </div>
      <TriviaPageClient
        groupId={groupId}
        groupName={group.name}
        userId={userProfile.id}
        isPointsMode={true}
        triviaOpen={true}
        hasPlayedForPoints={false}
      />
    </div>
  );
}