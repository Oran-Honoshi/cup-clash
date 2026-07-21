"use client";

import { useEffect, useRef, useState } from "react";
import { OracleDuelResultPopup } from "@/components/game/oracle-duel-result-popup";
import { wasCelebrated, markCelebrated } from "@/lib/oracle-duel-celebration-storage";
import type { LatestResolvedOracleDuel } from "@/lib/services/oracle-duels";

// Mounted once in app/(app)/layout.tsx alongside ReengagementSheet — same
// "fetch its own eligibility on mount" pattern. The push half of this win/
// lose/draw notification already exists (scores cron STEP 4c); this is only
// the in-app modal for whoever opens the app before/without seeing the push.
export function OracleDuelCelebrationTrigger() {
  const [result, setResult] = useState<LatestResolvedOracleDuel | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    (async () => {
      const res = await fetch("/api/oracle-duels/latest-result", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { result: LatestResolvedOracleDuel | null };
      if (!data.result || wasCelebrated(data.result.duelId)) return;
      setResult(data.result);
    })();
  }, []);

  if (!result) return null;

  return (
    <OracleDuelResultPopup
      result={result}
      onDismiss={() => {
        markCelebrated(result.duelId);
        setResult(null);
      }}
    />
  );
}
