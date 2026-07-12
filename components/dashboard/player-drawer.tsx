"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Trophy, TrendingUp, Zap, XCircle, Star, Volleyball, Medal, ChevronDown, ChevronRight as ChevronRightIcon, Users } from "lucide-react";
import { countryFlagCode } from "@/lib/countries";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BallLoader } from "@/components/ui/BallLoader";
import { FOCUS_RING } from "@/lib/a11y";
import type { MemberPrediction, BestThirdPick, MemberPredictionsResponse, TournamentPick } from "@/app/api/member-predictions/route";

interface PlayerDrawerProps {
  userId:     string;
  groupId:    string;
  groupName?: string;
  name:       string;
  avatarUrl?: string | null;
  country:    string;
  points:     number;
  rank:       number;
  open:       boolean;
  onClose:    () => void;
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
  if (type === "exact")   return <span style={{ color: "var(--sc)" }}>✅</span>;
  if (type === "correct") return <span style={{ color: "var(--ac)" }}>☑️</span>;
  return <span style={{ color: "var(--ft)" }}>❌</span>;
}

function MatchRow({ item }: { item: MemberPrediction }) {
  return (
    <div
      className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg mb-1"
      style={{
        background: item.type === "exact"
          ? "color-mix(in srgb, var(--sc) 6%, transparent)"
          : item.type === "correct"
            ? "color-mix(in srgb, var(--ac) 5%, transparent)"
            : "var(--ip)",
        border: "0.5px solid var(--br)",
        borderRadius: "var(--border-radius-lg)",
      }}
    >
      <FlagBadge code={item.homeFlagCode} label={item.home} size="sm" />
      <span className="text-[10px]" style={{ color: "var(--ft)" }}>vs</span>
      <FlagBadge code={item.awayFlagCode} label={item.away} size="sm" />
      <div className="flex-1 min-w-0 ml-0.5">
        <span className="text-[11px] font-bold truncate" style={{ color: "var(--tx)" }}>
          {item.home} {item.actual} {item.away}
        </span>
        <span className="text-[10px] ml-1.5" style={{ color: "var(--mt)" }}>
          Pred: {item.predicted}
        </span>
      </div>
      <TypeIcon type={item.type} />
      <span
        className="text-[10px] font-bold w-10 text-right shrink-0"
        style={{ color: item.pts > 0 ? (item.type === "exact" ? "var(--sc)" : "var(--ac)") : "var(--ft)" }}
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
    <div className="overflow-hidden mb-3 cc-elevated" style={{ background: "var(--ip)", border: "0.5px solid var(--br)", borderRadius: "var(--border-radius-lg)" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: open ? "1px solid var(--dv)" : "none" }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="ta-section-label">{title}</span>
          {count !== undefined && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--ip)", color: "var(--mt)" }}>
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pts !== undefined && pts > 0 && (
            <span className="text-[11px] font-bold" style={{ color: "var(--ac)" }}>+{pts}pts</span>
          )}
          {open ? <ChevronDown size={13} style={{ color: "var(--ft)" }} /> : <ChevronRightIcon size={13} style={{ color: "var(--ft)" }} />}
        </div>
      </button>
      {open && <div className="p-2">{children}</div>}
    </div>
  );
}

