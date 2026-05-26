"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Users, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";

const FRIEND_FEATURES = [
  "No cap on group size",
  "Optional cash pool with 1st/2nd/3rd splits",
  "Group chat & live leaderboard",
  "All 9 scoring rules customizable",
];

export function Pricing() {
  const [showEnterprise, setShowEnterprise] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">Two Ways to Play</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl uppercase text-white">
              Pay once.{" "}<span style={{ color: "#00FF88" }}>Play forever.</span>
            </h2>
            <p className="text-lg mt-4 max-w-xl mx-auto text-white/60">
              One-time payments. No subscriptions. Covers the entire World Cup 2026 tournament.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 items-stretch">

            {/* Friend Circle */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{ background: "rgba(18,14,38,0.5)", backdropFilter: "blur(40px) saturate(180%)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF)" }} />
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)" }}>
                    <Users size={18} style={{ color: "#00FF88" }} />
                  </div>
                  <div>
                    <div className="font-display text-xl uppercase font-black text-white">Friend Circle</div>
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5"
                      style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.25)" }}>
                      Free to create
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-display font-black" style={{ fontSize: 64, color: "#00FF88", lineHeight: 1 }}>$2</span>
                </div>
                <div className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>per friend, one-time</div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                  The host sets it up for free. Each friend pays a one-time $2 entry to unlock the live leaderboard, all 104 match predictions, and the full knockout bracket.
                </p>
                <div className="space-y-3 mb-8 flex-1">
                  {FRIEND_FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.2)" }}>
                        <Check size={10} style={{ color: "#00FF88" }} />
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" className="block mt-auto">
                  <button className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#050e08", boxShadow: "0 4px 20px rgba(0,255,136,0.25)" }}>
                    Start a Friend Circle <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Corporate Sponsor */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{ background: "rgba(18,14,38,0.7)", backdropFilter: "blur(40px) saturate(180%)", border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #8B5CF6)" }} />
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
                    <Shield size={18} style={{ color: "#00D4FF" }} />
                  </div>
                  <div>
                    <div className="font-display text-xl uppercase font-black text-white">Corporate Sponsor</div>
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5"
                      style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}>
                      Team pays $0
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                  One-time fee for the whole team. Every employee joins free. Choose cash payouts or custom company rewards.
                </p>
                <div className="flex flex-col gap-3 mb-6 flex-1">
                  <div className="rounded-2xl p-4 flex items-center justify-between gap-4"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div>
                      <div className="text-sm font-bold text-white">Team Starter</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Up to 50 employees · employees join free</div>
                    </div>
                    <div className="font-display font-black text-white shrink-0" style={{ fontSize: 28 }}>$75</div>
                  </div>
                  <div className="rounded-2xl p-4 flex items-center justify-between gap-4 relative"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <div className="absolute top-3 right-12 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                      Popular
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Corporate Pack</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Up to 100 employees · employees join free</div>
                    </div>
                    <div className="font-display font-black shrink-0" style={{ fontSize: 32, color: "#00D4FF" }}>$130</div>
                  </div>
                </div>
                <p className="text-center text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Need &gt;100 members?{" "}
                  <button onClick={() => setShowEnterprise(true)} className="underline transition-colors hover:text-white" style={{ color: "#00D4FF" }}>
                    Contact us for Enterprise
                  </button>
                </p>
                <Link href="/create-group?model=corporate_sponsored" className="block mt-auto">
                  <button className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF", background: "transparent" }}>
                    Sponsor your office team <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
      <EnterpriseModal isOpen={showEnterprise} onClose={() => setShowEnterprise(false)} />
    </>
  );
}