"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { matchInGroupScope, type ScheduleMatch } from "@/lib/schedule";

interface RecentResultsStripProps {
  groupId: string;
  userId: string;
  groupCompetitionId?: string | null;
  allMatches: ScheduleMatch[];
  limit?: number;
}

type PredRow = { match_id: string; home_score: number; away_score: number; points_earned: number | null; is_exact: boolean | null };

// Compact "what just happened" companion to the Next Match Hero above it —
// deliberately NOT a re-add of MatchResultsTable's full member-comparison
// grid (removed in 1c78fb2 for being redundant with the Group Predictions
// sub-sector); this shows only the viewer's own pick outcome, single column.
export function RecentResultsStrip({ groupId, userId, groupCompetitionId = null, allMatches, limit = 5 }: RecentResultsStripProps) {
  const [predsByMatch, setPredsByMatch] = useState<Record<string, PredRow>>({});
  const [loaded, setLoaded] = useState(false);

  const recent = useMemo(() => {
    return allMatches
      .filter(m => m.status === "finished" && matchInGroupScope(m.stage, m.competitionId, groupCompetitionId))
      .sort((a, b) => b.kickoff_at.localeCompare(a.kickoff_at))
      .slice(0, limit);
  }, [allMatches, groupCompetitionId, limit]);

  const matchIdsKey = recent.map(m => m.id).join(",");

  useEffect(() => {
    if (!recent.length) { setLoaded(true); return; }
    let cancelled = false;
    createClient()
      .from("group_predictions")
      .select("match_id, home_score, away_score, points_earned, is_exact")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .in("match_id", recent.map(m => m.id))
      .then(({ data }) => {
        if (cancelled) return;
        const map: Record<string, PredRow> = {};
        for (const row of (data ?? []) as PredRow[]) map[row.match_id] = row;
        setPredsByMatch(map);
        setLoaded(true);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, userId, matchIdsKey]);

  if (!loaded || recent.length === 0) return null;

  return (
    <div className="pb-4">
      <div className="ta-section-label mb-2">Recent Results</div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
        {recent.map((m, i) => {
          const pred = predsByMatch[m.id];
          return (
            <div key={m.id} className="flex items-center gap-2 px-3 py-2.5"
              style={i > 0 ? { borderTop: "1px solid var(--br)" } : undefined}>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span className="text-xs font-bold truncate" style={{ color: "var(--tx)" }}>{m.home}</span>
                <FlagBadge code={m.homeFlagCode} size="sm" />
              </div>
              <div className="font-mono font-black text-sm shrink-0 px-1.5 tabular-nums" style={{ color: "var(--tx)" }}>
                {m.home_score}–{m.away_score}
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <FlagBadge code={m.awayFlagCode} size="sm" />
                <span className="text-xs font-bold truncate" style={{ color: "var(--tx)" }}>{m.away}</span>
              </div>
              <div className="shrink-0 w-16 flex justify-end">
                <PredictionBadge pred={pred} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PredictionBadge({ pred }: { pred: PredRow | undefined }) {
  if (!pred) {
    return <span className="text-[10px]" style={{ color: "var(--mt)" }}>No pick</span>;
  }
  const predStr = `${pred.home_score}-${pred.away_score}`;
  const pts = pred.points_earned ?? 0;

  if (pred.is_exact) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
        style={{ background: "color-mix(in srgb, var(--sc) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--sc) 40%, transparent)" }}>
        <Trophy size={10} style={{ color: "var(--sc)", flexShrink: 0 }} />
        <span className="text-[10px] font-bold tabular-nums" style={{ color: "var(--sc)" }}>+{pts}</span>
      </div>
    );
  }
  if (pts > 0) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
        style={{ background: "color-mix(in srgb, var(--ac) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 28%, transparent)" }}>
        <Check size={10} style={{ color: "var(--ac)", flexShrink: 0 }} />
        <span className="text-[10px] font-bold tabular-nums" style={{ color: "var(--ac)" }}>+{pts}</span>
      </div>
    );
  }
  return (
    <div className="px-1.5 py-0.5 rounded-full"
      style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)" }}>
      <span className="text-[10px] font-bold tabular-nums" style={{ color: "#f87171" }}>{predStr}</span>
    </div>
  );
}
