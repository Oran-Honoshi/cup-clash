"use client";

import { motion } from "framer-motion";
import { Smartphone, Download, Share, Plus } from "lucide-react";

const STEPS = [
  {
    os:    "iOS (iPhone/iPad)",
    icon:  "🍎",
    steps: [
      { icon: Share,    text: "Tap the Share button at the bottom of Safari" },
      { icon: Plus,     text: "Scroll down and tap 'Add to Home Screen'" },
      { icon: Download, text: "Tap 'Add' — Cup Clash appears on your home screen" },
    ],
  },
  {
    os:    "Android",
    icon:  "🤖",
    steps: [
      { icon: Smartphone, text: "Open cupclash.live in Chrome" },
      { icon: Plus,       text: "Tap the menu (⋮) and select 'Add to Home Screen'" },
      { icon: Download,   text: "Tap 'Install' — opens like a native app" },
    ],
  },
];

export function PWAInstallSection() {
  return (
    <section className="py-20 px-5 sm:px-8" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.04), rgba(0,255,136,0.04))" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <div className="label-caps mb-3">No download needed</div>
          <h2 className="font-display text-4xl sm:text-5xl uppercase" style={{ color: "#0F172A" }}>
            Add to your{" "}
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              home screen
            </span>
          </h2>
          <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Cup Clash works like a native app — no App Store, no updates, no storage used.
            Install it in 10 seconds and it lives on your phone like any other app.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {STEPS.map((platform, pi) => (
            <motion.div key={platform.os}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: pi * 0.1 }}
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{platform.icon}</span>
                <span className="font-display text-lg uppercase font-black" style={{ color: "#0F172A" }}>
                  {platform.os}
                </span>
              </div>
              <div className="space-y-4">
                {platform.steps.map((step, si) => (
                  <div key={si} className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                      <span className="text-xs font-black" style={{ color: "#0891B2" }}>{si + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{step.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits row */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: "⚡", label: "Instant load" },
            { emoji: "📴", label: "Works offline" },
            { emoji: "🔔", label: "Push notifications" },
            { emoji: "💾", label: "No storage used" },
          ].map(({ emoji, label }) => (
            <div key={label} className="rounded-xl px-3 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,212,255,0.1)" }}>
              <div className="text-xl mb-1">{emoji}</div>
              <div className="text-xs font-bold" style={{ color: "#475569" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}