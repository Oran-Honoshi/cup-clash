"use client";

import { useEffect, useRef, useState } from "react";
import { OracleCaptainResultPopup } from "@/components/fantasy/oracle-captain-result-popup";
import { wasCelebrated, markCelebrated } from "@/lib/oracle-captain-celebration-storage";
import type { LatestOracleCaptainResult } from "@/lib/services/fantasy-gameweek-picks";

// Mirrors components/game/oracle-duel-celebration-trigger.tsx — mounted
// once in app/(app)/layout.tsx alongside it.
export function OracleCaptainCelebrationTrigger() {
  const [result, setResult] = useState<LatestOracleCaptainResult | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    (async () => {
      const res = await fetch("/api/fantasy/oracle-captain/latest-result", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { result: LatestOracleCaptainResult | null };
      if (!data.result || wasCelebrated(data.result.scoreId)) return;
      setResult(data.result);
    })();
  }, []);

  if (!result) return null;

  return (
    <OracleCaptainResultPopup
      result={result}
      onDismiss={() => {
        markCelebrated(result.scoreId);
        setResult(null);
      }}
    />
  );
}
