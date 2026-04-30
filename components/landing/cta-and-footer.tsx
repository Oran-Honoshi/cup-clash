"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PHOTOS } from "@/lib/assets";

const LINKS = {
  product: [
    { label:"Features",      href:"#features"     },
    { label:"Pricing",       href:"#pricing"       },
    { label:"How It Works",  href:"#how-it-works"  },
    { label:"2026 Schedule", href:"/schedule"      },
  ],
  legal: [
    { label:"Privacy",     href:"/privacy"     },
    { label:"Terms",       href:"/terms"       },
    { label:"Unsubscribe", href:"/unsubscribe" },
  ],
};

export function CtaAndFooter() {
  return (
    <>
      {/* Final CTA */}
      <section className="py-28 px-5 sm:px-8" style={{ background:"#F8FAFC" }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="relative rounded-3xl overflow-hidden p-12"
            style={{ background:"rgba(255,255,255,0.88)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(0,212,255,0.25)", boxShadow:"0 20px 60px rgba(0,212,255,0.08), 0 40px 80px rgba(0,255,136,0.06)" }}>

            {/* Trophy photo — white bleed from center */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTOS.trophyGrass} alt="World Cup trophy"
                className="w-full h-full object-cover"
                style={{ opacity:0.08, objectPosition:"center 20%" }} />
              {/* Radial white fade from center outward */}
              <div className="absolute inset-0" style={{
                background:"radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.92) 65%)",
              }} />
            </div>

            {/* Messi photo — floating right side */}
            <div className="absolute right-0 bottom-0 w-48 h-64 pointer-events-none overflow-hidden rounded-br-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTOS.messiShirt} alt="Messi Argentina shirt"
                className="w-full h-full object-cover object-top"
                style={{ opacity:0.12 }} />
              {/* Left + top white fade */}
              <div className="absolute inset-0" style={{
                background:"linear-gradient(to bottom-right, rgba(255,255,255,0.95) 0%, transparent 60%)",
              }} />
            </div>

            {/* Cyan-to-mint top bar */}
            <div className="absolute top-0 left-0 right-0 h-1"
              style={{ background:"linear-gradient(90deg, #00D4FF, #00FF88)" }} />

            {/* Neon glow orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%)", transform:"translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle, rgba(0,255,136,0.05), transparent 70%)", transform:"translate(-30%, 30%)" }} />

            <div className="relative">
              <div className="label-caps mb-4">The time is now</div>
              <h2 className="font-display text-5xl sm:text-6xl uppercase mb-4 leading-tight" style={{ color:"#0F172A" }}>
                Glory Starts<br />
                <span style={{ background:"linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  June 11.
                </span><br />
                Claim It Now.
              </h2>
              <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color:"#64748b" }}>
                Join thousands of groups already gearing up for the biggest World Cup in history. Secure your slot today.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg uppercase tracking-wider transition-all hover:-translate-y-1"
                    style={{ background:"linear-gradient(135deg, #00FF88, #00D4FF)", color:"#0B141B", boxShadow:"0 20px 50px rgba(0,255,136,0.30), 0 4px 16px rgba(0,255,136,0.2)" }}>
                    Start My Group — Free <ArrowRight size={20} />
                  </button>
                </Link>
                <Link href="/signin">
                  <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:shadow-md"
                    style={{ border:"1px solid rgba(0,212,255,0.25)", background:"rgba(255,255,255,0.6)", backdropFilter:"blur(8px)", color:"#475569" }}>
                    Claim the Trophy
                  </button>
                </Link>
              </div>
              <p className="mt-6 text-sm" style={{ color:"#94a3b8" }}>
                No credit card required · 3 members free forever · Upgrade anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-5 sm:px-8 py-12"
        style={{ borderColor:"rgba(0,212,255,0.12)", background:"rgba(255,255,255,0.6)", backdropFilter:"blur(12px)" }}>
        {/* Soccer ball photo strip at top of footer */}
        <div className="relative h-24 rounded-2xl overflow-hidden mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.stadiumWatering} alt="Stadium pitch"
            className="w-full h-full object-cover"
            style={{ opacity:0.18, objectPosition:"center 40%" }} />
          <div className="absolute inset-0" style={{
            background:"linear-gradient(to right, rgba(255,255,255,0.9) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.9) 100%)",
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="font-display text-2xl uppercase font-black" style={{ color:"#0F172A" }}>Cup Clash</div>
              <div className="text-xs uppercase tracking-widest mt-0.5" style={{ color:"#0891B2" }}>World Cup 2026</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              <p className="text-sm mb-4" style={{ color:"#64748b" }}>
                The private World Cup 2026 prediction league.<br />
                Ad-free. Fan-first. Built for your group.
              </p>
              <div className="text-xs" style={{ color:"#94a3b8" }}>© 2026 Cup Clash. All rights reserved.</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:"#94a3b8" }}>Product</div>
              <ul className="space-y-2">
                {LINKS.product.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors" style={{ color:"#64748b" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#00D4FF")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:"#94a3b8" }}>Legal</div>
              <ul className="space-y-2">
                {LINKS.legal.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors" style={{ color:"#64748b" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#00D4FF")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t flex items-start justify-between gap-4 flex-wrap"
            style={{ borderColor:"rgba(0,212,255,0.1)" }}>
            <div className="text-xs max-w-xl" style={{ color:"#94a3b8" }}>
              Cup Clash is built by fans, for fans; we will never clutter your experience with ads, trackers, or corporate junk — just 104 matches of pure competition.
            </div>
            <div className="text-xs" style={{ color:"#94a3b8" }}>Made with love for the beautiful game</div>
          </div>
        </div>
      </footer>
    </>
  );
}
