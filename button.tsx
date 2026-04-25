"use client";

import { motion } from "framer-motion";
import { Palette, RotateCcw } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ALL_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

export function CountryPickerSection() {
  const { country, setCountry } = useTheme();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <div className="label-caps inline-flex items-center gap-2 mb-4">
              <Palette size={13} />
              Personalization
            </div>
            <h2 className="font-display text-4xl sm:text-6xl uppercase text-white leading-[0.95] tracking-tight">
              Your team,
              <br />
              <span className="gradient-text-accent">your colors.</span>
            </h2>
            <p className="mt-6 text-lg text-pitch-300 max-w-md">
              Pick your country and the whole app re-skins around it. Try it —
              click any flag and watch every accent on this page shift in real
              time.
            </p>
            {country && (
              <button
                onClick={() => setCountry(null)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-pitch-300 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
                Reset to default
              </button>
            )}
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-3 sm:grid-cols-4 gap-2.5"
            >
              {ALL_COUNTRIES.map((c) => {
                const active = c.code === country;
                return (
                  <button
                    key={c.code}
                    onClick={() => setCountry(active ? null : c.code)}
                    aria-pressed={active}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200",
                      "border backdrop-blur-md",
                      active
                        ? "bg-white/[0.06] -translate-y-0.5"
                        : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:-translate-y-0.5"
                    )}
                    style={
                      active
                        ? {
                            borderColor: "rgb(var(--accent) / 0.5)",
                            boxShadow:
                              "0 0 0 1px rgb(var(--accent) / 0.3), 0 8px 24px rgb(var(--accent) / 0.25)",
                          }
                        : undefined
                    }
                  >
                    <span className="text-3xl leading-none" aria-hidden>
                      {c.flag}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[11px] font-bold tracking-widest",
                        active ? "text-white" : "text-pitch-400"
                      )}
                      style={active ? { color: "rgb(var(--accent-glow))" } : undefined}
                    >
                      {c.code}
                    </span>
                    {active && (
                      <span
                        className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full ring-2 ring-pitch-950"
                        style={{ backgroundColor: "rgb(var(--accent))" }}
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
