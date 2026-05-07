"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, RotateCcw, Trophy, Target, ChevronRight, Zap,
  CheckCircle2, XCircle, Users, Crown, FlaskConical,
  AlertTriangle, Copy, Check,
} from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaggedTeam } from "@/components/predictions/flagged-team";
import { flagUrl } from "@/lib/countries";
import {
  MOCK_TEST_MEMBERS, SIMULATED_MATCHES, calculateLeaderboard,
  getMatchWinners, DEFAULT_SCORING_RULES, type SimulatedResult,
} from "@/lib/testing/data";
import { cn } from "@/lib/utils";

const RANK_COLORS = ["#d97706", "#64748b", "#b45309", "#94a3b8", "#94a3b8"];

// ── Setup instructions for 5 real users ─────────────────────────────────────
const SETUP_STEPS = [
  {
    step: 1, label: "Create admin account",
    detail: "Sign up as Amit (amit@test.cupclash.com). Create a group called 'Tech Titans World Cup'. Set buy-in to $50, payout 60/30/10.",
    action: "Sign Up → Create Group",
  },
  {
    step: 2, label: "Copy invite link",
    detail: "Go to Admin panel → copy the invite link. Share it with the other 4 test accounts.",
    action: "Admin → Copy Link",
  },
  {
    step: 3, label: "Join as 4 members",
    detail: "Sign up as Sarah, John, Lior, Maya using the emails below. Each opens the invite link to join the group.",
    action: "Sign Up × 4 → Join",
  },
  {
    step: 4, label: "Enter predictions",
    detail: "Each member logs in and enters the predictions shown in the table below for Group A–L matches.",
    action: "Predictions page",
  },
  {
    step: 5, label: "Simulate results here",
    detail: "Come back to this page as admin. Click 'Play Next Match' to simulate results one by one.",
    action: "Use panel below",
  },
];

