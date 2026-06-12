"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Trophy, Zap, TrendingUp } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { flagUrl } from "@/lib/countries";
import { FOCUS_RING } from "@/lib/a11y";
import { PredictionBadge } from "@/components/predictions/prediction-badge";

interface PointHistoryItem {
  matchId:      string;
  home:         string;
  away:         string;
  homeFlagCode: string;
  awayFlagCode: string;
  predicted:    string;
  actual:       string;
  pts:          number;
  type:         "exact" | "correct" | "missed";
}

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

const FLAG_CODES: Record<string, string> = {
  "Mexico": "mx", "South Africa": "za", "Brazil": "br", "Morocco": "ma",
  "USA": "us", "Paraguay": "py", "Germany": "de", "France": "fr",
  "Argentina": "ar", "England": "gb-eng", "Spain": "es", "Portugal": "pt",
  "Netherlands": "nl", "Belgium": "be", "Japan": "jp", "Australia": "au",
};

function getFlagCode(teamName: string): string {
  return FLAG_CODES[teamName] ?? "un";
}

export function PlayerDrawer({ userId, groupId, name, country, points, rank, open, onClose }: PlayerDrawerProps) {
  const [history,  setHistory]  = useState<PointHistoryItem[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [exactCount,   setExactCount]   = useState(0);
  const [outcomeCount, setOutcomeCount] = useState(0);
  const [closeHover, setCloseHover] = useState(false);

  useEffect(() => {
    if (!open || !userId || !groupId) return;
    setLoading(true);

    const sb = createClient();
    sb.from("group_predictions")
      .select(`
        match_id, home_score, away_score, points_earned, is_exact,
        matches ( home, away, home_flag, away_flag, home_score, away_score, status )
      `)
      .eq("user_id",  userId)
      .eq("group_id", groupId)
      .order("updated_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!data?.length) { setLoading(false); return; }

        type RawRow = {
          match_id:      string;
          home_score:    number;
          away_score:    number;
          points_earned: number | null;
          is_exact:      boolean | null;
          matches: {
            home:       string;
            away:       string;
            home_flag:  string | null;
            away_flag:  string | null;
            home_score: number | null;
            away_score: number | null;
            status:     string;
          } | null;
        };

        const items: PointHistoryItem[] = (data as unknown as RawRow[])
          // only show finished matches
          .filter(p => p.matches?.status === "finished")
          .map(p => {
            const m         = p.matches!;
            const actualH   = m.home_score ?? 0;
            const actualA   = m.away_score ?? 0;
            const predH     = p.home_score;
            const predA     = p.away_score;
            const isExact   = predH === actualH && predA === actualA;
            const predW     = predH > predA ? "H" : predH < predA ? "A" : "D";
            const realW     = actualH > actualA ? "H" : actualH < actualA ? "A" : "D";
            const type: PointHistoryItem["type"] =
              isExact ? "exact" : predW === realW ? "correct" : "missed";
            return {
              matchId:      p.match_id,
              home:         m.home,
              away:         m.away,
              homeFlagCode: m.home_flag ?? getFlagCode(m.home),
              awayFlagCode: m.away_flag ?? getFlagCode(m.away),
              predicted:    `${predH}–${predA}`,
              actual:       `${actualH}–${actualA}`,
              pts:          p.points_earned ?? 0,
              type,
            };
          });

        setHistory(items);
        setExactCount(items.filter(i => i.type === "exact").length);
        setOutcomeCount(items.filter(i => i.type === "correct").length);
        setLoading(false);
      });
  }, [open, userId, groupId]);

  // Escape closes the drawer (keyboard parity with the backdrop click).
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            aria-hidden="true"
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} player details`}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 overflow-y-auto"
            style={{ background: "rgba(8,6,20,0.95)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderLeft: "1px solid rgba(0,212,255,0.15)", boxShadow: "-8px 0 40px rgba(0,0,0,0.1)" }}>

            {/* Header */}
            <div className="sticky top-0 px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(18,14,38,0.6)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden"
                  style={{ border: "2px solid rgba(0,212,255,0.2)" }}>
                  <Image src={flagUrl(country, 40)} alt={country} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <div className="font-display text-xl uppercase font-black" style={{ color: "white" }}>{name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#00D4FF" }}>Rank #{rank}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                    <span className="text-xs font-black" style={{ color: "white" }}>{points} pts</span>
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 px-5 py-4">
              {[
                { icon: Trophy,    label: "Total pts",  value: points,       color: "#0891B2" },
                { icon: Target,    label: "Exact",      value: exactCount,   color: "#facc15" },
                { icon: TrendingUp,label: "Correct",    value: outcomeCount, color: "#00FF88" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(18,14,38,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Icon size={16} className="mx-auto mb-1" style={{ color }} />
                  <div className="font-black text-xl" style={{ color: "white" }}>{value}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Point history */}
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
                    No finished matches yet. Check back after games are played.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(item => (
                    <div key={item.matchId}
                      className="rounded-xl px-3 py-2.5"
                      style={{
                        background:
                          item.type === "exact"   ? "rgba(250,204,21,0.05)"  :
                          item.type === "correct" ? "rgba(0,255,136,0.04)"   :
                          "rgba(239,68,68,0.04)",
                        border: `1px solid ${
                          item.type === "exact"   ? "rgba(250,204,21,0.18)" :
                          item.type === "correct" ? "rgba(0,255,136,0.15)"  :
                          "rgba(239,68,68,0.15)"
                        }`,
                      }}>
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
                        {item.pts > 0 && (
                          <div className="shrink-0 font-black text-base font-mono"
                            style={{ color: item.type === "exact" ? "#facc15" : "#00FF88" }}>
                            +{item.pts}
                          </div>
                        )}
                      </div>
                      {/* Bottom row: pick · result · badge */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Pick: <span className="font-mono font-bold text-white">{item.predicted}</span>
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Result: <span className="font-mono font-bold text-white">{item.actual}</span>
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
