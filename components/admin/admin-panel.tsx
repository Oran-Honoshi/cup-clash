"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Copy, Check, AlertCircle, Users, Wallet, Trophy, Link2, RefreshCw } from "lucide-react";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Group, Member } from "@/lib/types";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const payoutSchema = z.object({
  first:  z.number().min(0).max(100),
  second: z.number().min(0).max(100),
  third:  z.number().min(0).max(100),
}).refine((d) => d.first + d.second + d.third === 100, {
  message: "Payouts must add up to exactly 100%",
});

interface AdminPanelProps {
  group: Group;
  initialMembers: Member[];
}

export function AdminPanel({ group, initialMembers }: AdminPanelProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [payouts, setPayouts] = useState({
    first:  Number(group.payouts.first.replace("%",  "")),
    second: Number(group.payouts.second.replace("%", "")),
    third:  Number(group.payouts.third.replace("%",  "")),
  });
  const [payoutSaving, setPayoutSaving]   = useState(false);
  const [payoutError,  setPayoutError]    = useState<string | null>(null);
  const [payoutSaved,  setPayoutSaved]    = useState(false);
  const [copied,       setCopied]         = useState(false);

  const totalPct   = payouts.first + payouts.second + payouts.third;
  const totalPot   = members.length * group.buyInAmount;
  const paidCount  = members.filter((m) => m.paid).length;
  const inviteUrl  = typeof window !== "undefined" ? `${window.location.origin}/join/${group.id}` : "";

  const togglePaid = async (memberId: string, currentPaid: boolean) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, paid: !currentPaid } : m));
      return;
    }
    const sb = getClient();
    const { error } = await sb.from("group_members")
      .update({ paid: !currentPaid } as Record<string, boolean>)
      .eq("user_id", memberId)
      .eq("group_id", group.id);
    if (!error) setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, paid: !currentPaid } : m));
  };

  const savePayouts = async () => {
    const result = payoutSchema.safeParse(payouts);
    if (!result.success) { setPayoutError(result.error.errors[0]?.message ?? "Invalid"); return; }
    setPayoutSaving(true);
    setPayoutError(null);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setPayoutSaving(false); setPayoutSaved(true); setTimeout(() => setPayoutSaved(false), 2000); return;
    }
    const sb = getClient();
    const { error } = await sb.from("groups")
      .update({ payout_first: payouts.first, payout_second: payouts.second, payout_third: payouts.third } as Record<string, number>)
      .eq("id", group.id);
    setPayoutSaving(false);
    if (error) { setPayoutError(error.message); }
    else { setPayoutSaved(true); setTimeout(() => setPayoutSaved(false), 2000); }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paidAmount   = Math.round(totalPot * (payouts.first  / 100));
  const secondAmount = Math.round(totalPot * (payouts.second / 100));
  const thirdAmount  = Math.round(totalPot * (payouts.third  / 100));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Member payment tracker */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <Users size={18} style={{ color: "rgb(var(--accent-glow))" }} />
          <span className="font-display text-xl uppercase text-white tracking-tight">Member Payments</span>
          <span className="ml-auto label-caps">{paidCount}/{members.length} paid</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-5">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${members.length > 0 ? (paidCount / members.length) * 100 : 0}%`, backgroundImage: "linear-gradient(90deg, rgb(var(--brand)), rgb(var(--accent-glow)))" }} />
        </div>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}>
                {m.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{m.name}</div>
                <div className="text-[11px] text-pitch-500">{m.country}</div>
              </div>
              {group.buyInAmount > 0 && <span className="text-sm font-bold text-pitch-300 shrink-0">${group.buyInAmount}</span>}
              <button onClick={() => togglePaid(m.id, m.paid)}
                className={cn("flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border transition-all",
                  m.paid ? "text-success bg-success/10 border-success/25 hover:bg-success/15" : "text-danger bg-danger/10 border-danger/25 hover:bg-danger/15")}>
                {m.paid ? <><CheckCircle size={12} /> Paid</> : <><XCircle size={12} /> Pending</>}
              </button>
            </div>
          ))}
        </div>
        {group.buyInAmount > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-sm text-pitch-400">Total pot collected</span>
            <span className="font-display text-2xl" style={{ color: "rgb(var(--accent-glow))" }}>
              ${paidCount * group.buyInAmount}
              <span className="text-pitch-500 text-sm font-sans"> / ${totalPot}</span>
            </span>
          </div>
        )}
      </Card>

      <div className="space-y-5">
        {/* Payout split editor */}
        <Card variant="glass" className="p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <Trophy size={18} style={{ color: "#D4AF37" }} />
            <span className="font-display text-xl uppercase text-white tracking-tight">Payout Split</span>
            <span className={cn("ml-auto text-xs font-bold", totalPct === 100 ? "text-success" : "text-danger")}>{totalPct}% / 100%</span>
          </div>
          <div className="space-y-3 mb-4">
            {([
              { label: "1st", key: "first"  as const, medal: "🥇", amount: paidAmount   },
              { label: "2nd", key: "second" as const, medal: "🥈", amount: secondAmount  },
              { label: "3rd", key: "third"  as const, medal: "🥉", amount: thirdAmount   },
            ]).map(({ label, key, medal, amount }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-8 text-sm">{medal}</span>
                <span className="text-sm text-pitch-300 w-8">{label}</span>
                <div className="flex-1 relative">
                  <input type="number" min={0} max={100} value={payouts[key]}
                    onChange={(e) => { setPayouts((p) => ({ ...p, [key]: Number(e.target.value) })); setPayoutSaved(false); }}
                    className="w-full rounded-xl px-3 py-2 text-sm text-white text-right bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent pr-7" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pitch-500 text-sm">%</span>
                </div>
                {group.buyInAmount > 0 && <span className="text-sm font-bold text-pitch-300 w-12 text-right">${amount}</span>}
              </div>
            ))}
          </div>
          {payoutError && <div className="flex items-center gap-2 text-xs text-danger mb-3"><AlertCircle size={13} />{payoutError}</div>}
          {totalPct !== 100 && <p className="text-xs text-danger mb-3 flex items-center gap-1.5"><AlertCircle size={12} />Must add up to exactly 100%</p>}
          <Button onClick={savePayouts} disabled={totalPct !== 100 || payoutSaving} loading={payoutSaving} size="sm" className="w-full"
            leftIcon={payoutSaved ? <Check size={14} /> : <Wallet size={14} />}>
            {payoutSaved ? "Saved!" : "Save payout split"}
          </Button>
        </Card>

        {/* Invite link */}
        <Card variant="glass" className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <Link2 size={18} style={{ color: "rgb(var(--accent-glow))" }} />
            <span className="font-display text-xl uppercase text-white tracking-tight">Invite Link</span>
          </div>
          <div className="glass rounded-xl p-3 font-mono text-xs text-pitch-300 break-all mb-3">{inviteUrl}</div>
          <div className="flex gap-2">
            <Button onClick={copyInviteLink} variant="outline" size="sm" className="flex-1"
              leftIcon={copied ? <Check size={13} /> : <Copy size={13} />}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button variant="ghost" size="sm" className="shrink-0" leftIcon={<RefreshCw size={13} />} title="Regenerate">New code</Button>
          </div>
          <p className="mt-3 text-[11px] text-pitch-500">Share this link with your group. Anyone with it can join.</p>
        </Card>
      </div>
    </div>
  );
}
