"use client";

import { motion } from "framer-motion";
import { PHOTOS } from "@/lib/assets";

const STEPS = [
  {
    number: "01", color: "#00FF88", bgColor: "rgba(0,255,136,0.08)",
    title: "Create Your Group — Free",
    body: "Sign up, name your group, set your scoring rules and prize split in under 60 seconds. Admins are always free. Zero credit card required.",
    detail: "✓ Admin always free. No exceptions.",
    photo: PHOTOS.dressRoomShirts,
    photoAlt: "Team shirts in dressing room",
  },
  {
    number: "02", color: "#00D4FF", bgColor: "rgba(0,212,255,0.08)",
    title: "Invite Your Squad",
    body: "Share your unique passkey via WhatsApp, Telegram, email or SMS. Friends join for $2 each — that's it. No subscription, no hidden fees.",
    detail: "Members pay $2. You pay $0.",
    photo: PHOTOS.fansStreet,
    photoAlt: "Fans celebrating on the street",
  },
  {
    number: "03", color: "#d97706", bgColor: "rgba(217,119,6,0.08)",
    title: "Predict & Conquer",
    body: "Enter scores, track the live bracket, and climb the leaderboard in real-time. Every goal changes the standings until the trophy is raised in Jersey.",
    detail: "104 matches. 38 days. One champion.",
    photo: PHOTOS.playerJumping,
    photoAlt: "Player jumping after scoring",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 px-5 sm:px-8" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10">
          <div className="label-caps mb-3">Simple by design</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase" style={{ color: "#0F172A" }}>
            Up and running in{" "}
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              60 seconds.
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[120px] left-[16.67%] right-[16.67%] h-px"
            style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF, #d97706)" }} />

          <div className="grid lg:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={step.number}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,212,255,0.12)", boxShadow: `0 4px 24px ${step.bgColor}` }}>

                {/* Fixed height image container with explicit dimensions to prevent CLS */}
                <div className="relative overflow-hidden" style={{ height: 176, width: "100%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.photo}
                    alt={step.photoAlt}
                    width={600}
                    height={176}
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.85 }}
                  />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.95) 100%)" }} />
                  <div className="absolute top-4 left-4 h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm z-10"
                    style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", color: step.color, border: `1px solid ${step.color}40` }}>
                    {step.number}
                  </div>
                </div>

                {/* Content — padding-top ensures title never gets clipped */}
                <div className="px-5 pt-4 pb-5">
                  <h3 className="font-display text-2xl uppercase mb-3" style={{ color: "#0F172A" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "#64748b" }}>{step.body}</p>
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