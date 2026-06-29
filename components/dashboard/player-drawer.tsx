"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Trophy, TrendingUp, Zap, XCircle, Star, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { flagUrl, countryFlagCode } from "@/lib/countries";
import { FOCUS_RING } from "@/lib/a11y";
import type { MemberPrediction, BestThirdPick, MemberPredictionsResponse, TournamentPick } from "@/app/api/member-predictions/route";

interface PlayerDrawerProps {
  userId:    string;
  groupId:   string;
  name:      string;
  country:   string;
  points:    number;
  rank:      number;
  open:      boolean;
  onClose:   () => void;
}

const STAGE_ORDER = ["Group", "R32", "R16", "QF", "SF", "3rd", "Final"] as const;
const STAGE_LABELS: Record<string, string> = {
  Group:  "Group Stage",
  R32:    "Round of 32",
  R16:    "Round of 16",
  QF:     "Quarter-finals",
  SF:     "Semi-finals",
  "3rd":  "Third Place",
  Final:  "Final",
};

const TOURNEY_LABELS: Record<string, string> = {
  winner:       "Tournament Winner",
  top_scorer:   "Top Scorer",
  top_assister: "Top Assister",
};

function TypeIcon({ type }: { type: MemberPrediction["type"] }) {
  if (type === "exact")   return <span style={{ color: "#facc15" }}>✅</span>;
  if (type === "correct") return <span style={{ color: "#00FF88" }}>☑️</span>;
  return <span style={{ color: "rgba(255,255,255,0.3)" }}>❌</span>;
}

function FlagImg({ code, name }: { code: string; name: string }) {
  return (
    <div className="relative h-4 w-5 rounded-sm overflow-hidden shrink-0">
      <Image src={flagUrl(code, 20)} alt={name} fill className="object-cover" unoptimized />
    </div>
  );
}

function MatchRow({ item }: { item: MemberPrediction }) {
  return (
    <div
      className="flex items-center gap-2 py-1.5 px-3 rounded-lg"
      style={{
        background: item.type === "exact"
          ? "rgba(250,204,21,0.05)"
          : item.type === "correct"
            ? "rgba(0,255,136,0.04)"
            : "transparent",
      }}
    >
      <FlagImg code={item.homeFlagCode} name={item.home} />
      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>vs</span>
      <FlagImg code={item.awayFlagCode} name={item.away} />
      <div className="flex-1 min-w-0 ml-0.5">
        <span className="text-[11px] font-bold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
          {item.home} {item.actual} {item.away}
        </span>
        <span className="text-[10px] ml-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Pred: {item.predicted}
        </span>
      </div>
      <TypeIcon type={item.type} />
      <span
        className="text-[10px] font-bold w-10 text-right shrink-0"
        style={{ color: item.pts > 0 ? (item.type === "exact" ? "#facc15" : "#00FF88") : "rgba(255,255,255,0.25)" }}
      >
        {item.pts > 0 ? `+${item.pts}` : "0"}
      </span>
    </div>
  );
}

function CollapsibleSection({
  title, icon, count, pts, children, defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  pts?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden mb-3" style={{ background: "rgba(18,14,38,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: open ? "1px solid rgba(255,255,255,0.07)" : "none" }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)" }}>{title}</span>
          {count !== undefined && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pts !== undefined && pts > 0 && (
            <span className="text-[11px] font-bold" style={{ color: "#00FF88" }}>+{pts}pts</span>
          )}
          {open ? <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.3)" }} /> : <ChevronRightIcon size={13} style={{ color: "rgba(255,255,255,0.3)" }} />}
        </div>
      </button>
      {open && <div className="p-2">{children}</div>}
    </div>
  );
}

