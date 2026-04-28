"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Target } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { flagUrl } from "@/lib/countries";

interface MatchWinner {
  name: string;
  flagCode: string;
  country: string;
  points: number;
  isExact: boolean;
  predicted: string;
}

interface PostMatchPopupProps {
  visible: boolean;
  onDismiss: () => void;
  match: {
    home: string;
    away: string;
    homeFlagCode: string;
    awayFlagCode: string;
    homeScore: number;
    awayScore: number;
  };
  winners: MatchWinner[];
}

export function PostMatchPopup({ visible, onDismiss, match, winners }: PostMatchPopupProps) {
  const isExactWin = winners.some((w) => w.isExact);
  const isTie = winners.length > 1;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onDismiss}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="glass-strong rounded-3xl p-6 max-w-sm w-full pointer-events-auto relative overflow-hidden">
              {/* Gold top bar for exact, accent for outcome */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                style={{ background: isExactWin ? "linear-gradient(90deg, #D4AF37, #F5E06E)" : "linear-gradient(90deg, rgb(var(--brand)), rgb(var(--brand-2)))" }} />

              <button onClick={onDismiss}
                className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-pitch-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>

              {/* Match result */}
              <div className="text-center mb-5">
                <div className="label-caps mb-2">Match Result</div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-5 rounded-sm overflow-hidden">
                      <Image src={flagUrl(match.homeFlagCode, 40)} alt={match.home} fill className="object-cover" unoptimized />
                    </div>
                    <span className="font-display text-lg uppercase text-white">{match.home}</span>
                  </div>
                  <span className="font-display text-3xl text-white px-2">{match.homeScore}–{match.awayScore}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg uppercase text-white">{match.away}</span>
                    <div className="relative w-8 h-5 rounded-sm overflow-hidden">
                      <Image src={flagUrl(match.awayFlagCode, 40)} alt={match.away} fill className="object-cover" unoptimized />
                    </div>
                  </div>
                </div>
              </div>

              {/* Winners */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  {isExactWin
                    ? <Trophy size={18} style={{ color: "#D4AF37" }} />
                    : <Target size={18} style={{ color: "rgb(var(--accent-glow))" }} />
                  }
                  <span className="font-display text-lg uppercase text-white">
                    {isExactWin ? "🎯 Exact score!" : "✓ Correct outcome"}
                    {isTie ? " — It's a tie!" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  {winners.map((w, i) => (
                    <motion.div
                      key={w.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{
                        backgroundColor: "rgb(var(--accent) / 0.08)",
                        borderColor: "rgb(var(--accent) / 0.25)",
                      }}
                    >
                      <div className="relative w-7 h-5 rounded-sm overflow-hidden shrink-0">
                        <Image src={flagUrl(w.flagCode, 40)} alt={w.country} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{w.name}</div>
                        <div className="text-xs text-pitch-400">Predicted: {w.predicted}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl" style={{ color: "rgb(var(--accent-glow))" }}>
                          +{w.points}
                        </div>
                        <div className="text-[10px] text-pitch-500 uppercase tracking-widest">pts</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {winners.length === 0 && (
                <div className="text-center text-pitch-400 text-sm py-4">
                  No one got points for this match 😬
                </div>
              )}

              <Button onClick={onDismiss} variant="outline" size="md" className="w-full">
                Back to dashboard
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
