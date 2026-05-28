"use client";

import { motion } from "framer-motion";
import { TrendingDown, ThumbsDown, Frown, Meh } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import type { Member } from "@/lib/types";

interface WallOfShameProps {
  members:       Member[];
  totalMatches?: number;
}

export function WallOfShame({ members, totalMatches = 20 }: WallOfShameProps) {
  if (members.length < 3) return null;

  const sorted = [...members]
    .filter(m => !m.isGhost && (m.correctPredictions ?? 0) + (m.exactScores ?? 0) > 0)
    .sort((a, b) => {
      const accA = ((a.correctPredictions ?? 0) + (a.exactScores ?? 0)) / totalMatches;
      const accB = ((b.correctPredictions ?? 0) + (b.exactScores ?? 0)) / totalMatches;
      return accA - accB;
    });

  const bottom3 = sorted.slice(0, 3);
  if (!bottom3.length) return null;

  const SHAME_ITEMS = [
    { Icon: ThumbsDown, label: "The Wall",   sub: "Worst accuracy",  color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)"  },
    { Icon: Frown,      label: "Dead Cert",  sub: "Second worst",    color: "#fbbf24", bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.15)"  },
    { Icon: Meh,        label: "The Pundit", sub: "Third worst",      color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(18,14,38,0.5)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <TrendingDown size={16} strokeWidth={1.5} style={{ color: "#f87171" }} />
          <span className="font-display text-xl uppercase tracking-tight text-white">Wall of Shame</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Lowest accuracy</span>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>In a good group, the losers are just as celebrated as the winners.</p>
        {bottom3.map((member, i) => {
          const { Icon, label, sub, color, bg, border } = SHAME_ITEMS[i];
          const accuracy = totalMatches > 0 ? Math.round(((member.correctPredictions ?? 0) + (member.exactScores ?? 0)) / totalMatches * 100) : 0;
          return (
            <motion.div key={member.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon size={15} strokeWidth={1.5} style={{ color }} />
              </div>
              <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold truncate text-white">{member.name}</span>
                  {i === 0 && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}>{label}</span>}
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono font-black text-xl" style={{ color }}>{accuracy}%</div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>accuracy</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="px-5 py-2 border-t text-[10px] text-center" style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>
        Updated after every match · only shown when 3+ matches played
      </div>
    </div>
  );
}