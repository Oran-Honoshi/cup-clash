"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Target, ChevronRight, Zap, ArrowRight } from "lucide-react";
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

const RANK_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600", "text-pitch-400"];

export function TestControlPanel() {
  const [uploadedResults, setUploadedResults] = useState<SimulatedResult[]>([]);
  const [lastResult, setLastResult] = useState<SimulatedResult | null>(null);
  const [lastWinners, setLastWinners] = useState<ReturnType<typeof getMatchWinners>>([]);
  const [showWinners, setShowWinners] = useState(false);

  const rules = DEFAULT_SCORING_RULES;
  const leaderboard = calculateLeaderboard(MOCK_TEST_MEMBERS, uploadedResults, rules);
  const nextMatch = SIMULATED_MATCHES[uploadedResults.length];
  const isComplete = uploadedResults.length >= SIMULATED_MATCHES.length;

  const uploadNextResult = () => {
    if (!nextMatch) return;
    const winners = getMatchWinners(MOCK_TEST_MEMBERS, nextMatch, rules);
    setUploadedResults((prev) => [...prev, nextMatch]);
    setLastResult(nextMatch);
    setLastWinners(winners);
    setShowWinners(true);
    setTimeout(() => setShowWinners(false), 6000);
  };

  const reset = () => {
    setUploadedResults([]);
    setLastResult(null);
    setLastWinners([]);
    setShowWinners(false);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="glass rounded-2xl p-5 border border-warning/20 bg-warning/5">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} className="text-warning" />
          <span className="font-bold text-warning uppercase tracking-widest text-xs">Testing Mode</span>
        </div>
        <p className="text-sm text-pitch-300">
          Simulate match results one by one. {uploadedResults.length}/{SIMULATED_MATCHES.length} results uploaded.
          Group stage (12) + Round of 32 (2) + QF (1) + SF (1).
        </p>
      </div>

      {/* Next match info + upload button */}
      {!isComplete && nextMatch && (
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="label-caps mb-1">{nextMatch.stage}</div>
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-4 rounded-sm overflow-hidden">
                  <Image src={flagUrl(nextMatch.homeFlagCode, 20)} alt={nextMatch.home} fill className="object-cover" unoptimized />
                </div>
                <span className="font-display text-lg uppercase text-white">{nextMatch.home}</span>
                <span className="text-pitch-500 font-bold">vs</span>
                <div className="relative w-6 h-4 rounded-sm overflow-hidden">
                  <Image src={flagUrl(nextMatch.awayFlagCode, 20)} alt={nextMatch.away} fill className="object-cover" unoptimized />
                </div>
                <span className="font-display text-lg uppercase text-white">{nextMatch.away}</span>
              </div>
              {nextMatch.isKnockout && (
                <div className="mt-1 text-xs text-pitch-400">
                  Knockout match · Result: <strong className="text-white">{nextMatch.homeScore}–{nextMatch.awayScore}</strong>
                  {nextMatch.wentToPenalties && <span className="text-warning ml-1">(to penalties)</span>}
                  {" · Advances: "}<strong className="text-white">{nextMatch.advancedTeam}</strong>
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button onClick={uploadNextResult} size="md" leftIcon={<Play size={16} />}>
                Upload result
              </Button>
              <Button onClick={reset} variant="outline" size="md" leftIcon={<RotateCcw size={16} />}>
                Reset
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isComplete && (
        <Card variant="glass-accent" className="p-5 text-center">
          <div className="font-display text-2xl uppercase text-white mb-2">All results uploaded!</div>
          <p className="text-pitch-400 text-sm mb-4">Tournament complete. Check the final leaderboard.</p>
          <Button onClick={reset} variant="outline" size="sm" leftIcon={<RotateCcw size={14} />}>Start over</Button>
        </Card>
      )}

      {/* Match winner popup */}
      <AnimatePresence>
        {showWinners && lastResult && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            className="glass-accent rounded-2xl p-5 border"
            style={{ borderColor: "rgb(var(--accent)/0.3)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} style={{ color: "#D4AF37" }} />
              <span className="font-display text-xl uppercase text-white">
                {lastResult.home} {lastResult.homeScore}–{lastResult.awayScore} {lastResult.away}
              </span>
              {lastResult.wentToPenalties && (
                <span className="text-xs text-warning font-bold uppercase tracking-widest ml-1">
                  Penalties
                </span>
              )}
            </div>

            {lastResult.isKnockout && (
              <div className="text-xs text-pitch-400 mb-3 flex items-center gap-1.5">
                <ArrowRight size={11} />
                <strong className="text-white">{lastResult.advancedTeam}</strong> advances
              </div>
            )}

            {lastWinners.length > 0 ? (
              <>
                <div className="text-xs text-pitch-400 mb-2">
                  {lastWinners[0].isExact ? "🎯 Exact score" : "✓ Correct outcome"}
                  {lastWinners.length > 1 ? " — Tied:" : " — Winner:"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {lastWinners.map((w) => (
                    <div key={w.member.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                      <div className="relative w-5 h-3.5 rounded-sm overflow-hidden">
                        <Image src={flagUrl(w.member.flagCode, 20)} alt={w.member.country} fill className="object-cover" unoptimized />
                      </div>
                      <span className="font-bold text-white text-sm">{w.member.name}</span>
                      <span className="font-bold text-sm" style={{ color: "rgb(var(--accent-glow))" }}>
                        +{w.points}
                      </span>
                      {w.isExact && <span className="text-[10px] text-success font-bold">EXACT</span>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-pitch-500 text-sm italic">No one got points for this match 😬</div>
            )}
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
                <span className={cn("w-6 text-center font-display text-lg", RANK_COLORS[i] ?? "text-pitch-500")}>{i + 1}</span>
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

        {/* Results log */}
        <Card variant="glass" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Target size={16} style={{ color: "rgb(var(--accent-glow))" }} />
            <span className="font-display text-lg uppercase text-white">Results Log</span>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
            {uploadedResults.length === 0 ? (
              <div className="px-5 py-8 text-center text-pitch-500 text-sm">Upload a result to start</div>
            ) : (
              [...uploadedResults].reverse().map((r) => (
                <div key={r.matchId} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="relative w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
                      <Image src={flagUrl(r.homeFlagCode, 20)} alt={r.home} fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-xs text-pitch-200 truncate">{r.home}</span>
                  </div>
                  <span className="font-display text-base text-white shrink-0">{r.homeScore}–{r.awayScore}</span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                    <span className="text-xs text-pitch-200 truncate">{r.away}</span>
                    <div className="relative w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
                      <Image src={flagUrl(r.awayFlagCode, 20)} alt={r.away} fill className="object-cover" unoptimized />
                    </div>
                  </div>
                  {r.isKnockout && (
                    <div className="text-[10px] text-warning font-bold shrink-0">KO</div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Full breakdown table */}
      <Card variant="glass" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <span className="font-display text-lg uppercase text-white">Prediction Breakdown</span>
          <p className="text-[11px] text-pitch-500 mt-0.5">
            Score: exact score · Adv: who advances pick (knockout only)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-pitch-400 font-bold uppercase tracking-widest text-[10px] sticky left-0 bg-pitch-950/80">Match</th>
                {MOCK_TEST_MEMBERS.map((m) => (
                  <th key={m.id} className="px-3 py-3 text-center text-pitch-400 font-bold uppercase tracking-widest text-[10px] min-w-[90px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative w-5 h-3.5 rounded-sm overflow-hidden">
                        <Image src={flagUrl(m.flagCode, 20)} alt={m.country} fill className="object-cover" unoptimized />
                      </div>
                      {m.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {SIMULATED_MATCHES.map((match) => {
                const result = uploadedResults.find((r) => r.matchId === match.matchId);
                const isUploaded = !!result;
                return (
                  <tr key={match.matchId} className={cn("transition-colors", !isUploaded && "opacity-40")}>
                    <td className="px-4 py-2.5 sticky left-0 bg-pitch-950/80">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1">
                          <div className="relative w-4 h-3 rounded-sm overflow-hidden">
                            <Image src={flagUrl(match.homeFlagCode, 20)} alt={match.home} fill className="object-cover" unoptimized />
                          </div>
                          <span className="text-[10px] text-pitch-300">{match.home.slice(0, 3).toUpperCase()}</span>
                        </div>
                        <span className="text-[10px] text-pitch-600">
                          {isUploaded ? `${result.homeScore}–${result.awayScore}` : "vs"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-pitch-300">{match.away.slice(0, 3).toUpperCase()}</span>
                          <div className="relative w-4 h-3 rounded-sm overflow-hidden">
                            <Image src={flagUrl(match.awayFlagCode, 20)} alt={match.away} fill className="object-cover" unoptimized />
                          </div>
                        </div>
                        {match.isKnockout && <span className="text-[9px] text-warning font-bold">KO</span>}
                      </div>
                      {isUploaded && result.isKnockout && (
                        <div className="text-[9px] text-pitch-500 mt-0.5">→ {result.advancedTeam}</div>
                      )}
                    </td>

                    {MOCK_TEST_MEMBERS.map((member) => {
                      const pred = member.predictions.find((p) => p.matchId === match.matchId);
                      if (!pred) return <td key={member.id} className="px-3 py-2.5 text-center text-pitch-600 text-[10px]">—</td>;

                      const predStr = `${pred.homeScore}–${pred.awayScore}`;

                      if (!isUploaded) {
                        return (
                          <td key={member.id} className="px-3 py-2.5 text-center">
                            <div className="text-[11px] text-pitch-400">{predStr}</div>
                            {pred.advancementPick && (
                              <div className="text-[9px] text-pitch-600">→ {pred.advancementPick}</div>
                            )}
                          </td>
                        );
                      }

                      const { points, isExact, breakdown } = (() => {
                        const predOutcome = Math.sign(pred.homeScore - pred.awayScore);
                        const realOutcome = Math.sign(result.homeScore - result.awayScore);
                        const exact = pred.homeScore === result.homeScore && pred.awayScore === result.awayScore;
                        let pts = 0;
                        const bd: string[] = [];
                        if (exact) { pts += rules.exactScore; bd.push(`+${rules.exactScore}`); }
                        else if (predOutcome === realOutcome) { pts += rules.correctOutcome; bd.push(`+${rules.correctOutcome}`); }
                        if (result.isKnockout && pred.advancementPick && pred.advancementPick === result.advancedTeam) {
                          pts += rules.knockoutAdvancement;
                          bd.push(`+${rules.knockoutAdvancement} adv`);
                        }
                        return { points: pts, isExact: exact, breakdown: bd };
                      })();

                      const advCorrect = result.isKnockout && pred.advancementPick === result.advancedTeam;
                      const advWrong = result.isKnockout && pred.advancementPick && pred.advancementPick !== result.advancedTeam;

                      return (
                        <td key={member.id} className="px-3 py-2.5 text-center">
                          <div className={cn("text-[11px] font-bold",
                            isExact ? "text-success" : points > 0 ? "text-pitch-200" : "text-pitch-600")}>
                            {predStr}
                          </div>
                          {result.isKnockout && pred.advancementPick && (
                            <div className={cn("text-[9px] font-bold",
                              advCorrect ? "text-success" : advWrong ? "text-danger" : "text-pitch-500")}>
                              → {pred.advancementPick.slice(0, 6)}
                            </div>
                          )}
                          <div className={cn("text-[10px] font-bold mt-0.5",
                            points > 0 ? "text-success" : "text-danger")}>
                            {points > 0 ? `+${points}` : "✗"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr className="border-t-2 border-white/[0.12]">
                <td className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-pitch-400 sticky left-0 bg-pitch-950/80">Total</td>
                {leaderboard.map((entry) => (
                  <td key={entry.member.id} className="px-3 py-3 text-center">
                    <div className="font-display text-xl" style={{ color: "rgb(var(--accent-glow))" }}>
                      {entry.totalPoints}
                    </div>
                    <div className="text-[10px] text-pitch-500">{entry.exactCount} exact</div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
