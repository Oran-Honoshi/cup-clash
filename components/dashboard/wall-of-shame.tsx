"use client";

import { motion } from "framer-motion";
import { TrendingDown, ThumbsDown, Frown, Meh } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MemberAvatar } from "@/components/ui/member-avatar";
import type { Member } from "@/lib/types";

interface WallOfShameProps {
  members: Member[];
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
  if (bottom3.length === 0) return null;

  const SHAME_ITEMS = [
    { Icon: ThumbsDown, label: "The Wall",   sub: "Worst accuracy",  color: "#dc2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.15)"  },
    { Icon: Frown,      label: "Dead Cert",  sub: "Second worst",    color: "#d97706", bg: "rgba(217,119,6,0.06)",   border: "rgba(217,119,6,0.12)"  },
    { Icon: Meh,        label: "The Pundit", sub: "Third worst",      color: "#64748b", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.12)" },
  ];

  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <TrendingDown size={16} strokeWidth={1.5} style={{ color: "#dc2626" }} />
        <span className="font-display text-xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Wall of Shame
        </span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
          Lowest accuracy
        </span>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>
          In a good group, the losers are just as celebrated as the winners.
        </p>

        {bottom3.map((member, i) => {
          const { Icon, label, sub, color, bg, border } = SHAME_ITEMS[i];
          const accuracy = totalMatches > 0
            ? Math.round(((member.correctPredictions ?? 0) + (member.exactScores ?? 0)) / totalMatches * 100)
            : 0;

          return (
            <motion.div key={member.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              {/* Icon badge */}
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon size={15} strokeWidth={1.5} style={{ color }} />
              </div>

              {/* Avatar */}
              <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />

              {/* Name + label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold truncate" style={{ color: "#334155" }}>
                    {member.name}
                  </span>
                  {i === 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}>
                      {label}
                    </span>
                  )}
                </div>
                <div className="text-[10px]" style={{ color: "#94a3b8" }}>{sub}</div>
              </div>

              {/* Accuracy */}
              <div className="text-right shrink-0">
                <div className="font-mono font-black text-xl" style={{ color }}>
                  {accuracy}%
                </div>
                <div className="text-[10px]" style={{ color: "#94a3b8" }}>accuracy</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="px-5 py-2 border-t border-slate-50 text-[10px] text-center" style={{ color: "#94a3b8" }}>
        Updated after every match · only shown when 3+ matches played
      </div>
    </Card>
  );
}