"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { CountryCode } from "@/lib/types";

interface ThemeContextValue {
  country: CountryCode | null;
  setCountry: (code: CountryCode | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Brand defaults — 2026 World Cup official palette.
// Hermes Blue (#2A398D) as default, Torch Red (#E61D25) as gradient end.
const BRAND_ACCENT = "42 57 141";       // Hermes Blue
const BRAND_ACCENT_GLOW = "100 120 210"; // lighter blue for glow

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<CountryCode | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (country === null) {
      root.style.setProperty("--accent", BRAND_ACCENT);
      root.style.setProperty("--accent-glow", BRAND_ACCENT_GLOW);
    } else {
      const theme = COUNTRIES[country].theme;
      root.style.setProperty("--accent", theme.accent);
      root.style.setProperty("--accent-glow", theme.accentGlow);
    }
  }, [country]);

  return (
    <ThemeContext.Provider value={{ country, setCountry }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}