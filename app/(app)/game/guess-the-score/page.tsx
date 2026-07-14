export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { GuessTheScoreClient } from "@/components/game/guess-the-score-client";

// Fully anonymous-playable, same contract as /daily-challenge — never
// redirects or gates on `profile` being null.
export default async function GuessTheScorePage() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-6">
      <Link href="/game" className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--t2)" }}>
        <ChevronLeft size={14} /> Game Room
      </Link>
      <GuessTheScoreClient userId={profile?.id ?? null} />
    </div>
  );
}
