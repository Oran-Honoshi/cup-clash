"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Users, Building2, Zap, Star } from "lucide-react";
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
  "Each member pays $2 individually when joining",
  "Admin always free",
  "Unlimited group members",
  "Multiple groups supported",
  "Copy predictions between groups",
];

const STARTER_FEATURES = [
  "Everything in Friends",
  "Up to 50 members — employees join free",
  "Single flat payment — no individual checkouts",
  "Set a custom company prize for your leaderboard",
  "Priority support",
];

const CORPORATE_FEATURES = [
  "Everything in Team Starter",
  "Up to 100 members",
  "Maximum value for large departments",
  "Ideal for multi-team competitions",
];

export function Pricing() {
  const [showEnterprise, setShowEnterprise] = useState(false);

  return (
    <>
      <section id="pricing" className="py-16 px-5 sm:px-8" style={{ background: "#F8FAFC" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="label-caps mb-3">Pricing</div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase" style={{ color: "#0F172A" }}>
              Simple,{" "}
              <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                honest pricing
              </span>
            </h2>
            <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: "#64748b" }}>
              Free for individuals. Flat-rate for teams. One tournament, no subscriptions.
            </p>
          </motion.div>

          {/* 4-column grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Tier 1 — Free Solo */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{ background: "white", border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 4px 20px rgba(0,212,255,0.06)" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <Zap size={17} style={{ color: "#0891B2" }} />
                  </div>
                  <div>
                    <div className="font-display text-base uppercase font-black" style={{ color: "#0F172A" }}>Free Solo</div>
                    <div className="text-[10px]" style={{ color: "#94a3b8" }}>Try it out</div>
                  </div>
                </div>
                <div className="mb-5">
                  <span className="font-display text-4xl font-black" style={{ color: "#0F172A" }}>$0</span>
                  <span className="text-sm ml-1" style={{ color: "#94a3b8" }}>forever</span>
                </div>
                <Link href="/signup" className="block mb-6">
                  <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                    Start Free <ArrowRight size={14} />
                  </button>
                </Link>
                <div className="space-y-2 flex-1">
                  {SOLO_FEATURES.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(0,255,136,0.1)" }}>
                        <Check size={9} style={{ color: "#059669" }} />
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: "#475569" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tier 2 — Friends */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{ background: "white", border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 4px 20px rgba(0,212,255,0.06)" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <Users size={17} style={{ color: "#059669" }} />
                  </div>
                  <div>
                    <div className="font-display text-base uppercase font-black" style={{ color: "#0F172A" }}>Friends</div>
                    <div className="text-[10px]" style={{ color: "#94a3b8" }}>For friend groups</div>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="font-display text-4xl font-black" style={{ color: "#0F172A" }}>$2</span>
                  <span className="text-sm ml-1" style={{ color: "#94a3b8" }}>/ member</span>
                </div>
                <div className="text-xs mb-5" style={{ color: "#64748b" }}>One-time · Admin free</div>
                <Link href="/signup" className="block mb-6">
                  <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                    Create Group <ArrowRight size={14} />
                  </button>
                </Link>
                <div className="space-y-2 flex-1">
                  {FRIENDS_FEATURES.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(0,255,136,0.1)" }}>
                        <Check size={9} style={{ color: "#059669" }} />
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: "#475569" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tier 3 — Team Starter */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="rounded-3xl overflow-hidden flex flex-col relative"
              style={{ background: "linear-gradient(135deg, #0B141B, #0B1F14)", border: "2px solid rgba(0,212,255,0.4)", boxShadow: "0 8px 40px rgba(0,212,255,0.15)" }}>
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                Most Popular
              </div>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
                    <Building2 size={17} style={{ color: "#00D4FF" }} />
                  </div>
                  <div>
                    <div className="font-display text-base uppercase font-black" style={{ color: "white" }}>Team Starter</div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Up to 50 members</div>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="font-display text-4xl font-black" style={{ color: "white" }}>$75</span>
                  <span className="text-sm ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>one-time</span>
                </div>
                <div className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Whole team joins free</div>
                <Link href="/create-group" className="block mb-6">
                  <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
                    Get Team Starter <ArrowRight size={14} />
                  </button>
                </Link>
                <div className="space-y-2 flex-1">
                  {STARTER_FEATURES.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }}>
                        <Check size={9} style={{ color: "#00FF88" }} />
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tier 4 — Corporate Pack */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{ background: "white", border: "2px solid rgba(217,119,6,0.3)", boxShadow: "0 4px 20px rgba(217,119,6,0.08)" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                    <Star size={17} style={{ color: "#d97706" }} />
                  </div>
                  <div>
                    <div className="font-display text-base uppercase font-black" style={{ color: "#0F172A" }}>Corporate Pack</div>
                    <div className="text-[10px]" style={{ color: "#94a3b8" }}>Up to 100 members</div>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="font-display text-4xl font-black" style={{ color: "#0F172A" }}>$130</span>
                  <span className="text-sm ml-1" style={{ color: "#94a3b8" }}>one-time</span>
                </div>
                <div className="text-xs mb-5" style={{ color: "#64748b" }}>Whole team joins free</div>
                <Link href="/create-group" className="block mb-6">
                  <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "white" }}>
                    Get Corporate Pack <ArrowRight size={14} />
                  </button>
                </Link>
                <div className="space-y-2 flex-1">
                  {[...STARTER_FEATURES, ...CORPORATE_FEATURES].map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(217,119,6,0.1)" }}>
                        <Check size={9} style={{ color: "#d97706" }} />
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: "#475569" }}>{f}</span>
                    </div>
                  ))}
                </div>
                {/* Enterprise CTA */}
                <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: "#f1f5f9" }}>
                  <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>Need more than 100 members?</p>
                  <button onClick={() => setShowEnterprise(true)}
                    className="text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70"
                    style={{ color: "#0891B2" }}>
                    Contact us for Enterprise →
                  </button>
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