export function TestControlPanel() {
  const [results,    setResults]    = useState<SimulatedResult[]>([]);
  const [lastResult, setLastResult] = useState<SimulatedResult | null>(null);
  const [lastWinners,setLastWinners]= useState<ReturnType<typeof getMatchWinners>>([]);
  const [showResult, setShowResult] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [tab,        setTab]        = useState<"setup"|"simulate"|"predictions">("setup");

  const rules      = DEFAULT_SCORING_RULES;
  const leaderboard= calculateLeaderboard(MOCK_TEST_MEMBERS, results, rules);
  const nextMatch  = SIMULATED_MATCHES[results.length];
  const isComplete = results.length >= SIMULATED_MATCHES.length;

  const playNext = () => {
    if (!nextMatch) return;
    const winners = getMatchWinners(MOCK_TEST_MEMBERS, nextMatch, rules);
    setResults(prev => [...prev, nextMatch]);
    setLastResult(nextMatch);
    setLastWinners(winners);
    setShowResult(true);
    setTimeout(() => setShowResult(false), 7000);
  };

  const reset = () => {
    setResults([]);
    setLastResult(null);
    setLastWinners([]);
    setShowResult(false);
  };

  const copyEmails = () => {
    const emails = MOCK_TEST_MEMBERS.map(m => m.email).join(", ");
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Warning banner */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={16} strokeWidth={1.5} style={{ color: "#d97706" }} />
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#d97706" }}>Testing Mode</span>
          <span className="text-sm" style={{ color: "#64748b" }}>
            — Local simulation only. Real Supabase data is NOT modified.
            {results.length > 0 && ` ${results.length}/${SIMULATED_MATCHES.length} matches simulated.`}
          </span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["setup", "simulate", "predictions"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={tab === t ? {
              background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#0891B2",
            } : {
              background: "rgba(255,255,255,0.7)", border: "1px solid #e2e8f0", color: "#64748b",
            }}>
            {t === "setup" ? "Setup Guide" : t === "simulate" ? "Simulate Matches" : "Member Predictions"}
          </button>
        ))}
      </div>

      {/* ── TAB: Setup ─────────────────────────────────────────────────── */}
      {tab === "setup" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <FlaskConical size={18} strokeWidth={1.5} style={{ color: "#0891B2" }} />
              <span className="font-display text-xl uppercase" style={{ color: "#0F172A" }}>5-User Test Setup</span>
            </div>

            <div className="space-y-4">
              {SETUP_STEPS.map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-black text-sm"
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#0891B2" }}>
                    {s.step}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#0F172A" }}>{s.label}</div>
                    <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748b" }}>{s.detail}</div>
                    <div className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block"
                      style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>{s.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {/* Test accounts */}
            <Card variant="glass" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Users size={16} strokeWidth={1.5} style={{ color: "#0891B2" }} />
                  <span className="font-display text-lg uppercase" style={{ color: "#0F172A" }}>Test Accounts</span>
                </div>
                <button onClick={copyEmails}
                  className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2", border: "1px solid rgba(0,212,255,0.2)" }}>
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy all emails</>}
                </button>
              </div>
              <div className="space-y-2">
                {MOCK_TEST_MEMBERS.map(m => (
                  <div key={m.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
                      <Image src={flagUrl(m.flagCode, 20)} alt={m.country} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "#0F172A" }}>{m.name}</span>
                        {m.isAdmin && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(217,119,6,0.1)", color: "#d97706" }}>Admin</span>
                        )}
                      </div>
                      <div className="text-xs font-mono" style={{ color: "#94a3b8" }}>{m.email}</div>
                    </div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>pw: Test1234!</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-3" style={{ color: "#94a3b8" }}>
                Create these accounts in Supabase Auth or via the signup page. Use password: <span className="font-mono font-bold">Test1234!</span>
              </p>
            </Card>

            {/* Scoring rules */}
            <Card variant="glass" className="p-4">
              <div className="label-caps mb-3">Scoring rules used</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Correct outcome", pts: DEFAULT_SCORING_RULES.correctOutcome },
                  { label: "Exact score",     pts: DEFAULT_SCORING_RULES.exactScore     },
                  { label: "KO advancement",  pts: DEFAULT_SCORING_RULES.koAdvancement  },
                ].map(r => (
                  <div key={r.label} className="rounded-xl py-2"
                    style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.12)" }}>
                    <div className="font-mono font-black text-2xl" style={{ color: "#0891B2" }}>+{r.pts}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: Simulate ──────────────────────────────────────────────── */}
      {tab === "simulate" && (
        <div className="grid lg:grid-cols-[1fr_340px] gap-5">
          {/* Left — controls + history */}
          <div className="space-y-4">
            {/* Next match card */}
            <Card variant="glass" className="p-5">
              <div className="label-caps mb-3">
                {isComplete ? "All matches simulated" : `Next match — #${results.length + 1} of ${SIMULATED_MATCHES.length}`}
              </div>

              {nextMatch && !isComplete ? (
                <div className="space-y-4">
                  {/* Match strip */}
                  <div className="flex items-center gap-4 py-3 rounded-2xl px-4"
                    style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
                    <div className="flex-1 text-right">
                      <FlaggedTeam name={nextMatch.home} flagCode={nextMatch.homeFlagCode} size="md" />
                    </div>
                    <div className="text-center px-4">
                      <div className="font-mono font-black text-3xl" style={{ color: "#0891B2" }}>
                        {nextMatch.homeScore} – {nextMatch.awayScore}
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>{nextMatch.stage}</div>
                      {nextMatch.wentToPenalties && (
                        <div className="text-[10px] font-bold" style={{ color: "#d97706" }}>A.E.T / Pens</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <FlaggedTeam name={nextMatch.away} flagCode={nextMatch.awayFlagCode} size="md" />
                    </div>
                  </div>

                  <div className="text-xs" style={{ color: "#94a3b8" }}>
                    {nextMatch.stadium} · {nextMatch.city}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={playNext} size="md" className="flex-1"
                      leftIcon={<Play size={16} />}>
                      Play this match
                    </Button>
                    <Button onClick={reset} variant="outline" size="md" leftIcon={<RotateCcw size={16} />}>
                      Reset all
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Crown size={36} className="mx-auto" style={{ color: "#d97706" }} />
                  <div className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>Tournament complete!</div>
                  <Button onClick={reset} variant="outline" size="md" leftIcon={<RotateCcw size={16} />}>
                    Reset and start over
                  </Button>
                </div>
              )}
            </Card>

            {/* Match history */}
            {results.length > 0 && (
              <Card variant="glass" className="overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                  <span className="font-display text-lg uppercase" style={{ color: "#0F172A" }}>
                    Results played ({results.length})
                  </span>
                </div>
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {[...results].reverse().map(r => (
                    <div key={r.matchId} className="flex items-center gap-3 px-5 py-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <FlaggedTeam name={r.home} flagCode={r.homeFlagCode} size="xs" />
                      </div>
                      <div className="text-center shrink-0">
                        <span className="font-mono font-black text-base" style={{ color: "#0891B2" }}>
                          {r.homeScore}–{r.awayScore}
                        </span>
                        {r.wentToPenalties && <div className="text-[9px]" style={{ color: "#d97706" }}>pens</div>}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FlaggedTeam name={r.away} flagCode={r.awayFlagCode} size="xs" />
                      </div>
                      <div className="text-[10px] shrink-0" style={{ color: "#94a3b8" }}>{r.stage}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right — live leaderboard */}
          <div className="space-y-4">
            {/* Match result popup */}
            <AnimatePresence>
              {showResult && lastResult && (
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <Card variant="glass-accent" className="p-4">
                    <div className="label-caps mb-2" style={{ color: "#059669" }}>Just played</div>
                    <div className="font-mono font-black text-2xl mb-3" style={{ color: "#0F172A" }}>
                      {lastResult.home} {lastResult.homeScore}–{lastResult.awayScore} {lastResult.away}
                    </div>
                    {lastWinners.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="label-caps mb-1">Points earned</div>
                        {lastWinners.map(w => (
                          <div key={w.member.id} className="flex items-center gap-2">
                            <div className="relative h-5 w-5 rounded-full overflow-hidden shrink-0">
                              <Image src={flagUrl(w.member.flagCode, 20)} alt="" fill className="object-cover" unoptimized />
                            </div>
                            <span className="text-sm font-bold flex-1" style={{ color: "#0F172A" }}>{w.member.name}</span>
                            <span className="text-xs font-black px-2 py-0.5 rounded-full"
                              style={{
                                background: w.type === "exact" ? "rgba(0,255,136,0.12)" : "rgba(0,212,255,0.08)",
                                color: w.type === "exact" ? "#059669" : "#0891B2",
                              }}>
                              +{w.pts} {w.type === "exact" ? "EXACT" : "OUTCOME"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: "#94a3b8" }}>No points scored on this match.</p>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leaderboard */}
            <Card variant="glass" className="overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <Trophy size={16} strokeWidth={1.5} style={{ color: "#d97706" }} />
                <span className="font-display text-lg uppercase" style={{ color: "#0F172A" }}>Live Leaderboard</span>
              </div>
              <div className="divide-y divide-slate-50">
                {leaderboard.map((entry, i) => (
                  <div key={entry.member.id}
                    className="flex items-center gap-3 px-5 py-3"
                    style={entry.member.id === "test-amit" ? { background: "rgba(0,255,136,0.04)", borderLeft: "3px solid #00FF88" } : undefined}>
                    <div className="w-8 text-center shrink-0">
                      {i < 3 ? (
                        <span className="text-xs font-black" style={{ color: RANK_COLORS[i] }}>
                          {["1st","2nd","3rd"][i]}
                        </span>
                      ) : (
                        <span className="text-xs font-bold" style={{ color: "#94a3b8" }}>{i+1}</span>
                      )}
                    </div>
                    <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0"
                      style={{ border: "2px solid #e2e8f0" }}>
                      <Image src={flagUrl(entry.member.flagCode, 20)} alt={entry.member.country}
                        fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>{entry.member.name}</div>
                      <div className="text-[10px]" style={{ color: "#94a3b8" }}>
                        {entry.exactScores} exact · {entry.correctOutcomes} outcome
                      </div>
                    </div>
                    <div className="font-mono font-black text-2xl" style={{ color: "#0891B2" }}>
                      {entry.points}
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm" style={{ color: "#94a3b8" }}>
                    Play a match to see the leaderboard update.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: Predictions ───────────────────────────────────────────── */}
      {tab === "predictions" && (
        <Card variant="glass" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="font-display text-xl uppercase" style={{ color: "#0F172A" }}>
              All Member Predictions
            </span>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Enter these predictions manually in the app as each test user. Highlighted = results already simulated.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Match</th>
                  {MOCK_TEST_MEMBERS.map(m => (
                    <th key={m.id} className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative h-5 w-5 rounded-full overflow-hidden">
                          <Image src={flagUrl(m.flagCode, 20)} alt="" fill className="object-cover" unoptimized />
                        </div>
                        {m.name.split(" ")[0]}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {SIMULATED_MATCHES.slice(0, 15).map((match, mi) => {
                  const played = results.find(r => r.matchId === match.matchId);
                  return (
                    <tr key={match.matchId}
                      className="border-b border-slate-50"
                      style={played ? { background: "rgba(0,255,136,0.03)" } : undefined}>
                      <td className="px-4 py-2.5 bg-white"
                        style={{ backgroundColor: "rgba(255,255,255,0.95)" }}>
                        <div className="flex items-center gap-2">
                          <div className="relative h-4 w-5 rounded-sm overflow-hidden shrink-0">
                            <Image src={flagUrl(match.homeFlagCode, 20)} alt="" fill className="object-cover" unoptimized />
                          </div>
                          <span className="font-bold text-xs" style={{ color: "#0F172A" }}>{match.home.split(" ")[0]}</span>
                          <span style={{ color: "#94a3b8" }}>vs</span>
                          <div className="relative h-4 w-5 rounded-sm overflow-hidden shrink-0">
                            <Image src={flagUrl(match.awayFlagCode, 20)} alt="" fill className="object-cover" unoptimized />
                          </div>
                          <span className="font-bold text-xs" style={{ color: "#0F172A" }}>{match.away.split(" ")[0]}</span>
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>{match.stage}</div>
                      </td>
                      {MOCK_TEST_MEMBERS.map(member => {
                        const pred = member.predictions.find(p => p.matchId === match.matchId);
                        let result: ReturnType<typeof getMatchWinners>[0] | null = null;
                        if (played && pred) {
                          const scored = getMatchWinners(MOCK_TEST_MEMBERS, played, DEFAULT_SCORING_RULES);
                          result = scored.find(w => w.member.id === member.id) ?? null;
                        }
                        return (
                          <td key={member.id} className="px-3 py-2.5 text-center">
                            <div className="font-mono font-bold text-sm" style={{ color: "#0F172A" }}>
                              {pred ? `${pred.homeScore}–${pred.awayScore}` : "—"}
                            </div>
                            {played && pred && (
                              <div className="text-[9px] font-bold mt-0.5"
                                style={{ color: result && result.pts > 0 ? (result.type === "exact" ? "#059669" : "#0891B2") : "#dc2626" }}>
                                {result && result.pts > 0 ? `+${result.pts}` : "✗"}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2.5 text-center">
                        {played ? (
                          <div>
                            <div className="font-mono font-black text-base" style={{ color: "#0891B2" }}>
                              {played.homeScore}–{played.awayScore}
                            </div>
                            {played.wentToPenalties && <div className="text-[9px]" style={{ color: "#d97706" }}>pens</div>}
                          </div>
                        ) : (
                          <span style={{ color: "#e2e8f0" }}>–</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}