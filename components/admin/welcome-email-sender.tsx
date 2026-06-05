"use client";

import { useState } from "react";
import { Mail, Send, Check, AlertCircle, Info, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Member, Group } from "@/lib/types";

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

interface WelcomeEmailSenderProps {
  group:     Group;
  members:   Member[];
  adminName: string;
}

interface MemberEmail {
  memberId: string;
  name:     string;
  email:    string;
  selected: boolean;
  isManual: boolean;
}

export function WelcomeEmailSender({ group, members, adminName }: WelcomeEmailSenderProps) {
  const [memberEmails, setMemberEmails] = useState<MemberEmail[]>(
    members.map(m => ({ memberId: m.id, name: m.name, email: "", selected: true, isManual: false }))
  );
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<{ sent: number; failed: number; message: string } | null>(null);

  const updateEmail   = (memberId: string, email: string) =>
    setMemberEmails(prev => prev.map(m => m.memberId === memberId ? { ...m, email } : m));

  const updateName    = (memberId: string, name: string) =>
    setMemberEmails(prev => prev.map(m => m.memberId === memberId ? { ...m, name } : m));

  const toggleSelect  = (memberId: string) =>
    setMemberEmails(prev => prev.map(m => m.memberId === memberId ? { ...m, selected: !m.selected } : m));

  const removeManual  = (memberId: string) =>
    setMemberEmails(prev => prev.filter(m => m.memberId !== memberId));

  const addManual = () => {
    const id = `manual_${Date.now()}`;
    setMemberEmails(prev => [...prev, { memberId: id, name: "", email: "", selected: true, isManual: true }]);
  };

  const selected  = memberEmails.filter(m => m.selected && m.email.includes("@"));
  const hasEmails = selected.length > 0;

  const handleSend = async () => {
    if (!hasEmails) return;
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberEmails:  selected.map(m => m.email),
          memberNames:   selected.map(m => m.name || "Member"),
          groupName:     group.name,
          adminName,
          rulesText:     "",
          buyInAmount:   group.buyInAmount,
          inviteCode:    group.passkey,
          scoringSystem: "25 pts exact score · 10 pts correct outcome · 20 pts KO advancement",
          adminFee:      0,
          payouts: {
            first:  Number(group.payouts.first.replace("%",  "")),
            second: Number(group.payouts.second.replace("%", "")),
            third:  Number(group.payouts.third.replace("%",  "")),
          },
        }),
      });
      const data = await res.json() as { sent: number; failed: number; message: string };
      setResult(data);
      setSent(true);
    } catch {
      setError("Failed to send. Check your network and try again.");
    } finally {
      setSending(false);
    }
  };

  const enteredCount  = memberEmails.filter(m => m.email.includes("@")).length;

  return (
    <div className="rounded-2xl p-5" style={glass}>
      <div className="flex items-center gap-2.5 mb-2">
        <Mail size={18} style={{ color: "#00D4FF" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">
          Welcome Emails
        </span>
      </div>
      <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
        Send personalized invites to your group members with rules, buy-in info, and a join link.
      </p>

      {/* Member email rows — always expanded */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>Member emails</span>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            {enteredCount} of {memberEmails.length} emails entered · {selected.length} selected
          </span>
        </div>

        <div className="space-y-2">
          {memberEmails.map(m => (
            <div key={m.memberId} className="flex items-center gap-2">
              {/* Checkbox */}
              <button onClick={() => toggleSelect(m.memberId)}
                className={cn("h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                  m.selected ? "border-accent bg-accent/20" : "border-white/20")}
                style={m.selected ? { borderColor: "rgb(var(--accent))" } : undefined}>
                {m.selected && <Check size={9} style={{ color: "rgb(var(--accent-glow))" }} />}
              </button>

              {/* Name */}
              {m.isManual ? (
                <input type="text" placeholder="Name"
                  value={m.name} onChange={e => updateName(m.memberId, e.target.value)}
                  className="w-24 shrink-0 px-2 py-2 rounded-lg text-xs text-white bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent" />
              ) : (
                <span className="text-xs font-bold text-white w-24 shrink-0 truncate">{m.name}</span>
              )}

              {/* Email */}
              <input type="email" placeholder="email@example.com"
                value={m.email} onChange={e => updateEmail(m.memberId, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs text-white bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent" />

              {/* Remove manual */}
              {m.isManual && (
                <button onClick={() => removeManual(m.memberId)}
                  className="shrink-0 text-pitch-600 hover:text-danger transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add member manually */}
      <button onClick={addManual}
        className="flex items-center gap-1.5 text-xs hover:text-white transition-colors mt-3 mb-5"
        style={{ color: "rgba(255,255,255,0.4)" }}>
        <UserPlus size={13} /> Add member manually
      </button>

      {/* Legal */}
      <div className="flex items-start gap-2 text-[10px] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
        <Info size={11} className="shrink-0 mt-0.5" />
        <span>
          Each email includes an unsubscribe link and is sent from your group admin account.
          By sending, you confirm recipients have agreed to receive Cup Clash emails.
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-danger mb-3">
          <AlertCircle size={13} />{error}
        </div>
      )}
      {sent && result && (
        <div className="flex items-center gap-2 text-xs text-success mb-3">
          <Check size={13} />{result.message}
        </div>
      )}

      <Button onClick={handleSend} loading={sending}
        disabled={!hasEmails || sending} size="sm" className="w-full"
        leftIcon={sent ? <Check size={14} /> : <Send size={14} />}>
        {sent
          ? "Emails sent!"
          : `Send invite to ${selected.length} member${selected.length !== 1 ? "s" : ""}`}
      </Button>
    </div>
  );
}