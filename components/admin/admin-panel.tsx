"use client";

import { useState, useEffect } from "react";
import { Users, Trophy, Copy, Check, RefreshCw, CheckCircle, XCircle, Link2 } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { NudgeButton } from "@/components/admin/nudge-button";
import { cn } from "@/lib/utils";
import type { Group, Member } from "@/lib/types";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface AdminPanelProps {
  group: Group;
  initialMembers: Member[];
}

export function AdminPanel({ group, initialMembers }: AdminPanelProps) {
  const [members,     setMembers]     = useState<Member[]>(initialMembers);
  const [payouts,     setPayouts]     = useState({
    first:  Number(group.payouts.first.replace("%",  "")),
    second: Number(group.payouts.second.replace("%", "")),
    third:  Number(group.payouts.third.replace("%",  "")),
  });
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutSaved,  setPayoutSaved]  = useState(false);
  const [payoutError,  setPayoutError]  = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);
  const [inviteUrl,    setInviteUrl]    = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/join/${group.id}`);
    }
  }, [group.id]);

  const paidCount  = members.filter(m => m.paid).length;
  const totalPot   = members.length * group.buyInAmount;
  const paidAmount = paidCount * group.buyInAmount;
  const totalPct   = payouts.first + payouts.second + payouts.third;
  const secondAmount = Math.round(paidAmount * payouts.second / 100);
  const thirdAmount  = Math.round(paidAmount * payouts.third  / 100);
  const firstAmount  = Math.round(paidAmount * payouts.first  / 100);

  const togglePaid = async (memberId: string, currentPaid: boolean) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, paid: !currentPaid } : m));
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const sb = getClient();
    await sb.from("group_members")
      .update({ paid: !currentPaid } as Record<string, boolean>)
      .eq("user_id", memberId).eq("group_id", group.id);
  };

  const savePayouts = async () => {
    if (totalPct !== 100) { setPayoutError("Must add up to 100%"); return; }
    setPayoutSaving(true); setPayoutError(null);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const sb = getClient();
      await sb.from("groups").update({
        payout_first:  payouts.first,
        payout_second: payouts.second,
        payout_third:  payouts.third,
      } as Record<string, number>).eq("id", group.id);
    } else {
      await new Promise(r => setTimeout(r, 500));
    }
    setPayoutSaving(false); setPayoutSaved(true);
    setTimeout(() => setPayoutSaved(false), 2500);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = "w-full rounded-xl px-3 py-2 text-sm text-right bg-white border border-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Member Payments */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Users size={18} strokeWidth={1.5} style={{ color: "#0891B2" }} />
            <span className="font-display text-xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
              Member Payments
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>
            {paidCount}/{members.length} Paid
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: "#e2e8f0" }}>
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${members.length ? (paidCount / members.length) * 100 : 0}%`,
              background: "linear-gradient(90deg, #00D4FF, #00FF88)",
            }} />
        </div>

        {/* Member list */}
        <div className="space-y-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>{m.name}</div>
                <div className="text-[11px]" style={{ color: "#94a3b8" }}>{m.country}</div>
              </div>
              <NudgeButton
                memberName={m.name}
                matchLabel="Next match"
                groupName={group.name}
                minutesToKickoff={90}
                hasPredicted={false}
                size="sm"
              />
              {group.buyInAmount > 0 && (
                <span className="text-sm font-bold shrink-0" style={{ color: "#334155" }}>
                  ${group.buyInAmount}
                </span>
              )}
              <button onClick={() => togglePaid(m.id, m.paid)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border transition-all",
                  m.paid
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                )}>
                {m.paid
                  ? <><CheckCircle size={12} /> Paid</>
                  : <><XCircle size={12} /> Pending</>}
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm" style={{ color: "#64748b" }}>Total pot collected</span>
          <div>
            <span className="font-display text-2xl font-black" style={{ color: "#0891B2" }}>
              ${paidAmount}
            </span>
            <span className="text-sm ml-1" style={{ color: "#94a3b8" }}>/ ${totalPot}</span>
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        {/* Payout Split */}
        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Trophy size={18} strokeWidth={1.5} style={{ color: "#d97706" }} />
              <span className="font-display text-xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
                Payout Split
              </span>
            </div>
            <span className="text-xs font-bold" style={{ color: totalPct === 100 ? "#059669" : "#dc2626" }}>
              {totalPct}% / 100%
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {([
              { label: "1st", emoji: "🥇", key: "first"  as const, amount: firstAmount  },
              { label: "2nd", emoji: "🥈", key: "second" as const, amount: secondAmount },
              { label: "3rd", emoji: "🥉", key: "third"  as const, amount: thirdAmount  },
            ]).map(({ label, emoji, key, amount }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm font-bold w-8" style={{ color: "#64748b" }}>{emoji} {label}</span>
                <div className="flex-1 relative">
                  <input type="number" min={0} max={100} value={payouts[key]}
                    onChange={e => { setPayouts(p => ({ ...p, [key]: Number(e.target.value) })); setPayoutSaved(false); }}
                    className={cn(inputCls, "pr-7")} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#94a3b8" }}>%</span>
                </div>
                {group.buyInAmount > 0 && (
                  <span className="text-sm font-bold w-12 text-right" style={{ color: "#0891B2" }}>${amount}</span>
                )}
              </div>
            ))}
          </div>

          {payoutError && (
            <p className="text-xs mb-3" style={{ color: "#dc2626" }}>{payoutError}</p>
          )}
          {totalPct !== 100 && (
            <p className="text-xs mb-3" style={{ color: "#dc2626" }}>Must add up to exactly 100%</p>
          )}

          <Button onClick={savePayouts} loading={payoutSaving} disabled={totalPct !== 100} size="sm" className="w-full"
            leftIcon={payoutSaved ? <Check size={14} /> : <Trophy size={14} />}>
            {payoutSaved ? "Saved!" : "Save Payout Split"}
          </Button>
        </Card>

        {/* Invite Link */}
        <Card variant="glass" className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <Link2 size={18} strokeWidth={1.5} style={{ color: "#0891B2" }} />
            <span className="font-display text-xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
              Invite Link
            </span>
          </div>
          <div className="rounded-xl p-3 text-xs break-all mb-3 font-mono"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569" }}>
            {inviteUrl}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyInviteLink} variant="outline" size="sm" className="flex-1"
              leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />}>
              New Code
            </Button>
          </div>
          <p className="mt-3 text-[11px]" style={{ color: "#94a3b8" }}>
            Share this link with your group. Anyone with it can join.
          </p>
        </Card>
      </div>
    </div>
  );
}