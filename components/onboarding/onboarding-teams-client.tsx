"use client";

import { useTransition } from "react";
import { TeamPicker } from "@/components/teams/team-picker";
import { BallLoader } from "@/components/ui/BallLoader";
import { completeOnboarding } from "@/app/onboarding/teams/actions";
import type { CompetitionTeams } from "@/lib/services/teams";

interface OnboardingTeamsClientProps {
  next: string;
  userId: string;
  teamGroups: CompetitionTeams[];
  followedTeamIds: Set<string>;
}

export function OnboardingTeamsClient({ next, userId, teamGroups, followedTeamIds }: OnboardingTeamsClientProps) {
  const [pending, startTransition] = useTransition();

  const finish = () => startTransition(() => completeOnboarding(next));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ac)", marginBottom: 4 }}>
            Welcome to Cup Clash
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
            Pick your teams
          </h1>
          <p style={{ fontSize: 14, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4, maxWidth: 480 }}>
            Follow a few teams to personalize your news feed and see their results on Home. You can always change this later.
          </p>
        </div>
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--mt)",
            background: "none",
            border: "none",
            cursor: pending ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            padding: "8px 4px",
            textDecoration: "underline",
          }}
        >
          Skip for now
        </button>
      </div>

      <TeamPicker groups={teamGroups} userId={userId} followedTeamIds={followedTeamIds} />

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          className="inline-flex items-center gap-2 font-bold uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            padding: "12px 24px",
            borderRadius: 100,
            background: "var(--ac)",
            color: "var(--at)",
            border: "none",
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? <BallLoader size="inline" label={null} /> : "Continue"}
        </button>
      </div>
    </div>
  );
}
