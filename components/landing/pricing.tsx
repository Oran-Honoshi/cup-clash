"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Users, Building2, Zap, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";

const SOLO_FEATURES = [
  "Predict all 104 World Cup matches",
  "Live automated leaderboard",
  "Knockout bracket predictions",
  "Tournament picks (winner, top scorer, assister)",
  "Group chat with GIFs",
  "Buy-in & prize pool tracker",
  "Push notifications",
  "Mobile app (install to home screen)",
];

const FRIENDS_FEATURES = [
  "Everything in Free Solo",
  "Each member pays a one-time $2 entry — admin always free",
  "Unlimited group members",
  "Multiple groups supported",
  "Private closed room — invite-only via passkey link",
  "Copy predictions between groups",
];

const STARTER_FEATURES = [
  "Everything in Friends",
  "Up to 50 members — employees join completely free",
  "Single flat payment — no individual checkouts for your team",
  "Set a custom company prize for your leaderboard",
  "Priority support",
];

const CORPORATE_FEATURES = [
  "Everything in Team Starter",
  "Up to 100 members — employees join completely free",
  "Single flat payment — no individual checkouts for your team",
  "Set a custom company prize for your leaderboard",
  "Maximum value for large departments",
  "Ideal for multi-team office competitions",
];

function PlaystyleCallout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl p-6 mb-12"
      style={{
        background: "rgba(0,212,255,0.05)",
        border: "1px solid rgba(0,212,255,0.2)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4 text-cyan">
        Choose Your Playstyle
      </div>
      <div className="grid sm:grid-cols-2 gap-6">

        {/* Private Group */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-ac" />
            <span className="text-sm font-black uppercase tracking-wide text-white">
              The Private Group Game
            </span>
          </div>
          <p className="text-xs leading-relaxed text-white/60">
            Create a closed room for your office or inner circle. Two ways to run it:
          </p>
          <div className="space-y-2">
            <div className="rounded-xl p-3"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.18)" }}>
              <div className="text-xs font-black mb-0.5 text-ac">For Friends</div>
              <div className="text-xs text-white/60">
                The host sets it up for free. Players pay a one-time <strong className="text-white">$2 entry fee</strong> to unlock the live leaderboard and all predictions.
              </div>
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)" }}>
              <div className="text-xs font-black mb-0.5" style={{ color: "#a78bfa" }}>For Companies</div>
              <div className="text-xs text-white/60">
                The company pays a single flat fee ($75 or $130). All employees join <strong className="text-white">100% free</strong> with zero checkout friction.
              </div>
            </div>
          </div>
        </div>

        {/* Global Solo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-cyan" />
            <span className="text-sm font-black uppercase tracking-wide text-white">
              The Global Solo Game — $0
            </span>
          </div>
          <p className="text-xs leading-relaxed text-white/60">
            Play completely free, forever, on our public global leaderboard against football fans worldwide. No credit card, no group required — just sign up and start predicting.
          </p>
          <div className="rounded-xl p-3"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)" }}>
            <div className="text-xs text-white/60">
              🌍 Compete globally · All 104 matches · Full bracket · Leaderboard updated live after every final whistle.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Pricing() {
  const [showEnterprise, setShowEnterprise] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">Pricing</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl uppercase text-white">
              Pay once.{" "}
              <span className="bg-gradient-to-br from-cyan to-ac bg-clip-text text-transparent">
                Play forever.
              </span>
            </h2>
            <p className="text-lg mt-4 max-w-xl mx-auto text-white/60">
              One-time payments. No subscriptions. Covers the entire World Cup 2026 tournament.
            </p>
          </motion.div>

          <PlaystyleCallout />

          {/* Tier cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">

            {/* Tier 1 — Free Solo */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden flex flex-col h-full"
              style={{
                background: "rgba(18,14,38,0.32)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(0,212,255,0.25)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}>
                      <Zap size={17} className="text-cyan" />
                    </div>
                    <div>
                      <div className="font-display text-base uppercase font-black text-white">Free Solo</div>
                      <div className="text-[10px] text-white/40">Global public leaderboard</div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4"
                    style={{ background: "rgba(0,212,255,0.08)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <Globe size={9} /> Global Solo Game
                  </div>
                  <div className="mb-5">
                    <span className="font-display text-4xl font-black text-white">$0</span>
                    <span className="text-sm ml-1 text-white/40">forever</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    {SOLO_FEATURES.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.2)" }}>
                          <Check size={9} className="text-ac" />
                        </div>
                        <span className="text-xs leading-relaxed text-white/65">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/signup" className="block w-full mt-auto">
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-[#050e08]"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)" }}>
                    Start Free <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Tier 2 — Friends */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl overflow-hidden flex flex-col h-full"
              style={{
                background: "rgba(18,14,38,0.32)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(0,255,136,0.25)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF)" }} />
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)" }}>
                      <Users size={17} className="text-ac" />
                    </div>
                    <div>
                      <div className="font-display text-base uppercase font-black text-white">Friends</div>
                      <div className="text-[10px] text-white/40">Private group · Invite only</div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4"
                    style={{ background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <Users size={9} /> Private Group Game
                  </div>
                  <div className="mb-1">
                    <span className="font-display text-4xl font-black text-white">$2</span>
                    <span className="text-sm ml-1 text-white/40">/ member</span>
                  </div>
                  <div className="text-xs mb-5 text-white/50">One-time entry · Admin always free</div>
                  <div className="space-y-2 mb-6">
                    {FRIENDS_FEATURES.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.2)" }}>
                          <Check size={9} className="text-ac" />
                        </div>
                        <span className="text-xs leading-relaxed text-white/65">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/signup" className="block w-full mt-auto">
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-[#050e08]"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)" }}>
                    Create Group <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Tier 3 — Team Starter (Most Popular) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="rounded-3xl overflow-hidden flex flex-col h-full relative"
              style={{
                background: "linear-gradient(135deg, #0B141B, #0B1F14)",
                border: "2px solid rgba(0,212,255,0.45)",
                boxShadow: "0 8px 40px rgba(0,212,255,0.2), 0 12px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-[#050e08]"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
                Most Popular
              </div>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
                      <Building2 size={17} className="text-cyan" />
                    </div>
                    <div>
                      <div className="font-display text-base uppercase font-black text-white">Team Starter</div>
                      <div className="text-[10px] text-white/40">Up to 50 members</div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4"
                    style={{ background: "rgba(0,212,255,0.12)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.28)" }}>
                    <Building2 size={9} /> Corporate · Employees join free
                  </div>
                  <div className="mb-1">
                    <span className="font-display text-4xl font-black text-white">$75</span>
                    <span className="text-sm ml-1 text-white/40">one-time</span>
                  </div>
                  <div className="text-xs mb-5 text-white/40">Company pays once · Whole team joins free</div>
                  <div className="space-y-2 mb-6">
                    {STARTER_FEATURES.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }}>
                          <Check size={9} className="text-ac" />
                        </div>
                        <span className="text-xs leading-relaxed text-white/70">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/create-group?model=corporate_sponsored" className="block w-full mt-auto">
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-[#050e08]"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
                    Get Team Starter <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Tier 4 — Corporate Pack */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className="rounded-3xl overflow-hidden flex flex-col h-full"
              style={{
                background: "rgba(18,14,38,0.32)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(99,102,241,0.3)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="h-1" style={{ background: "linear-gradient(90deg, #6366F1, #4F46E5)" }} />
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
                      <Building2 size={17} style={{ color: "#818cf8" }} />
                    </div>
                    <div>
                      <div className="font-display text-base uppercase font-black text-white">Corporate Pack</div>
                      <div className="text-[10px] text-white/40">Up to 100 members</div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.22)" }}>
                    <Building2 size={9} /> Corporate · Employees join free
                  </div>
                  <div className="mb-1">
                    <span className="font-display text-4xl font-black text-white">$130</span>
                    <span className="text-sm ml-1 text-white/40">one-time</span>
                  </div>
                  <div className="text-xs mb-5 text-white/50">Company pays once · Whole team joins free</div>
                  <div className="space-y-2 mb-6">
                    {CORPORATE_FEATURES.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
                          <Check size={9} style={{ color: "#818cf8" }} />
                        </div>
                        <span className="text-xs leading-relaxed text-white/65">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto">
                  <Link href="/create-group?model=corporate_sponsored" className="block w-full">
                    <button
                      className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-white"
                      style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                      Get Corporate Pack <ArrowRight size={14} />
                    </button>
                  </Link>
                  <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-[11px] mb-0.5 text-white/40">Need more than 100 slots?</p>
                    <button
                      onClick={() => setShowEnterprise(true)}
                      className="text-xs font-bold uppercase tracking-wide transition-opacity hover:opacity-75"
                      style={{ color: "#818cf8" }}
                    >
                      Contact us for Enterprise →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <EnterpriseModal isOpen={showEnterprise} onClose={() => setShowEnterprise(false)} />
    </>
  );
}
