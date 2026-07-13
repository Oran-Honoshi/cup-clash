"use client";

import { DollarSign } from "lucide-react";
import type { Group, Member } from "@/lib/types";

interface BuyInStatusProps {
  group:   Group;
  members: Member[];
}

export function BuyInStatus({ group, members }: BuyInStatusProps) {
  if (!group.buyInAmount || group.buyInAmount === 0) return null;

  const paidCount = members.filter(m => m.paid).length;
  const paidPot   = paidCount * group.buyInAmount;
  const paidPct   = members.length ? (paidCount / members.length) * 100 : 0;
  const first     = Math.round(paidPot * Number(group.payouts.first.replace("%",  "")) / 100);
  const second    = Math.round(paidPot * Number(group.payouts.second.replace("%", "")) / 100);
  const third     = Math.round(paidPot * Number(group.payouts.third.replace("%",  "")) / 100);

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(18,14,38,0.5)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2.5 mb-4">
        <DollarSign size={18} strokeWidth={1.5} style={{ color: "#00FF88" }} />
        <span className="font-display text-xl uppercase tracking-tight text-white">Prize Tracker</span>
      </div>
      <div className="text-center py-4 mb-4 rounded-xl" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
        <div className="font-display text-5xl font-black" style={{ color: "#00FF88" }}>{group.currencySymbol}{paidPot}</div>
        <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Group Pool</div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{paidCount}/{members.length} paid · {group.currencySymbol}{group.buyInAmount}/player</div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${paidPct}%`, background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
      </div>
      <div className="flex justify-between text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
        <span>{paidCount} paid</span>
        <span>{members.length - paidCount} outstanding</span>
      </div>
      <div className="space-y-2">
        {[
          { label: "🥇 1st place", pct: group.payouts.first,  amount: first,  color: "#fbbf24" },
          { label: "🥈 2nd place", pct: group.payouts.second, amount: second, color: "#94a3b8" },
          { label: "🥉 3rd place", pct: group.payouts.third,  amount: third,  color: "#f97316" },
        ].map(({ label, pct, amount, color }) => (
          <div key={label} className="flex justify-between items-center py-1.5 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{pct}</span>
              <span className="font-black text-base" style={{ color }}>{group.currencySymbol}{amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}