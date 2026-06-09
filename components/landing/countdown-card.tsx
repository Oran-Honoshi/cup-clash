"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { motion } from "framer-motion";

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

export function CountdownCard({ target }: CountdownProps) {
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
      className="relative overflow-hidden w-full"
      style={{
        background: "rgba(18,14,38,0.5)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
        borderRadius: 24,
        padding: 20,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-8 right-8 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)" }} />

      {/* Match preview label */}
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
        First Match · June 11 · 3:00 PM ET
      </div>

      {/* Match row with flags */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flags/mx.svg" alt="Mexico" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>MEXICO</span>
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>VS</span>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>SOUTH AFRICA</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flags/za.svg" alt="South Africa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </div>

      {/* Countdown boxes */}
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="text-center flex flex-col items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "16px 4px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="tabular leading-none"
              style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 800, color: "white" }}
              suppressHydrationWarning
            >
              {mounted ? String(unit.value).padStart(2, "0") : "--"}
            </div>
            <div className="text-[9px] font-bold tracking-[0.2em] mt-1.5 uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="mt-4 pt-4 text-[10px] text-center uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.3)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        Picks lock 5 min before kickoff
      </div>
    </motion.div>
  );
}