export function PlayerDrawer({ userId, groupId, groupName, name, avatarUrl, country, points, rank, open, onClose }: PlayerDrawerProps) {
  const [history,         setHistory]         = useState<MemberPrediction[]>([]);
  const [bestThird,       setBestThird]        = useState<MemberPredictionsResponse["bestThird"] | null>(null);
  const [tournamentPicks, setTournamentPicks]  = useState<TournamentPick[]>([]);
  const [loading,         setLoading]          = useState(false);
  const [dataLoaded,      setDataLoaded]       = useState(false);
  const [stats,           setStats]            = useState({ exactCount: 0, outcomeCount: 0, missedCount: 0, gsPts: 0, knockoutPts: 0, bestThirdPts: 0, bonusPts: 0 });
  const [apiTotal,        setApiTotal]         = useState<number | null>(null);
  const [closeHover,      setCloseHover]       = useState(false);
  const [mounted,         setMounted]          = useState(false);

  // Portal to <body> — a page-transition ancestor sets `willChange: opacity`,
  // which unconditionally creates a stacking context (per spec, regardless
  // of the actual opacity value) and traps this drawer's z-index below the
  // global app header's, even though the drawer is position:fixed. Portaling
  // out of that ancestor is the only fix that survives future page changes.
  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            aria-hidden="true"
            className="fixed inset-0 z-50"
            style={{ background: "var(--shad)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} player details`}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 overflow-y-auto cc-elevated"
            style={{
              background: "var(--sf)",
              borderLeft: "1px solid var(--br)",
              boxShadow: "-8px 0 40px var(--shad)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 px-5 py-4 flex flex-col gap-2"
              style={{
                borderBottom: "1px solid var(--br)",
                background: "var(--nv)",
                paddingTop: "calc(16px + env(safe-area-inset-top, 0px))",
              }}
            >
              {/* Group-context indicator — stays visible with the rest of the
                  sticky header so it's always clear which group's data this is. */}
              {groupName && (
                <div className="flex items-center gap-1.5">
                  <Users size={11} style={{ color: "var(--ac)", flexShrink: 0 }} />
                  <span className="text-[11px] font-bold truncate" style={{ color: "var(--t2)" }}>{groupName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <UserAvatar name={name} avatarUrl={avatarUrl} size="lg" teamCountry={country} />
                    <div className="absolute -bottom-1 -right-1">
                      <FlagBadge code={countryFlagCode(country)} label={country} size="sm" />
                    </div>
                  </div>
                  <div>
                    <div className="ta-team-name" style={{ color: "var(--tx)" }}>{name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: "var(--ac)" }}>Rank #{rank}</span>
                      <span className="text-xs" style={{ color: "var(--ft)" }}>·</span>
                      <span className="text-xs font-black" style={{ color: "var(--tx)" }}>{totalPoints} pts</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close player details"
                  onClick={onClose}
                  className={`p-2 rounded-xl ${FOCUS_RING}`}
                  style={{ background: closeHover ? "var(--ip)" : "transparent", transition: "background 0.15s" }}
                  onMouseEnter={() => setCloseHover(true)}
                  onMouseLeave={() => setCloseHover(false)}
                >
                  <X size={18} style={{ color: "var(--t2)" }} />
                </button>
              </div>
            </div>

            {/* Point breakdown chips */}
            <div className="px-5 py-3 flex flex-wrap gap-2" style={{ borderBottom: "1px solid var(--dv)" }}>
              {[
                { icon: Volleyball, label: "GS",     value: stats.gsPts        },
                { icon: Trophy,     label: "KO",     value: stats.knockoutPts  },
                { icon: Medal,      label: "3rd",    value: stats.bestThirdPts },
                { icon: Star,       label: "Bonus",  value: stats.bonusPts     },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ background: "var(--ip)", border: "1px solid var(--br)" }}
                >
                  <Icon size={11} style={{ color: "var(--t2)" }} />
                  <span className="text-[10px] font-bold" style={{ color: "var(--t2)" }}>{label}:</span>
                  <span className="text-[11px] font-black" style={{ color: value > 0 ? "var(--tx)" : "var(--ft)", fontFamily: "var(--font-mono)" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Accuracy stats */}
            <div className="grid grid-cols-3 gap-2 px-5 py-3" style={{ borderBottom: "1px solid var(--dv)" }}>
              {[
                { icon: Target,     label: "Exact",   value: stats.exactCount,   color: "var(--sc)" },
                { icon: TrendingUp, label: "Correct", value: stats.outcomeCount, color: "var(--ac)" },
                { icon: XCircle,    label: "Missed",  value: stats.missedCount,  color: "#f87171" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="p-2.5 text-center cc-elevated" style={{ background: "var(--ip)", border: "0.5px solid var(--br)", borderRadius: "var(--border-radius-lg)" }}>
                  <Icon size={14} className="mx-auto mb-1" style={{ color }} />
                  <div className="ta-stat-number" style={{ color: "var(--tx)" }}>{value}</div>
                  <div className="ta-section-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {loading ? (
                <div className="py-8 flex justify-center"><BallLoader size="sm" label={null} /></div>
              ) : history.length === 0 && tournamentPicks.length === 0 && !bestThird?.enabled ? (
                <div className="py-8 text-center space-y-2">
                  <Zap size={28} className="mx-auto" style={{ color: "var(--ft)" }} />
                  <p className="ta-body">
                    No scored predictions yet. Check back after games are played.
                  </p>
                </div>
              ) : (
                <>
                  {/* Group Stage */}
                  {hasGS && (
                    <CollapsibleSection
                      title="Group Stage"
                      icon={<Volleyball size={13} style={{ color: "var(--t2)" }} />}
                      count={gsMatches.length}
                      pts={stats.gsPts}
                      defaultOpen={false}
                    >
                      {gsLetters.map(letter => (
                        <div key={letter} className="mb-2">
                          <div className="ta-section-label px-3 py-1 mb-1">
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
                      icon={<Trophy size={13} style={{ color: "#d97706" }} />}
                      count={koMatches.length}
                      pts={stats.knockoutPts}
                      defaultOpen={true}
                    >
                      {koStages.map(stage => (
                        <div key={stage} className="mb-2">
                          <div className="ta-section-label px-3 py-1 mb-1">
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
                      <div className="divide-y" style={{ borderColor: "var(--dv)" }}>
                        {bestThird.picks.map(pick => (
                          <div key={pick.slot} className="flex items-center justify-between px-3 py-1.5">
                            <span className="text-sm" style={{ color: "var(--t2)" }}>{pick.team}</span>
                            <div className="flex items-center gap-2">
                              {pick.pointsEarned > 0 && (
                                <span className="text-[10px] font-bold" style={{ color: "var(--ac)" }}>+{pick.pointsEarned}pts</span>
                              )}
                              <span className="text-base font-bold" style={{ color: pick.correct ? "var(--ac)" : "var(--ft)" }}>
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
                      <div className="divide-y" style={{ borderColor: "var(--dv)" }}>
                        {tournamentPicks.map(pick => (
                          <div key={pick.predType} className="flex items-center justify-between px-3 py-2">
                            <div>
                              <div className="ta-section-label mb-0.5">
                                {TOURNEY_LABELS[pick.predType] ?? pick.predType}
                              </div>
                              <div className="text-sm font-bold" style={{ color: "var(--tx)" }}>
                                {pick.predValue ?? "—"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {pick.status === "pending" && (
                                <span className="text-[10px]" style={{ color: "var(--ft)" }}>pending</span>
                              )}
                              {pick.status === "correct" && (
                                <span className="text-[10px] font-bold" style={{ color: "var(--ac)" }}>+{pick.pointsEarned}pts</span>
                              )}
                              {pick.status !== "pending" && (
                                <span className="text-base font-bold" style={{ color: pick.status === "correct" ? "var(--ac)" : "var(--ft)" }}>
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
    </AnimatePresence>,
    document.body
  );
}
