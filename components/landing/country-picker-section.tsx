"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALL_COUNTRIES, flagUrl } from "@/lib/countries";
import { useTheme } from "@/components/theme-provider";
import type { CountryCode } from "@/lib/types";

export function CountryPickerSection() {
  const { setCountry } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handlePick = (code: CountryCode, name: string) => {
    setSelected(name);
    setCountry(code);
  };

  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="label-caps mb-3">Pick your team</div>
          <h2 className="font-display text-4xl sm:text-5xl uppercase text-white">
            Your flag.<br />
            <span style={{ color: "#10b981" }}>Your colors.</span>
          </h2>
          <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "#94a3b8" }}>
            Select your team below — the entire app theme changes to match your nation's colors.
            {selected && (
              <span className="font-bold text-white"> You picked {selected}! </span>
            )}
          </p>
        </motion.div>

        {/* Flag grid */}
        <div className="grid grid-cols-8 sm:grid-cols-12 lg:grid-cols-16 gap-1.5 mb-10">
          {ALL_COUNTRIES.slice(0, 48).map((c) => {
            const active = selected === c.name;
            return (
              <motion.button
                key={c.code}
                whileHover={{ scale: 1.15, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePick(c.code, c.name)}
                title={c.name}
                className="relative flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all"
                style={active ? {
                  borderColor: "rgba(16,185,129,0.5)",
                  background: "rgba(16,185,129,0.1)",
                  boxShadow: "0 0 12px rgba(16,185,129,0.3)",
                } : {
                  borderColor: "rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="relative w-8 h-5 rounded-sm overflow-hidden">
                  <Image
                    src={flagUrl(c.flagCode, 40)}
                    alt={c.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-[8px] font-bold"
                  style={{ color: active ? "#10b981" : "#475569" }}>
                  {c.code}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* CTA after picking */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
              Nice! Your theme is now set to{" "}
              <strong className="text-white">{selected}</strong>. Sign up to keep it.
            </p>
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-white transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
                Create your group <ArrowRight size={16} />
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
