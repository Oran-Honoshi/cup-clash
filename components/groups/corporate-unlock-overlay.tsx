"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, Users, Building2, CheckCircle, Copy, Check, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: object) => { render: (selector: string) => Promise<void> };
    };
  }
}

interface CorporateUnlockOverlayProps {
  groupId:   string;
  groupName: string;
  passkey:   string;
}

export function CorporateUnlockOverlay({ groupId, groupName, passkey }: CorporateUnlockOverlayProps) {
  const [tier,      setTier]      = useState<50 | 100 | null>(null);
  const [step,      setStep]      = useState<"choose" | "pay" | "success">("choose");
  const [error,     setError]     = useState<string | null>(null);
  const [copied,    setCopied]    = useState(false);
  const [ppLoading, setPpLoading] = useState(false);
  const rendered = useRef(false);
  const router   = useRouter();

  const price = tier === 50 ? 75 : 130;
  const inviteUrl = `https://cupclash.live/join/${passkey}`;

  // Load PayPal when step = "pay"
  useEffect(() => {
    if (step !== "pay" || rendered.current) return;
    rendered.current = true;
    setPpLoading(true);

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) { setError("PayPal not configured"); return; }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => {
      setPpLoading(false);
      if (!window.paypal) return;
      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 },

        createOrder: async () => {
          const res = await fetch("/api/paypal/create-order", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ groupId, amount: price }),
          });
          const data = await res.json() as { id: string };
          return data.id;
        },

        onApprove: async (data: { orderID: string }) => {
          const res = await fetch("/api/paypal/capture-corporate", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ orderID: data.orderID, groupId, capacity: tier }),
          });
          const result = await res.json() as { success: boolean; error?: string };
          if (result.success) {
            setStep("success");
            // Refresh page after 3s so passkey section replaces overlay
            setTimeout(() => router.refresh(), 3000);
          } else {
            setError(result.error ?? "Payment failed — please try again");
          }
        },

        onError: () => { setError("Payment failed. Please try again."); },
        onCancel: () => { setError(null); },

      }).render("#corporate-paypal-container").catch(() => {
        setError("PayPal failed to load. Please refresh.");
      });
    };
    script.onerror = () => { setError("Failed to load PayPal. Check your connection."); setPpLoading(false); };
    document.body.appendChild(script);
  }, [step, groupId, price, tier, router]);

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state — show invite link
  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 text-center space-y-4"
        style={{ background: "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))", border: "2px solid rgba(0,255,136,0.3)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
          <CheckCircle size={48} className="mx-auto" style={{ color: "#059669" }} />
        </motion.div>
        <div>
          <h3 className="font-display text-2xl uppercase font-black mb-1" style={{ color: "#0F172A" }}>
            Team Unlocked! 🎉
          </h3>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Your corporate group is live. Share the link below with your team.
          </p>
        </div>
        <div className="rounded-xl p-4"
          style={{ background: "white", border: "1px solid rgba(0,212,255,0.2)" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0891B2" }}>
            Invite Link
          </div>
          <div className="font-mono text-sm mb-3 break-all" style={{ color: "#0F172A" }}>{inviteUrl}</div>
          <button onClick={copyInvite}
            className="w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Invite Link</>}
          </button>
        </div>
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          Employees click the link and join free — no payment required on their end
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>

      {/* Locked passkey blur */}
      <div className="relative">
        <div className="p-5 text-center select-none" style={{ filter: "blur(6px)", pointerEvents: "none" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>Entry Passkey</div>
          <div className="font-mono font-black text-4xl tracking-[0.2em]" style={{ color: "#0F172A" }}>••••••</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>cupclash.live/join/••••••</div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(2px)" }}>
          <Lock size={24} style={{ color: "#94a3b8" }} />
        </div>
      </div>

      {/* Unlock card */}
      <div className="border-t p-5" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <AnimatePresence mode="wait">

          {/* Step 1 — Choose tier */}
          {step === "choose" && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                  style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <Building2 size={12} style={{ color: "#0891B2" }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#0891B2" }}>
                    Corporate Team Tier
                  </span>
                </div>
                <h3 className="font-display text-xl uppercase font-black mb-1" style={{ color: "#0F172A" }}>
                  Ready to invite your team?
                </h3>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  One flat fee — employees join free with zero friction
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 50 members */}
                <button onClick={() => { setTier(50); setStep("pay"); rendered.current = false; }}
                  className="rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 border-2"
                  style={{ border: "2px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.04)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} style={{ color: "#0891B2" }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>Starter</span>
                  </div>
                  <div className="font-display text-3xl font-black mb-0.5" style={{ color: "#0F172A" }}>$75</div>
                  <div className="text-xs" style={{ color: "#64748b" }}>Up to 50 members</div>
                  <div className="text-[10px] mt-1.5 font-bold" style={{ color: "#059669" }}>$1.50/member</div>
                </button>

                {/* 100 members */}
                <button onClick={() => { setTier(100); setStep("pay"); rendered.current = false; }}
                  className="rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 relative overflow-hidden"
                  style={{ border: "2px solid rgba(217,119,6,0.4)", background: "rgba(217,119,6,0.04)" }}>
                  <div className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(217,119,6,0.15)", color: "#d97706" }}>BEST VALUE</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={16} style={{ color: "#d97706" }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#d97706" }}>Corporate</span>
                  </div>
                  <div className="font-display text-3xl font-black mb-0.5" style={{ color: "#0F172A" }}>$130</div>
                  <div className="text-xs" style={{ color: "#64748b" }}>Up to 100 members</div>
                  <div className="text-[10px] mt-1.5 font-bold" style={{ color: "#d97706" }}>$1.30/member</div>
                </button>
              </div>

              <div className="flex items-start gap-2 text-xs rounded-xl px-3 py-2.5"
                style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)" }}>
                <Sparkles size={12} style={{ color: "#059669", marginTop: 1, flexShrink: 0 }} />
                <span style={{ color: "#475569" }}>
                  Employees click your invite link and join for <strong>$0</strong>. The entire team fee is covered by your one payment.
                </span>
              </div>

              {/* Enterprise CTA */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  Need more than 100 members?
                </p>
                <a href="/contact"
                  className="flex items-center gap-1.5 text-xs font-bold transition-colors hover:opacity-70"
                  style={{ color: "#0891B2" }}>
                  <MessageCircle size={11} /> Contact us for Enterprise
                </a>
              </div>
            </motion.div>
          )}

          {/* Step 2 — PayPal */}
          {step === "pay" && (
            <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <button onClick={() => { setStep("choose"); setTier(null); rendered.current = false; }}
                  className="text-xs font-bold" style={{ color: "#0891B2" }}>
                  ← Back
                </button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-black" style={{ color: "#0F172A" }}>
                    {tier === 50 ? "Team Starter — $75" : "Corporate Pack — $130"}
                  </span>
                  <div className="text-xs" style={{ color: "#94a3b8" }}>Up to {tier} members · one-time</div>
                </div>
              </div>

              {ppLoading && (
                <div className="flex items-center justify-center py-6 gap-2" style={{ color: "#94a3b8" }}>
                  <span className="animate-spin text-lg">⟳</span>
                  <span className="text-sm">Loading PayPal...</span>
                </div>
              )}

              {error && (
                <div className="text-xs rounded-xl px-3 py-2 text-center"
                  style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}>
                  {error}
                </div>
              )}

              <div id="corporate-paypal-container" />

              <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
                Secured by PayPal · No account required · Pay with card or PayPal
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}