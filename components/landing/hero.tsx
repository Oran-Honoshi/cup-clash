"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { CountdownCard } from "@/components/landing/countdown-card";

const KICKOFF = new Date("2026-06-11T20:00:00Z");

// Phone mockup — tilted 15deg, cyan outer glow, mint CTA prominent
function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 10 }}
      animate={{ opacity: 1, y: 0, rotate: 15 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto"
      style={{
        width: 270,
        // Electric Cyan outer glow
        filter: "drop-shadow(0 0 20px rgba(0,212,255,0.35)) drop-shadow(0 30px 60px rgba(0,212,255,0.15)) drop-shadow(0 20px 40px rgba(0,0,0,0.08))",
        animation: "floatPhone 4s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes floatPhone {
          0%, 100% { transform: rotate(15deg) translateY(0px); }
          50%       { transform: rotate(15deg) translateY(-10px); }
        }
      `}</style>

      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] overflow-hidden"
        style={{
          background: "#ffffff",
          border: "2px solid rgba(0,212,255,0.4)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.9)",
        }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-2xl z-10"
          style={{ background: "#F8FAFC" }} />

        {/* Screen */}
        <div className="pt-8 pb-4 px-4 space-y-3" style={{ background: "#F8FAFC" }}>
          {/* Status bar */}
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold" style={{ color: "#0B141B" }}>9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-1.5 rounded-sm" style={{ background: "rgba(0,212,255,0.3)" }} />
              <div className="w-3 h-1.5 rounded-sm" style={{ background: "rgba(0,212,255,0.5)" }} />
              <div className="w-3 h-1.5 rounded-sm" style={{ background: "#00FF88" }} />
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>Cup Clash</div>
              <div className="font-bold text-sm" style={{ color: "#0B141B" }}>Tech Titans</div>
            </div>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>A</div>
          </div>

          {/* Leaderboard card */}
          <div className="rounded-2xl p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(8px)" }}>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>Leaderboard</div>
            {[
              { rank: 1, name: "Amit",  pts: 145, you: true,  color: "#00FF88" },
              { rank: 2, name: "Sarah", pts: 130, you: false, color: "#00D4FF" },
              { rank: 3, name: "John",  pts: 95,  you: false, color: "#94a3b8" },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-2 rounded-lg px-2 py-1"
                style={p.you ? { background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" } : {}}>
                <span className="text-[10px] font-bold w-4" style={{ color: p.color }}>{p.rank}</span>
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                  {p.name[0]}
                </div>
                <span className="text-[10px] font-bold flex-1" style={{ color: "#0B141B" }}>{p.name}</span>
                <span className="font-bold text-[11px]" style={{ color: p.you ? "#00FF88" : "#334155" }}>{p.pts}</span>
              </div>
            ))}
          </div>

          {/* Prediction card — mint CTA prominent */}
          <div className="rounded-2xl p-3"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,255,136,0.25)", boxShadow: "0 4px 16px rgba(0,255,136,0.1)" }}>
            <div className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: "#00D4FF" }}>Next Match</div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-center"><div className="text-sm">🇧🇷</div><div className="text-[9px] font-bold" style={{ color: "#0B141B" }}>BRA</div></div>
              <div className="flex gap-1 items-center">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(0,212,255,0.1)", color: "#0B141B", border: "1px solid rgba(0,212,255,0.2)" }}>2</div>
                <span className="font-bold" style={{ color: "#94a3b8" }}>–</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(0,212,255,0.1)", color: "#0B141B", border: "1px solid rgba(0,212,255,0.2)" }}>1</div>
              </div>
              <div className="text-center"><div className="text-sm">🇫🇷</div><div className="text-[9px] font-bold" style={{ color: "#0B141B" }}>FRA</div></div>
            </div>
            {/* PROMINENT NEON MINT CTA */}
            <button className="w-full rounded-xl py-2 text-[9px] font-bold uppercase tracking-widest"
              style={{
                background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                color: "#0B141B",
                boxShadow: "0 4px 12px rgba(0,255,136,0.35)",
              }}>
              Save Prediction →
            </button>
          </div>

          {/* Nav dots */}
          <div className="flex justify-center gap-1.5 pt-1">
            {[true, false, false, false, false].map((a, i) => (
              <div key={i} className="rounded-full" style={{ width: a ? 16 : 6, height: 6, background: a ? "#00FF88" : "rgba(0,212,255,0.2)" }} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const TICKER_ITEMS = [
  "⚡ Amit just predicted Brazil 2–1 France",
  "↑ Sarah leads the Tech Titans with 145 points",
  "✓ 3 exact scores in the last match — +25 pts each",
  "★ Lior scored 18/20 in the Trivia Challenge",
  "$ $600 pot in play — Office World Cup Group",
  "✓ John nailed the Germany vs Spain exact score",
  "⏱ Predictions lock in 4 minutes — get in now",
  "★ Ahmed just claimed the Trivia Champion badge",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-0 sm:pt-32"
      style={{ background: "#F8FAFC" }}>

      {/* "Stadium lights just off-camera" — radial from top right */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px]"
          style={{
            background: "radial-gradient(circle at top right, rgba(0,212,255,0.10) 0%, rgba(0,255,136,0.05) 30%, transparent 70%)",
          }} />
        <div className="absolute top-0 left-0 w-[400px] h-[400px]"
          style={{
            background: "radial-gradient(circle at top left, rgba(0,255,136,0.06) 0%, transparent 60%)",
          }} />
        {/* Diagonal cut line */}
        <div className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: "linear-gradient(to bottom right, transparent 49%, rgba(0,212,255,0.06) 50%)",
          }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center min-h-[88vh] pb-20">

          {/* LEFT */}
          <div className="relative z-10 py-12 lg:py-0">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ borderColor: "rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.06)", backdropFilter: "blur(8px)" }}
            >
              <Zap size={12} style={{ color: "#00D4FF" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
                North America 2026 Is Almost Here.
              </span>
            </motion.div>

            {/* H1 — Navy to Cyan gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display leading-[0.88] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.8rem, 6.5vw, 5rem)", fontWeight: 900, color: "#0B141B" }}
            >
              SPREADSHEETS<br />
              DON&apos;T SCORE.<br />
              <span style={{
                background: "linear-gradient(135deg, #0B141B 0%, #00D4FF 100%)",
                WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>CUP CLASH</span><br />
              <span style={{ color: "#00FF88" }}>DOES.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-relaxed mb-8 max-w-md"
              style={{ color: "#475569", fontFamily: "var(--font-inter)" }}
            >
              Ditch the manual math and the Venmo chasing.{" "}
              <strong style={{ color: "#0B141B" }}>Run your World Cup pool like a pro</strong>{" "}
              with live leaderboards, brackets, and zero spreadsheet fatigue.
            </motion.p>

            {/* CTAs — "Deep and Dreamy" floating shadows */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link href="/signup">
                <button className="flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                    color: "#0B141B",
                    // Large, soft, floating shadow
                    boxShadow: "0 20px 50px rgba(0,255,136,0.30), 0 4px 16px rgba(0,255,136,0.2)",
                  }}>
                  Start My Group — Free <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/schedule">
                <button className="flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    border: "1px solid rgba(0,212,255,0.25)",
                    background: "rgba(255,255,255,0.7)",
                    color: "#475569",
                    backdropFilter: "blur(8px)",
                  }}>
                  Preview the App
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {["#00FF88","#00D4FF","#0B141B","#d97706","#8b5cf6"].map((c, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                    style={{ background: c, color: c === "#0B141B" ? "white" : "#0B141B", borderColor: "#F8FAFC" }}>
                    {["A","S","J","L","M"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "#0B141B" }}>1,200+ groups active</div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>across 40+ countries</div>
              </div>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} style={{ color: "#d97706" }}>★</span>)}</div>
            </motion.div>

            {/* Countdown — "Deep and Dreamy" shadow */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-10">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#94a3b8" }}>
                First match kicks off in
              </div>
              {/* Wrapper adds the dreamy floating shadow */}
              <div style={{ filter: "drop-shadow(0 20px 50px rgba(0,255,136,0.20))" }}>
                <CountdownCard target={KICKOFF} matchLabel="Mexico vs South Africa — Opening Match" />
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Phone, 15deg tilt, cyan glow */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* Soft background bloom */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-80 w-80 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(0,212,255,0.12), rgba(0,255,136,0.08), transparent)" }} />
            </div>

            <PhoneMockup />

            {/* Floating badge — mint */}
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute top-16 -left-4 rounded-2xl px-3 py-2 text-xs font-bold"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(0,255,136,0.3)",
                boxShadow: "0 8px 24px rgba(0,255,136,0.15)",
                color: "#00c46a",
              }}>
              +25 pts
              <div className="text-[10px]" style={{ color: "#94a3b8" }}>Exact score!</div>
            </motion.div>

            {/* Floating badge — cyan */}
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-24 -right-4 rounded-2xl px-3 py-2 text-xs font-bold"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(0,212,255,0.3)",
                boxShadow: "0 8px 24px rgba(0,212,255,0.15)",
                color: "#00D4FF",
              }}>
              $240 pot
              <div className="text-[10px]" style={{ color: "#94a3b8" }}>12 members</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Host nations bar */}
      <div className="border-t border-b py-4 px-5"
        style={{ borderColor: "rgba(0,212,255,0.12)", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 flex-wrap">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Host Nations</div>
          <div className="flex items-center gap-6">
            {[
              { flag: "🇺🇸", name: "United States", matches: "60 matches" },
              { flag: "🇲🇽", name: "Mexico",        matches: "22 matches" },
              { flag: "🇨🇦", name: "Canada",        matches: "13 matches" },
            ].map(({ flag, name, matches }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-2xl">{flag}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: "#0B141B" }}>{name}</div>
                  <div className="text-[10px]" style={{ color: "#94a3b8" }}>{matches}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs font-bold" style={{ color: "#94a3b8" }}>48 teams · 104 matches · 16 cities</div>
        </div>
      </div>

      {/* Ticker — mint on near-white */}
      <div className="overflow-hidden py-2.5"
        style={{ background: "rgba(0,255,136,0.05)", borderBottom: "1px solid rgba(0,255,136,0.12)" }}>
        <div className="flex animate-ticker whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-xs font-bold uppercase tracking-widest mx-8"
              style={{ color: "#00c46a" }}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
