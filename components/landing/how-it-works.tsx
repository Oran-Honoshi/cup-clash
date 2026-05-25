"use client";

import { motion } from "framer-motion";
import { PHOTOS } from "@/lib/assets";

const STEPS = [
  {
    number: "01", color: "#00FF88", bgColor: "rgba(0,255,136,0.08)", borderColor: "rgba(0,255,136,0.25)",
    title: "Create Your Group — Free",
    body: "Sign up, name your group, set scoring rules and prize split in under 60 seconds. Admins are always free. Zero credit card required.",
    detail: "✓ Admin always free. No exceptions.",
    photo: PHOTOS.dressRoomShirts,
    photoAlt: "Team shirts in dressing room",
  },
  {
    number: "02", color: "#00D4FF", bgColor: "rgba(0,212,255,0.08)", borderColor: "rgba(0,212,255,0.25)",
    title: "Invite Your Squad",
    body: "Share your unique passkey via WhatsApp, Telegram, email or SMS. Friends join for $2 each — that's it. No subscription, no hidden fees.",
    detail: "Members pay $2. You pay $0.",
    photo: PHOTOS.fansStreet,
    photoAlt: "Fans celebrating on the street",
  },
  {
    number: "03", color: "#fbbf24", bgColor: "rgba(217,119,6,0.08)", borderColor: "rgba(251,191,36,0.25)",
    title: "Predict & Conquer",
    body: "Enter scores, track the live bracket, and climb the leaderboard in real-time. Every goal changes the standings until the trophy is raised in Jersey.",
    detail: "104 matches. 38 days. One champion.",
    photo: PHOTOS.playerJumping,
    photoAlt: "Player jumping after scoring",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">Simple by design</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase text-white">
            Up and running in{" "}
            <span className="bg-gradient-to-br from-cyan to-ac bg-clip-text text-transparent">
              60 seconds.
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[120px] left-[16.67%] right-[16.67%] h-px"
            style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF, #fbbf24)" }} />

          <div className="grid lg:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={step.number}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(18,14,38,0.32)",
                  backdropFilter: "blur(40px) saturate(180%)",
                  border: `1px solid ${step.borderColor}`,
                  boxShadow: `0 4px 24px ${step.bgColor}, 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
                }}>

                {/* Accent glow */}
                <div className="absolute -top-5 -right-5 w-28 h-28 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${step.color}20, transparent 70%)`, filter: "blur(30px)" }} />

                {/* Photo */}
                <div className="relative overflow-hidden" style={{ height: 176, width: "100%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.photo}
                    alt={step.photoAlt}
                    width={600}
                    height={176}
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(18,14,38,0.95) 100%)" }} />
                  <div className="absolute top-4 left-4 h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm z-10"
                    style={{
                      background: "rgba(18,14,38,0.9)",
                      backdropFilter: "blur(8px)",
                      color: step.color,
                      border: `1px solid ${step.color}40`,
                    }}>
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pt-4 pb-6">
                  <h3 className="font-display text-2xl uppercase mb-3 text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed mb-3 text-white/62">{step.body}</p>
                  <p className="text-sm font-bold" style={{ color: step.color }}>{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
