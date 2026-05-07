"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X, MessageCircle, Mail } from "lucide-react";

interface ShareGroupProps {
  groupName: string;
  adminName: string;
  passkey: string;
}

export function ShareGroup({ groupName, adminName, passkey }: ShareGroupProps) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : "https://cupclash.live"}/join/${passkey}`;
  const message = `You're invited to ${groupName} on Cup Clash!\n\nJoin ${adminName}'s World Cup 2026 tournament. Only $2 to play for the whole cup!\n\nEntry code: ${passkey}\nJoin here: ${joinUrl}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Join ${groupName} on Cup Clash`, text: message, url: joinUrl }); }
      catch { /* cancelled */ }
    } else {
      setOpen(true);
    }
  };

  const SHARE_OPTIONS = [
    { key: "whatsapp", label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(message)}` },
    { key: "telegram", label: "Telegram", color: "#0088cc", href: `https://t.me/share/url?url=${encodeURIComponent(joinUrl)}&text=${encodeURIComponent(message)}` },
    { key: "email",    label: "Email",    color: "#0891B2", href: `mailto:?subject=${encodeURIComponent(`Join ${groupName} on Cup Clash`)}&body=${encodeURIComponent(message)}` },
    { key: "slack",    label: "Slack",    color: "#4A154B", href: `https://slack.com/share?text=${encodeURIComponent(message)}` },
  ];

  return (
    <>
      <button onClick={nativeShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,212,255,0.25)" }}>
        <Share2 size={16} />
        Invite Members
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6"
              style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)", border: "1px solid rgba(0,212,255,0.2)" }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#e2e8f0" }} />
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>Invite Your Squad</div>
                  <div className="text-sm" style={{ color: "#64748b" }}>{groupName}</div>
                </div>
                <button onClick={() => setOpen(false)}><X size={20} style={{ color: "#94a3b8" }} /></button>
              </div>
              <div className="rounded-2xl p-4 mb-5 text-center" style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>Entry Passkey</div>
                <div className="font-mono font-black text-4xl tracking-widest" style={{ color: "#0F172A" }}>{passkey}</div>
                <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>$2 entry · All predictions unlocked</div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {SHARE_OPTIONS.map(opt => (
                  <a key={opt.key} href={opt.href} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl transition-all hover:scale-105"
                    style={{ background: `${opt.color}12`, border: `1px solid ${opt.color}25` }}>
                    <MessageCircle size={20} style={{ color: opt.color }} />
                    <span className="text-[10px] font-bold uppercase" style={{ color: "#64748b" }}>{opt.label}</span>
                  </a>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { key: "code", label: "Copy passkey only", text: passkey },
                  { key: "link", label: "Copy join link",    text: joinUrl },
                  { key: "msg",  label: "Copy full message", text: message },
                ].map(c => (
                  <button key={c.key} onClick={() => copy(c.text, c.key)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <span className="text-sm font-bold" style={{ color: "#0F172A" }}>{c.label}</span>
                    {copied === c.key ? <Check size={16} style={{ color: "#059669" }} /> : <Copy size={16} style={{ color: "#94a3b8" }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}