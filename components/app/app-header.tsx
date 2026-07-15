"use client";

import Link from "next/link";
import { Bell, LogOut, Globe, X, Check, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { LOCALES, LOCALE_KEYS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { UserAvatar } from "@/components/ui/UserAvatar";

function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const readIds = JSON.parse(localStorage.getItem("cupclash_read_notifs") ?? "[]") as string[];
    setCount(Math.max(0, 2 - readIds.length));
  }, []);
  return count;
}

interface HeaderProfile {
  name:       string;
  avatar_url: string | null;
}

// Signed-in state drives which entry point (avatar → Settings, or generic
// icon → sign in) shows in the top-right corner, consistently across zones.
function useHeaderProfile() {
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setAuthLoaded(true); return; }
      const { data } = await sb
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as HeaderProfile);
      setAuthLoaded(true);
    })();
  }, []);

  return { profile, authLoaded };
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
          background: "var(--nv)",
          border: "1px solid var(--br)",
          boxShadow: "0 -8px 40px var(--shad)",
          maxHeight: "72dvh",
          // Always LTR — language list should read L→R regardless of app locale
          direction: "ltr",
        }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--dv)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b"
          style={{ borderColor: "var(--dv)" }}>
          <span className="font-display text-lg uppercase font-black" style={{ color: "var(--tx)" }}>Language</span>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-xl"
            style={{ background: "var(--ip)", color: "var(--mt)" }}>
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
                  background: active ? "color-mix(in srgb, var(--ac) 10%, transparent)" : "transparent",
                  borderBottom: "1px solid var(--dv)",
                  minHeight: 56,
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/flags/${LOCALES[l].flagCode}.svg`} alt="" aria-hidden="true" width={28} height={20} className="shrink-0 rounded-sm object-cover" style={{ aspectRatio: "3/2" }} />
                <span className="font-bold text-base" style={{ color: active ? "var(--ac)" : "var(--tx)" }}>
                  {LOCALES[l].nativeName}
                </span>
                <span className="text-xs" style={{ color: "var(--mt)" }}>
                  {LOCALES[l].name}
                </span>
                {(l === "he" || l === "ar") && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: "var(--ip)", color: "var(--mt)" }}>
                    RTL
                  </span>
                )}
                {active && (
                  <span className="ms-auto shrink-0">
                    <Check size={16} style={{ color: "var(--ac)" }} />
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
        className="flex items-center justify-center transition-all"
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: "var(--ip)",
          border: "1px solid var(--br)",
        }}
        aria-label="Change language">
        <Globe size={16} style={{ color: "var(--t2)" }} />
      </button>

      {/* Portal to <body> — escapes header's z-index stacking context */}
      {mounted && sheet && createPortal(sheet, document.body)}
    </>
  );
}

export function AppHeader({ title }: { title?: string }) {
  const unread = useUnreadCount();
  const { profile, authLoaded } = useHeaderProfile();

  const handleSignOut = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    window.location.replace("/signin");
  };

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 border-b"
      style={{
        background: "var(--nv)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "var(--br)",
        boxShadow: "0 2px 16px var(--shad)",
        paddingTop: "calc(12px + env(safe-area-inset-top))",
        paddingBottom: "12px",
        height: "calc(52px + env(safe-area-inset-top))",
      }}
    >
      <div className="app-title">
        {title ?? "Cup Clash"}
      </div>
      <div className="flex items-center gap-2">
        <MobileLanguagePicker />
        <Link
          href="/settings?tab=notifications"
          className="relative flex items-center justify-center transition-all"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: "var(--ip)",
            border: "1px solid var(--br)",
          }}
        >
          <Bell size={16} style={{ color: "var(--t2)" }} />
          {unread > 0 && (
            <span
              className="absolute flex items-center justify-center font-mono font-bold text-white"
              style={{
                top: -3,
                right: -3,
                width: 14,
                height: 14,
                borderRadius: 7,
                background: "#e53e3e",
                fontSize: 8,
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        {authLoaded && profile ? (
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex items-center justify-center transition-all"
            style={{ width: 32, height: 32, borderRadius: 16 }}
          >
            <UserAvatar name={profile.name} avatarUrl={profile.avatar_url} size="sm" />
          </Link>
        ) : authLoaded ? (
          <Link
            href="/signup?next=/settings"
            aria-label="Sign in"
            className="flex items-center justify-center transition-all"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: "var(--ip)",
              border: "1px solid var(--br)",
            }}
          >
            <UserCircle size={16} style={{ color: "var(--t2)" }} />
          </Link>
        ) : null}
        {authLoaded && profile && (
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center transition-all"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: "var(--ip)",
              border: "1px solid var(--br)",
            }}
            aria-label="Sign out"
          >
            <LogOut size={14} style={{ color: "#f87171" }} />
          </button>
        )}
      </div>
    </header>
  );
}
