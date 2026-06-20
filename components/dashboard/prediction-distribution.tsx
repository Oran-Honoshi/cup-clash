"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PredictionDistributionProps {
  matchId: string;
  groupId: string;
}

interface ScoreDist {
  score: string;
  pct: number;
}

export function PredictionDistribution({ matchId, groupId }: PredictionDistributionProps) {
  const [dist, setDist] = useState<ScoreDist[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!matchId || !groupId) return;
    const sb = createClient();
    sb.from("group_predictions")
      .select("home_score, away_score")
      .eq("match_id", matchId)
      .eq("group_id", groupId)
      .not("home_score", "is", null)
      .not("away_score", "is", null)
      .then(({ data }) => {
        if (!data) { setReady(true); return; }
        const rows = data as { home_score: number; away_score: number }[];
        const total = rows.length;
        if (total < 3) { setReady(true); return; }

        const map: Record<string, number> = {};
        for (const r of rows) {
          const key = `${r.home_score}–${r.away_score}`;
          map[key] = (map[key] ?? 0) + 1;
        }

        const top5 = Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([score, cnt]) => ({ score, pct: Math.round((cnt / total) * 100) }));

        setDist(top5);
        setReady(true);
      });
  }, [matchId, groupId]);

  if (!ready || dist.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "var(--font-ui)",
          marginBottom: 8,
        }}
      >
        Group predictions
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {dist.map(({ score, pct }) => (
          <div
            key={score}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 11,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-ui)",
                fontWeight: 600,
              }}
            >
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
