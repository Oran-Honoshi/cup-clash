"use client";

import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/countries";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { CountryCode } from "@/lib/types";

interface CountrySelectorProps {
  value: CountryCode | null;
  onChange: (code: CountryCode) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [search, setSearch] = useState("");
  const { setCountry } = useTheme();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.code ?? c.flagCode).toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (code: CountryCode) => {
    onChange(code);
    setCountry(code); // also updates the global theme
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500"
        />
        <input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white",
            "bg-white/[0.06] border border-white/[0.12]",
            "placeholder:text-pitch-500",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            "transition-all duration-150"
          )}
        />
      </div>

      {/* Flag grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-white/10"
      >
        {filtered.map((c) => {
          const active = (c.code ?? c.flagCode) === value;
          return (
            <button
              key={c.code ?? c.flagCode}
              type="button"
              onClick={() => handleSelect((c.code ?? c.flagCode) as string)}
              title={c.name}
              className={cn(
                "relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150",
                active
                  ? "bg-white/[0.10] -translate-y-0.5"
                  : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06]"
              )}
              style={
                active
                  ? {
                      borderColor: "rgb(var(--accent) / 0.6)",
                      boxShadow: "0 0 12px rgb(var(--accent) / 0.3)",
                    }
                  : undefined
              }
            >
              <FlagBadge code={c.flagCode} label={c.name} size="sm" />
              <span
                className={cn(
                  "text-[9px] font-bold tracking-wider leading-none",
                  active ? "text-white" : "text-pitch-500"
                )}
              >
                {c.code ?? c.flagCode}
              </span>
              {active && (
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-pitch-950"
                  style={{ backgroundColor: "rgb(var(--accent))" }}
                >
                  <Check size={9} color="white" />
                </span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-4 sm:col-span-5 py-6 text-center text-pitch-500 text-sm">
            No countries found
          </div>
        )}
      </div>

      {/* Selected country name */}
      {value && (
        <div
          className="text-center text-sm font-bold uppercase tracking-widest"
          style={{ color: "rgb(var(--accent-glow))" }}
        >
          {ALL_COUNTRIES.find((c) => (c.code ?? c.flagCode) === value)?.name}
        </div>
      )}
    </div>
  );
}