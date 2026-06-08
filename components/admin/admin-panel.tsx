"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Trophy, Copy, Check, RefreshCw, CheckCircle, XCircle, Link2, Trash2, UserCog, Shield, Crown, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { NudgeButton } from "@/components/admin/nudge-button";
import { BonusQuestionsAdmin } from "@/components/admin/bonus-questions-admin";
import { cn } from "@/lib/utils";
import type { Group, Member } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";

type MemberRole = 'member' | 'admin' | 'owner';

interface AdminPanelProps {
  group:          Group;
  initialMembers: Member[];
  isOwner:        boolean;
  currentUserId:  string;
}

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

export function AdminPanel({ group, initialMembers, isOwner, currentUserId }: AdminPanelProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [members,      setMembers]      = useState<Member[]>(initialMembers);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,          setDeleting]          = useState(false);
  const [payouts,      setPayouts]      = useState({
    first:  Number(group.payouts.first.replace("%",  "")),
    second: Number(group.payouts.second.replace("%", "")),
    third:  Number(group.payouts.third.replace("%",  "")),
  });
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutSaved,  setPayoutSaved]  = useState(false);
  const [payoutError,  setPayoutError]  = useState<string | null>(null);
  const [copied,          setCopied]          = useState(false);
  const [inviteUrl,       setInviteUrl]       = useState("");
  const [paymentLinkEdit, setPaymentLinkEdit] = useState(group.paymentLink ?? "");
  const [editingLink,     setEditingLink]     = useState(false);
  const [savingLink,      setSavingLink]      = useState(false);
  const [linkSaved,       setLinkSaved]       = useState(false);
  const [transferTo,      setTransferTo]      = useState("");
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [transferring,    setTransferring]    = useState(false);
  const [transferError,   setTransferError]   = useState<string | null>(null);
  const [copiedTransfer,  setCopiedTransfer]  = useState(false);
  const [roleUpdating,    setRoleUpdating]    = useState<string | null>(null);
  const [openRoleMenu,    setOpenRoleMenu]    = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/join/${group.passkey}`);
    }
  }, [group.passkey]);

  useEffect(() => {
    if (!openRoleMenu) return;
    const close = () => setOpenRoleMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openRoleMenu]);

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
    const sb = createClient();
    await sb.from("group_members")
      .update({ paid: !currentPaid } as Record<string, boolean>)
      .eq("user_id", memberId).eq("group_id", group.id);
  };

  const setMemberRole = async (memberId: string, role: MemberRole) => {
    setRoleUpdating(memberId);
    setOpenRoleMenu(null);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token ?? "";
    await fetch("/api/admin/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ groupId: group.id, targetUserId: memberId, role }),
    });
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
    setRoleUpdating(null);
  };

  const savePayouts = async () => {
    if (totalPct !== 100) { setPayoutError(t("adm_payout_err")); return; }
    setPayoutSaving(true); setPayoutError(null);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const sb = createClient();
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

  const savePaymentLink = async () => {
    setSavingLink(true);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token ?? "";
    await fetch("/api/admin/save-group-setting", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ groupId: group.id, field: "payment_link", value: paymentLinkEdit.trim() || null }),
    });
    setSavingLink(false); setLinkSaved(true); setEditingLink(false);
    setTimeout(() => setLinkSaved(false), 2500);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.push("/groups");
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo) return;
    setTransferring(true);
    setTransferError(null);
    try {
      const sb = createClient();
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token ?? "";
      const res = await fetch("/api/admin/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ groupId: group.id, newAdminUserId: transferTo }),
      });
      const result = await res.json() as { success?: boolean; error?: string };
      if (!result.success) throw new Error(result.error ?? "Transfer failed");
      router.push("/groups");
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
      setTransferring(false);
      setShowTransferConfirm(false);
    }
  };

  return (
    <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-2">

      {/* ── Member Payments ── */}
      {group.isCorporatePaid ? (
        <div className="rounded-2xl p-5 flex items-center gap-3" style={{ ...glass, border: "1px solid rgba(0,255,136,0.2)" }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div className="font-display text-base uppercase tracking-tight text-white mb-0.5">Corporate Group</div>
            <div className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>All members join free and ad-free</div>
          </div>
        </div>
      ) : (
      <div className="rounded-2xl p-5" style={glass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Users size={18} strokeWidth={1.5} style={{ color: "#00D4FF" }} />
            <span className="font-display text-xl uppercase tracking-tight text-white">{t("adm_payments")}</span>
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
          {members.map(m => {
            const memberRole: MemberRole = m.role ?? 'member';
            const isThisOwner = memberRole === 'owner';
            const isThisAdmin = memberRole === 'admin';
            const canManageRole = isOwner && m.id !== currentUserId && !isThisOwner;
            return (
            <div key={m.id} className="flex items-center gap-2 sm:gap-3 py-2.5 border-b last:border-0"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-bold truncate text-white">{m.name}</span>
                  {isThisOwner && (
                    <span className="flex items-center gap-0.5 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                      <Crown size={9} /> Owner
                    </span>
                  )}
                  {isThisAdmin && (
                    <span className="flex items-center gap-0.5 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}>
                      <Shield size={9} /> Admin
                    </span>
                  )}
                </div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{m.country}</div>
              </div>
              {canManageRole && (
                <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenRoleMenu(openRoleMenu === m.id ? null : m.id); }}
                    disabled={roleUpdating === m.id}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                    {roleUpdating === m.id ? "…" : <ChevronDown size={10} />}
                  </button>
                  {openRoleMenu === m.id && (
                    <div className="absolute right-0 top-full mt-1 z-[200] rounded-xl overflow-hidden min-w-[140px]"
                      style={{ background: "rgba(18,14,38,0.98)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                      {isThisAdmin ? (
                        <button onClick={e => { e.stopPropagation(); setMemberRole(m.id, 'member'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-bold flex items-center gap-2 transition-colors hover:bg-white/5"
                          style={{ color: "#f87171" }}>
                          <Shield size={12} /> Remove Admin
                        </button>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setMemberRole(m.id, 'admin'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-bold flex items-center gap-2 transition-colors hover:bg-white/5"
                          style={{ color: "#00D4FF" }}>
                          <Shield size={12} /> Make Co-Admin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="hidden sm:block">
                <NudgeButton
                  memberName={m.name} matchLabel="Next match"
                  groupName={group.name} minutesToKickoff={90}
                  hasPredicted={false} size="sm"
                />
              </div>
              {group.buyInAmount > 0 && (
                <span className="hidden sm:inline text-sm font-bold shrink-0" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {group.currencySymbol}{group.buyInAmount}
                </span>
              )}
              <button onClick={() => togglePaid(m.id, m.paid)}
                className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-2 rounded-full transition-all shrink-0"
                style={m.paid ? {
                  background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.25)", color: "#00FF88",
                } : {
                  background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171",
                }}>
                {m.paid
                  ? <><CheckCircle size={12} /><span className="hidden sm:inline">Paid</span></>
                  : <><XCircle size={12} /><span className="hidden sm:inline">Unpaid</span></>}
              </button>
            </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Total pot collected</div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-extrabold" style={{ fontSize: 40, lineHeight: 1, color: "#00FF88" }}>{group.currencySymbol}{paidAmount}</span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>/ {group.currencySymbol}{totalPot}</span>
          </div>
        </div>
      </div>
      )}

      <div className="space-y-5">

        {/* ── Payout Split ── */}
        <div className="rounded-2xl p-5" style={glass}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
              <span className="font-display text-xl uppercase tracking-tight text-white">{t("adm_payout_split")}</span>
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
                  <span className="text-sm font-bold w-12 text-right" style={{ color: "#00D4FF" }}>{group.currencySymbol}{amount}</span>
                )}
              </div>
            ))}
          </div>

          {(payoutError || totalPct !== 100) && (
            <p className="text-xs mb-3" style={{ color: "#f87171" }}>
              {payoutError ?? t("adm_payout_err")}
            </p>
          )}

          <Button onClick={savePayouts} loading={payoutSaving} disabled={totalPct !== 100} size="sm" className="w-full"
            leftIcon={payoutSaved ? <Check size={14} /> : <Trophy size={14} />}>
            {payoutSaved ? t("adm_saved") : t("adm_save_payouts")}
          </Button>
        </div>

        {/* ── Prizes ── */}
        {group.corporatePrize && (
          <div className="rounded-2xl p-5" style={glass}>
            <div className="flex items-center gap-2.5 mb-3">
              <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
              <span className="font-display text-xl uppercase tracking-tight text-white">Prizes</span>
            </div>
            <div className="space-y-2">
              {group.corporatePrize.split("|").map(r => r.trim()).filter(Boolean).map(reward => (
                <div key={reward} className="rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Invite Link ── */}
        <div className="rounded-2xl p-5" style={glass}>
          <div className="flex items-center gap-2.5 mb-4">
            <Link2 size={18} strokeWidth={1.5} style={{ color: "#00D4FF" }} />
            <span className="font-display text-xl uppercase tracking-tight text-white">{t("adm_invite")}</span>
          </div>
          <div className="rounded-xl p-3 text-xs break-all mb-3 font-mono"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
            {inviteUrl}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyInviteLink} variant="outline" size="sm" className="flex-1"
              leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
              {copied ? t("adm_copied") : t("adm_copy")}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />}>{t("adm_new_code")}</Button>
          </div>
          <p className="mt-3 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {t("adm_invite_hint")}
          </p>
        </div>

        {/* ── Payment Collection ── */}
        <div className="rounded-2xl p-5" style={glass}>
          <div className="flex items-center gap-2.5 mb-4">
            <span style={{ fontSize: 18 }}>💳</span>
            <span className="font-display text-xl uppercase tracking-tight text-white">Payment Collection</span>
          </div>

          {editingLink ? (
            <div className="space-y-3">
              <input
                type="url" value={paymentLinkEdit}
                onChange={e => setPaymentLinkEdit(e.target.value)}
                placeholder="https://bit.ly/your-paybox-link"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontFamily: "var(--font-ui)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
              />
              <div className="flex gap-2">
                <Button onClick={savePaymentLink} loading={savingLink} size="sm" className="flex-1"
                  leftIcon={linkSaved ? <Check size={14} /> : undefined}>
                  {linkSaved ? "Saved!" : "Save Link"}
                </Button>
                <Button onClick={() => { setEditingLink(false); setPaymentLinkEdit(group.paymentLink ?? ""); }} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {group.paymentLink ? (
                <a href={group.paymentLink} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                  💳 Open Payment Link
                </a>
              ) : (
                <div className="rounded-xl px-4 py-3 text-xs text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
                  No payment link set — add one below
                </div>
              )}
              <Button onClick={() => setEditingLink(true)} variant="outline" size="sm" className="w-full"
                leftIcon={<Link2 size={14} />}>
                {group.paymentLink ? "Edit Link" : "Add Link"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Bonus Questions */}
      <BonusQuestionsAdmin groupId={group.id} />

      {/* Transfer Admin Role — owner only */}
      {isOwner && <div className="rounded-2xl p-5" style={{ ...glass, border: "1px solid rgba(251,191,36,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <UserCog size={16} style={{ color: "#fbbf24" }} />
          <span className="font-display text-lg uppercase tracking-tight" style={{ color: "#fbbf24" }}>Transfer Admin Role</span>
        </div>
        <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          This will make another member the admin. You will become a regular member.
        </p>

        <div className="rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            To transfer admin role, the new admin must first join the group using the invite link.
          </p>
          <button
            onClick={() => { navigator.clipboard.writeText(inviteUrl); setCopiedTransfer(true); setTimeout(() => setCopiedTransfer(false), 2000); }}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
            style={{ color: "#fbbf24", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {copiedTransfer ? <Check size={12} /> : <Copy size={12} />}
            {copiedTransfer ? "Copied!" : "Copy Invite Link"}
          </button>
        </div>

        {members.filter(m => m.id !== group.admin).length === 0 ? (
          <div className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No other members yet. Invite members to join first, then you can transfer admin role.</div>
        ) : (
          <div className="space-y-3">
            <select
              value={transferTo}
              onChange={e => setTransferTo(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: transferTo ? "#fff" : "rgba(255,255,255,0.35)" }}
            >
              <option value="" disabled>Select new admin…</option>
              {members.filter(m => m.id !== group.admin).map(m => (
                <option key={m.id} value={m.id} style={{ background: "#0B141B" }}>{m.name}</option>
              ))}
            </select>
            {transferError && (
              <p className="text-xs" style={{ color: "#f87171" }}>{transferError}</p>
            )}
            <button
              onClick={() => setShowTransferConfirm(true)}
              disabled={!transferTo}
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
              <UserCog size={14} /> Transfer Admin
            </button>
          </div>
        )}
      </div>}

      {isOwner && showTransferConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "rgba(18,14,38,0.98)", border: "1px solid rgba(251,191,36,0.3)" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.12)" }}>
                <UserCog size={18} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <div className="font-display text-lg uppercase font-black text-white">Transfer Admin?</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>This cannot be undone</div>
              </div>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Are you sure? You will lose admin access and become a regular member.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTransferConfirm(false)}
                disabled={transferring}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferring}
                className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                {transferring ? "Transferring…" : "Yes, Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone — owner only */}
      {isOwner && <div className="rounded-2xl p-5" style={{ ...glass, border: "1px solid rgba(239,68,68,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <Trash2 size={16} style={{ color: "#f87171" }} />
          <span className="font-display text-lg uppercase tracking-tight" style={{ color: "#f87171" }}>{t("adm_danger")}</span>
        </div>
        <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          {t("adm_danger_warn")}
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          <Trash2 size={14} /> {t("grp_delete")}
        </button>
      </div>}

      {isOwner && showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "rgba(18,14,38,0.98)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>
                <Trash2 size={18} style={{ color: "#f87171" }} />
              </div>
              <div>
                <div className="font-display text-lg uppercase font-black text-white">{t("grp_del_title")}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t("grp_del_undo")}</div>
              </div>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t("adm_del_body")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                {t("common_cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>
                {deleting ? t("grp_deleting") : t("common_delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
