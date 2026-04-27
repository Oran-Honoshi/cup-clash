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
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

        {/* ── DESKTOP: Side-by-side layout ── */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">

          {/* Left: Copy */}
          <div className="relative z-10">
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
              style={{ fontSize: "clamp(52px, 5.5vw, 88px)" }}
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
              <span className="opacity-30">·</span>
              <span>No credit card</span>
              <span className="opacity-30">·</span>
              <span>48 teams · 104 matches</span>
            </motion.div>
          </div>

          {/* Right: Trophy + Countdown stacked */}
          <div className="flex flex-col items-center gap-8">
            {/* Trophy photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative w-full max-w-xs xl:max-w-sm mx-auto"
            >
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 40% at 50% 80%, rgba(212,175,55,0.25) 0%, transparent 70%)",
                }}
              />
              <Image
                src="/trophy-stadium.jpg"
                alt="FIFA World Cup Trophy"
                width={400}
                height={580}
                className="w-full h-auto relative z-10"
                style={{
                  filter:
                    "drop-shadow(0 0 40px rgba(212, 175, 55, 0.4)) drop-shadow(0 20px 50px rgba(0,0,0,0.7))",
                  maskImage:
                    "linear-gradient(to bottom, black 55%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 55%, transparent 100%)",
                  maxHeight: 340,
                  objectFit: "cover",
                  objectPosition: "top",
                }}
                priority
              />
            </motion.div>

            {/* Countdown — gets full width of the right column */}
            <div className="w-full">
              <CountdownCard target={target} matchLabel={matchLabel} />
            </div>
          </div>
        </div>

        {/* ── MOBILE: Stacked layout ── */}
        <div className="lg:hidden space-y-8">
          {/* Copy */}
          <div>
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
              className="font-display uppercase text-white leading-[0.88] tracking-tight text-[clamp(44px,12vw,72px)]"
            >
              Predict every match.
              <br />
              <span className="gradient-text">Beat your friends.</span>
            </motion.h1>

            <p className="mt-4 text-base text-pitch-300 leading-relaxed">
              Private prediction leagues for your group chat, office, or family.
            </p>

            {/* Host nations — mobile */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-pitch-500">Hosted by</span>
              {HOST_NATIONS.map((code) => {
                const c = COUNTRIES[code];
                return (
                  <div key={code} className="flex items-center gap-1 glass rounded-lg px-2 py-1">
                    <div className="relative w-4 h-3 rounded-sm overflow-hidden">
                      <Image src={flagUrl(c.flagCode, 20)} alt={c.name} fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-[10px] font-bold text-pitch-200 uppercase">{c.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="md" rightIcon={<ArrowRight size={16} />}>Start a group — free</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="md" variant="outline">Preview app</Button>
              </Link>
            </div>
          </div>

          {/* Countdown — full width on mobile, no squishing */}
          <CountdownCard target={target} matchLabel={matchLabel} />

          {/* Trophy — small, below countdown on mobile */}
          <div className="flex justify-center">
            <div className="relative w-40">
              <Image
                src="/trophy-stadium.jpg"
                alt="FIFA World Cup Trophy"
                width={160}
                height={232}
                className="w-full h-auto"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))",
                  maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
