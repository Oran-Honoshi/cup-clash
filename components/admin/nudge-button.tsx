"use client";

import { MessageCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NudgeButtonProps {
  memberName: string;
  memberPhone?: string | null;
  matchLabel: string;   // e.g. "Brazil vs France — Jun 15, 20:00 UTC"
  groupName: string;
  minutesToKickoff: number;
  hasPredicted: boolean;
  size?: "sm" | "md";
}

export function NudgeButton({
  memberName,
  memberPhone,
  matchLabel,
  groupName,
  minutesToKickoff,
  hasPredicted,
  size = "sm",
}: NudgeButtonProps) {
  if (hasPredicted) {
    return (
      <span className="text-[10px] font-bold text-success uppercase tracking-widest flex items-center gap-1">
        ✓ Predicted
      </span>
    );
  }

  const urgency = minutesToKickoff <= 30 ? "🚨 URGENT" : minutesToKickoff <= 60 ? "⏱ Heads up" : "👋 Reminder";
  const timeLeft = minutesToKickoff <= 60
    ? `${minutesToKickoff} minutes`
    : `${Math.round(minutesToKickoff / 60)} hours`;

  const whatsappText = encodeURIComponent(
    `${urgency} ${memberName}!\n\n` +
    `You haven't predicted the score for *${matchLabel}* yet.\n\n` +
    `Predictions lock in *${timeLeft}* — don't miss out on points!\n\n` +
    `👉 Open Cup Clash now: ${typeof window !== "undefined" ? window.location.origin : "https://cupclash.com"}/predictions\n\n` +
    `— Your ${groupName} admin`
  );

  const handleNudge = () => {
    const phone = memberPhone?.replace(/\D/g, "") ?? "";
    const url = phone
      ? `https://wa.me/${phone}?text=${whatsappText}`
      : `https://wa.me/?text=${whatsappText}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleNudge(); }}
      className={cn(
        "flex items-center gap-1.5 font-bold uppercase tracking-widest rounded-lg border transition-all hover:opacity-80",
        size === "sm" ? "text-[9px] px-2 py-1" : "text-xs px-3 py-1.5",
        "text-pitch-400 border-white/10 bg-white/[0.04] hover:border-white/20 hover:text-white"
      )}
      title={`Send WhatsApp nudge to ${memberName}`}
    >
      <MessageCircle size={size === "sm" ? 10 : 12} />
      Nudge
    </button>
  );
}

// In-app nudge bell (no WhatsApp — just marks for in-app notification)
export function InAppNudgeButton({
  memberName,
  onNudge,
}: {
  memberName: string;
  onNudge: (name: string) => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onNudge(memberName); }}
      className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-pitch-500 hover:text-warning transition-colors"
      title={`Send in-app nudge to ${memberName}`}
    >
      <Bell size={10} />
      Ping
    </button>
  );
}