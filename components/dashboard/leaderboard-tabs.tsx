"use client";

import { useState } from "react";
import { Trophy, Star, Users, Brain } from "lucide-react";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { TopScorersLeaderboard, TopAssistersLeaderboard } from "@/components/dashboard/player-stats-leaderboard";
import { TriviaLeaderboard } from "@/components/trivia/trivia-leaderboard";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

type Tab = "predictions" | "scorers" | "assisters" | "trivia";

const TABS: Array<{ id: Tab; label: string; icon: typeof Trophy }> = [
  { id: "predictions", label: "Predictions", icon: Trophy  },
  { id: "scorers",     label: "Scorers",     icon: Star    },
  { id: "assisters",   label: "Assisters",   icon: Users   },
  { id: "trivia",      label: "Trivia",      icon: Brain   },
];

interface LeaderboardTabsProps {
  members: Member[];
  currentUserId?: string;
}

export function LeaderboardTabs({ members, currentUserId = "1" }: LeaderboardTabsProps) {
  const [active, setActive] = useState<Tab>("predictions");

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 glass rounded-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200",
              active === tab.id
                ? "text-white"
                : "text-pitch-500 hover:text-pitch-300"
            )}
            style={active === tab.id ? {
              backgroundColor: "rgb(var(--accent) / 0.15)",
              color: "rgb(var(--accent-glow))",
              boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)",
            } : undefined}
          >
            <tab.icon size={15} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "predictions" && (
        <Leaderboard members={members} currentUserId={currentUserId} />
      )}
      {active === "scorers"     && <TopScorersLeaderboard />}
      {active === "assisters"   && <TopAssistersLeaderboard />}
      {active === "trivia"      && <TriviaLeaderboard currentUserId={currentUserId} />}
    </div>
  );
}