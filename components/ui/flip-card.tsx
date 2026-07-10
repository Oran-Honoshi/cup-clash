"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface FlipCardProps {
  /** When true, shows `back`; when false, shows `front`. */
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  /** Flip duration in ms — keep this snappy (300–450ms). */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A contained 3D flip-card transition between two faces. Falls back to an
 * instant fade when the user has prefers-reduced-motion enabled.
 *
 * Both faces are absolutely positioned during the 3D flip, so the caller
 * must give this an explicit height (via style/className).
 *
 * This is a deliberately rare flourish — do not reuse for list/grid rows.
 */
export function FlipCard({ flipped, front, back, duration = 380, className, style }: FlipCardProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className={className} style={{ position: "relative", width: "100%", height: "100%", ...style }}>
        <motion.div
          key={flipped ? "back" : "front"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12 }}
          style={{ width: "100%", height: "100%" }}
        >
          {flipped ? back : front}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={className} style={{ perspective: 900, width: "100%", height: "100%", ...style }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: duration / 1000, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
