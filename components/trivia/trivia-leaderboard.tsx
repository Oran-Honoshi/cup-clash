"use client";

import { motion } from "framer-motion";
import { Brain, Trophy, Clock, Crown } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TriviaScore {
  userId: string;
  name: string;
  country: string;
  avatarUrl?: string | null;
  correct: number;
  total: number;
  totalTimeMs: number;  // for tie-breaking
  isChampion: boolean;
}

// Mock data — will come from Supabase trivia_scores table
const MOCK_TRIVIA_SCORES: TriviaScore[] = [
  { userId: "1", name: "Amit",  country: "Argentina", correct: 18, total: 20, totalTimeMs: 62000, isChampion: true,  avatarUrl: null },
  { userId: "2", name: "Sarah", country: "Brazil",    correct: 15, total: 20, totalTimeMs: 78000, isChampion: false, avatarUrl: null },
  { userId: "3", name: "John",  country: "England",   correct: 14, total: 20, totalTimeMs: 95000, isChampion: false, avatarUrl: null },
  { userId: "4", name: "Lior",  country: "Israel",    correct: 12, total: 20, totalTimeMs: 71000, isChampion: false, avatarUrl: null },
];

// Champion badge — pulsing trophy
export function ChampionBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        size === "sm" ? "h-5 w-5" : "h-7 w-7"
      )}
      style={{
        background: "linear-gradient(135deg, #D4AF37, #F5E06E)",
        boxShadow: "0 0 10px rgba(212,175,55,0.6)",
      }}
      title="Trivia Champion"
    >
      <Trophy size={size === "sm" ? 10 : 14} style={{ color: "#7B5E00" }} />
    </motion.div>
  );
}

interface TriviaLeaderboardProps {
  scores?: TriviaScore[];
  currentUserId?: string;
}

export function TriviaLeaderboard({ scores = MOCK_TRIVIA_SCORES, currentUserId }: TriviaLeaderboardProps) {
  const sorted = [...scores].sort((a, b) =>
    b.correct - a.correct || a.totalTimeMs - b.totalTimeMs
  );

  const allPlayed = scores.length > 0 && scores.every(s => s.total > 0);

  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
        <Brain size={18} style={{ color: "rgb(var(--accent-glow))" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">
          Trivia Leaderboard
        </span>
        {allPlayed && (
          <span className="ml-auto text-[10px] text-pitch-500 uppercase tracking-widest">
            All played
          </span>
        )}
      </div>

      {!allPlayed && (
        <div className="px-5 py-2 border-b border-white/[0.04] text-[11px] text-pitch-500 italic">
          Champion badge awarded when all members have played
        </div>
      )}

      <div className="divide-y divide-white/[0.04]">
        {sorted.map((player, i) => {
          const isCurrentUser = player.userId === currentUserId;
          const pct = Math.round((player.correct / player.total) * 100);
          const avgTime = (player.totalTimeMs / player.total / 1000).toFixed(1);

          return (
            <motion.div key={player.userId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "flex items-center gap-3 px-5 py-3.5 transition-colors",
                isCurrentUser && "bg-white/[0.03]"
              )}
              style={isCurrentUser ? { borderLeft: "2px solid rgb(var(--accent))" } : undefined}
            >
              {/* Rank */}
              <span className="w-6 text-center font-display text-lg text-pitch-500 shrink-0">
                {i + 1}
              </span>

              {/* Avatar + champion badge */}
              <div className="relative shrink-0">
                <MemberAvatar name={player.name} avatarUrl={player.avatarUrl} size="sm" />
                {player.isChampion && (
                  <div className="absolute -top-1.5 -right-1.5">
                    <ChampionBadge size="sm" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-bold truncate",
                    isCurrentUser ? "text-white" : "text-pitch-200")}>
                    {player.name}
                  </span>
                  {player.isChampion && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                      Champion
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-pitch-300 shrink-0">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Progress bar */}
                  <div className="w-16 h-1 rounded-full bg-white/[0.08] overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444",
                      }} />
                  </div>
                  <span className="text-[10px] text-pitch-600">{pct}%</span>
                </div>
              </div>

              {/* Score + time */}
              <div className="text-right shrink-0">
                <div className="font-display text-2xl text-white">
                  {player.correct}
                  <span className="text-pitch-500 text-sm">/{player.total}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-pitch-600 justify-end">
                  <Clock size={9} />
                  {avgTime}s avg
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {scores.length === 0 && (
        <div className="px-5 py-8 text-center text-pitch-500 text-sm">
          No one has played the trivia yet. Be the first!
        </div>
      )}
    </Card>
  );
}