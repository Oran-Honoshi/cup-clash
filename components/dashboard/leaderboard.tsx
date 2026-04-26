import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

interface LeaderboardProps {
  members: Member[];
  currentUserId?: string;
}

const RANK_COLORS = [
  "from-yellow-400 to-yellow-600",   // 1st — gold
  "from-slate-300 to-slate-500",      // 2nd — silver
  "from-amber-600 to-amber-800",      // 3rd — bronze
];

const RANK_GLOWS = [
  "0 0 20px rgba(250, 204, 21, 0.4)",
  "0 0 20px rgba(148, 163, 184, 0.3)",
  "0 0 20px rgba(180, 83, 9, 0.35)",
];

export function Leaderboard({ members, currentUserId }: LeaderboardProps) {
  const sorted = [...members].sort((a, b) => b.points - a.points);

  return (
    <Card variant="glass" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <Trophy size={18} style={{ color: "rgb(var(--accent-glow))" }} />
          <span className="font-display text-xl uppercase text-white tracking-tight">
            Leaderboard
          </span>
        </div>
        <span className="label-caps">{sorted.length} players</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {sorted.map((member, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          const isCurrentUser = member.id === currentUserId;
          const delta = 0; // placeholder — will come from real data

          return (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-4 px-5 py-3.5 transition-colors",
                isCurrentUser
                  ? "bg-white/[0.04]"
                  : "hover:bg-white/[0.02]"
              )}
              style={
                isCurrentUser
                  ? { borderLeft: "2px solid rgb(var(--accent))" }
                  : undefined
              }
            >
              {/* Rank */}
              <div className="w-8 shrink-0 flex justify-center">
                {isTop3 ? (
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-b",
                      RANK_COLORS[i]
                    )}
                    style={{ boxShadow: RANK_GLOWS[i] }}
                  >
                    {rank}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-pitch-500 tabular">
                    {rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))",
                  opacity: isCurrentUser ? 1 : 0.7,
                }}
              >
                {member.name.charAt(0)}
              </div>

              {/* Name + country */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold truncate",
                      isCurrentUser ? "text-white" : "text-pitch-200"
                    )}
                  >
                    {member.name}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-pitch-300">
                      You
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-pitch-500 truncate">
                  {member.country}
                </div>
              </div>

              {/* Delta */}
              <div className="shrink-0">
                {delta > 0 ? (
                  <TrendingUp size={14} className="text-success" />
                ) : delta < 0 ? (
                  <TrendingDown size={14} className="text-danger" />
                ) : (
                  <Minus size={14} className="text-pitch-600" />
                )}
              </div>

              {/* Points */}
              <div className="shrink-0 text-right">
                <div
                  className="font-display text-2xl tabular leading-none"
                  style={
                    isTop3
                      ? { color: "rgb(var(--accent-glow))" }
                      : undefined
                  }
                >
                  {member.points}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-pitch-500">
                  pts
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
