"use client";

import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ALL_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

export function CountryPickerSection() {
  const { country, setCountry } = useTheme();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 mb-4 label-caps">
              <Palette size={14} />
              Personalization
            </div>
            <h2 className="h-display text-3xl sm:text-5xl text-ink-900">
              Your team,
              <br />
              <span className="gradient-text-accent">your colors.</span>
            </h2>
            <p className="mt-5 text-lg text-ink-500 max-w-md">
              Pick your country and the whole app re-skins around it. Try it —
              click any flag and watch every accent on this page shift in real
              time.
            </p>
            {country && (
              <button
                onClick={() => setCountry(null)}
                className="mt-5 text-sm font-semibold text-ink-500 hover:text-ink-900 transition-colors"
              >
                ← Reset to default
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
                      "border bg-white",
                      active
                        ? "border-accent shadow-cta -translate-y-0.5"
                        : "border-ink-100 hover:border-ink-300 hover:-translate-y-0.5 hover:shadow-card"
                    )}
                  >
                    <span className="text-2xl leading-none" aria-hidden>
                      {c.flag}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[11px] font-bold tracking-wider",
                        active ? "text-accent" : "text-ink-500"
                      )}
                    >
                      {c.code}
                    </span>
                    {active && (
                      <span
                        className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full ring-2 ring-white"
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
