"use client";

import { motion } from "framer-motion";
import { Users, Building2, KeyRound, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DashboardEmptyState() {
  return (
    <div className="space-y-5">
      <div>
        <div className="label-caps mb-1">Welcome to Cup Clash</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          How would you like to play?
        </h1>
        <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>
          Pick your path — you can always change later.
        </p>
      </div>

      {/* Primary tiles */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Friend Circle */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,255,136,0.15)" }}
          transition={{ duration: 0.2 }}>
          <Link href="/create-group?model=pay_per_member"
            className="block rounded-3xl overflow-hidden h-full"
            style={{ background: "white", border: "2px solid rgba(0,255,136,0.25)", boxShadow: "0 4px 20px rgba(0,255,136,0.08)" }}>
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF)" }} />
            <div className="p-7">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
                <Users size={26} style={{ color: "#059669" }} />
              </div>
              <div className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
                Friend Circle
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>
                Free for you to create. Every member pays a flat{" "}
                <strong style={{ color: "#0F172A" }}>$2 entry fee</strong> individually when joining.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Fantasy leagues", "Friend groups", "Family", "Bar buddies"].map(t => (
                  <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,255,136,0.08)", color: "#059669", border: "1px solid rgba(0,255,136,0.15)" }}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "#059669" }}>
                Create a Friend Group <ArrowRight size={15} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Corporate Sponsor */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,212,255,0.18)" }}
          transition={{ duration: 0.2 }}>
          <Link href="/create-group?model=corporate_sponsored"
            className="block rounded-3xl overflow-hidden h-full"
            style={{ background: "white", border: "2px solid rgba(0,212,255,0.3)", boxShadow: "0 4px 20px rgba(0,212,255,0.08)" }}>
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
            <div className="p-7">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Building2 size={26} style={{ color: "#0891B2" }} />
              </div>
              <div className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
                Corporate Sponsor
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>
                Cover the whole team with a{" "}
                <strong style={{ color: "#0F172A" }}>single flat rate</strong>.
                Everyone you invite joins for{" "}
                <strong style={{ color: "#0F172A" }}>$0 — zero friction</strong>.
              </p>
              <div className="flex gap-3 mb-6">
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2" }}>
                  $75 · 50 members
                </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(217,119,6,0.08)", color: "#d97706" }}>
                  $130 · 100 members
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "#0891B2" }}>
                Set Up Corporate Group <ArrowRight size={15} />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Link href="/join/enter"
            className="block rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <KeyRound size={20} style={{ color: "#0891B2" }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#0F172A" }}>Join a Group</div>
              <div className="text-xs" style={{ color: "#94a3b8" }}>Enter a passkey from your admin</div>
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Link href="/predictions"
            className="block rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
              <Trophy size={20} style={{ color: "#059669" }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#0F172A" }}>Solo Predictions</div>
              <div className="text-xs" style={{ color: "#94a3b8" }}>Play on your own, no group needed</div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}