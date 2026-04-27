"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
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
    { value: days,    label: "DAYS" },
    { value: hours,   label: "HRS"  },
    { value: minutes, label: "MIN"  },
    { value: seconds, label: "SEC"  },
  ];
}

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
      className="glass-strong relative rounded-3xl p-5 overflow-hidden w-full"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--accent) / 0.6), transparent)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between text-pitch-300 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
              style={{ backgroundColor: "rgb(var(--accent))" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: "rgb(var(--accent))" }}
            />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            Next Kickoff
          </span>
        </div>
        <Radio size={14} className="text-white/30" />
      </div>

      {/* Match name */}
      <div className="relative mb-4">
        <div className="font-display text-2xl uppercase tracking-tight text-white leading-tight">
          {matchLabel}
        </div>
        <div className="text-pitch-400 text-xs font-mono mt-1" suppressHydrationWarning>
          {mounted
            ? formatInTimeZone(target, "UTC", "EEE, dd MMM · HH:mm 'UTC'")
            : "—"}
        </div>
      </div>

      {/* Countdown numerals — 4 equal boxes in a row */}
      <div className="relative grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-xl bg-white/[0.04] border border-white/[0.08] py-3 text-center flex flex-col items-center justify-center"
          >
            {/* Number — uses viewport-independent sizing so it doesn't overflow */}
            <div
              className="text-glow tabular text-white font-display leading-none font-bold"
              style={{ fontSize: "clamp(22px, 4vw, 44px)" }}
              suppressHydrationWarning
            >
              {mounted ? String(unit.value).padStart(2, "0") : "--"}
            </div>
            <div className="text-[9px] font-bold tracking-[0.2em] text-pitch-500 mt-1.5 uppercase">
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="relative mt-4 pt-4 border-t border-white/[0.06] text-[10px] text-pitch-500 text-center uppercase tracking-widest">
        Bets lock 5 min before kickoff
      </div>
    </motion.div>
  );
}
