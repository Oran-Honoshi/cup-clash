"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { CountdownCard } from "@/components/landing/countdown-card";
import { COUNTRIES, HOST_NATIONS, flagUrl } from "@/lib/countries";

interface HeroProps {
  matchLabel: string;
  target: Date;
}

export function Hero({ matchLabel, target }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="lg:col-span-5 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5"
            >
              <Badge tone="accent" className="scanline">
                <Sparkles size={11} />
                FIFA World Cup 2026
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display uppercase text-white leading-[0.88] tracking-tight"
              style={{ fontSize: "clamp(44px, 5.5vw, 84px)" }}
            >
              Predict every
              <br />
              match.
              <br />
              <span className="gradient-text">Beat your</span>
              <br />
              <span className="gradient-text">friends.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-pitch-300 max-w-md leading-relaxed"
            >
              Private prediction leagues for your group chat, office, or family.
              Score guesses, knockout brackets, top scorers — all tracked and settled.
            </motion.p>

            {/* Host nations */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-5 flex items-center gap-3 flex-wrap"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-pitch-500">
                Hosted by
              </span>
              <div className="flex items-center gap-2">
                {HOST_NATIONS.map((code) => {
                  const c = COUNTRIES[code];
                  return (
                    <div
                      key={code}
                      className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5"
                    >
                      <div className="relative w-5 h-3.5 rounded-sm overflow-hidden shadow-sm shrink-0">
                        <Image
                          src={flagUrl(c.flagCode, 40)}
                          alt={c.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-[11px] font-bold text-pitch-200 uppercase tracking-wider">
                        {c.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/signup">
                <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                  Start a group — free
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Preview the app
                </Button>
              </Link>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-widest text-pitch-500"
            >
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-success" />
                Free under 4 players
              </span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>No credit card</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>48 teams · 104 matches</span>
            </motion.div>
          </div>

          {/* ── MIDDLE: Trophy photo ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="hidden lg:block lg:col-span-4 relative"
          >
            {/* Glow behind trophy */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 70%, rgba(212,175,55,0.2) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />

            <div className="relative z-10" style={{ maxWidth: 320, margin: "0 auto" }}>
              <Image
                src="/trophy-stadium.jpg"
                alt="FIFA World Cup Trophy in a stadium"
                width={320}
                height={463}
                className="w-full h-auto object-contain"
                style={{
                  filter:
                    "drop-shadow(0 0 40px rgba(212, 175, 55, 0.35)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
                  maskImage:
                    "linear-gradient(to bottom, black 60%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 60%, transparent 100%)",
                }}
                priority
              />
            </div>
          </motion.div>

          {/* ── RIGHT: Countdown card ── */}
          <div className="lg:col-span-3">
            <CountdownCard target={target} matchLabel={matchLabel} />
          </div>
        </div>

        {/* Mobile trophy — shown below CTAs on small screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="lg:hidden mt-8 flex justify-center"
        >
          <div className="relative w-48">
            <Image
              src="/trophy-stadium.jpg"
              alt="FIFA World Cup Trophy"
              width={200}
              height={290}
              className="w-full h-auto"
              style={{
                filter: "drop-shadow(0 0 24px rgba(212, 175, 55, 0.3))",
                maskImage:
                  "linear-gradient(to bottom, black 55%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 55%, transparent 100%)",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
