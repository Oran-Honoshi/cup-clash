"use client";

import Link from "next/link";
import { Bell, LogOut, Globe, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { LOCALES, LOCALE_KEYS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";

function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const readIds = JSON.parse(localStorage.getItem("cupclash_read_notifs") ?? "[]") as string[];
    setCount(Math.max(0, 2 - readIds.length));
  }, []);
  return count;
}

function MobileLanguagePicker() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 w-9 flex items-center justify-center rounded-xl transition-all"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        aria-label="Change language">
        <Globe size={16} style={{ color: "rgba(255,255,255,0.7)" }} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}>
          <div
            className="rounded-t-3xl overflow-hidden"
            style={{ background: "rgba(10,8,24,0.98)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "70vh" }}
            onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="font-display text-lg uppercase font-black text-white">Language</span>
              <button onClick={() => setOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                <X size={16} />
              </button>
            </div>
            {/* Options */}
            <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
              {LOCALE_KEYS.map(l => {
                const active = l === locale;
                return (
                  <button
                    key={l}
                    onClick={() => { setLocale(l as Locale); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-all"
                    style={{
                      background: active ? "rgba(0,212,255,0.08)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      // Always LTR so flag+name reads left-to-right regardless of app language
                      direction: "ltr",
                    }}>
                    <span className="text-xl">{LOCALES[l].flag}</span>
                    <span className="font-bold text-sm" style={{ color: active ? "#00D4FF" : "rgba(255,255,255,0.7)" }}>
                      {LOCALES[l].nativeName}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {LOCALES[l].name}
                    </span>
                    {(l === "he" || l === "ar") && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>RTL</span>
                    )}
                    {active && <Check size={15} className="ms-auto shrink-0" style={{ color: "#00D4FF" }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AppHeader({ title }: { title?: string }) {
  const unread = useUnreadCount();

  const handleSignOut = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    window.location.replace("/signin");
  };

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: "rgba(8, 12, 22, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.07)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
      }}
    >
      <div className="font-display text-lg uppercase font-bold text-white">
        {title ?? "Cup Clash"}
      </div>
      <div className="flex items-center gap-2">
        <MobileLanguagePicker />
        <Link
          href="/notifications"
          className="relative h-9 w-9 flex items-center justify-center rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Bell size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
          {unread > 0 && (
            <span
              className="absolute top-1 right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "#dc2626", boxShadow: "0 0 8px rgba(220,38,38,0.5)" }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <button
          onClick={handleSignOut}
          className="h-9 w-9 flex items-center justify-center rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          aria-label="Sign out"
        >
          <LogOut size={16} style={{ color: "#f87171" }} />
        </button>
      </div>
    </header>
  );
}
