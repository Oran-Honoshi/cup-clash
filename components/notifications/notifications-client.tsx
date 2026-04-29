"use client";

import { useState } from "react";
import { Bell, Trophy, Target, Users, Zap, Check, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type NotifType = "match_result" | "prediction_locked" | "member_joined" | "trivia_open" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  groupName?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "match_result", read: false,
    title: "Match result: Israel 1–2 France",
    body: "Amit got an exact score! +25 pts. You got the correct outcome. +10 pts.",
    createdAt: new Date(Date.now() - 1000 * 60 * 32),
    groupName: "Tech Titans World Cup",
  },
  {
    id: "n2", type: "prediction_locked", read: false,
    title: "Predictions locked: USA vs Panama",
    body: "Your score prediction (3–0) has been locked in. Kickoff in 5 minutes!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    groupName: "Tech Titans World Cup",
  },
  {
    id: "n3", type: "member_joined", read: true,
    title: "Sarah joined your group",
    body: "Sarah accepted the invite to Tech Titans World Cup. You now have 3 members.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    groupName: "Tech Titans World Cup",
  },
  {
    id: "n4", type: "trivia_open", read: true,
    title: "Trivia is now open! 🧠",
    body: "Your admin has opened the trivia challenge. Answer 20 questions to earn up to 20 bonus points.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    groupName: "Tech Titans World Cup",
  },
  {
    id: "n5", type: "system", read: true,
    title: "Welcome to Cup Clash!",
    body: "Your group is set up. Share the invite link with your friends to get started.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

const TYPE_CONFIG: Record<NotifType, { icon: typeof Bell; color: string; bg: string }> = {
  match_result:       { icon: Trophy,  color: "#D4AF37", bg: "rgba(212,175,55,0.1)"     },
  prediction_locked:  { icon: Target,  color: "#6EE7B7", bg: "rgba(110,231,183,0.08)"  },
  member_joined:      { icon: Users,   color: "rgb(var(--accent-glow))", bg: "rgb(var(--accent)/0.08)" },
  trivia_open:        { icon: Zap,     color: "#F59E0B", bg: "rgba(245,158,11,0.08)"   },
  system:             { icon: Bell,    color: "#64748B", bg: "rgba(100,116,139,0.06)"  },
};

export function NotificationsClient() {
  const [notifs, setNotifs] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifs.filter(n => !n.read).length;
  const displayed   = filter === "unread" ? notifs.filter(n => !n.read) : notifs;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="space-y-4">
      {/* Filter + actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 glass rounded-xl p-1">
          {(["all", "unread"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                filter === f ? "bg-white/10 text-white" : "text-pitch-500 hover:text-pitch-300")}>
              {f === "all" ? "All" : `Unread ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-xs text-pitch-500 hover:text-white transition-colors uppercase tracking-widest">
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      {displayed.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <Bell size={32} className="text-pitch-600 mx-auto mb-3" />
          <p className="text-pitch-400 text-sm">No {filter === "unread" ? "unread " : ""}notifications</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayed.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type];
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/[0.02]",
                  n.read ? "border-white/[0.06] opacity-70" : "border-white/[0.10]"
                )}
                style={!n.read ? { backgroundColor: cfg.bg } : undefined}
              >
                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: cfg.color }} />
                )}

                {/* Icon */}
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cfg.bg }}>
                  <cfg.icon size={18} style={{ color: cfg.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-sm text-white">{n.title}</div>
                    <div className="text-[10px] text-pitch-600 shrink-0">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-xs text-pitch-400 mt-0.5 leading-relaxed">{n.body}</div>
                  {n.groupName && (
                    <div className="text-[10px] text-pitch-600 mt-1 uppercase tracking-wider">{n.groupName}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Push notification placeholder */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <Settings size={16} className="text-pitch-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">Push notifications</div>
            <div className="text-xs text-pitch-500">
              Install Cup Clash as an app on your phone to get push notifications for match results, prediction reminders, and leaderboard updates.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
