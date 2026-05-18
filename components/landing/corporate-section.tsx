"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Building2, Users, Trophy, Zap, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";

const BENEFITS = [
  { icon: Users,     title: "Zero friction for employees",  body: "Staff click the invite link and go straight in. No checkout, no card details, no friction."    },
  { icon: Zap,       title: "One payment, whole team",      body: "HR or a manager pays once. Every employee gets full platform access automatically."             },
  { icon: Trophy,    title: "Your prizes, your rules",      body: "Replace cash pots with company prizes — gift cards, extra days off, tech gadgets."              },
  { icon: Building2, title: "Distributed teams welcome",   body: "Works for remote, hybrid, or office teams across any timezone. Just share the link on Slack."    },
];

const OFFICE_PHOTO = "https://ljivgwkczgqvcqkdzsxr.supabase.co/storage/v1/object/public/landing-assets/office%20germany%20fans.jpg";
const STADIUM_PHOTO = "https://ljivgwkczgqvcqkdzsxr.supabase.co/storage/v1/object/public/landing-assets/outside%20stadium%20and%20many%20blureed%20people%20outside.jpg";

export function CorporateSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="py-16 px-5 sm:px-8" style={{ background: "white" }}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
              style={{ borderColor: "rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.05)" }}>
              <Building2 size={13} style={{ color: "#0891B2" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>
                For Teams & Companies
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase font-black mb-4" style={{ color: "#0F172A" }}>
              The World Cup is the{" "}
              <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                best team-building event
              </span>{" "}
              of 2026.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#64748b" }}>
              One flat fee covers your entire department. Employees join free — no checkout, no friction, no chasing payments.
            </p>
          </motion.div>

          {/* Main content — photo + benefits */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12 items-center">

            {/* Office photo */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden relative"
              style={{ height: 400 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OFFICE_PHOTO}
                alt="Office team celebrating World Cup together"
                width={700}
                height={400}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,255,136,0.1))" }} />
              {/* Overlay badge */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-2xl px-5 py-4"
                  style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-display text-2xl font-black" style={{ color: "#0F172A" }}>$0</div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>per employee</div>
                    </div>
                    <div className="h-8 w-px" style={{ background: "#e2e8f0" }} />
                    <div className="text-center">
                      <div className="font-display text-2xl font-black" style={{ color: "#0F172A" }}>1</div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>flat payment</div>
                    </div>
                    <div className="h-8 w-px" style={{ background: "#e2e8f0" }} />
                    <div className="flex-1">
                      <div className="text-sm font-bold" style={{ color: "#0F172A" }}>Your company covers it</div>
                      <div className="text-xs" style={{ color: "#64748b" }}>employees join instantly</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-5">
              {BENEFITS.map((b, i) => (
                <motion.div key={b.title}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 p-4 rounded-2xl"
                  style={{ background: "#F8FAFC", border: "1px solid rgba(0,212,255,0.1)" }}>
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}>
                    <b.icon size={18} style={{ color: "#0891B2" }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-0.5" style={{ color: "#0F172A" }}>{b.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{b.body}</div>
                  </div>
                </motion.div>
              ))}

              {/* How it works mini */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  { step: "1", text: "Manager pays once" },
                  { step: "→", text: "" },
                  { step: "2", text: "Share invite link" },
                  { step: "→", text: "" },
                  { step: "3", text: "Team joins free" },
                ].map((s, i) => (
                  s.step === "→" ? (
                    <span key={i} style={{ color: "#cbd5e1" }}>→</span>
                  ) : (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                        style={{ background: "rgba(0,212,255,0.1)", color: "#0891B2" }}>{s.step}</div>
                      <span className="text-xs font-bold" style={{ color: "#475569" }}>{s.text}</span>
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          </div>

          {/* Corporate prize callout */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl p-6 mb-10 flex items-center gap-6 flex-wrap"
            style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)" }}>
            <div className="text-3xl">🏆</div>
            <div className="flex-1">
              <div className="font-bold text-sm mb-1" style={{ color: "#0F172A" }}>Replace the cash pool with company prizes</div>
              <div className="text-xs" style={{ color: "#64748b" }}>
                Extra vacation day · Amazon gift card · Team lunch · Tech gadget · Charity donation in winner&apos;s name
              </div>
            </div>
            <div className="flex items-center gap-3">
              {["✓ No cash handling", "✓ No legal issues", "✓ HR-friendly"].map(t => (
                <span key={t} className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Stadium photo strip */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="rounded-3xl overflow-hidden mb-10 relative"
            style={{ height: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STADIUM_PHOTO}
              alt="Fans outside stadium"
              width={1400}
              height={200}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(11,20,27,0.55)" }}>
              <div className="text-center text-white">
                <div className="font-display text-3xl sm:text-4xl uppercase font-black mb-2">
                  104 matches. One platform.
                </div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  June 11 – July 19, 2026 · USA, Canada & Mexico
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-group">
              <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider w-full sm:w-auto justify-center transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 20px rgba(0,255,136,0.25)" }}>
                Set Up Your Team <ArrowRight size={18} />
              </button>
            </Link>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider w-full sm:w-auto justify-center transition-all hover:-translate-y-0.5"
              style={{ border: "2px solid rgba(0,212,255,0.3)", color: "#0891B2", background: "rgba(0,212,255,0.04)" }}>
              Contact Us for Enterprise
            </button>
          </div>
        </div>
      </section>

      <EnterpriseModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}