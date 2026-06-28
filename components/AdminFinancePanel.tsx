"use client";

import { useState, useId } from "react";
import { X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member, Group } from "@/lib/types";

interface AdminFinancePanelProps {
  group:   Group;
  members: Member[];
  onTogglePaid: (memberId: string, paid: boolean) => void;
}

interface PayoutSplit {
  first:  string;
  second: string;
  third:  string;
}

function parsePercent(val: string): number {
  return parseFloat(val.replace("%", "")) || 0;
}

function calcPrize(pool: number, pct: string): number {
  return Math.floor((pool * parsePercent(pct)) / 100);
}

// ── Minimal Dialog ─────────────────────────────────────────────────────────────
function Dialog({ open, onClose, title, children }: {
  open:    boolean;
  onClose: () => void;
  title:   string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/14 bg-[#080510]
                        shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                         hover:bg-white/15 transition-colors"
              aria-label="Close"
            >
              <X size={15} className="text-white/70" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Payout dialog ──────────────────────────────────────────────────────────────
function PayoutDialog({
  open,
  onClose,
  payouts,
  onSave,
}: {
  open:    boolean;
  onClose: () => void;
  payouts: PayoutSplit;
  onSave:  (p: PayoutSplit) => void;
}) {
  const id = useId();
  const [first,  setFirst]  = useState(payouts.first.replace("%", ""));
  const [second, setSecond] = useState(payouts.second.replace("%", ""));
  const [third,  setThird]  = useState(payouts.third.replace("%", ""));

  const sum = parseFloat(first || "0") + parseFloat(second || "0") + parseFloat(third || "0");
  const valid = Math.abs(sum - 100) < 0.01;

  function save() {
    if (!valid) return;
    onSave({ first: `${first}%`, second: `${second}%`, third: `${third}%` });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Set Payouts">
      <div className="space-y-4">
        {(["first","second","third"] as const).map((place, i) => {
          const val   = [first, second, third][i];
          const setVal = [setFirst, setSecond, setThird][i];
          const labels = ["1st place", "2nd place", "3rd place"];
          return (
            <div key={place}>
              <label htmlFor={`${id}-${place}`} className="text-xs text-white/50 uppercase tracking-widest font-bold block mb-1.5">
                {labels[i]}
              </label>
              <div className="relative">
                <input
                  id={`${id}-${place}`}
                  type="number"
                  min={0}
                  max={100}
                  value={val}
                  onChange={e => setVal(e.target.value)}
                  className="w-full h-11 pr-8 pl-4 rounded-xl border border-white/14 bg-white/5
                             text-white text-sm font-semibold focus:outline-none
                             focus:ring-2 focus:ring-[rgb(var(--accent,0_255_136))]
                             appearance-none [-moz-appearance:textfield]
                             [&::-webkit-outer-spin-button]:appearance-none
                             [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">%</span>
              </div>
            </div>
          );
        })}

        {/* sum indicator */}
        <div className={cn(
          "flex justify-between items-center px-4 py-2.5 rounded-xl border text-sm font-bold",
          valid
            ? "border-green-500/30 bg-green-500/10 text-green-400"
            : "border-red-500/30 bg-red-500/10 text-red-400"
        )}>
          <span>Total</span>
          <span>{sum.toFixed(0)}%{valid ? " ✓" : ` (need 100%)`}</span>
        </div>

        <button
          onClick={save}
          disabled={!valid}
          className="w-full h-11 rounded-full font-bold uppercase tracking-widest text-sm
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-fast"
          style={{
            background: valid ? "linear-gradient(135deg,#00FF88,#00D4FF)" : "rgba(255,255,255,0.08)",
            color:      valid ? "#0B141B" : "rgba(255,255,255,0.4)",
          }}
        >
          Save payouts
        </button>
      </div>
    </Dialog>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────
export function AdminFinancePanel({ group, members, onTogglePaid }: AdminFinancePanelProps) {
  const [payouts, setPayouts]           = useState<PayoutSplit>(group.payouts);
  const [payoutDialogOpen, setPayoutOpen] = useState(false);

  const paidCount = members.filter(m => m.paid).length;
  const pool      = paidCount * group.buyInAmount;

  const sorted = [...members].sort((a, b) => b.points - a.points);

  function exportPDF() {
    const rows = sorted
      .slice(0, 3)
      .map((m, i) => {
        const pcts  = [payouts.first, payouts.second, payouts.third];
        const prize = calcPrize(pool, pcts[i] ?? "0%");
        return `${i + 1}. ${m.name} — $${prize} ${m.paid ? "(Paid)" : "(Unpaid)"}`;
      })
      .join("\n");

    const content = [
      "FINAL PAYOUT REPORT",
      `Group: ${group.name}`,
      `Total Pool: $${pool}`,
      `Date: ${new Date().toLocaleDateString("en-GB")}`,
      "",
      rows,
      "",
      "Generated by Cup Clash",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `payout-report-${group.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* ── Pool summary ── */}
      <div className="rounded-2xl border border-white/14 bg-[rgba(18,14,38,0.5)] backdrop-blur-[20px] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Total pool</p>
        <p className="text-4xl font-black text-white">
          {group.currencySymbol}{pool.toLocaleString()}
        </p>
        <p className="text-sm text-white/50 mt-1">
          {paidCount} of {members.length} members paid
          {" · "}{group.currencySymbol}{group.buyInAmount} buy-in
        </p>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setPayoutOpen(true)}
          className="h-10 px-5 rounded-full text-sm font-bold uppercase tracking-widest
                     border border-white/20 text-white hover:bg-white/10 transition-colors duration-fast"
        >
          Set Payouts
        </button>
        <button
          onClick={exportPDF}
          className="h-10 px-5 rounded-full text-sm font-bold uppercase tracking-widest
                     flex items-center gap-2 border border-white/20 text-white
                     hover:bg-white/10 transition-colors duration-fast"
        >
          <Download size={15} />
          Export PDF
        </button>
      </div>

      {/* ── Member table ── */}
      <div className="rounded-2xl border border-white/14 overflow-hidden bg-[rgba(18,14,38,0.5)] backdrop-blur-[20px]">
        {/* header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3 border-b border-white/10">
          {["Name","Country","Points","Paid"].map(h => (
            <span key={h} className="text-label text-white/40 uppercase tracking-widest text-right first:text-left">
              {h}
            </span>
          ))}
        </div>

        {sorted.map((m, i) => {
          const rank   = i + 1;
          const pcts   = [payouts.first, payouts.second, payouts.third];
          const prize  = rank <= 3 ? calcPrize(pool, pcts[rank - 1] ?? "0%") : 0;

          return (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3
                         border-b border-white/6 last:border-0 items-center"
            >
              {/* name + prize */}
              <div>
                <p className="text-sm font-semibold text-white/90">{m.name}</p>
                {prize > 0 && (
                  <p className="text-xs text-[#00FF88] font-bold">
                    {group.currencySymbol}{prize}
                  </p>
                )}
              </div>

              {/* country */}
              <span className="text-sm text-white/60 text-right">{m.country}</span>

              {/* points */}
              <span className="text-sm font-bold text-white text-right">{m.points}</span>

              {/* paid toggle */}
              <button
                onClick={() => onTogglePaid(m.id, !m.paid)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors duration-normal border ml-2",
                  m.paid
                    ? "bg-green-500/20 border-green-500/30"
                    : "bg-white/5 border-white/10"
                )}
                aria-label={m.paid ? "Mark unpaid" : "Mark paid"}
                role="switch"
                aria-checked={m.paid}
              >
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-normal shadow-sm",
                  m.paid
                    ? "translate-x-6 bg-green-400"
                    : "translate-x-0.5 bg-white/30"
                )} />
              </button>
            </div>
          );
        })}
      </div>

      <PayoutDialog
        open={payoutDialogOpen}
        onClose={() => setPayoutOpen(false)}
        payouts={payouts}
        onSave={setPayouts}
      />
    </div>
  );
}
