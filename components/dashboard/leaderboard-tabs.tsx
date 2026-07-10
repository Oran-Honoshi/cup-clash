"use client";

import { useState } from "react";
import { Trophy, Star, Users, Brain } from "lucide-react";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { TopScorersLeaderboard, TopAssistersLeaderboard } from "@/components/dashboard/player-stats-leaderboard";
import { TriviaLeaderboard } from "@/components/trivia/trivia-leaderboard";
import { FOCUS_RING_INSET } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

type Tab = "predictions" | "scorers" | "assisters" | "trivia";

const TABS: Array<{ id: Tab; label: string; mobileLabel: string; icon: typeof Trophy }> = [
  { id: "predictions", label: "Predictions", mobileLabel: "Picks",   icon: Trophy  },
  { id: "scorers",     label: "Scorers",     mobileLabel: "Goals",   icon: Star    },
  { id: "assisters",   label: "Assisters",   mobileLabel: "Assists", icon: Users   },
  { id: "trivia",      label: "Trivia",      mobileLabel: "Trivia",  icon: Brain   },
];

interface LeaderboardTabsProps {
  members: Member[];
  currentUserId?: string;
  groupId?: string;
  isAdFree?: boolean;
  isCorporate?: boolean;
}

export function LeaderboardTabs({ members, currentUserId, groupId, isAdFree, isCorporate }: LeaderboardTabsProps) {
  const [active, setActive] = useState<Tab>("predictions");

  return (
    <div className="space-y-5">
      {/* Tab bar — independent floating pills, no shared bar behind them */}
      <div
        role="tablist"
        aria-label="Leaderboard view"
        className="flex gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "ta-subtab-label flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 rounded-xl transition-all duration-200",
              FOCUS_RING_INSET,
            )}
            style={active === tab.id ? {
              background: "rgb(var(--accent) / 0.15)",
              color: "rgb(var(--accent-glow))",
              border: "1px solid rgb(var(--accent) / 0.35)",
              boxShadow: "0 2px 12px -1px rgb(var(--accent) / 0.3)",
            } : {
              background: "var(--sf)",
              color: "var(--mt)",
              border: "1px solid var(--br)",
              boxShadow: "0 1px 6px -1px var(--shad)",
            }}
            onMouseEnter={(e) => { if (active !== tab.id) e.currentTarget.style.color = "var(--t2)"; }}
            onMouseLeave={(e) => { if (active !== tab.id) e.currentTarget.style.color = "var(--mt)"; }}
          >
            <tab.icon size={14} />
            <span className="sm:hidden">{tab.mobileLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "predictions" && (
        <Leaderboard members={members} currentUserId={currentUserId} groupId={groupId} isAdFree={isAdFree} isCorporate={isCorporate} />
      )}
      {active === "scorers"     && <TopScorersLeaderboard />}
      {active === "assisters"   && <TopAssistersLeaderboard />}
      {active === "trivia"      && <TriviaLeaderboard currentUserId={currentUserId} />}
    </div>
  );
}