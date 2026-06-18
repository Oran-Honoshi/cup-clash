"use client";

import { Trophy, Check, X as XIcon, Minus } from "lucide-react";

export type PredictionBadgeType = "exact" | "correct" | "missed" | "none";

interface PredictionBadgeProps {
  type: PredictionBadgeType;
  points?: number;
  size?: "sm" | "md";
}

const CFG = {
  exact:   { Icon: Trophy, label: "Exact",   color: "#ffaa00", bg: "#162a10", border: "#2a4a10" },
  correct: { Icon: Check,  label: "Correct", color: "#5aaa6a", bg: "#162a16", border: "#2a5a2a" },
  missed:  { Icon: XIcon,  label: "Missed",  color: "#cc4444", bg: "#1a0a0a", border: "#3a1a1a" },
  none:    { Icon: Minus,  label: "No pick", color: "#3a7a3a", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" },
} as const;

export function PredictionBadge({ type, points, size = "md" }: PredictionBadgeProps) {
  // "none" means no prediction was made — callers render their own dash if needed
  if (type === "none") return null;

  const { Icon, label, color, bg, border } = CFG[type];
  const iconSize = size === "sm" ? 9  : 10;
  const fontSize = size === "sm" ? 9  : 9;
  const px       = size === "sm" ? "2px 7px" : "2px 9px";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1 font-barlow font-bold uppercase"
        style={{
          background: bg,
          border: `1px solid ${border}`,
          color,
          fontSize,
          padding: px,
          borderRadius: 5,
          letterSpacing: "0.5px",
        }}
      >
        <Icon size={iconSize} />
        {label}
      </span>
      {points !== undefined && (
        <span
          className="font-barlow font-bold"
          style={{ color: type === "missed" ? "#3a7a3a" : color, fontSize }}
        >
          {type === "missed" ? "0 pts" : `+${points} pts`}
        </span>
      )}
    </span>
  );
}
