"use client";

import { motion } from "framer-motion";
import { Check, Zap, Ban, CreditCard, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Free",       price: "$0",   period: "forever",  highlight: false, badge: null,
    geminiName: "The \"Sunday League\" Special",
    members: "Up to 3 members",
    features: ["All scoring rules", "Auto-locking predictions", "Live leaderboard", "Trivia challenge", "DiceBear avatars", "Mobile-friendly"],
    cta: "Start My Group — Free", ctaHref: "/signup",
  },
  {
    name: "Startup",    price: "$20",  period: "one-time", highlight: false, badge: null,
    geminiName: "The \"Benchwarmers\"",
    members: "Up to 10 members",
    features: ["Everything in Free", "Buy-in & prize tracker", "Custom payout splits", "Welcome email invites", "Tie-breaker rules", "Nudge unpredicted members"],
    cta: "Choose Startup", ctaHref: "/create-group?tier=startup",
  },
  {
    name: "Pro",        price: "$50",  period: "one-time", highlight: true,  badge: "Most Popular",
    geminiName: "The \"First Team\"",
    members: "Up to 30 members",
    features: ["Everything in Startup", "Admin finance panel", "Winner poster export", "CSV leaderboard export", "Multiple groups", "Admin fee management"],
    cta: "Choose Pro", ctaHref: "/create-group?tier=pro",
  },
  {
    name: "Enterprise", price: "$100", period: "one-time", highlight: false, badge: null,
    geminiName: "The \"Galácticos\"",
    members: "Up to 60 members",
    features: ["Everything in Pro", "60 member slots", "Single match groups", "Priority support", "Custom rules text", "Full audit trail"],
    cta: "Choose Enterprise", ctaHref: "/create-group?tier=enterprise",
  },
];

const FOOTNOTES = [
  { Icon: Ban,        text: "No ads. Ever. We mean it."                         },
  { Icon: CreditCard, text: "One-time payment. No auto-renew. No subscription." },
  { Icon: Shield,     text: "Prize money stays with your group. We never touch it." },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 sm:px-8" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="label-caps mb-3">Pricing</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase" style={{ color: "#0F172A" }}>
            One Tournament.<br />
            One Payment.<br />
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              No Ads.
            </span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Choose the capacity your squad needs. No monthly fees, ever.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {TIERS.map((tier, i) => (
            <motion.div key={tier.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative flex flex-col rounded-2xl overflow-hidden"
              style={tier.highlight ? {
                background: "linear-gradient(160deg, rgba(0,255,136,0.06) 0%, rgba(255,255,255,0.9) 60%)",
                border: "1px solid rgba(0,212,255,0.25)",
                boxShadow: "0 4px 24px rgba(0,212,255,0.08)",
              } : {
                background: "rgba(255,255,255,0.85)",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,212,255,0.04)",
              }}
            >
              {tier.badge && (
                <div className="absolute top-0 left-0 right-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                  {tier.badge}
                </div>
              )}

              <div className={cn("p-6 flex-1 flex flex-col", tier.badge && "pt-10")}>
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#64748b" }}>{tier.name}</div>
                  <div className="text-xs italic mb-2" style={{ color: "#0891B2" }}>{tier.geminiName}</div>
                  <div className="flex items-end gap-1.5 mb-1">
                    <span className="font-display text-5xl leading-none font-black" style={{ color: "#0F172A" }}>{tier.price}</span>
                    <span className="text-xs pb-1.5" style={{ color: "#94a3b8" }}>{tier.period}</span>
                  </div>
                  <div className="text-xs font-bold" style={{ color: "#00c46a" }}>{tier.members}</div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#475569" }}>
                      <Check size={14} className="shrink-0 mt-0.5" style={{ color: "#00c46a" }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={tier.ctaHref}>
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
                    style={tier.highlight ? {
                      background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                      color: "#0B141B",
                      boxShadow: "0 4px 16px rgba(0,255,136,0.25)",
                    } : {
                      border: "1px solid rgba(0,212,255,0.2)",
                      color: "#64748b",
                      background: "transparent",
                    }}
                  >
                    {tier.highlight && <Zap size={14} className="inline mr-1.5" />}
                    {tier.cta}
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-10 grid sm:grid-cols-3 gap-4 text-center text-sm"
          style={{ color: "#64748b" }}
        >
          {FOOTNOTES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2">
              <Icon size={15} style={{ color: "#0891B2" }} />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}