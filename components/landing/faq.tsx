"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Gemini copy — exact questions and answers
const FAQS = [
  {
    q: "How do tie-breakers work?",
    a: "Speed is king. If points are identical, the user who submitted their predictions earliest earns the higher rank. No arguments, just physics. As a secondary tie-breaker: most exact scores. Third: correctly predicted the tournament winner. If still tied, the admin can split the pot — the UI supports dual 1st place.",
  },
  {
    q: "Does Cup Clash handle the actual prize money?",
    a: "To keep things legal and peer-to-peer, the Commissioner handles the transfers. We provide the tracker, the payout splits, and the \"Paid\" status so everyone knows who's good for it. Cup Clash tracks the pot and calculates exactly who gets what — the actual money stays between your group.",
  },
  {
    q: "When do predictions lock?",
    a: "All predictions lock automatically 5 minutes before the match kicks off. No \"I forgot,\" no \"The app crashed,\" and zero late entries. Tournament-level picks (winner, top scorer, Golden Ball, etc.) lock before the very first match on June 11.",
  },
  {
    q: "Is it ready for the 48-team expansion?",
    a: "Absolutely. We have mapped out all 12 groups and the new Round of 32 knockout stage. 104 matches, 16 host cities, the whole thing. We've done the heavy lifting so you don't have to.",
  },
  {
    q: "Can I join multiple groups?",
    a: "Yes. Your dashboard aggregates all your active leagues so you can see your total potential winnings across all friend groups in one view. Office group, family group, bar squad — all tracked simultaneously with a single \"Show Me The Money\" total.",
  },
  {
    q: "Can we create a group for just the Final?",
    a: "Yes. Admins can toggle \"Single Match Mode\" for high-stakes betting on the big ones — from the opening match in Mexico City to the MetLife Final. You can also add extra predictions: yellow cards, corners, whether it goes to extra time or penalties.",
  },
  {
    q: "What's the Trivia Challenge?",
    a: "20 World Cup questions, 7 seconds each. One shot to earn up to 20 bonus points — 1 point per correct answer. The Trivia Champion badge (pulsing gold trophy) is awarded to whoever gets the most correct, with total answer time as the tie-breaker. After the points round, you can play the remaining questions for fun.",
  },
  {
    q: "Is Cup Clash really ad-free?",
    a: "Cup Clash is built by fans, for fans. We will never clutter your experience with ads, trackers, or corporate junk — just 104 matches of pure competition. Your payment is the business model. That's the deal.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="label-caps mb-3">FAQ</div>
          <h2 className="font-display text-4xl sm:text-5xl uppercase text-white">
            Good questions.<br />
            <span style={{ color: "#10b981" }}>Straight answers.</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl overflow-hidden border transition-all"
              style={{ borderColor: open === i ? "rgba(0,212,255,0.3)" : "#e2e8f0", background: open === i ? "rgba(0,212,255,0.03)" : "rgba(255,255,255,0.85)" }}
            >
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
                <span className="text-sm font-bold leading-relaxed" style={{ color: open === i ? "#ffffff" : "#cbd5e1" }}>{faq.q}</span>
                <ChevronDown size={18} className={`shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                  style={{ color: open === i ? "#10b981" : "#64748b" }} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-6 pb-5 text-sm leading-relaxed border-t" style={{ color: "#94a3b8", borderColor: "rgba(16,185,129,0.1)" }}>
                      <div className="pt-4">{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
