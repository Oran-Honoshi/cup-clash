"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MemberAvatar } from "@/components/ui/member-avatar";

interface PredictionDistributionProps {
  matchId: string;
  groupId: string;
}

interface ScoreDist {
  score: string;
  pct: number;
}

interface MemberPred {
  userId:    string;
  name:      string;
  avatarUrl: string | null;
  homeScore: number;
  awayScore: number;
}

const wrapperStyle = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: "1px solid rgba(255,255,255,0.07)",
  maxWidth: "100%",
  overflow: "hidden",
} as const;

const labelStyle = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.3)",
  fontFamily: "var(--font-ui)",
  marginBottom: 8,
} as const;

export function PredictionDistribution({ matchId, groupId }: PredictionDistributionProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [dist, setDist]             = useState<ScoreDist[]>([]);
  const [memberPreds, setMemberPreds] = useState<MemberPred[]>([]);
  const [ready, setReady]           = useState(false);

  useEffect(() => {
    if (!matchId || !groupId) return;
    let cancelled = false;
    const sb = createClient();

    async function load() {
      // Step 1: check match status to determine reveal mode
      const { data: matchData } = await sb
        .from("matches")
        .select("status")
        .eq("id", matchId)
        .maybeSingle();

      if (cancelled) return;
      const revealed = matchData?.status === "live" || matchData?.status === "finished";
      setIsRevealed(revealed);

      if (revealed) {
        // Step 2a: fetch all member predictions with names
        const [predsRes, profilesRes] = await Promise.all([
          sb.from("group_predictions")
            .select("user_id, home_score, away_score")
            .eq("match_id", matchId)
            .eq("group_id", groupId)
            .not("home_score", "is", null)
            .not("away_score", "is", null),
          sb.from("group_members")
            .select("user_id, profiles(name, avatar_url)")
            .eq("group_id", groupId),
        ]);

        if (cancelled) return;

        const preds = (predsRes.data ?? []) as {
          user_id: string; home_score: number; away_score: number;
        }[];
        const gm = (profilesRes.data ?? []) as {
          user_id: string;
          profiles: { name: string; avatar_url: string | null } | null;
        }[];

        const memberMap: Record<string, { name: string; avatarUrl: string | null }> = {};
        gm.forEach(m => {
          if (m.profiles) memberMap[m.user_id] = { name: m.profiles.name, avatarUrl: m.profiles.avatar_url };
        });

        const named: MemberPred[] = preds
          .filter(p => memberMap[p.user_id])
          .map(p => ({
            userId:    p.user_id,
            name:      memberMap[p.user_id].name,
            avatarUrl: memberMap[p.user_id].avatarUrl,
            homeScore: p.home_score,
            awayScore: p.away_score,
          }));

        setMemberPreds(named);
      } else {
        // Step 2b: anonymous score distribution for upcoming matches
        const { data } = await sb
          .from("group_predictions")
          .select("home_score, away_score")
          .eq("match_id", matchId)
          .eq("group_id", groupId)
          .not("home_score", "is", null)
          .not("away_score", "is", null);

        if (cancelled) return;
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
      }

      setReady(true);
    }

    load();
    return () => { cancelled = true; };
  }, [matchId, groupId]);

  if (!ready) return null;

  // ── Revealed: named predictions ──────────────────────────────────────────────
  if (isRevealed) {
    if (memberPreds.length === 0) return null;
    return (
      <div style={wrapperStyle}>
        <div style={labelStyle}>What your group predicted</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {memberPreds.map(m => (
            <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} size="xs" />
              <span style={{
                fontSize: 11, flex: 1,
                color: "rgba(255,255,255,0.6)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {m.name}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>
                {m.homeScore}–{m.awayScore}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Upcoming: anonymous distribution ─────────────────────────────────────────
  if (dist.length === 0) return null;
  return (
    <div style={wrapperStyle}>
      <div style={labelStyle}>What your group predicted</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {dist.map(({ score, pct }) => (
          <div
            key={score}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "3px 9px", borderRadius: 20,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
              {score}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
