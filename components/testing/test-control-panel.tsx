"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Target, ChevronRight, Check, X, Zap } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { flagUrl } from "@/lib/countries";
import {
  MOCK_TEST_MEMBERS,
  SIMULATED_MATCHES,
  calculateLeaderboard,
  getMatchWinners,
  DEFAULT_SCORING_RULES,
  type SimulatedResult,
} from "@/lib/testing/data";
import { cn } from "@/lib/utils";

export function TestControlPanel() {
  const [uploadedResults, setUploadedResults] = useState<SimulatedResult[]>([]);
  const [lastMatchWinners, setLastMatchWinners] = useState<ReturnType<typeof getMatchWinners> | null>(null);
  const [showWinners, setShowWinners] = useState(false);

  const rules = DEFAULT_SCORING_RULES;
  const leaderboard = calculateLeaderboard(MOCK_TEST_MEMBERS, uploadedResults, rules);
  const nextMatch = SIMULATED_MATCHES[uploadedResults.length];
  const isComplete = uploadedResults.length >= SIMULATED_MATCHES.length;

  const uploadNextResult = () => {
    if (!nextMatch) return;
    const winners = getMatchWinners(MOCK_TEST_MEMBERS, nextMatch, rules);
    setUploadedResults((prev) => [...prev, nextMatch]);
    setLastMatchWinners(winners);
    setShowWinners(true);
    setTimeout(() => setShowWinners(false), 5000);
  };

  const reset = () => {
    setUploadedResults([]);
    setLastMatchWinners(null);
    setShowWinners(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-5 border border-warning/20 bg-warning/5">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-warning" />
          <span className="font-bold text-warning uppercase tracking-widest text-xs">
            Testing Mode
          </span>
        </div>
        <p className="text-sm text-pitch-300">
          Simulate match results to test scoring, leaderboard updates, and popup celebrations.
          {" "}{uploadedResults.length}/{SIMULATED_MATCHES.length} results uploaded.
        </p>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={uploadNextResult}
          disabled={isComplete}
          size="md"
          leftIcon={<Play size={16} />}
        >
          {isComplete ? "All results uploaded" : `Upload: ${nextMatch?.home} vs ${nextMatch?.away}`}
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          size="md"
          leftIcon={<RotateCcw size={16} />}
        >
          Reset
        </Button>
      </div>

      {/* Match winner popup */}
      <AnimatePresence>
        {showWinners && lastMatchWinners && lastMatchWinners.length > 0 && uploadedResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-accent rounded-2xl p-5 border border-accent/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} style={{ color: "#D4AF37" }} />
              <span className="font-display text-xl uppercase text-white tracking-tight">
                Match Result — {uploadedResults[uploadedResults.length - 1]?.home} vs {uploadedResults[uploadedResults.length - 1]?.away}
              </span>
            </div>
            <div className="text-2xl font-display text-white mb-3">
              {uploadedResults[uploadedResults.length - 1]?.homeScore} – {uploadedResults[uploadedResults.length - 1]?.awayScore}
            </div>
            <div className="text-sm text-pitch-300 mb-2">
              {lastMatchWinners[0].isExact ? "🎯 Exact score!" : "✓ Correct outcome"} — Points winners:
            </div>
            <div className="flex flex-wrap gap-2">
              {lastMatchWinners.map((w) => (
                <div key={w.member.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                  <div className="relative w-5 h-3.5 rounded-sm overflow-hidden">
                    <Image src={flagUrl(w.member.flagCode, 20)} alt={w.member.country} fill className="object-cover" unoptimized />
                  </div>
                  <span className="font-bold text-white text-sm">{w.member.name}</span>
                  <span className="font-bold text-sm" style={{ color: "rgb(var(--accent-glow))" }}>
                    +{w.points}
                  </span>
                  {w.isExact && <span className="text-xs text-success">EXACT</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Live leaderboard */}
        <Card variant="glass" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Trophy size={16} style={{ color: "rgb(var(--accent-glow))" }} />
            <span className="font-display text-lg uppercase text-white">Live Leaderboard</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {leaderboard.map((entry, i) => (
              <div key={entry.member.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-6 text-center font-display text-lg text-pitch-500">{i + 1}</span>
                <div className="relative w-6 h-4 rounded-sm overflow-hidden">
                  <Image src={flagUrl(entry.member.flagCode, 20)} alt={entry.member.country} fill className="object-cover" unoptimized />
                </div>
                <span className="flex-1 font-bold text-white">{entry.member.name}</span>
                <span className="text-xs text-pitch-500">{entry.exactCount} exact</span>
                <span className="font-display text-2xl" style={{ color: "rgb(var(--accent-glow))" }}>
                  {entry.totalPoints}
                </span>
                <span className="text-xs text-pitch-500">pts</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Uploaded results */}
        <Card variant="glass" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Target size={16} style={{ color: "rgb(var(--accent-glow))" }} />
            <span className="font-display text-lg uppercase text-white">Results Uploaded</span>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
            {uploadedResults.length === 0 ? (
              <div className="px-5 py-8 text-center text-pitch-500 text-sm">
                No results yet — click "Upload" to start
              </div>
            ) : (
              uploadedResults.map((r) => (
                <div key={r.matchId} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="relative w-5 h-3.5 rounded-sm overflow-hidden">
                    <Image src={flagUrl(r.homeFlagCode, 20)} alt={r.home} fill className="object-cover" unoptimized />
                  </div>
                  <span className="text-sm text-pitch-200 flex-1 truncate">{r.home}</span>
                  <span className="font-display text-lg text-white px-2">{r.homeScore}–{r.awayScore}</span>
                  <span className="text-sm text-pitch-200 flex-1 text-right truncate">{r.away}</span>
                  <div className="relative w-5 h-3.5 rounded-sm overflow-hidden">
                    <Image src={flagUrl(r.awayFlagCode, 20)} alt={r.away} fill className="object-cover" unoptimized />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Per-member breakdown */}
      <Card variant="glass" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <span className="font-display text-lg uppercase text-white">Prediction Breakdown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-pitch-400 font-bold uppercase tracking-widest text-[10px]">Match</th>
                {MOCK_TEST_MEMBERS.map((m) => (
                  <th key={m.id} className="px-4 py-3 text-center text-pitch-400 font-bold uppercase tracking-widest text-[10px]">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {SIMULATED_MATCHES.map((match, i) => {
                const result = uploadedResults.find((r) => r.matchId === match.matchId);
                const isUploaded = !!result;
                return (
                  <tr key={match.matchId} className={cn("transition-colors", isUploaded ? "" : "opacity-40")}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isUploaded ? (
                          <ChevronRight size={12} className="text-success shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" />
                        )}
                        <span className="text-pitch-200 text-xs">
                          {match.home} {isUploaded ? `${result.homeScore}–${result.awayScore}` : "vs"} {match.away}
                        </span>
                      </div>
                    </td>
                    {MOCK_TEST_MEMBERS.map((member) => {
                      const pred = member.predictions.find((p) => p.matchId === match.matchId);
                      if (!pred) return <td key={member.id} className="px-4 py-2.5 text-center text-pitch-600">—</td>;
                      const predStr = `${pred.homeScore}–${pred.awayScore}`;
                      if (!isUploaded) {
                        return <td key={member.id} className="px-4 py-2.5 text-center text-pitch-400 text-xs">{predStr}</td>;
                      }
                      const { points, isExact } = (() => {
                        const predOutcome = Math.sign(pred.homeScore - pred.awayScore);
                        const realOutcome = Math.sign(result.homeScore - result.awayScore);
                        const exact = pred.homeScore === result.homeScore && pred.awayScore === result.awayScore;
                        if (exact) return { points: rules.exactScore, isExact: true };
                        if (predOutcome === realOutcome) return { points: rules.correctOutcome, isExact: false };
                        return { points: 0, isExact: false };
                      })();
                      return (
                        <td key={member.id} className="px-4 py-2.5 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={cn("text-xs font-bold",
                              isExact ? "text-success" : points > 0 ? "text-pitch-200" : "text-pitch-600")}>
                              {predStr}
                            </span>
                            <span className={cn("text-[10px] font-bold",
                              isExact ? "text-success" : points > 0 ? "text-pitch-400" : "text-danger")}>
                              {points > 0 ? `+${points}` : "✗"}
                              {isExact && " 🎯"}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
