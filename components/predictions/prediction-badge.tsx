"use client";

import { Trophy, Check, X as XIcon, Minus } from "lucide-react";

export type PredictionBadgeType = "exact" | "correct" | "missed" | "none";

interface PredictionBadgeProps {
  type: PredictionBadgeType;
  points?: number;
  size?: "sm" | "md";
}

const CFG = {
  exact:   { Icon: Trophy, label: "Exact",   color: "#facc15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.28)" },
  correct: { Icon: Check,  label: "Correct", color: "#00FF88", bg: "rgba(0,255,136,0.08)",  border: "rgba(0,255,136,0.25)"  },
  missed:  { Icon: XIcon,  label: "Missed",  color: "#f87171", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.22)"  },
  none:    { Icon: Minus,  label: "No pick", color: "rgba(255,255,255,0.28)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" },
} as const;

export function PredictionBadge({ type, points, size = "md" }: PredictionBadgeProps) {
  const { Icon, label, color, bg, border } = CFG[type];
  const iconSize  = size === "sm" ? 9  : 11;
  const fontSize  = size === "sm" ? 9  : 10;
  const px        = size === "sm" ? "4px 7px" : "4px 9px";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide"
        style={{ background: bg, border: `1px solid ${border}`, color, fontSize, padding: px }}
      >
        <Icon size={iconSize} />
        {label}
      </span>
      {type !== "none" && points !== undefined && (
        <span
          className="font-mono font-bold"
          style={{ color: type === "missed" ? "rgba(255,255,255,0.3)" : color, fontSize }}
        >
          {type === "missed" ? "0 pts" : `+${points} pts`}
        </span>
      )}
    </span>
  );
}
