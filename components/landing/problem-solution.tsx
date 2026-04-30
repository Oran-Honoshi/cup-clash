"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { PHOTOS } from "@/lib/assets";

const PAIRS = [
  { pain: "Manual Math: Broken formulas and Excel errors.",               solution: "Instant Scoring: Automated, real-time points engine."    },
  { pain: "The Debt Collector: Chasing friends for buy-ins.",             solution: "Pot Tracker: Built-in Paid/Pending status bars."          },
  { pain: "Lost Info: Predictions buried in 400 unread messages.",        solution: "Locked Timestamps: Digital proof of every guess."         },
  { pain: "Scale Shock: Managing 48 teams by hand is a job.",             solution: "104-Match Flow: Expansion-ready logic for 2026."          },
  { pain: "The \"Who Won?\" Debate: Constant tie-breaker fights.",        solution: "Speed Rules: Crystal clear, time-based tie-breakers."     },
  { pain: "Ad-Trash: Shady sites filled with pop-up junk.",              solution: "Pro-Tier UI: 100% Ad-free. Clean. Fast. Elite."           },
];

function PhotoHeader({ src, alt, desaturate = false, label }: { src: string; alt: string; desaturate?: boolean; label: string }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-t-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover"
        style={{ filter: desaturate ? "grayscale(100%) brightness(0.9)" : "brightness(0.95)", opacity: desaturate ? 0.6 : 0.85 }} />
      {/* Fade to card bg at bottom */}
      <div className="absolute inset-0" style={{
        background: desaturate
          ? "linear-gradient(to bottom, transparent 40%, #F1F5F9 100%)"
          : "linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.9) 100%)",
      }} />
      {/* Label */}
      <div className="absolute bottom-3 left-5">
        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={desaturate
            ? { background:"rgba(100,116,139,0.15)", color:"#94a3b8" }
            : { background:"rgba(0,255,136,0.15)", color:"#059669", border:"1px solid rgba(0,255,136,0.3)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function ProblemSolution() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ background:"#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
          <div className="label-caps mb-3">Sound familiar?</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase leading-tight" style={{ color:"#0F172A" }}>
            The Group Chat Nightmare<br />
            <span style={{ background:"linear-gradient(135deg, #0F172A, #00D4FF)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              vs. The Cup Clash Way.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Nightmare — desaturated, boring */}
          <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            className="rounded-3xl overflow-hidden"
            style={{ background:"#F1F5F9", border:"1px solid #e2e8f0" }}>
            <PhotoHeader src={PHOTOS.funnyFans} alt="Frustrated fans" desaturate label="The Old Way" />
            <div className="px-6 py-5 border-b" style={{ borderColor:"#e2e8f0" }}>
              <div className="font-display text-xl uppercase" style={{ color:"#475569" }}>The WhatsApp Nightmare</div>
              <div className="text-xs" style={{ color:"#94a3b8" }}>0/10 — do not recommend</div>
            </div>
            <div className="p-6 space-y-3">
              {PAIRS.map((p,i) => (
                <motion.div key={i} initial={{ opacity:0, x:-8 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl" style={{ background:"#e8edf3" }}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background:"#cbd5e1" }}>
                    <X size={10} style={{ color:"#94a3b8" }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color:"#64748b" }}>{p.pain}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cup Clash — vibrant, winning */}
          <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            className="rounded-3xl overflow-hidden relative"
            style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(0,212,255,0.3)", boxShadow:"0 8px 40px rgba(0,212,255,0.10), 0 20px 60px rgba(0,255,136,0.08)" }}>
            <PhotoHeader src={PHOTOS.happyFans} alt="Happy fans celebrating" label="The Cup Clash Way" />
            {/* Cyan-to-mint gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ background:"linear-gradient(90deg, #00D4FF, #00FF88)" }} />
            <div className="px-6 py-5 border-b" style={{ borderColor:"rgba(0,212,255,0.15)" }}>
              <div className="font-display text-xl uppercase" style={{ color:"#0F172A" }}>The Cup Clash Way</div>
              <div className="text-xs" style={{ color:"#00D4FF" }}>Pure football joy. Zero admin pain.</div>
            </div>
            <div className="p-6 space-y-3">
              {PAIRS.map((p,i) => (
                <motion.div key={i} initial={{ opacity:0, x:8 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background:"rgba(0,255,136,0.05)", border:"1px solid rgba(0,255,136,0.1)" }}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background:"rgba(0,255,136,0.15)", border:"1px solid rgba(0,255,136,0.3)" }}>
                    <Check size={10} style={{ color:"#00c46a" }} />
                  </div>
                  <span className="text-sm leading-relaxed font-medium" style={{ color:"#0F172A" }}>{p.solution}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
