"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { CountryCode } from "@/lib/types";

interface ThemeContextValue {
  /** null = use brand default; CountryCode = country accent active */
  country: CountryCode | null;
  setCountry: (code: CountryCode | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Brand defaults — used when no country is selected.
// These match --brand and --brand-2 in globals.css.
const BRAND_ACCENT = "99 102 241";       // indigo-500
const BRAND_ACCENT_GLOW = "165 180 252"; // indigo-300

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
