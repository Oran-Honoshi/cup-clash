"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds, format } from "date-fns";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";

interface CountdownProps {
  target: Date;
  matchLabel: string;
}

interface TimeUnit {
  value: number;
  label: string;
}

function getTimeUnits(target: Date): TimeUnit[] {
  const totalSeconds = Math.max(0, differenceInSeconds(target, new Date()));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    { value: days, label: "DAYS" },
    { value: hours, label: "HRS" },
    { value: minutes, label: "MIN" },
    { value: seconds, label: "SEC" },
  ];
}

/**
 * The signature stadium-energy element of the landing page.
 * Sits inside the light SaaS hero like a jewel — dark, glowing,
 * unmistakable. Re-tints to user's chosen country.
 */
export function CountdownCard({ target, matchLabel }: CountdownProps) {
  const [units, setUnits] = useState<TimeUnit[]>(() => getTimeUnits(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setUnits(getTimeUnits(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="countdown-card relative rounded-[24px] p-6 sm:p-8 shadow-2xl"
      style={{ boxShadow: "0 24px 60px rgb(var(--accent) / 0.25)" }}
    >
      {/* Header: live indicator + match name */}
      <div className="relative flex items-center justify-between text-white/70 mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            Next Kickoff
          </span>
        </div>
        <Radio size={14} className="text-white/40" />
      </div>

      {/* Match name */}
      <div className="relative mb-6">
        <div className="text-white font-extrabold text-2xl sm:text-3xl tracking-tight">
          {matchLabel}
        </div>
        <div className="text-white/50 text-xs font-mono mt-1">
          {format(target, "EEE, dd MMM · HH:mm 'UTC'")}
        </div>
      </div>

      {/* The numerals */}
      <div className="relative grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-1 py-4 sm:py-5 text-center"
          >
            <div
              className="countdown-numeral tabular text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-none"
              suppressHydrationWarning
            >
              {mounted ? String(unit.value).padStart(2, "0") : "--"}
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-white/50 mt-2">
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="relative mt-6 pt-5 border-t border-white/[0.06] text-[11px] text-white/40 text-center">
        Bets lock 5 minutes before kickoff
      </div>
    </motion.div>
  );
}
