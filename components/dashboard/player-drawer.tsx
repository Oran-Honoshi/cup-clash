"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Trophy, TrendingUp, Zap, XCircle } from "lucide-react";
import Image from "next/image";
import { flagUrl, countryFlagCode } from "@/lib/countries";
import { FOCUS_RING } from "@/lib/a11y";
import { PredictionBadge } from "@/components/predictions/prediction-badge";
import type { MemberPrediction, MemberPredictionsResponse } from "@/app/api/member-predictions/route";

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

export function PlayerDrawer({ userId, groupId, name, country, points, rank, open, onClose }: PlayerDrawerProps) {
  const [history,      setHistory]      = useState<MemberPrediction[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [dataLoaded,   setDataLoaded]   = useState(false);
  const [exactCount,   setExactCount]   = useState(0);
  const [outcomeCount, setOutcomeCount] = useState(0);
  const [missedCount,  setMissedCount]  = useState(0);
  const [closeHover,   setCloseHover]   = useState(false);

  // Derive total directly from history so tile and list are always in sync.
  // Fall back to the leaderboard prop while loading or on API failure.
  const totalPoints = dataLoaded
    ? history.reduce((s, i) => s + i.pts, 0)
    : points;

  useEffect(() => {
    if (!open || !userId || !groupId) return;
    setLoading(true);
    setDataLoaded(false);
    setHistory([]);

    fetch(`/api/member-predictions?userId=${encodeURIComponent(userId)}&groupId=${encodeURIComponent(groupId)}`)
      .then(r => r.json())
      .then((data: MemberPredictionsResponse) => {
        setHistory(data.history ?? []);
        setExactCount(data.stats.exactCount);
        setOutcomeCount(data.stats.outcomeCount);
        setMissedCount(data.stats.missedCount);
        setDataLoaded(true);
      })
      .catch(() => { /* silently fail — UI already shows empty state */ })
      .finally(() => setLoading(false));
  }, [open, userId, groupId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(18,14,38,0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="relative h-10 w-10 rounded-full overflow-hidden"
                  style={{ border: "2px solid rgba(0,212,255,0.2)" }}
                >
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
                style={{
                  background: closeHover ? "rgba(255,255,255,0.1)" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={() => setCloseHover(true)}
                onMouseLeave={() => setCloseHover(false)}
              >
                <X size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            </div>

            {/* Stats — 2×2 grid */}
            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              {[
                { icon: Trophy,    label: "Total pts",  value: totalPoints,  color: "#0891B2" },
                { icon: Target,    label: "Exact",      value: exactCount,   color: "#facc15" },
                { icon: TrendingUp,label: "Correct",    value: outcomeCount, color: "#00FF88" },
                { icon: XCircle,   label: "Missed",     value: missedCount,  color: "#f87171" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(18,14,38,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon size={16} className="mx-auto mb-1" style={{ color }} />
                  <div className="font-black text-xl" style={{ color: "white" }}>{value}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Point history — only pts > 0 matches */}
            <div className="px-5 pb-8">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                Point History
              </div>

              {loading ? (
                <div className="py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Loading...</div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Zap size={28} className="mx-auto" style={{ color: "rgba(255,255,255,0.2)" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                    No points earned yet. Check back after games are played.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(item => (
                    <div
                      key={item.matchId}
                      className="rounded-xl px-3 py-2.5"
                      style={{
                        background: item.type === "exact" ? "rgba(250,204,21,0.05)" : "rgba(0,255,136,0.04)",
                        border: `1px solid ${item.type === "exact" ? "rgba(250,204,21,0.18)" : "rgba(0,255,136,0.15)"}`,
                      }}
                    >
                      {/* Top row: flags + match name + points */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="relative h-4 w-5 rounded-sm overflow-hidden">
                            <Image src={flagUrl(item.homeFlagCode, 20)} alt={item.home} fill className="object-cover" unoptimized />
                          </div>
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>vs</span>
                          <div className="relative h-4 w-5 rounded-sm overflow-hidden">
                            <Image src={flagUrl(item.awayFlagCode, 20)} alt={item.away} fill className="object-cover" unoptimized />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate text-white">
                            {item.home} vs {item.away}
                          </div>
                        </div>
                        <div
                          className="shrink-0 font-black text-base font-mono"
                          style={{ color: item.type === "exact" ? "#facc15" : "#00FF88" }}
                        >
                          +{item.pts}
                        </div>
                      </div>
                      {/* Bottom row: result · pick · badge */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Result: <span className="font-mono font-bold text-white">{item.actual}</span>
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Pick: <span className="font-mono font-bold text-white">{item.predicted}</span>
                        </span>
                        <span className="ml-auto">
                          <PredictionBadge type={item.type} size="sm" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
