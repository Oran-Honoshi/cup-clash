"use client";

import { motion } from "framer-motion";

// Gemini copy — exact steps
const STEPS = [
  {
    number: "01", emoji: "🛡️", color: "#10b981",
    title: "Draft Your League",
    body: "Pick your tier, set your buy-in, and customize your scoring rules in under 60 seconds. We handle the math; you handle the glory.",
    detail: "60 seconds to launch. Seriously.",
  },
  {
    number: "02", emoji: "👥", color: "#3b82f6",
    title: "Recruit the Squad",
    body: "Blast your unique invite link to the chat and watch as your friends join and customize their unique DiceBear avatars. No more chasing people for \"Who's in?\"",
    detail: "Works on WhatsApp, email, or any chat.",
  },
  {
    number: "03", emoji: "🏆", color: "#E61D25",
    title: "Predict and Conquer",
    body: "Enter scores, track the live bracket, and climb the leaderboard in real-time. Every goal changes the standings until the trophy is raised in Jersey.",
    detail: "104 matches. 38 days. One champion.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="label-caps mb-3">Simple by design</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase text-white">
            Up and running in{" "}
            <span style={{ color: "#10b981" }}>60 seconds.</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px"
            style={{ background: "linear-gradient(90deg, #10b981, #3b82f6, #E61D25)" }} />

          <div className="grid lg:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <motion.div key={step.number}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center lg:text-left"
              >
                <div className="flex justify-center lg:justify-start mb-6">
                  <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}>
                    {step.emoji}
                    <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: step.color }}>{step.number}</div>
                  </div>
                </div>
                <h3 className="font-display text-2xl uppercase text-white mb-3">{step.title}</h3>
                <p className="text-base leading-relaxed mb-3" style={{ color: "#94a3b8" }}>{step.body}</p>
                <p className="text-sm font-bold" style={{ color: step.color }}>{step.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
