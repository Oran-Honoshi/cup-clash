"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { CountryCode } from "@/lib/types";

interface ThemeContextValue {
  country: CountryCode | null;
  setCountry: (code: CountryCode | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Default: Theme A "Stadium Night" accent green (--ac) + Electric Cyan
const BRAND_ACCENT      = "0 207 128";    // #00CF80 (Theme A --ac)
const BRAND_ACCENT_GLOW = "0 212 255";    // #00D4FF

const STORAGE_KEY = "cupclash_country";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode | null>(null);

  // Load persisted country on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
      if (saved && COUNTRIES[saved]) setCountryState(saved);
    } catch {}
  }, []);

  // Apply CSS vars + persist whenever country changes
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
      try { localStorage.setItem(STORAGE_KEY, country); } catch {}
    }
  }, [country]);

  const setCountry = (code: CountryCode | null) => {
    setCountryState(code);
    if (!code) { try { localStorage.removeItem(STORAGE_KEY); } catch {} }
  };

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