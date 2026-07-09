"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { CountryCode } from "@/lib/types";

// App-wide visual skin — separate axis from the per-country --accent tint
// above. Each theme owns structural tokens (bg/surface/nav/text/border/
// hero-card, set in app/globals.css under [data-theme="..."]); --accent/
// --accent-glow keep driving country-specific highlights on top, unchanged.
export type AppTheme = "a" | "b" | "c" | "d";
const VALID_APP_THEMES: AppTheme[] = ["a", "b", "c", "d"];

interface ThemeContextValue {
  country: CountryCode | null;
  setCountry: (code: CountryCode | null) => void;
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Default: Theme A "Stadium Night" accent green (--ac) + Electric Cyan
const BRAND_ACCENT      = "0 207 128";    // #00CF80 (Theme A --ac)
const BRAND_ACCENT_GLOW = "0 212 255";    // #00D4FF

const STORAGE_KEY      = "cupclash_country";
const APP_THEME_STORAGE_KEY = "cupclash_app_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState]   = useState<CountryCode | null>(null);
  const [appTheme, setAppThemeState] = useState<AppTheme>("a");

  // Load persisted country + app theme on mount (instant, pre-profile-fetch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
      if (saved && COUNTRIES[saved]) setCountryState(saved);
      const savedTheme = localStorage.getItem(APP_THEME_STORAGE_KEY) as AppTheme | null;
      if (savedTheme && VALID_APP_THEMES.includes(savedTheme)) setAppThemeState(savedTheme);
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

  // Apply data-theme attribute + persist whenever the app theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appTheme);
    try { localStorage.setItem(APP_THEME_STORAGE_KEY, appTheme); } catch {}
  }, [appTheme]);

  const setCountry = (code: CountryCode | null) => {
    setCountryState(code);
    if (!code) { try { localStorage.removeItem(STORAGE_KEY); } catch {} }
  };

  const setAppTheme = (theme: AppTheme) => {
    if (VALID_APP_THEMES.includes(theme)) setAppThemeState(theme);
  };

  return (
    <ThemeContext.Provider value={{ country, setCountry, appTheme, setAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}