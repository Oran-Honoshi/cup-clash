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

interface TimeUnit { value: number; label: string; }

function getTimeUnits(target: Date): TimeUnit[] {
  const total   = Math.max(0, differenceInSeconds(target, new Date()));
  const days    = Math.floor(total / 86400);
  const hours   = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [
    { value: days,    label: "DAYS" },
    { value: hours,   label: "HRS"  },
    { value: minutes, label: "MIN"  },
    { value: seconds, label: "SEC"  },
  ];
}

export function CountdownCard({ target, matchLabel }: CountdownProps) {
  const [units,   setUnits]   = useState<TimeUnit[]>(() => getTimeUnits(target));
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
      className="relative rounded-3xl p-5 overflow-hidden w-full"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0,212,255,0.2)",
        boxShadow: "0 8px 32px rgba(0,212,255,0.08)",
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-8 right-8 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
              style={{ backgroundColor: "#00FF88" }} />
            <span className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: "#00FF88" }} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
            Next Kickoff
          </span>
        </div>
        <Radio size={14} style={{ color: "#cbd5e1" }} />
      </div>

      {/* Match name */}
      <div className="mb-4">
        <div className="font-display text-2xl uppercase tracking-tight leading-tight" style={{ color: "#0B141B" }}>
          {matchLabel}
        </div>
        <div className="text-xs font-mono mt-1" style={{ color: "#64748b" }} suppressHydrationWarning>
          {mounted ? formatInTimeZone(target, "UTC", "EEE, dd MMM · HH:mm 'UTC'") : "—"}
        </div>
      </div>

      {/* Countdown boxes */}
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div key={unit.label}
            className="rounded-xl py-3 text-center flex flex-col items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,212,255,0.15)",
              boxShadow: "0 2px 8px rgba(0,212,255,0.06)",
            }}
          >
            <div
              className="tabular font-display leading-none font-black"
              style={{ fontSize: "clamp(22px, 4vw, 44px)", color: "#0B141B" }}
              suppressHydrationWarning
            >
              {mounted ? String(unit.value).padStart(2, "0") : "--"}
            </div>
            <div className="text-[9px] font-bold tracking-[0.2em] mt-1.5 uppercase" style={{ color: "#94a3b8" }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="mt-4 pt-4 text-[10px] text-center uppercase tracking-widest"
        style={{ color: "#94a3b8", borderTop: "1px solid rgba(0,212,255,0.1)" }}>
        Bets lock 5 min before kickoff
      </div>
    </motion.div>
  );
}