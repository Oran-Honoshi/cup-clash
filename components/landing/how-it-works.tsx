"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    emoji: "🛡️",
    title: "Draft Your League",
    body: "Drop the spreadsheet. Create a private group in 30 seconds, set your buy-in, and define your payout split. We handle the math — you handle the glory.",
    detail: "Set rules, scoring system, and invite link in under a minute.",
    color: "#10b981",
  },
  {
    number: "02",
    emoji: "👥",
    title: "Recruit the Squad",
    body: "Send your unique invite link to the group chat. Watch as your friends' custom avatars fill the locker room. No more chasing people for \"Who's in?\"",
    detail: "Works on WhatsApp, email, or any messaging platform.",
    color: "#3b82f6",
  },
  {
    number: "03",
    emoji: "🏆",
    title: "Predict & Conquer",
    body: "Enter scores, track the live bracket, and climb the leaderboard in real-time. From the opening kick in Mexico City to the Final in New York — every goal changes the standings.",
    detail: "104 matches. 38 days. One champion.",
    color: "#E61D25",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="label-caps mb-3">Simple by design</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase text-white">
            Up and running in{" "}
            <span style={{ color: "#10b981" }}>3 minutes.</span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
            We built Cup Clash to be so simple that your group's least technical member sets it up.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-20 left-[16.67%] right-[16.67%] h-px"
            style={{ background: "linear-gradient(90deg, #10b981, #3b82f6, #E61D25)" }} />

          <div className="grid lg:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {/* Number bubble */}
                <div className="flex justify-center lg:justify-start mb-6">
                  <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}>
                    <span className="text-3xl">{step.emoji}</span>
                    <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: step.color }}>
                      {step.number}
                    </div>
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <h3 className="font-display text-2xl uppercase text-white mb-3">{step.title}</h3>
                  <p className="text-base leading-relaxed mb-3" style={{ color: "#94a3b8" }}>{step.body}</p>
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
