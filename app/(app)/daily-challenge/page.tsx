export const dynamic = "force-dynamic";

import { getCurrentUserProfile } from "@/lib/services/user-group";
import { DailyChallengeClient } from "@/components/daily-challenge/daily-challenge-client";
import { ConsumeDailyChallengeParam } from "@/components/daily-challenge/consume-daily-challenge-param";

// Fully anonymous-playable — unlike most (app) pages, this one never
// redirects or gates on `profile` being null. Group Streak/Titles/chat
// nudges only ever activate as a side effect for signed-in group members
// (see the API routes), never as a condition for reaching this page.
export default async function DailyChallengePage() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-6">
      <ConsumeDailyChallengeParam userId={profile?.id ?? null} />
      <DailyChallengeClient userId={profile?.id ?? null} />
    </div>
  );
}
