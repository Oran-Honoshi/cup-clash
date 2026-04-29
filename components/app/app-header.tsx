"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// In production: fetch unread count from Supabase
// For now: mock unread count from localStorage
function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Count notifications not marked as read
    const MOCK_TOTAL = 2; // matches mock notifications in notifications-client
    const readIds = JSON.parse(localStorage.getItem("cupclash_read_notifs") ?? "[]") as string[];
    setCount(Math.max(0, MOCK_TOTAL - readIds.length));
  }, []);

  return count;
}

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const unread = useUnreadCount();

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b glass-strong"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      {/* Logo / title */}
      <div className="font-display text-lg uppercase text-white tracking-tight">
        {title ?? "Cup Clash"}
      </div>

      {/* Notification bell */}
      <Link href="/notifications" className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/[0.06] transition-colors">
        <Bell size={18} className="text-pitch-400" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#E61D25" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}
