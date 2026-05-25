"use client";

import { motion } from "framer-motion";
import { Brain, Trophy, Clock } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { cn } from "@/lib/utils";

export interface TriviaScore {
  userId:     string;
  name:       string;
  country:    string;
  avatarUrl?: string | null;
  correct:    number;
  total:      number;
  totalTimeMs: number;
  isChampion: boolean;
}

const MOCK_TRIVIA_SCORES: TriviaScore[] = [
  { userId: "1", name: "Amit",  country: "Argentina", correct: 18, total: 20, totalTimeMs: 62000, isChampion: true,  avatarUrl: null },
  { userId: "2", name: "Sarah", country: "Brazil",    correct: 15, total: 20, totalTimeMs: 78000, isChampion: false, avatarUrl: null },
  { userId: "3", name: "John",  country: "England",   correct: 14, total: 20, totalTimeMs: 95000, isChampion: false, avatarUrl: null },
  { userId: "4", name: "Lior",  country: "Israel",    correct: 12, total: 20, totalTimeMs: 71000, isChampion: false, avatarUrl: null },
];

export function ChampionBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={cn("inline-flex items-center justify-center rounded-full", size === "sm" ? "h-5 w-5" : "h-7 w-7")}
      style={{ background: "linear-gradient(135deg, #D4AF37, #F5E06E)", boxShadow: "0 0 10px rgba(212,175,55,0.6)" }}
      title="Trivia Champion">
      <Trophy size={size === "sm" ? 10 : 14} style={{ color: "#7B5E00" }} />
    </motion.div>
  );
}

interface TriviaLeaderboardProps {
  scores?:       TriviaScore[];
  currentUserId?: string;
}

export function TriviaLeaderboard({ scores = MOCK_TRIVIA_SCORES, currentUserId }: TriviaLeaderboardProps) {
  const sorted   = [...scores].sort((a, b) => b.correct - a.correct || a.totalTimeMs - b.totalTimeMs);
  const allPlayed = scores.length > 0 && scores.every(s => s.total > 0);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}>

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Brain size={18} style={{ color: "#00D4FF" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">Trivia Leaderboard</span>
        {allPlayed && (
          <span className="ml-auto text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            All played
          </span>
        )}
      </div>

      {!allPlayed && (
        <div className="px-5 py-2 border-b text-[11px] italic" style={{ borderColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
          Champion badge awarded when all members have played
        </div>
      )}

      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {sorted.map((player, i) => {
          const isCurrentUser = player.userId === currentUserId;
          const pct      = Math.round((player.correct / player.total) * 100);
          const avgTime  = (player.totalTimeMs / player.total / 1000).toFixed(1);

          return (
            <motion.div key={player.userId}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-5 py-3.5 transition-all"
              style={isCurrentUser ? {
                background: "rgba(0,255,136,0.05)",
                borderLeft: "2px solid rgba(0,255,136,0.4)",
                paddingLeft: "calc(1.25rem - 2px)",
              } : undefined}>

              {/* Rank */}
              <span className="w-6 text-center font-display text-lg shrink-0"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                {i + 1}
              </span>

              {/* Avatar + champion badge */}
              <div className="relative shrink-0">
                <MemberAvatar name={player.name} avatarUrl={player.avatarUrl} size="sm" />
                {player.isChampion && (
                  <div className="absolute -top-1.5 -right-1.5"><ChampionBadge size="sm" /></div>
                )}
              </div>

              {/* Name + progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold truncate"
                    style={{ color: isCurrentUser ? "#00FF88" : "rgba(255,255,255,0.85)" }}>
                    {player.name}
                  </span>
                  {player.isChampion && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                      Champion
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88" }}>
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: pct >= 80 ? "#00FF88" : pct >= 60 ? "#fbbf24" : "#f87171" }} />
                  </div>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{pct}%</span>
                </div>
              </div>

              {/* Score + time */}
              <div className="text-right shrink-0">
                <div className="font-display text-white font-black" style={{ fontSize: 22 }}>
                  {player.correct}
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>/{player.total}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] justify-end" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Clock size={9} />{avgTime}s avg
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {scores.length === 0 && (
        <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          No one has played the trivia yet. Be the first!
        </div>
      )}
    </div>
  );
}