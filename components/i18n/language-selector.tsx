"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_KEYS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-bold transition-all"
        style={{ color: "rgba(255,255,255,0.55)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <Globe size={16} strokeWidth={1.75} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/flags/${LOCALES[locale].flagCode}.svg`} alt="" aria-hidden="true" width={20} height={14} className="rounded-sm object-cover shrink-0" style={{ aspectRatio: "3/2" }} />
        <span>{LOCALES[locale].nativeName}</span>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1 rounded-2xl overflow-hidden z-50"
          style={{
            background: "rgba(10,8,24,0.98)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
          }}>
          {LOCALE_KEYS.map(l => (
            <button
              key={l}
              onClick={() => { setLocale(l as Locale); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-all text-left"
              style={{
                color: locale === l ? "#00D4FF" : "rgba(255,255,255,0.65)",
                background: locale === l ? "rgba(0,212,255,0.08)" : "transparent",
                direction: "ltr",
              }}
              onMouseEnter={e => { if (locale !== l) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (locale !== l) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/flags/${LOCALES[l].flagCode}.svg`} alt="" aria-hidden="true" width={20} height={14} className="rounded-sm object-cover shrink-0" style={{ aspectRatio: "3/2" }} />
              <span>{LOCALES[l].nativeName}</span>
              {l === "he" || l === "ar" ? <span className="ms-auto text-[10px] opacity-50">RTL</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
