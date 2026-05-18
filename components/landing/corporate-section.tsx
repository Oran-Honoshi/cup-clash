"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Building2, Users, Trophy, Zap, ArrowRight, Check } from "lucide-react";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";

const BENEFITS = [
  { icon: Users,    title: "Zero friction for employees",   body: "Staff click the invite link and go straight in. No checkout, no card details, no friction." },
  { icon: Zap,      title: "One payment, whole team",       body: "HR or a manager pays once. Every employee gets full platform access automatically."          },
  { icon: Trophy,   title: "Your prizes, your rules",       body: "Replace cash pots with company prizes — gift cards, extra days off, tech gadgets."           },
  { icon: Building2, title: "Distributed teams welcome",   body: "Works for remote, hybrid, or office teams across any timezone. Just share the link."          },
];

const LOGOS = ["🏢", "🏭", "🏦", "🏥", "🎓", "💻"];

export function CorporateSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="py-16 px-5 sm:px-8"
        style={{ background: "linear-gradient(135deg, #0B141B 0%, #0B1F14 60%, #0B141B 100%)" }}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
              style={{ borderColor: "rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.06)" }}>
              <Building2 size={13} style={{ color: "#00D4FF" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
                For Teams & Companies
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase font-black mb-4" style={{ color: "white" }}>
              The World Cup is the{" "}
              <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                best team-building event
              </span>{" "}
              of 2026.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
              HR managers and team leads: one flat fee covers your entire department.
              Employees join for free. No individual checkouts. No chasing payments.
            </p>
          </motion.div>

          {/* Benefits grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <b.icon size={20} style={{ color: "#00D4FF" }} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: "white" }}>{b.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{b.body}</p>
              </motion.div>
            ))}
          </div>

          {/* How it works for corporates */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 mb-10"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <h3 className="font-display text-2xl uppercase font-black text-center mb-8" style={{ color: "white" }}>
              How it works for your team
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Manager pays once",     body: "HR or team lead picks the Corporate Pack and pays a single flat fee. Takes 2 minutes.",        color: "#00D4FF" },
                { step: "02", title: "Share the invite link", body: "Post the passkey on Slack, Teams, or WhatsApp. Employees sign up — no payment required.",       color: "#00FF88" },
                { step: "03", title: "Everyone competes",     body: "Staff predict matches, climb the leaderboard, and compete for company-sponsored prizes.",       color: "#d97706" },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm mx-auto mb-4"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}40`, color: s.color }}>
                    {s.step}
                  </div>
                  <h4 className="font-bold text-sm mb-2" style={{ color: "white" }}>{s.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{s.body}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Corporate prize idea */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="rounded-2xl p-6 mb-10 text-center"
            style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="font-bold text-sm mb-1" style={{ color: "#00FF88" }}>Replace the cash pot with company prizes</h4>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Extra vacation day · Amazon gift card · Team lunch · Tech gadget · Charity donation in winner's name
            </p>
          </motion.div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing">
              <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider w-full sm:w-auto justify-center"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                See Corporate Pricing <ArrowRight size={18} />
              </button>
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider w-full sm:w-auto justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "white", background: "rgba(255,255,255,0.06)" }}>
              Contact Us for Enterprise
            </button>
          </div>
        </div>
      </section>

      <EnterpriseModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}