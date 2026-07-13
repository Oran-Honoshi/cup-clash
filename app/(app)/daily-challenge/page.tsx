export const dynamic = "force-dynamic";

import { getCurrentUserProfile, getCurrentUserGroup } from "@/lib/services/user-group";
import { DailyChallengeClient } from "@/components/daily-challenge/daily-challenge-client";
import { ConsumeDailyChallengeParam } from "@/components/daily-challenge/consume-daily-challenge-param";
import { DailyLeaderboardPanel } from "@/components/daily-challenge/daily-leaderboard-panel";

// Fully anonymous-playable — unlike most (app) pages, this one never
// redirects or gates on `profile` being null. Group Streak/Titles/chat
// nudges only ever activate as a side effect for signed-in group members
// (see the API routes), never as a condition for reaching this page.
export default async function DailyChallengePage() {
  const [profile, userGroup] = await Promise.all([getCurrentUserProfile(), getCurrentUserGroup()]);

  return (
    <div className="space-y-6">
      <ConsumeDailyChallengeParam userId={profile?.id ?? null} />
      <DailyChallengeClient userId={profile?.id ?? null} />
      <DailyLeaderboardPanel groupId={userGroup.groupId} />
    </div>
  );
}
