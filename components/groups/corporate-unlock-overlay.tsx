"use client";

import { motion } from "framer-motion";
import { Lock, Users, Building2, Star, ArrowRight, Copy, Check, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface CorporateUnlockOverlayProps {
  groupId:   string;
  groupName: string;
  passkey:   string;
}

const glassToken = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: 22,
};

export function CorporateUnlockOverlay({ groupId, groupName, passkey }: CorporateUnlockOverlayProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `https://cupclash.live/join/${passkey}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ ...glassToken }}>

      {/* Blurred passkey */}
      <div className="relative">
        <div className="p-5 text-center select-none" style={{ filter: "blur(6px)", pointerEvents: "none" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>Entry Passkey</div>
          <div className="font-mono font-black text-4xl tracking-[0.2em]" style={{ color: "white" }}>••••••</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>cupclash.live/join/••••••</div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(8,6,20,0.85)", backdropFilter: "blur(8px)" }}>
          <Lock size={22} style={{ color: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>

      {/* Unlock panel */}
      <div className="border-t p-5 space-y-4" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <Building2 size={12} style={{ color: "#0891B2" }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#0891B2" }}>
              Corporate Team Tier
            </span>
          </div>
          <h3 className="font-display text-lg uppercase font-black mb-1" style={{ color: "white" }}>
            Ready to invite your team?
          </h3>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            One flat fee — employees join for <strong style={{ color: "white" }}>$0</strong>
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/groups/${groupId}/unlock`}
            className="rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 block"
            style={{ border: "2px solid rgba(0,212,255,0.25)", background: "rgba(18,14,38,0.6)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} style={{ color: "#0891B2" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>Starter</span>
            </div>
            <div className="font-display text-2xl font-black mb-0.5" style={{ color: "white" }}>$75</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Up to 50 members</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold" style={{ color: "#0891B2" }}>
              Unlock <ArrowRight size={11} />
            </div>
          </Link>

          <Link href={`/groups/${groupId}/unlock`}
            className="rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 relative overflow-hidden block"
            style={{ border: "2px solid rgba(217,119,6,0.3)", background: "rgba(18,14,38,0.6)" }}>
            <div className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(217,119,6,0.12)", color: "#d97706" }}>BEST</div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} style={{ color: "#d97706" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#d97706" }}>Corporate</span>
            </div>
            <div className="font-display text-2xl font-black mb-0.5" style={{ color: "white" }}>$130</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Up to 100 members</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold" style={{ color: "#d97706" }}>
              Unlock <ArrowRight size={11} />
            </div>
          </Link>
        </div>

        {/* Benefit note */}
        <div className="flex items-start gap-2 text-xs rounded-xl px-3 py-2.5"
          style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)" }}>
          <Sparkles size={12} style={{ color: "#059669", marginTop: 1, flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>
            Employees click your invite link and join for <strong>$0</strong>.
            Your one payment covers the entire team.
          </span>
        </div>

        {/* Enterprise CTA */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Need more than 100 members?</p>
          <a href="/contact"
            className="flex items-center gap-1.5 text-xs font-bold transition-colors hover:opacity-70"
            style={{ color: "#0891B2" }}>
            <MessageCircle size={11} /> Contact Enterprise
          </a>
        </div>
      </div>
    </div>
  );
}
