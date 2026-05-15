"use client";

import { Star, ExternalLink } from "lucide-react";

interface ReviewButtonProps {
  variant?: "trustpilot" | "google";
  context?: "post-payment" | "post-prediction" | "post-group" | "landing";
  className?: string;
}

// Replace with your actual Trustpilot review URL once account is set up
const TRUSTPILOT_URL = "https://www.trustpilot.com/review/cupclash.live";

export function ReviewButton({ variant = "trustpilot", context = "landing", className }: ReviewButtonProps) {
  const messages: Record<string, string> = {
    "post-payment":    "Enjoying Cup Clash? Leave us a quick review ⭐",
    "post-prediction": "Nice predictions! Help others find Cup Clash — rate us.",
    "post-group":      "Group created! Share the love — rate Cup Clash.",
    "landing":         "Rate us on Trustpilot",
  };

  return (
    <a
      href={TRUSTPILOT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${className ?? ""}`}
      style={{ background: "#00B67A", color: "white", textDecoration: "none" }}>
      <Star size={14} fill="white" />
      {messages[context]}
      <ExternalLink size={12} style={{ opacity: 0.7 }} />
    </a>
  );
}

// Inline banner — shown after key actions
export function ReviewBanner({ context }: { context: "post-payment" | "post-prediction" | "post-group" }) {
  const titles: Record<string, string> = {
    "post-payment":    "You're in! 🎉",
    "post-prediction": "Predictions saved! 🎯",
    "post-group":      "Group created! 🏆",
  };
  const subs: Record<string, string> = {
    "post-payment":    "Welcome to the group. Enjoying the app so far?",
    "post-prediction": "Nice picks. Think others would enjoy Cup Clash?",
    "post-group":      "Your group is live. Share the love?",
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl flex-wrap"
      style={{ background: "rgba(0,182,122,0.06)", border: "1px solid rgba(0,182,122,0.2)" }}>
      <div>
        <div className="font-bold text-sm" style={{ color: "#0F172A" }}>{titles[context]}</div>
        <div className="text-xs" style={{ color: "#64748b" }}>{subs[context]}</div>
      </div>
      <ReviewButton context={context} />
    </div>
  );
}