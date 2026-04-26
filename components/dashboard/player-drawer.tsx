"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Check, Trophy, Star } from "lucide-react";
import type { Member } from "@/lib/types";

// Mock point history — will come from Supabase later
const MOCK_HISTORY = [
  { id: "1", match: "Israel vs France",     date: "Jun 12", type: "exact",   points: 25, detail: "Predicted 2–1 ✓" },
  { id: "2", match: "Argentina vs Brazil",  date: "Jun 13", type: "outcome", points: 10, detail: "Predicted Argentina win ✓" },
  { id: "3", match: "England vs Spain",     date: "Jun 14", type: "miss",    points: 0,  detail: "Predicted England win ✗" },
  { id: "4", match: "Tournament Winner",    date: "Pre-tourney", type: "tournament", points: 100, detail: "Picked Argentina 🏆" },
  { id: "5", match: "Top Scorer",           date: "Pre-tourney", type: "scorer", points: 0, detail: "Picked Mbappé (pending)" },
];

const TYPE_CONFIG = {
  exact:      { icon: Target,  color: "#3CAC3B", label: "Exact score",   bg: "rgba(60,172,59,0.12)"    },
  outcome:    { icon: Check,   color: "#6EE7B7", label: "Correct outcome", bg: "rgba(110,231,183,0.1)" },
  miss:       { icon: X,       color: "#64748B", label: "Missed",         bg: "rgba(100,116,139,0.1)"  },
  tournament: { icon: Trophy,  color: "#D4AF37", label: "Tournament pick", bg: "rgba(212,175,55,0.12)" },
  scorer:     { icon: Star,    color: "#F59E0B", label: "Top scorer pick", bg: "rgba(245,158,11,0.1)"  },
};

interface PlayerDrawerProps {
  member: Member | null;
  onClose: () => void;
}

export function PlayerDrawer({ member, onClose }: PlayerDrawerProps) {
  return (
    <AnimatePresence>
      {member && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 glass-strong border-l border-white/[0.08] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 glass-strong border-b border-white/[0.08] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))",
                  }}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display text-xl uppercase text-white">
                    {member.name}
                  </div>
                  <div className="text-xs text-pitch-400">{member.country}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-pitch-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Points summary */}
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display text-5xl"
                  style={{ color: "rgb(var(--accent-glow))" }}
                >
                  {member.points}
                </span>
                <span className="text-pitch-400 text-sm uppercase tracking-widest">
                  total points
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.04] py-2">
                  <div className="font-display text-2xl text-success">3</div>
                  <div className="text-[10px] text-pitch-500 uppercase tracking-wider">Exact</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] py-2">
                  <div className="font-display text-2xl text-white">9</div>
                  <div className="text-[10px] text-pitch-500 uppercase tracking-wider">Correct</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] py-2">
                  <div className="font-display text-2xl text-pitch-500">4</div>
                  <div className="text-[10px] text-pitch-500 uppercase tracking-wider">Missed</div>
                </div>
              </div>
            </div>

            {/* Point history */}
            <div className="px-5 py-4">
              <div className="label-caps mb-3">Point history</div>
              <div className="space-y-2">
                {MOCK_HISTORY.map((h) => {
                  const cfg = TYPE_CONFIG[h.type as keyof typeof TYPE_CONFIG];
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 rounded-xl p-3 border border-white/[0.06]"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      {/* Icon */}
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cfg.color}20` }}
                      >
                        <cfg.icon size={15} style={{ color: cfg.color }} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {h.match}
                        </div>
                        <div className="text-[11px] text-pitch-400">{h.detail}</div>
                      </div>

                      {/* Points */}
                      <div className="shrink-0 text-right">
                        <div
                          className="font-display text-xl"
                          style={{ color: h.points > 0 ? cfg.color : "#475569" }}
                        >
                          {h.points > 0 ? `+${h.points}` : "0"}
                        </div>
                        <div className="text-[10px] text-pitch-600">{h.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
