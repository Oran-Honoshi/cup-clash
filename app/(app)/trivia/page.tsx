export const dynamic = "force-dynamic";

import { TriviaPageClient } from "@/components/trivia/trivia-page-client";

export default function TriviaPage() {
  // In production: load group trivia settings from Supabase
  // For now: default config for testing
  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">World Cup 2026</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight sr-only">
          Trivia
        </h1>
      </div>

      <TriviaPageClient
        groupId="grp_titans"
        groupName="Tech Titans World Cup"
        userId="user_1"
        isPointsMode={true}
        triviaOpen={true}
        hasPlayedForPoints={false}
      />
    </div>
  );
}
