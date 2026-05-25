"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How much does it cost to host a group?",
    a: "Hosting is free for friend groups — you pay $0 to create and run a Friend Circle. Each friend pays $2 to join. For corporate groups, you pay a one-time fee of $75 (up to 50 employees) or $130 (up to 100 employees) and your entire team joins for free.",
  },
  {
    q: "When does the tournament start?",
    a: "World Cup 2026 kicks off June 11, 2026 with Mexico vs South Africa. The tournament runs through July 19 (Final at MetLife Stadium, New Jersey). You can create your group anytime — predictions lock 5 minutes before each match kickoff.",
  },
  {
    q: "Can I customise the scoring rules?",
    a: "Yes. Cup Clash ships with 9 togglable scoring rules: Match Outcome, Exact Scoreline, Knockout Advancement, Tournament Champion, Golden Boot, Top Assist, Best Defence, Best Young Player, and Golden Ball. Default values are 10/25/20/100/50/50/40/30/40 pts respectively, and every value is customisable.",
  },
  {
    q: "How are prizes paid out?",
    a: "For friend groups with a buy-in pot, you set the % split between 1st/2nd/3rd (default 60/30/10) and we track payments via PayPal. For corporate groups, you can either run a cash pool or define custom company rewards (e.g. \"Extra day off + $100 Amazon Voucher\").",
  },
  {
    q: "What if my team has more than 100 employees?",
    a: "Cup Clash offers an Enterprise tier with SSO, custom URLs, a dedicated CSM and invoicing for teams larger than 100 employees. Reach out via the contact page.",
  },
  {
    q: "Is there a mobile app for Cup Clash?",
    a: "Cup Clash is a Progressive Web App (PWA) — install it directly from your browser to get a near-native experience on iOS and Android, with all features and no app store friction.",
  },
  {
    q: "Is Cup Clash gambling?",
    a: "No. Cup Clash is a skill-based prediction league between friends or coworkers. There is no house, no odds, and no operator take. Optional cash pools are peer-to-peer and managed by the group host.",
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
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">Frequently Asked</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl uppercase text-white">
            Questions &amp; answers.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-2.5">
          {FAQS.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: "rgba(18,14,38,0.32)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: open === i ? "1px solid rgba(0,255,136,0.35)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-sm font-bold leading-relaxed text-white">{faq.q}</span>
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: open === i ? "rgba(0,255,136,0.18)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${open === i ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.12)"}`,
                  }}
                >
                  <ChevronDown size={14}
                    className={`transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                    style={{ color: open === i ? "#00FF88" : "rgba(255,255,255,0.5)" }}
                  />
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-6 pb-5 text-sm leading-relaxed border-t text-white/65"
                      style={{ borderColor: "rgba(0,255,136,0.1)" }}>
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
