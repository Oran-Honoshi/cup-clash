"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { LOCALES, TRANSLATIONS, detectLocale, type Locale, type Translations } from "@/lib/i18n";

interface LocaleContextValue {
  locale:    Locale;
  setLocale: (l: Locale) => void;
  t:         (key: keyof Translations) => string;
  dir:       "ltr" | "rtl";
  isRTL:     boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    applyToDOM(detected);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("cupclash_locale", l); } catch {}
    // Also set a cookie so server components can read the locale
    document.cookie = `cupclash_locale=${l};path=/;max-age=31536000;samesite=lax`;
    applyToDOM(l);
  };

  const t = (key: keyof Translations): string =>
    TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  const dir   = LOCALES[locale].dir;
  const isRTL = dir === "rtl";

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

function applyToDOM(locale: Locale) {
  const dir  = LOCALES[locale].dir;
  const html = document.documentElement;
  html.setAttribute("lang", locale);
  html.setAttribute("dir",  dir);
}
