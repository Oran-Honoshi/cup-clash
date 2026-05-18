"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, Star, ArrowRight, MessageCircle } from "lucide-react";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";
import { useRouter } from "next/navigation";

interface CorporatePaymentClientProps {
  groupId:   string;
  groupName: string;
}

type Tier = 50 | 100 | null;

export function CorporatePaymentClient({ groupId, groupName }: CorporatePaymentClientProps) {
  const [tier, setTier] = useState<Tier>(null);
  const router = useRouter();

  const price = tier === 50 ? 75 : 130;

  const handleSuccess = () => {
    // After corporate payment, refresh and go back to group
    router.push(`/groups/${groupId}?unlocked=1`);
    router.refresh();
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 8px 32px rgba(0,212,255,0.08)" }}>
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />

      <div className="p-6 space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <Building2 size={13} style={{ color: "#0891B2" }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#0891B2" }}>
              Corporate Unlock
            </span>
          </div>
          <h2 className="font-display text-2xl uppercase font-black mb-1" style={{ color: "#0F172A" }}>
            {groupName}
          </h2>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Choose your team size — employees join free after you pay once.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!tier ? (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3">

              {/* $75 */}
              <button onClick={() => setTier(50)}
                className="w-full rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 border-2"
                style={{ border: "2px solid rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.03)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: "#0891B2" }} />
                    <span className="font-bold text-sm" style={{ color: "#0F172A" }}>Team Starter</span>
                  </div>
                  <span className="font-display text-2xl font-black" style={{ color: "#0F172A" }}>$75</span>
                </div>
                <div className="text-xs" style={{ color: "#64748b" }}>Up to 50 members · employees join free</div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold" style={{ color: "#0891B2" }}>
                  Select <ArrowRight size={12} />
                </div>
              </button>

              {/* $130 */}
              <button onClick={() => setTier(100)}
                className="w-full rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 relative overflow-hidden"
                style={{ border: "2px solid rgba(217,119,6,0.3)", background: "rgba(217,119,6,0.03)" }}>
                <div className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(217,119,6,0.12)", color: "#d97706" }}>BEST VALUE</div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star size={16} style={{ color: "#d97706" }} />
                    <span className="font-bold text-sm" style={{ color: "#0F172A" }}>Corporate Pack</span>
                  </div>
                  <span className="font-display text-2xl font-black" style={{ color: "#0F172A" }}>$130</span>
                </div>
                <div className="text-xs" style={{ color: "#64748b" }}>Up to 100 members · employees join free</div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold" style={{ color: "#d97706" }}>
                  Select <ArrowRight size={12} />
                </div>
              </button>

              {/* Enterprise */}
              <div className="text-center pt-1">
                <a href="/contact"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold transition-colors hover:opacity-70"
                  style={{ color: "#94a3b8" }}>
                  <MessageCircle size={11} />
                  Need more than 100 members? Contact us for Enterprise
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <button onClick={() => setTier(null)}
                className="text-xs font-bold flex items-center gap-1"
                style={{ color: "#0891B2" }}>
                ← Back to tier selection
              </button>

              <div className="rounded-xl p-3 text-center"
                style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <div className="text-xs" style={{ color: "#64748b" }}>
                  {tier === 50 ? "Team Starter" : "Corporate Pack"} · up to {tier} members
                </div>
                <div className="font-display text-3xl font-black" style={{ color: "#0F172A" }}>${price}</div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>one-time · employees join free</div>
              </div>

              <PayPalCheckout
                groupId={groupId}
                groupName={groupName}
                amount={price}
                containerId="corporate-paypal-container"
                onSuccess={handleSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}