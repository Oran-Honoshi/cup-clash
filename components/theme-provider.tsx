"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { CountryCode } from "@/lib/types";

interface ThemeContextValue {
  country: CountryCode | null;
  setCountry: (code: CountryCode | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Default: Neon Mint + Electric Cyan
const BRAND_ACCENT      = "0 255 136";    // #00FF88
const BRAND_ACCENT_GLOW = "0 212 255";    // #00D4FF

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<CountryCode | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (country === null) {
      root.style.setProperty("--accent",      BRAND_ACCENT);
      root.style.setProperty("--accent-glow", BRAND_ACCENT_GLOW);
    } else {
      const theme = COUNTRIES[country]?.theme;
      if (theme) {
        root.style.setProperty("--accent",      theme.accent);
        root.style.setProperty("--accent-glow", theme.accentGlow);
      }
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