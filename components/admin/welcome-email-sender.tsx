"use client";

import { useState } from "react";
import { Mail, Send, Check, AlertCircle, Info, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";
import type { Group } from "@/lib/types";

interface WelcomeEmailSenderProps {
  group: Group;
  members: Member[];
  adminName: string;
}

interface MemberEmail {
  memberId: string;
  name: string;
  email: string;
  selected: boolean;
}

export function WelcomeEmailSender({ group, members, adminName }: WelcomeEmailSenderProps) {
  const [memberEmails, setMemberEmails] = useState<MemberEmail[]>(
    members.map(m => ({ memberId: m.id, name: m.name, email: "", selected: true }))
  );
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [result,   setResult]   = useState<{ sent: number; failed: number; message: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const updateEmail = (memberId: string, email: string) =>
    setMemberEmails(prev => prev.map(m => m.memberId === memberId ? { ...m, email } : m));

  const toggleSelect = (memberId: string) =>
    setMemberEmails(prev => prev.map(m => m.memberId === memberId ? { ...m, selected: !m.selected } : m));

  const selected   = memberEmails.filter(m => m.selected && m.email.includes("@"));
  const hasEmails  = selected.length > 0;

  const handleSend = async () => {
    if (!hasEmails) return;
    setSending(true); setError(null);

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberEmails: selected.map(m => m.email),
          memberNames:  selected.map(m => m.name),
          groupName:    group.name,
          adminName,
          rulesText:    "",
          buyInAmount:  group.buyInAmount,
          inviteCode:   group.id,
          scoringSystem: "3 pts exact · 2 pts winner + exact goals · 1 pt correct outcome",
          adminFee:     0,
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
    } catch (e) {
      setError("Failed to send emails. Check your Resend configuration.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <Mail size={18} style={{ color: "rgb(var(--accent-glow))" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">
          Welcome Emails
        </span>
      </div>

      <p className="text-xs text-pitch-500 mb-4">
        Send personalized invites to your group members with rules, buy-in info, and a join link.
      </p>

      {/* Deliverability warning */}
      <div className="flex items-start gap-2.5 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-xs text-warning mb-4">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-0.5">Deliverability notice</div>
          Emails may land in spam if your domain isn't verified in Resend.
          Verify at <span className="underline">resend.com/domains</span> for best results.
          Inform members to check their spam folder if they don't receive the invite.
        </div>
      </div>

      {/* Member email inputs */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="label-caps">Member emails</span>
          <button onClick={() => setExpanded(v => !v)}
            className="text-[10px] text-pitch-500 hover:text-white transition-colors uppercase tracking-widest">
            {expanded ? "Collapse" : "Edit emails"}
          </button>
        </div>

        {expanded ? (
          <div className="space-y-2">
            {memberEmails.map(m => (
              <div key={m.memberId} className="flex items-center gap-2">
                <button onClick={() => toggleSelect(m.memberId)}
                  className={cn("h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                    m.selected ? "border-accent bg-accent/20" : "border-white/20")}
                  style={m.selected ? { borderColor: "rgb(var(--accent))" } : undefined}>
                  {m.selected && <Check size={9} style={{ color: "rgb(var(--accent-glow))" }} />}
                </button>
                <span className="text-xs font-bold text-white w-20 shrink-0 truncate">{m.name}</span>
                <input type="email" placeholder="email@example.com"
                  value={m.email} onChange={e => updateEmail(m.memberId, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-pitch-400">
            {memberEmails.filter(m => m.email).length} of {memberEmails.length} emails entered
            {" · "}{selected.length} selected to receive invite
          </div>
        )}
      </div>

      {/* Add new member */}
      <div className="flex items-center gap-2 mb-5">
        <button className="flex items-center gap-1.5 text-xs text-pitch-500 hover:text-white transition-colors">
          <UserPlus size={13} /> Add member manually
        </button>
      </div>

      {/* Legal notice */}
      <div className="flex items-start gap-2 text-[10px] text-pitch-600 mb-4">
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
          <Check size={13} />
          {result.message}
        </div>
      )}

      <Button onClick={handleSend} loading={sending}
        disabled={!hasEmails || sending} size="sm" className="w-full"
        leftIcon={sent ? <Check size={14} /> : <Send size={14} />}>
        {sent ? "Emails sent!" : `Send invite to ${selected.length} member${selected.length !== 1 ? "s" : ""}`}
      </Button>
    </Card>
  );
}
