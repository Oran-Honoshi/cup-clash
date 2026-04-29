"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { CountdownCard } from "@/components/landing/countdown-card";

const KICKOFF = new Date("2026-06-11T20:00:00Z");

// Simulated phone screen UI — shown tilted as a "floating" mockup
function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -8 }}
      animate={{ opacity: 1, y: 0, rotate: -12 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto"
      style={{
        width: 280,
        filter: "drop-shadow(0 40px 80px rgba(16,185,129,0.25)) drop-shadow(0 20px 40px rgba(0,0,0,0.8))",
        animation: "float 4s ease-in-out infinite",
      }}
    >
      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] overflow-hidden"
        style={{
          background: "#111d27",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-2xl z-10"
          style={{ background: "#050a0f" }} />

        {/* Screen content */}
        <div className="pt-8 pb-4 px-4 space-y-3" style={{ background: "#050a0f" }}>
          {/* Status bar */}
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-white font-bold">9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-1.5 rounded-sm bg-white/40" />
              <div className="w-3 h-1.5 rounded-sm bg-white/40" />
              <div className="w-3 h-1.5 rounded-sm" style={{ background: "#10b981" }} />
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>Cup Clash</div>
              <div className="text-white font-bold text-sm">Tech Titans 🏆</div>
            </div>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #2A398D, #10b981)" }}>A</div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl p-3 space-y-2" style={{ background: "#111d27" }}>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Leaderboard</div>
            {[
              { rank: "🥇", name: "Amit",  pts: 145, you: true  },
              { rank: "🥈", name: "Sarah", pts: 130, you: false },
              { rank: "🥉", name: "John",  pts: 95,  you: false },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-2"
                style={p.you ? { background: "rgba(16,185,129,0.1)", borderRadius: 8, padding: "4px 6px" } : { padding: "0 6px" }}>
                <span className="text-sm w-5">{p.rank}</span>
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #2A398D, #E61D25)" }}>
                  {p.name[0]}
                </div>
                <span className="text-white text-[10px] font-bold flex-1">{p.name}</span>
                <span className="font-bold text-[11px]" style={{ color: p.you ? "#10b981" : "#f5f5f5" }}>{p.pts}</span>
              </div>
            ))}
          </div>

          {/* Next match card */}
          <div className="rounded-2xl p-3" style={{ background: "#111d27", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: "#10b981" }}>Next Match</div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm">🇧🇷</div>
                <div className="text-[9px] text-white font-bold">BRA</div>
              </div>
              <div className="flex gap-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "rgba(255,255,255,0.08)" }}>2</div>
                <div className="text-white text-lg font-bold">–</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "rgba(255,255,255,0.08)" }}>1</div>
              </div>
              <div className="text-center">
                <div className="text-sm">🇫🇷</div>
                <div className="text-[9px] text-white font-bold">FRA</div>
              </div>
            </div>
            <div className="mt-2 w-full rounded-lg py-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-white"
              style={{ background: "linear-gradient(135deg, #2A398D, #10b981)" }}>
              Lock in prediction →
            </div>
          </div>

          {/* Bottom nav dots */}
          <div className="flex justify-center gap-1.5 pt-1">
            {[true, false, false, false, false].map((a, i) => (
              <div key={i} className="rounded-full" style={{ width: a ? 16 : 6, height: 6, background: a ? "#10b981" : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Ticker bar — scrolling social proof
const TICKER_ITEMS = [
  "⚽ Amit just predicted Brazil 2–1 France",
  "🏆 Sarah leads the Tech Titans with 145 points",
  "🔥 3 exact scores in the last match",
  "🧠 Lior scored 18/20 in Trivia",
  "💰 $600 pot in play — Office World Cup",
  "🎯 John nailed the Germany vs Spain score",
  "⚡ Predictions lock in 4 minutes",
  "🥇 Ahmed just joined the finals prediction league",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-0 sm:pt-32">
      {/* Diagonal clip at bottom */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)",
          }} />
        {/* Pitch lines decoration */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "rgba(16,185,129,0.15)" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center min-h-[85vh] pb-20">

          {/* LEFT — Copy */}
          <div className="relative z-10 py-12 lg:py-0">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)" }}
            >
              <Zap size={12} style={{ color: "#10b981" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>
                World Cup 2026 — Jun 11 to Jul 19
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display leading-[0.88] tracking-tight text-white mb-6"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 900 }}
            >
              PREDICT<br />
              EVERY<br />
              <span style={{
                background: "linear-gradient(135deg, #10b981, #3b82f6)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>MATCH.</span><br />
              BEAT YOUR<br />
              <span style={{ color: "#E61D25" }}>FRIENDS.</span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-relaxed mb-8 max-w-md"
              style={{ color: "#94a3b8", fontFamily: "var(--font-inter)" }}
            >
              The private World Cup league your group has been waiting for.
              Score predictions, live leaderboard, trivia, and a pot of money on the line.
              <strong style={{ color: "#f5f5f5" }}> No spreadsheets. No WhatsApp chaos. Just glory.</strong>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link href="/signup">
                <button className="flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base uppercase tracking-wider text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 24px rgba(16,185,129,0.5)",
                  }}>
                  Start for free <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/schedule">
                <button className="flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
                  View schedule
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 flex-wrap"
            >
              {/* Avatars stack */}
              <div className="flex -space-x-2">
                {["#10b981","#3b82f6","#E61D25","#f59e0b","#8b5cf6"].map((c, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}88)`, borderColor: "#050a0f" }}>
                    {["A","S","J","L","M"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold text-white">1,200+ groups active</div>
                <div className="text-xs" style={{ color: "#64748b" }}>across 40+ countries</div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: "#f59e0b" }}>★</span>)}
              </div>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10"
            >
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>
                First match kicks off in
              </div>
              <CountdownCard target={KICKOFF} matchLabel="Mexico vs South Africa — Opening Match" />
            </motion.div>
          </div>

          {/* RIGHT — Tilted phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-96 w-96 rounded-full blur-3xl opacity-20"
                style={{ background: "#10b981" }} />
            </div>

            {/* Fan image — blurred behind a glass overlay */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-20">
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, transparent 0%, #050a0f 90%)" }} />
            </div>

            <PhoneMockup />

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute top-16 -left-4 glass rounded-2xl px-3 py-2 text-xs font-bold"
              style={{ border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <span style={{ color: "#10b981" }}>🔥 +25 pts</span>
              <div className="text-[10px]" style={{ color: "#64748b" }}>Exact score!</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-24 -right-4 glass rounded-2xl px-3 py-2 text-xs font-bold"
              style={{ border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <span style={{ color: "#3b82f6" }}>🏆 $240 pot</span>
              <div className="text-[10px]" style={{ color: "#64748b" }}>12 members</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Host nations bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-t border-b py-4 px-5"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(17,29,39,0.5)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 flex-wrap">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
            Host Nations
          </div>
          <div className="flex items-center gap-6">
            {[
              { flag: "🇺🇸", name: "United States", matches: "60 matches" },
              { flag: "🇲🇽", name: "Mexico",        matches: "22 matches" },
              { flag: "🇨🇦", name: "Canada",        matches: "13 matches" },
            ].map(({ flag, name, matches }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-2xl">{flag}</span>
                <div>
                  <div className="text-xs font-bold text-white">{name}</div>
                  <div className="text-[10px]" style={{ color: "#64748b" }}>{matches}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs font-bold" style={{ color: "#64748b" }}>
            48 teams · 104 matches · 16 host cities
          </div>
        </div>
      </motion.div>

      {/* Live ticker */}
      <div className="overflow-hidden py-2.5" style={{ background: "rgba(16,185,129,0.06)", borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="flex animate-ticker whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-xs font-bold uppercase tracking-widest mx-8"
              style={{ color: "#10b981" }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}