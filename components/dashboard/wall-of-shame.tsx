"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

interface WallOfShameProps {
  members: Member[];
  totalMatches?: number;
}

export function WallOfShame({ members, totalMatches = 20 }: WallOfShameProps) {
  if (members.length < 3) return null;

  // Sort by accuracy ascending — lowest first
  const sorted = [...members]
    .filter(m => !m.isGhost && (m.correctPredictions ?? 0) + (m.exactScores ?? 0) > 0)
    .sort((a, b) => {
      const accA = ((a.correctPredictions ?? 0) + (a.exactScores ?? 0)) / totalMatches;
      const accB = ((b.correctPredictions ?? 0) + (b.exactScores ?? 0)) / totalMatches;
      return accA - accB;
    });

  const bottom3 = sorted.slice(0, 3);
  if (bottom3.length === 0) return null;

  const SHAME_LABELS = [
    { emoji: "🧱", label: "The Wall",    sub: "Worst accuracy this week" },
    { emoji: "💀", label: "Dead Cert",   sub: "Second worst" },
    { emoji: "🤦", label: "The Pundit",  sub: "Third worst" },
  ];

  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
        <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">Wall of Shame</span>
        <span className="ml-auto text-[10px] text-pitch-600 uppercase tracking-widest">Lowest accuracy</span>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs text-pitch-500 mb-3">
          In a good group, the losers are just as celebrated as the winners. 🏅
        </p>

        {bottom3.map((member, i) => {
          const { emoji, label, sub } = SHAME_LABELS[i];
          const accuracy = totalMatches > 0
            ? Math.round(((member.correctPredictions ?? 0) + (member.exactScores ?? 0)) / totalMatches * 100)
            : 0;

          return (
            <motion.div key={member.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                i === 0 ? "border border-warning/20" : "border border-white/[0.04]"
              )}
              style={i === 0 ? { background: "rgba(245,158,11,0.06)" } : { background: "rgba(255,255,255,0.02)" }}
            >
              {/* Shame emoji */}
              <span className="text-xl w-7 text-center shrink-0">{emoji}</span>

              {/* Avatar */}
              <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" dim />

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-pitch-300 truncate">{member.name}</span>
                  {i === 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                      {label}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-pitch-600">{sub}</div>
              </div>

              {/* Accuracy */}
              <div className="text-right shrink-0">
                <div className="font-display text-xl" style={{ color: i === 0 ? "#f59e0b" : "#64748b" }}>
                  {accuracy}%
                </div>
                <div className="text-[10px] text-pitch-600">accuracy</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="px-5 py-2 border-t border-white/[0.04] text-[10px] text-pitch-600 text-center">
        Updated after every match · only shown when 3+ matches played
      </div>
    </Card>
  );
}
