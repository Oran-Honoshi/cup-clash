"use client";

import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const readIds = JSON.parse(localStorage.getItem("cupclash_read_notifs") ?? "[]") as string[];
    setCount(Math.max(0, 2 - readIds.length));
  }, []);
  return count;
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