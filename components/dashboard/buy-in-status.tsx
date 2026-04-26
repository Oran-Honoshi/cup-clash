import { CheckCircle, XCircle, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Group, Member } from "@/lib/types";

interface BuyInStatusProps {
  group: Group;
  members: Member[];
}

export function BuyInStatus({ group, members }: BuyInStatusProps) {
  const totalPot = members.length * group.buyInAmount;
  const paidCount = members.filter((m) => m.paid).length;
  const unpaidCount = members.length - paidCount;

  const payouts = [
    { place: "1st", pct: group.payouts.first, amount: Math.round(totalPot * 0.6) },
    { place: "2nd", pct: group.payouts.second, amount: Math.round(totalPot * 0.3) },
    { place: "3rd", pct: group.payouts.third, amount: Math.round(totalPot * 0.1) },
  ];

  return (
    <Card variant="glass" className="p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <Wallet size={18} style={{ color: "rgb(var(--accent-glow))" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">
          Buy-in Tracker
        </span>
      </div>

      {/* Pot total */}
      <div className="text-center py-4 mb-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div
          className="font-display text-5xl text-white"
          style={{ color: "rgb(var(--accent-glow))" }}
        >
          ${totalPot}
        </div>
        <div className="label-caps mt-1">Total pot</div>
        <div className="text-xs text-pitch-400 mt-1">
          {paidCount}/{members.length} paid · ${group.buyInAmount}/player
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] text-pitch-400 mb-1.5">
          <span>{paidCount} paid</span>
          <span>{unpaidCount} outstanding</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(paidCount / members.length) * 100}%`,
              backgroundImage:
                "linear-gradient(90deg, rgb(var(--brand)), rgb(var(--accent-glow)))",
            }}
          />
        </div>
      </div>

      {/* Payout splits */}
      <div className="space-y-2">
        {payouts.map((p) => (
          <div
            key={p.place}
            className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
          >
            <span className="text-sm font-bold text-pitch-300">{p.place} place</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-pitch-500">{p.pct}</span>
              <span
                className="font-display text-xl tabular"
                style={{ color: "rgb(var(--accent-glow))" }}
              >
                ${p.amount}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment status list */}
      <div className="mt-5 pt-4 border-t border-white/[0.06]">
        <div className="label-caps mb-3">Payment status</div>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <span className="text-sm text-pitch-200">{m.name}</span>
              {m.paid ? (
                <span className="flex items-center gap-1 text-success text-xs font-bold uppercase tracking-wider">
                  <CheckCircle size={13} />
                  Paid
                </span>
              ) : (
                <span className="flex items-center gap-1 text-danger text-xs font-bold uppercase tracking-wider">
                  <XCircle size={13} />
                  Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
