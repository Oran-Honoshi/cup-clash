"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NUDGE_REGISTRY } from "@/lib/nudges/registry";
import type { NudgeId } from "@/lib/nudges/types";
import { ReengagementSheet } from "@/components/reengagement/reengagement-sheet";
import { HouseGroupInviteSheet } from "@/components/house-groups/house-group-invite-sheet";
import { OracleDuelNudgeSheet } from "@/components/game/oracle-duel-nudge-sheet";
import { PickFollowsNudgeSheet } from "@/components/home/pick-follows-nudge-sheet";
import type { ReengagementResult } from "@/lib/nudges/check-reengagement";
import type { HouseGroupNudgeResult } from "@/lib/nudges/check-house-group";
import type { OracleDuelNudgeResult } from "@/lib/nudges/check-oracle-duel";

type Winner =
  | { id: "reengagement"; data: ReengagementResult }
  | { id: "house-group"; data: HouseGroupNudgeResult }
  | { id: "oracle-duel"; data: OracleDuelNudgeResult }
  | { id: "pick-follows"; data: true };

// Replaces 4 independently-mounted, independently-fetching nudge sheets with a
// single resolver: at most one nudge is shown per app session, chosen by
// priority (NUDGE_REGISTRY order) among whichever nudges are currently
// route-eligible and pass their local (localStorage) cap. Mounted once in
// app/(app)/layout.tsx, so it sees every pathname the user visits during
// this session — route-gated nudges (house-group, pick-follows) simply wait
// until their route comes up, same as before, but now arbitrated centrally
// instead of racing.
export function NudgeCoordinator() {
  const pathname = usePathname();
  const [winner, setWinner] = useState<Winner | null>(null);
  const resolvedIds = useRef<Set<NudgeId>>(new Set());
  const hasShown = useRef(false);
  const resolving = useRef(false);

  useEffect(() => {
    if (hasShown.current || resolving.current) return;

    const candidates = NUDGE_REGISTRY.filter(
      (n) =>
        !resolvedIds.current.has(n.id) &&
        (!n.routes || n.routes.includes(pathname)) &&
        n.isLocallyEligible()
    );
    if (candidates.length === 0) return;

    candidates.forEach((c) => resolvedIds.current.add(c.id));
    resolving.current = true;

    (async () => {
      const settled = await Promise.allSettled(candidates.map((c) => c.checkEligible()));
      resolving.current = false;
      if (hasShown.current) return;

      for (let i = 0; i < candidates.length; i++) {
        const result = settled[i];
        if (result.status === "fulfilled" && result.value != null) {
          hasShown.current = true;
          candidates[i].markShown?.();
          setWinner({ id: candidates[i].id, data: result.value } as Winner);
          return;
        }
      }
    })();
  }, [pathname]);

  const close = () => setWinner(null);

  if (!winner) return null;

  switch (winner.id) {
    case "reengagement":
      return <ReengagementSheet data={winner.data} onClose={close} />;
    case "house-group":
      return <HouseGroupInviteSheet data={winner.data} onClose={close} />;
    case "oracle-duel":
      return <OracleDuelNudgeSheet data={winner.data} onClose={close} />;
    case "pick-follows":
      return <PickFollowsNudgeSheet onClose={close} />;
  }
}
