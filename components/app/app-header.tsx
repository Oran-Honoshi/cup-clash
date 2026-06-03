"use client";

import Link from "next/link";
import { Bell, LogOut, Globe, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);

  // Need mounted flag so createPortal only runs client-side
  useEffect(() => { setMounted(true); }, []);

  const sheet = open && (
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex: 9999, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}>
      <div
        className="flex flex-col rounded-t-3xl"
        style={{
          background: "rgba(10,8,24,0.98)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
          maxHeight: "72dvh",
          // Always LTR — language list should read L→R regardless of app locale
          direction: "ltr",
        }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <span className="font-display text-lg uppercase font-black text-white">Language</span>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable options — takes remaining height */}
        <div className="overflow-y-auto flex-1">
          {LOCALE_KEYS.map(l => {
            const active = l === locale;
            return (
              <button
                key={l}
                onClick={() => { setLocale(l as Locale); setOpen(false); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                style={{
                  background: active ? "rgba(0,212,255,0.1)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  minHeight: 56,
                }}>
                <span className="text-2xl leading-none shrink-0">{LOCALES[l].flag}</span>
                <span className="font-bold text-base" style={{ color: active ? "#00D4FF" : "#ffffff" }}>
                  {LOCALES[l].nativeName}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {LOCALES[l].name}
                </span>
                {(l === "he" || l === "ar") && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                    RTL
                  </span>
                )}
                {active && (
                  <span className="ms-auto shrink-0">
                    <Check size={16} style={{ color: "#00D4FF" }} />
                  </span>
                )}
              </button>
            );
          })}
          {/* Bottom safe-area padding */}
          <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 w-9 flex items-center justify-center rounded-xl transition-all"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        aria-label="Change language">
        <Globe size={16} style={{ color: "rgba(255,255,255,0.7)" }} />
      </button>

      {/* Portal to <body> — escapes header's z-index stacking context */}
      {mounted && sheet && createPortal(sheet, document.body)}
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