export function PlayerDrawer({ userId, groupId, name, country, points, rank, open, onClose }: PlayerDrawerProps) {
  const [history,         setHistory]         = useState<MemberPrediction[]>([]);
  const [bestThird,       setBestThird]        = useState<MemberPredictionsResponse["bestThird"] | null>(null);
  const [tournamentPicks, setTournamentPicks]  = useState<TournamentPick[]>([]);
  const [loading,         setLoading]          = useState(false);
  const [dataLoaded,      setDataLoaded]       = useState(false);
  const [stats,           setStats]            = useState({ exactCount: 0, outcomeCount: 0, missedCount: 0, gsPts: 0, knockoutPts: 0, bestThirdPts: 0, bonusPts: 0 });
  const [apiTotal,        setApiTotal]         = useState<number | null>(null);
  const [closeHover,      setCloseHover]       = useState(false);

  const totalPoints = dataLoaded && apiTotal !== null ? apiTotal : points;

  useEffect(() => {
    if (!open || !userId || !groupId) return;
    setLoading(true);
    setDataLoaded(false);
    setHistory([]);
    setBestThird(null);
    setTournamentPicks([]);
    setApiTotal(null);

    fetch(`/api/member-predictions?userId=${encodeURIComponent(userId)}&groupId=${encodeURIComponent(groupId)}`)
      .then(r => r.json())
      .then((data: MemberPredictionsResponse) => {
        setHistory(data.history ?? []);
        setStats({
          exactCount:   data.stats.exactCount,
          outcomeCount: data.stats.outcomeCount,
          missedCount:  data.stats.missedCount,
          gsPts:        data.stats.gsPts ?? 0,
          knockoutPts:  data.stats.knockoutPts ?? 0,
          bestThirdPts: data.stats.bestThirdPts ?? 0,
          bonusPts:     data.stats.bonusPts ?? 0,
        });
        setApiTotal(data.stats.totalPoints);
        setBestThird(data.bestThird ?? null);
        setTournamentPicks(data.tournamentPicks ?? []);
        setDataLoaded(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, userId, groupId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Group stage: grouped by group_letter
  const gsMatches = history.filter(m => m.stage === "Group");
  const gsByLetter: Record<string, MemberPrediction[]> = {};
  for (const m of gsMatches) {
    const letter = m.groupLetter ?? "?";
    if (!gsByLetter[letter]) gsByLetter[letter] = [];
    gsByLetter[letter].push(m);
  }
  const gsLetters = Object.keys(gsByLetter).sort();

  // KO matches: grouped by stage order
  const koMatches = history.filter(m => m.stage !== "Group");
  const koByStage: Record<string, MemberPrediction[]> = {};
  for (const m of koMatches) {
    if (!koByStage[m.stage]) koByStage[m.stage] = [];
    koByStage[m.stage].push(m);
  }
  const koStages = STAGE_ORDER.filter(s => s !== "Group" && koByStage[s]?.length > 0);

  const hasKO = koMatches.length > 0;
  const hasGS = gsMatches.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            aria-hidden="true"
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} player details`}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 overflow-y-auto"
            style={{
              background: "rgba(8,6,20,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(0,212,255,0.15)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(18,14,38,0.6)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden" style={{ border: "2px solid rgba(0,212,255,0.2)" }}>
                  <Image src={flagUrl(countryFlagCode(country), 40)} alt={country} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <div className="font-display text-xl uppercase font-black" style={{ color: "white" }}>{name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#00D4FF" }}>Rank #{rank}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                    <span className="text-xs font-black" style={{ color: "white" }}>{totalPoints} pts</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close player details"
                onClick={onClose}
                className={`p-2 rounded-xl ${FOCUS_RING}`}
                style={{ background: closeHover ? "rgba(255,255,255,0.1)" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={() => setCloseHover(true)}
                onMouseLeave={() => setCloseHover(false)}
              >
                <X size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            </div>

            {/* Point breakdown chips */}
            <div className="px-5 py-3 flex flex-wrap gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { emoji: "⚽", label: "GS",     value: stats.gsPts,        color: "rgba(255,255,255,0.15)" },
                { emoji: "🏆", label: "KO",     value: stats.knockoutPts,  color: "rgba(255,255,255,0.15)" },
                { emoji: "🥉", label: "3rd",    value: stats.bestThirdPts, color: "rgba(255,255,255,0.15)" },
                { emoji: "🌟", label: "Bonus",  value: stats.bonusPts,     color: "rgba(255,255,255,0.15)" },
              ].map(({ emoji, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span className="text-[11px]">{emoji}</span>
                  <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{label}:</span>
                  <span className="text-[11px] font-black" style={{ color: value > 0 ? "white" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Accuracy stats */}
            <div className="grid grid-cols-3 gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { icon: Target,     label: "Exact",   value: stats.exactCount,   color: "#facc15" },
                { icon: TrendingUp, label: "Correct", value: stats.outcomeCount, color: "#00FF88" },
                { icon: XCircle,    label: "Missed",  value: stats.missedCount,  color: "#f87171" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(18,14,38,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Icon size={14} className="mx-auto mb-1" style={{ color }} />
                  <div className="font-black text-lg" style={{ color: "white" }}>{value}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {loading ? (
                <div className="py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Loading...</div>
              ) : history.length === 0 && tournamentPicks.length === 0 && !bestThird?.enabled ? (
                <div className="py-8 text-center space-y-2">
                  <Zap size={28} className="mx-auto" style={{ color: "rgba(255,255,255,0.2)" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                    No scored predictions yet. Check back after games are played.
                  </p>
                </div>
              ) : (
                <>
                  {/* Group Stage */}
                  {hasGS && (
                    <CollapsibleSection
                      title="Group Stage"
                      icon={<span className="text-base">⚽</span>}
                      count={gsMatches.length}
                      pts={stats.gsPts}
                      defaultOpen={false}
                    >
                      {gsLetters.map(letter => (
                        <div key={letter} className="mb-2">
                          <div className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Group {letter}
                          </div>
                          {gsByLetter[letter].map(item => (
                            <MatchRow key={item.matchId} item={item} />
                          ))}
                        </div>
                      ))}
                    </CollapsibleSection>
                  )}

                  {/* Knockout */}
                  {hasKO && (
                    <CollapsibleSection
                      title="Knockout Rounds"
                      icon={<span className="text-base">🏆</span>}
                      count={koMatches.length}
                      pts={stats.knockoutPts}
                      defaultOpen={true}
                    >
                      {koStages.map(stage => (
                        <div key={stage} className="mb-2">
                          <div className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {STAGE_LABELS[stage] ?? stage}
                          </div>
                          {koByStage[stage].map(item => (
                            <MatchRow key={item.matchId} item={item} />
                          ))}
                        </div>
                      ))}
                    </CollapsibleSection>
                  )}

                  {/* Best 3rd Place */}
                  {bestThird?.enabled && bestThird.picks.length > 0 && (
                    <CollapsibleSection
                      title="Best 3rd Place"
                      icon={<Star size={13} style={{ color: "#fbbf24" }} />}
                      count={bestThird.picks.length}
                      pts={stats.bestThirdPts}
                      defaultOpen={true}
                    >
                      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        {bestThird.picks.map(pick => (
                          <div key={pick.slot} className="flex items-center justify-between px-3 py-1.5">
                            <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{pick.team}</span>
                            <div className="flex items-center gap-2">
                              {pick.pointsEarned > 0 && (
                                <span className="text-[10px] font-bold" style={{ color: "#00FF88" }}>+{pick.pointsEarned}pts</span>
                              )}
                              <span className="text-base font-bold" style={{ color: pick.correct ? "#00FF88" : "rgba(255,255,255,0.2)" }}>
                                {pick.correct ? "✓" : "✗"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Tournament Picks */}
                  {tournamentPicks.length > 0 && (
                    <CollapsibleSection
                      title="Tournament Picks"
                      icon={<Trophy size={13} style={{ color: "#d97706" }} />}
                      pts={stats.bonusPts}
                      defaultOpen={true}
                    >
                      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        {tournamentPicks.map(pick => (
                          <div key={pick.predType} className="flex items-center justify-between px-3 py-2">
                            <div>
                              <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                                {TOURNEY_LABELS[pick.predType] ?? pick.predType}
                              </div>
                              <div className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
                                {pick.predValue ?? "—"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {pick.status === "pending" && (
                                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>pending</span>
                              )}
                              {pick.status === "correct" && (
                                <span className="text-[10px] font-bold" style={{ color: "#00FF88" }}>+{pick.pointsEarned}pts</span>
                              )}
                              {pick.status !== "pending" && (
                                <span className="text-base font-bold" style={{ color: pick.status === "correct" ? "#00FF88" : "rgba(255,255,255,0.2)" }}>
                                  {pick.status === "correct" ? "✓" : "✗"}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
