import type { NudgeId } from "@/lib/nudges/types";
import { wasShownToday as wasReengagementShownToday, markShownToday as markReengagementShownToday } from "@/lib/reengagement-storage";
import { wasHouseInviteDismissed } from "@/lib/house-group-storage";
import { wasNudgeShownToday as wasOracleDuelNudgeShownToday, markNudgeShownToday as markOracleDuelNudgeShownToday } from "@/lib/oracle-duel-nudge-storage";
import { wasNudgeShownToday as wasPickFollowsShownToday, markNudgeShownToday as markPickFollowsShownToday, isNudgeOptedOut as isPickFollowsOptedOut } from "@/lib/pick-follows-nudge-storage";
import { checkReengagement } from "@/lib/nudges/check-reengagement";
import { checkHouseGroupInvite } from "@/lib/nudges/check-house-group";
import { checkOracleDuelNudge } from "@/lib/nudges/check-oracle-duel";
import { checkPickFollows } from "@/lib/nudges/check-pick-follows";

export interface NudgeCandidate {
  id: NudgeId;
  /** Pathnames this nudge is allowed to trigger on. Omit for "any route". */
  routes?: string[];
  /** Cheap synchronous localStorage check (daily cap / permanent dismiss / opt-out). */
  isLocallyEligible: () => boolean;
  /** Async server-truth check. Resolves to a data payload, or null if not eligible. */
  checkEligible: () => Promise<unknown | null>;
  /** Called once this candidate is chosen as the winner, for cadence-capped nudges. */
  markShown?: () => void;
}

// Single source of truth for "which nudge, if any, should show right now" —
// see components/nudges/nudge-coordinator.tsx for the resolver. Array order
// IS priority order (index 0 = highest). To add a 5th nudge: write its own
// check-*.ts + storage helper (existing patterns), then add one entry below —
// nothing else in the coordinator needs to change.
//
// Priority reasoning:
//   1. Reengagement   — core retention, time-boxed to a real event (a match
//                        result within a 30-min freshness window); stalest if suppressed.
//   2. House-group     — converts a user into a group, the app's core loop;
//                        shown until dismissed/joined so a missed turn isn't fatal,
//                        but still outranks pure feature-discovery nudges.
//   3. Oracle Duel     — feature-discovery, but time-boxed to a specific
//                        featured match that rotates daily.
//   4. Pick-your-follows — lowest-stakes personalization nudge, no decay:
//                        it re-qualifies every day until acted on or opted out.
export const NUDGE_REGISTRY: NudgeCandidate[] = [
  {
    id: "reengagement",
    isLocallyEligible: () => !wasReengagementShownToday(),
    checkEligible: checkReengagement,
    markShown: markReengagementShownToday,
  },
  {
    id: "house-group",
    routes: ["/home", "/game"],
    isLocallyEligible: () => !wasHouseInviteDismissed(),
    checkEligible: checkHouseGroupInvite,
    // No markShown — house-group has no daily cap, only permanent
    // dismiss-on-close/join (handled inside the sheet itself).
  },
  {
    id: "oracle-duel",
    isLocallyEligible: () => !wasOracleDuelNudgeShownToday(),
    checkEligible: checkOracleDuelNudge,
    markShown: markOracleDuelNudgeShownToday,
  },
  {
    id: "pick-follows",
    routes: ["/home"],
    isLocallyEligible: () => !isPickFollowsOptedOut() && !wasPickFollowsShownToday(),
    checkEligible: checkPickFollows,
    markShown: markPickFollowsShownToday,
  },
];
