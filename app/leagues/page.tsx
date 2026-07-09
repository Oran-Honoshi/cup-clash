export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CompetitionPicker } from "@/components/leagues/competition-picker";
import { ConsumeFollowParam } from "@/components/leagues/consume-follow-param";
import { getCompetitions } from "@/lib/services/competitions";
import { getFollowedCompetitionIds } from "@/lib/services/follows";

export default async function LeaguesPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? null;

  const [competitions, followedCompetitionIds] = await Promise.all([
    getCompetitions(),
    getFollowedCompetitionIds(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ac)", marginBottom: 4 }}>
          Choose your leagues
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
          Follow what you care about
        </h1>
        <p style={{ fontSize: 14, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          Follow a competition to personalize your news feed. {!userId && "You'll be asked to create a free account to save it."}
        </p>
      </div>

      <ConsumeFollowParam userId={userId} />

      <CompetitionPicker
        competitions={competitions}
        activeSlug=""
        basePath="/leagues"
        userId={userId}
        followedCompetitionIds={followedCompetitionIds}
        variant="cards"
      />
    </div>
  );
}
