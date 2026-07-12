"use client";

import { LeaderboardList } from "@/components/dashboard/leaderboard-list";
import type { Member } from "@/lib/types";

interface LeaderboardProps {
  members:           Member[];
  currentUserId?:    string;
  groupId?:          string;
  groupName?:        string;
  showGhost?:        boolean;
  scrollable?:       boolean; // inner scroll for embedded tiles (dashboard); false = page scrolls
  isAdFree?:         boolean;
  isCorporate?:      boolean;
  showBestThird?:    boolean; // show best-3rd-place stat chip
}

export function Leaderboard(props: LeaderboardProps) {
  return <LeaderboardList variant="full" {...props} />;
}
