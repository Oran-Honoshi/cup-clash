"use client";

import { useEffect, useState } from "react";
import { Gift, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MemberAvatar } from "@/components/ui/member-avatar";

interface GroupStageLeader {
  userId:   string;
  name:     string;
  avatar:   string | null;
  points:   number;
}

interface Props {
  groupId:     string;
  prizeAmount: number | null;
  prizeLabel:  string | null;
  currencySymbol: string;
  isCashGroup: boolean;
}

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(167,139,250,0.25)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14)",
  borderRadius: 22,
} as const;

// Group stage runs through the 48 group stage matches — ends approximately July 2, 2026
const GROUP_STAGE_END = new Date("2026-07-02T23:59:00Z");

export function GroupStagePrizeCard({ groupId, prizeAmount, prizeLabel, currencySymbol, isCashGroup }: Props) {
  const [leaders, setLeaders] = useState<GroupStageLeader[]>([]);
  const [loading, setLoading] = useState(true);

  const isComplete = new Date() > GROUP_STAGE_END;

  useEffect(() => {
    const sb = createClient();
    async function load() {
      // 1. Get all group stage match IDs
      const { data: matches } = await sb
        .from("matches")
        .select("id")
        .eq("stage", "Group");

      const matchIds = (matches ?? []).map((m: { id: string }) => m.id);
      if (!matchIds.length) { setLoading(false); return; }

      // 2. Sum points_earned per user for group stage matches only
      const { data: preds } = await sb
        .from("group_predictions")
        .select("user_id, points_earned")
        .eq("group_id", groupId)
        .in("match_id", matchIds);

      if (!preds?.length) { setLoading(false); return; }

      // Aggregate
      const totals: Record<string, number> = {};
      for (const p of preds as Array<{ user_id: string; points_earned: number }>) {
        totals[p.user_id] = (totals[p.user_id] ?? 0) + (p.points_earned ?? 0);
      }

      // Top 3 user IDs by group stage points
      const topIds = Object.entries(totals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([uid]) => uid);

      if (!topIds.length) { setLoading(false); return; }

      // 3. Fetch profiles for those users
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", topIds);

      const profileMap: Record<string, { name: string; avatar: string | null }> = {};
      for (const pr of profiles ?? []) {
        const p = pr as { id: string; display_name: string; avatar_url: string | null };
        profileMap[p.id] = { name: p.display_name, avatar: p.avatar_url };
      }

      setLeaders(
        topIds.map(uid => ({
          userId: uid,
          name:   profileMap[uid]?.name ?? "Member",
          avatar: profileMap[uid]?.avatar ?? null,
          points: totals[uid],
        }))
      );
      setLoading(false);
    }
    load();
  }, [groupId]);

  const prizeText = isCashGroup
    ? (prizeAmount ? `${currencySymbol}${prizeAmount}` : null)
    : prizeLabel;

  const RANK_COLORS = ["#fbbf24", "#94a3b8", "#f97316"];
  const RANK_LABELS = ["1st", "2nd", "3rd"];

  return (
    <div className="p-5 space-y-4" style={glassCard}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift size={18} style={{ color: "#a78bfa" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>
            Group Stage Prize
          </span>
        </div>
        {prizeText && (
          <span className="text-xs font-black px-2.5 py-1 rounded-full"
            style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", fontFamily: "var(--font-mono)", border: "1px solid rgba(167,139,250,0.2)" }}>
            {prizeText}
          </span>
        )}
      </div>

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {isComplete
          ? "Group stage is complete. Final standings below."
          : "Standings after group stage matches (ends ~July 2). Leader wins the prize."}
      </p>

      {/* Leaderboard */}
      {loading ? (
        <div className="text-xs text-center py-3 animate-pulse" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading standings…
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-xs text-center py-3" style={{ color: "rgba(255,255,255,0.3)" }}>
          No group stage points yet — check back after June 11
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((m, i) => {
            const color = RANK_COLORS[i] ?? "rgba(255,255,255,0.4)";
            return (
              <div key={m.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: i === 0 ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.03)",
                  border: i === 0 ? "1px solid rgba(251,191,36,0.15)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                {i === 0
                  ? <Crown size={16} style={{ color, flexShrink: 0 }} />
                  : <span className="text-[10px] font-black w-4 text-center shrink-0" style={{ color }}>{RANK_LABELS[i]}</span>
                }
                <MemberAvatar name={m.name} avatarUrl={m.avatar} size="sm" />
                <span className="flex-1 text-sm font-bold truncate" style={{ color: i === 0 ? "white" : "rgba(255,255,255,0.8)" }}>
                  {m.name}
                </span>
                <span className="text-sm font-black shrink-0" style={{ color, fontFamily: "var(--font-mono)" }}>
                  {m.points} pts
                </span>
              </div>
            );
          })}
        </div>
      )}

      {isComplete && leaders[0] && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <Crown size={14} style={{ color: "#fbbf24" }} />
          <span className="text-xs font-bold" style={{ color: "#fbbf24" }}>
            🏅 {leaders[0].name} wins the group stage prize!
          </span>
        </div>
      )}
    </div>
  );
}
