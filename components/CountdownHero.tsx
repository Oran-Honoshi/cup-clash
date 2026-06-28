"use client";

import { useEffect, useState } from "react";
import { formatMatchTime } from "@/lib/formatMatchTime";

interface CountdownHeroProps {
  nextMatchIso: string;
  homeTeam:     string;
  awayTeam:     string;
}

interface TimeLeft {
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(iso: string): TimeLeft {
  const diff = Math.max(0, new Date(iso).getTime() - Date.now());
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Digit({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative tabular-nums text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-white"
        style={{ textShadow: "0 0 40px rgba(var(--accent,0 255 136)/0.7)" }}
      >
        {pad(value)}
      </div>
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/40 font-bold">
        {label}
      </span>
    </div>
  );
}

export function CountdownHero({ nextMatchIso, homeTeam, awayTeam }: CountdownHeroProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(nextMatchIso));
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    setLocalTime(formatMatchTime(nextMatchIso));
    const id = setInterval(() => setTimeLeft(calcTimeLeft(nextMatchIso)), 1000);
    return () => clearInterval(id);
  }, [nextMatchIso]);

  const isKickedOff = timeLeft.days === 0 && timeLeft.hours === 0
    && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <section
      className="relative w-full bg-gray-950 overflow-hidden flex flex-col items-center justify-center
                 min-h-[420px] sm:min-h-[520px] py-16 px-4 text-center"
    >
      {/* stadium atmosphere rings */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(var(--accent,0 255 136)/0.12) 0%, transparent 70%)",
        }}
      />

      <p
        className="text-xs sm:text-sm uppercase tracking-[0.25em] font-bold mb-6"
        style={{ color: "rgb(var(--accent,0 255 136))" }}
      >
        {isKickedOff ? "Match in progress" : "Next match"}
      </p>

      {/* countdown clock */}
      {!isKickedOff ? (
        <div className="flex items-center gap-3 sm:gap-6 mb-8" role="timer" aria-live="off">
          <Digit label="days"    value={timeLeft.days}    />
          <span className="text-3xl sm:text-5xl lg:text-7xl font-black text-white/30 pb-4">:</span>
          <Digit label="hours"   value={timeLeft.hours}   />
          <span className="text-3xl sm:text-5xl lg:text-7xl font-black text-white/30 pb-4">:</span>
          <Digit label="minutes" value={timeLeft.minutes} />
          <span className="text-3xl sm:text-5xl lg:text-7xl font-black text-white/30 pb-4">:</span>
          <Digit label="seconds" value={timeLeft.seconds} />
        </div>
      ) : (
        <p className="text-5xl sm:text-7xl font-black text-white mb-8 animate-livePulse">
          LIVE
        </p>
      )}

      {/* match info */}
      <p className="text-xl sm:text-3xl font-bold text-white">
        {homeTeam}
        <span className="mx-3 text-white/30">vs</span>
        {awayTeam}
      </p>
      {localTime && (
        <p className="mt-2 text-sm text-white/50">{localTime}</p>
      )}
    </section>
  );
}
