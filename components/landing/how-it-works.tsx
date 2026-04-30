"use client";

import { motion } from "framer-motion";
import { PHOTOS } from "@/lib/assets";

const STEPS = [
  {
    number: "01", color: "#00FF88", bgColor: "rgba(0,255,136,0.08)",
    title: "Draft Your League",
    body: "Pick your tier, set your buy-in, and customize your scoring rules in under 60 seconds. We handle the math; you handle the glory.",
    detail: "60 seconds to launch. Seriously.",
    photo: PHOTOS.dressRoomShirts,
    photoAlt: "Team shirts in dressing room",
  },
  {
    number: "02", color: "#00D4FF", bgColor: "rgba(0,212,255,0.08)",
    title: "Recruit the Squad",
    body: "Blast your unique invite link to the chat and watch as your friends join and customize their avatars. No more chasing people for \"Who's in?\"",
    detail: "Works on WhatsApp, email, or any chat.",
    photo: PHOTOS.fansStreet,
    photoAlt: "Fans celebrating on the street",
  },
  {
    number: "03", color: "#d97706", bgColor: "rgba(217,119,6,0.08)",
    title: "Predict and Conquer",
    body: "Enter scores, track the live bracket, and climb the leaderboard in real-time. Every goal changes the standings until the trophy is raised in Jersey.",
    detail: "104 matches. 38 days. One champion.",
    photo: PHOTOS.playerJumping,
    photoAlt: "Player jumping after scoring",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8" style={{ background:"#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
          <div className="label-caps mb-3">Simple by design</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase" style={{ color:"#0F172A" }}>
            Up and running in{" "}
            <span style={{ background:"linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              60 seconds.
            </span>
          </h2>
        </motion.div>

        {/* Connector line */}
        <div className="relative">
          <div className="hidden lg:block absolute top-[120px] left-[16.67%] right-[16.67%] h-px"
            style={{ background:"linear-gradient(90deg, #00FF88, #00D4FF, #d97706)" }} />

          <div className="grid lg:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={step.number}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.15 }}
                className="relative rounded-2xl overflow-hidden"
                style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(16px)", border:"1px solid rgba(0,212,255,0.12)", boxShadow:`0 4px 24px ${step.bgColor}` }}>

                {/* Photo with white-fade mask */}
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={step.photo} alt={step.photoAlt}
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.85 }} />
                  {/* White bleed from bottom */}
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.95) 100%)",
                  }} />
                  {/* Step number badge */}
                  <div className="absolute top-4 left-4 h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm"
                    style={{ background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", color:step.color, border:`1px solid ${step.color}40` }}>
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 -mt-2">
                  <h3 className="font-display text-2xl uppercase mb-3" style={{ color:"#0F172A" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color:"#64748b" }}>{step.body}</p>
                  <p className="text-sm font-bold" style={{ color:step.color }}>{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
