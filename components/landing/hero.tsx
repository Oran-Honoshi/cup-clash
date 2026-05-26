"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Building2, Eye, Zap } from "lucide-react";
import Link from "next/link";
import { CountdownCard } from "@/components/landing/countdown-card";
import { PHOTOS } from "@/lib/assets";

const KICKOFF = new Date("2026-06-11T20:00:00Z");

function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 10 }}
      animate={{ opacity: 1, y: 0, rotate: 6 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-[270px]"
      style={{
        filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.7))",
        transform: "rotate(6deg)",
      }}
    >
      <div
        className="relative rounded-[2.5rem] overflow-hidden"
        style={{
          background: "rgba(8,5,18,0.85)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          boxShadow: "0 0 0 6px rgba(40,30,80,0.3), 0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-2xl z-10 bg-[#050810]" />
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.stadiumNightAbove} alt="Stadium" className="w-full object-cover"
            style={{ height: 120, objectPosition: "center 30%", opacity: 0.25 }} />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(8,5,18,0.3) 0%, rgba(8,5,18,0.8) 70%, rgba(8,5,18,1) 100%)" }} />
        </div>
        <div className="px-4 pb-4 space-y-3 -mt-8 relative z-10">
          <div className="flex items-center justify-between pt-8">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-cyan">Cup Clash</div>
              <div className="font-bold text-sm text-white">Tech Titans</div>
            </div>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-[#050e08]"
              style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>A</div>
          </div>
          <div className="rounded-2xl p-3 space-y-2"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center justify-between">
              <div className="text-[9px] font-bold uppercase tracking-widest text-cyan">Leaderboard</div>
              <div className="flex items-center gap-1 text-[9px] text-cyan font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                Live
              </div>
            </div>
            {[
              { rank: 1, name: "Amit",  pts: 145, leading: true, me: false },
              { rank: 2, name: "Sarah", pts: 130, leading: false, me: false },
              { rank: 3, name: "You",   pts: 110, leading: false, me: true  },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-2 rounded-lg px-2 py-1"
                style={p.me ? { background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" } : {}}>
                <span className="text-[10px] font-black w-4"
                  style={{ color: p.leading ? "#fbbf24" : p.me ? "#00FF88" : "rgba(255,255,255,0.4)" }}>{p.rank}</span>
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-[#050e08]"
                  style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>{p.name[0]}</div>
                <span className="text-[10px] font-bold flex-1 text-white">{p.name}</span>
                <span className="font-bold text-[11px]"
                  style={{ color: p.leading ? "#fbbf24" : p.me ? "#00FF88" : "rgba(255,255,255,0.5)" }}>{p.pts}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,255,136,0.25)", boxShadow: "0 4px 16px rgba(0,255,136,0.1)" }}>
            <div className="text-[8px] font-bold uppercase tracking-widest mb-2 text-cyan">Next Match</div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="relative h-5 w-6 rounded-sm overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/flags/br.svg" alt="Brazil" className="w-full h-full object-cover" />
                </div>
                <div className="text-[9px] font-bold text-white">BRA</div>
              </div>
              <div className="flex gap-1 items-center">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}>2</div>
                <span className="font-bold text-white/30">–</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}>1</div>
              </div>
              <div className="text-center">
                <div className="relative h-5 w-6 rounded-sm overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/flags/fr.svg" alt="France" className="w-full h-full object-cover" />
                </div>
                <div className="text-[9px] font-bold text-white">FRA</div>
              </div>
            </div>
            <button className="w-full rounded-xl py-2 text-[9px] font-bold uppercase tracking-widest text-[#050e08]"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", boxShadow: "0 4px 12px rgba(0,255,136,0.35)" }}>
              Save Prediction →
            </button>
          </div>
          <div className="flex justify-center gap-1.5 pt-1">
            {[true, false, false, false, false].map((a, i) => (
              <div key={i} className="rounded-full"
                style={{ width: a ? 16 : 6, height: 6, background: a ? "#00FF88" : "rgba(0,212,255,0.2)" }} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pb-0"
      style={{ paddingTop: "calc(98px + 3.5rem)" }}
    >
      {/* Background atmosphere, one quiet wash, not two competing blobs. */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, rgba(0,212,255,0.06) 0%, transparent 60%)" }} />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center min-h-[82vh] pb-20">

          {/* ── LEFT COLUMN ── */}
          <div className="relative z-10 py-12 lg:py-0">

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ borderColor: "rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.1)", backdropFilter: "blur(8px)" }}>
              <Zap size={11} className="text-cyan" fill="#00D4FF" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan">
                World Cup 2026 · June 11 to July 19
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black leading-[0.95] tracking-tight mb-6 text-white"
              style={{ fontSize: "clamp(48px, 7vw, 92px)", letterSpacing: "-0.02em" }}>
              Predict<br />
              every match.<br />
              <span className="text-ac">Beat your friends.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-relaxed mb-8 max-w-md text-white/70">
              A private prediction league for World Cup 2026. Built for friend circles and office pools.{" "}
              <strong className="text-white font-semibold">Free to host. $2 per friend.</strong>{" "}
              Sponsor your whole team for $75.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-8">

              <Link href="/dashboard?action=create-group">
                <button
                  className="group flex items-center gap-2 px-7 py-4 rounded-2xl font-bold uppercase tracking-wider transition-all hover:-translate-y-1 w-full sm:w-auto text-[#050e08]"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", boxShadow: "0 8px 30px rgba(0,255,136,0.4)" }}>
                  Start a Friend Circle
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>

              <Link href="/dashboard?action=corporate">
                <button
                  className="group flex items-center gap-2 px-7 py-4 rounded-2xl font-bold uppercase tracking-wider transition-all hover:-translate-y-1 w-full sm:w-auto text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(20px)" }}>
                  <Building2 size={17} />
                  For Companies
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            </motion.div>

            {/* Guest-explore escape hatch. PRODUCT.md Principle 3: never gate the first session. */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="-mt-3 mb-6">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 text-[13px] font-semibold text-cyan rounded-md
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60
                           focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C16]"
              >
                <Eye size={13} strokeWidth={2.25} />
                <span className="border-b border-transparent group-hover:border-cyan/60 transition-colors duration-200">
                  Peek inside without signing up
                </span>
                <ArrowUpRight
                  size={13}
                  strokeWidth={2.25}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>
                ✓ Admin always free
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,212,255,0.08)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}>
                ✓ $2 per friend
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,212,255,0.08)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}>
                ✓ No ads · No subscription
              </span>
            </motion.div>

            {/* Countdown */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-12">
              <div className="text-xs font-bold uppercase tracking-widest mb-3 text-white/40">
                First match kicks off in
              </div>
              <div style={{ filter: "drop-shadow(0 20px 50px rgba(0,255,136,0.20))" }}>
                <CountdownCard target={KICKOFF} matchLabel="Mexico vs South Africa, Opening Match" />
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-80 w-80 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(0,255,136,0.15), rgba(0,212,255,0.08), transparent)" }} />
            </div>
            <PhoneMockup />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-16 -left-4 rounded-2xl px-3 py-2 text-xs font-bold"
              style={{ background: "rgba(18,14,38,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88" }}>
              Nailed it
              <div className="text-[10px] text-white/40">Exact score · +25</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-24 -right-4 rounded-2xl px-3 py-2 text-xs font-bold text-cyan"
              style={{ background: "rgba(18,14,38,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,212,255,0.3)" }}>
              12 friends in
              <div className="text-[10px] text-white/40">Tech Titans</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}