"use client";

import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Group, Member } from "@/lib/types";

interface BuyInStatusProps {
  group: Group;
  members: Member[];
}

export function BuyInStatus({ group, members }: BuyInStatusProps) {
  if (!group.buyInAmount || group.buyInAmount === 0) return null;

  const paidCount   = members.filter(m => m.paid).length;
  const totalPot    = members.length * group.buyInAmount;
  const paidPot     = paidCount * group.buyInAmount;
  const paidPct     = members.length ? (paidCount / members.length) * 100 : 0;
  const first  = Math.round(paidPot * Number(group.payouts.first.replace("%",  "")) / 100);
  const second = Math.round(paidPot * Number(group.payouts.second.replace("%", "")) / 100);
  const third  = Math.round(paidPot * Number(group.payouts.third.replace("%",  "")) / 100);

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <DollarSign size={18} strokeWidth={1.5} style={{ color: "#059669" }} />
        <span className="font-display text-xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Buy-in Tracker
        </span>
      </div>

      {/* Big pot number */}
      <div className="text-center py-4 mb-4 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div className="font-display text-5xl font-black" style={{ color: "#0891B2" }}>${paidPot}</div>
        <div className="text-xs uppercase tracking-widest mt-1" style={{ color: "#94a3b8" }}>Total Pot</div>
        <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
          {paidCount}/{members.length} paid · ${group.buyInAmount}/player
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "#e2e8f0" }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${paidPct}%`, background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
      </div>
      <div className="flex justify-between text-xs mb-5" style={{ color: "#64748b" }}>
        <span>{paidCount} paid</span>
        <span>{members.length - paidCount} outstanding</span>
      </div>

      {/* Payout breakdown */}
      <div className="space-y-2">
        {[
          { label: "1st place", pct: group.payouts.first,  amount: first,  color: "#d97706" },
          { label: "2nd place", pct: group.payouts.second, amount: second, color: "#64748b" },
          { label: "3rd place", pct: group.payouts.third,  amount: third,  color: "#b45309" },
        ].map(({ label, pct, amount, color }) => (
          <div key={label} className="flex justify-between items-center py-1">
            <span className="text-sm" style={{ color: "#475569" }}>{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#94a3b8" }}>{pct}</span>
              <span className="font-bold text-base" style={{ color }}>${amount}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}