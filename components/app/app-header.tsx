"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";

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

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(0,212,255,0.15)",
        boxShadow: "0 2px 12px rgba(0,212,255,0.06)",
      }}>
      <div className="font-display text-lg uppercase font-bold" style={{ color: "#0B141B" }}>
        {title ?? "Cup Clash"}
      </div>
      <Link href="/notifications"
        className="relative h-9 w-9 flex items-center justify-center rounded-xl transition-colors hover:bg-slate-100">
        <Bell size={18} style={{ color: "#64748b" }} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#dc2626" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}
