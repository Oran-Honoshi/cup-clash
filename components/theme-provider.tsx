"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
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

// Read persisted values synchronously during initial state creation (React
// lazy useState initializer) rather than in a post-mount effect. Loading
// them in a separate effect meant the "apply + persist" effect below fired
// once already, with the stale default, before the load effect's state
// update landed — that first write clobbered a saved theme back to "a" in
// localStorage (and briefly flashed the default before snapping over).
function getInitialCountry(): CountryCode | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
    if (saved && COUNTRIES[saved]) return saved;
  } catch {}
  return null;
}

function getInitialAppTheme(): AppTheme {
  if (typeof window === "undefined") return "a";
  try {
    const saved = localStorage.getItem(APP_THEME_STORAGE_KEY) as AppTheme | null;
    if (saved && VALID_APP_THEMES.includes(saved)) return saved;
  } catch {}
  return "a";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState]   = useState<CountryCode | null>(getInitialCountry);
  const [appTheme, setAppThemeState] = useState<AppTheme>(getInitialAppTheme);

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

  // Stable identities — callers (e.g. Profile page's load effect) depend on
  // these in a useEffect deps array; a fresh function reference every render
  // would re-fire that effect on every theme change and refetch the stale
  // pre-write value from Supabase, snapping the theme back.
  const setCountry = useCallback((code: CountryCode | null) => {
    setCountryState(code);
    if (!code) { try { localStorage.removeItem(STORAGE_KEY); } catch {} }
  }, []);

  const setAppTheme = useCallback((theme: AppTheme) => {
    if (VALID_APP_THEMES.includes(theme)) setAppThemeState(theme);
  }, []);

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