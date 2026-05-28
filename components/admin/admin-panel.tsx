"use client";

import { useState, useEffect } from "react";
import { Users, Trophy, Copy, Check, RefreshCw, CheckCircle, XCircle, Link2 } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
  group:          Group;
  initialMembers: Member[];
}

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

export function AdminPanel({ group, initialMembers }: AdminPanelProps) {
  const [members,      setMembers]      = useState<Member[]>(initialMembers);
  const [payouts,      setPayouts]      = useState({
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
      setInviteUrl(`${window.location.origin}/join/${group.passkey}`);
    }
  }, [group.passkey]);

  const paidCount    = members.filter(m => m.paid).length;
  const totalPot     = members.length * group.buyInAmount;
  const paidAmount   = paidCount * group.buyInAmount;
  const totalPct     = payouts.first + payouts.second + payouts.third;
  const firstAmount  = Math.round(paidAmount * payouts.first  / 100);
  const secondAmount = Math.round(paidAmount * payouts.second / 100);
  const thirdAmount  = Math.round(paidAmount * payouts.third  / 100);

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

  return (
    <div className="grid gap-5 lg:grid-cols-2">

      {/* ── Member Payments ── */}
      <div className="rounded-2xl p-5" style={glass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Users size={18} strokeWidth={1.5} style={{ color: "#00D4FF" }} />
            <span className="font-display text-xl uppercase tracking-tight text-white">Member Payments</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
            {paidCount}/{members.length} Paid
          </span>
        </div>

        {/* Progress bar */}
        <div className="overflow-hidden mb-5" style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full transition-all"
            style={{
              width: `${members.length ? (paidCount / members.length) * 100 : 0}%`,
              background: "linear-gradient(90deg, #00D4FF, #00FF88)",
              borderRadius: 3,
            }} />
        </div>

        {/* Member list */}
        <div className="space-y-1">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-2.5 border-b last:border-0"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate text-white">{m.name}</div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{m.country}</div>
              </div>
              <NudgeButton
                memberName={m.name} matchLabel="Next match"
                groupName={group.name} minutesToKickoff={90}
                hasPredicted={false} size="sm"
              />
              {group.buyInAmount > 0 && (
                <span className="text-sm font-bold shrink-0" style={{ color: "rgba(255,255,255,0.6)" }}>
                  ${group.buyInAmount}
                </span>
              )}
              <button onClick={() => togglePaid(m.id, m.paid)}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-2 rounded-full transition-all"
                style={m.paid ? {
                  background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.25)", color: "#00FF88",
                } : {
                  background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171",
                }}>
                {m.paid ? <><CheckCircle size={12} /> Paid</> : <><XCircle size={12} /> Pending</>}
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Total pot collected</div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-extrabold" style={{ fontSize: 40, lineHeight: 1, color: "#00FF88" }}>${paidAmount}</span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>/ ${totalPot}</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">

        {/* ── Payout Split ── */}
        <div className="rounded-2xl p-5" style={glass}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
              <span className="font-display text-xl uppercase tracking-tight text-white">Payout Split</span>
            </div>
            <span className="text-xs font-bold"
              style={{ color: totalPct === 100 ? "#00FF88" : "#f87171" }}>
              {totalPct}% / 100%
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {([
              { label: "1st", key: "first"  as const, amount: firstAmount,  color: "#fbbf24" },
              { label: "2nd", key: "second" as const, amount: secondAmount, color: "#94a3b8" },
              { label: "3rd", key: "third"  as const, amount: thirdAmount,  color: "#f97316" },
            ]).map(({ label, key, amount, color }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                  {label[0]}
                </div>
                <span className="text-sm font-bold w-8" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <div className="flex-1 relative">
                  <input
                    type="number" min={0} max={100} value={payouts[key]}
                    onChange={e => { setPayouts(p => ({ ...p, [key]: Number(e.target.value) })); setPayoutSaved(false); }}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-right font-bold pr-7 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: color,
                    }}
                    onFocus={e => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 2px ${color}20`; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "rgba(255,255,255,0.3)" }}>%</span>
                </div>
                {group.buyInAmount > 0 && (
                  <span className="text-sm font-bold w-12 text-right" style={{ color: "#00D4FF" }}>${amount}</span>
                )}
              </div>
            ))}
          </div>

          {(payoutError || totalPct !== 100) && (
            <p className="text-xs mb-3" style={{ color: "#f87171" }}>
              {payoutError ?? "Must add up to exactly 100%"}
            </p>
          )}

          <Button onClick={savePayouts} loading={payoutSaving} disabled={totalPct !== 100} size="sm" className="w-full"
            leftIcon={payoutSaved ? <Check size={14} /> : <Trophy size={14} />}>
            {payoutSaved ? "Saved!" : "Save Payout Split"}
          </Button>
        </div>

        {/* ── Invite Link ── */}
        <div className="rounded-2xl p-5" style={glass}>
          <div className="flex items-center gap-2.5 mb-4">
            <Link2 size={18} strokeWidth={1.5} style={{ color: "#00D4FF" }} />
            <span className="font-display text-xl uppercase tracking-tight text-white">Invite Link</span>
          </div>
          <div className="rounded-xl p-3 text-xs break-all mb-3 font-mono"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
            {inviteUrl}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyInviteLink} variant="outline" size="sm" className="flex-1"
              leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />}>New Code</Button>
          </div>
          <p className="mt-3 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Share this link with your group. Anyone with it can join.
          </p>
        </div>
      </div>
    </div>
  );
}