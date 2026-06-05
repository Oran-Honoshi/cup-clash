"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X } from "lucide-react";

interface ShareGroupProps {
  groupName: string;
  adminName: string;
  passkey:   string;
  compact?:  boolean;
}

const FUNNY_MESSAGES = [
  (group: string, admin: string, passkey: string, url: string) =>
    `⚽ ${admin} dares you to join *${group}* on Cup Clash!\n\nThink you know football? Prove it. Join free and compete for the entire World Cup 2026. 🏆\n\nPasskey: *${passkey}*\nJoin here: ${url}\n\n(Losers buy the first round 😏)`,
  (group: string, admin: string, passkey: string, url: string) =>
    `🚨 URGENT: ${admin} has invited you to *${group}*\n\nThe World Cup starts June 11. You have no excuse not to join. Free entry. One tournament. Eternal bragging rights.\n\nCode: *${passkey}*\n${url}`,
  (group: string, admin: string, passkey: string, url: string) =>
    `Hey! ${admin} here — I set up *${group}* on Cup Clash for World Cup 2026 🌍\n\nJoin free and predict all 104 matches for the whole tournament.\n\nPasskey: *${passkey}*\nLink: ${url}`,
];

export function ShareGroup({ groupName, adminName, passkey, compact = false }: ShareGroupProps) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : "https://cupclash.live"}/join/${passkey}`;
  const message = FUNNY_MESSAGES[msgIdx % FUNNY_MESSAGES.length](groupName, adminName, passkey, joinUrl);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on Cup Clash`,
          text:  message,
          url:   joinUrl,
        });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    setOpen(true);
  };

  const SHARE_OPTIONS = [
    {
      key:   "whatsapp",
      label: "WhatsApp",
      color: "#25D366",
      bg:    "#dcfce7",
      href:  `https://wa.me/?text=${encodeURIComponent(message)}`,
      emoji: "💬",
    },
    {
      key:   "telegram",
      label: "Telegram",
      color: "#0088cc",
      bg:    "#dbeafe",
      href:  `https://t.me/share/url?url=${encodeURIComponent(joinUrl)}&text=${encodeURIComponent(message)}`,
      emoji: "✈️",
    },
    {
      key:   "email",
      label: "Email",
      color: "#0891B2",
      bg:    "#cffafe",
      href:  `mailto:?subject=${encodeURIComponent(`Join ${groupName} on Cup Clash — World Cup 2026`)}&body=${encodeURIComponent(message)}`,
      emoji: "📧",
    },
    {
      key:   "slack",
      label: "Slack",
      color: "#4A154B",
      bg:    "#f3e8ff",
      href:  `https://slack.com/share?text=${encodeURIComponent(message)}`,
      emoji: "💼",
    },
    {
      key:   "sms",
      label: "SMS",
      color: "#059669",
      bg:    "#d1fae5",
      href:  `sms:?body=${encodeURIComponent(message)}`,
      emoji: "📱",
    },
    {
      key:   "twitter",
      label: "X / Twitter",
      color: "#000000",
      bg:    "#f1f5f9",
      href:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join my World Cup 2026 prediction group "${groupName}" on Cup Clash! $2 for the whole tournament 🏆\n\nCode: ${passkey}\n${joinUrl}`)}`,
      emoji: "🐦",
    },
  ];

  return (
    <>
      <button onClick={nativeShare}
        className="flex items-center gap-2 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
        style={compact ? {
          padding: "8px 12px",
          border: "1px solid rgba(0,212,255,0.2)",
          color: "#0891B2",
          background: "rgba(0,212,255,0.05)",
        } : {
          padding: "10px 20px",
          background: "linear-gradient(135deg, #00D4FF, #00FF88)",
          color: "#0B141B",
          boxShadow: "0 4px 16px rgba(0,212,255,0.25)",
        }}>
        <Share2 size={compact ? 14 : 16} />
        {compact ? "Share" : "Invite Members"}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setOpen(false)}
            />

            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{
                background: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(0,212,255,0.15)",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {/* Handle */}
              <div className="w-12 h-1.5 rounded-full mx-auto mt-3 mb-4" style={{ background: "#e2e8f0" }} />

              <div className="px-5 pb-8 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-2xl uppercase font-black" style={{ color: "#0F172A" }}>
                      Invite Your Squad
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{groupName}</p>
                  </div>
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <X size={18} style={{ color: "#94a3b8" }} />
                  </button>
                </div>

                {/* Passkey */}
                <div className="rounded-2xl p-4 text-center"
                  style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>
                    Entry Passkey
                  </div>
                  <div className="font-mono font-black text-4xl tracking-[0.2em]" style={{ color: "#0F172A" }}>
                    {passkey}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>$2 · All predictions unlocked</div>
                </div>

                {/* Message preview with cycle button */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
                      Invite message
                    </span>
                    <button onClick={() => setMsgIdx(i => i + 1)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg transition-colors hover:bg-slate-100"
                      style={{ color: "#0891B2" }}>
                      🎲 Try another
                    </button>
                  </div>
                  <div className="rounded-xl p-3 text-xs leading-relaxed"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", whiteSpace: "pre-wrap" }}>
                    {message}
                  </div>
                </div>

                {/* Share grid */}
                <div className="grid grid-cols-3 gap-3">
                  {SHARE_OPTIONS.map(opt => (
                    <a key={opt.key} href={opt.href} target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all hover:scale-105"
                      style={{ background: opt.bg, border: `1px solid ${opt.color}20` }}>
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: opt.color }}>
                        {opt.label}
                      </span>
                    </a>
                  ))}
                </div>

                {/* Copy options */}
                <div className="space-y-2">
                  {[
                    { key: "code", label: "Copy passkey",     text: passkey  },
                    { key: "link", label: "Copy join link",   text: joinUrl  },
                    { key: "msg",  label: "Copy full message",text: message  },
                  ].map(c => (
                    <button key={c.key} onClick={() => copy(c.text, c.key)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-slate-50"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span className="text-sm font-bold" style={{ color: "#0F172A" }}>{c.label}</span>
                      {copied === c.key
                        ? <Check size={16} style={{ color: "#059669" }} />
                        : <Copy size={16} style={{ color: "#94a3b8" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}