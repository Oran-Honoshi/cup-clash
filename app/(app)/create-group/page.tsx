"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, DollarSign, Trophy, AlertCircle, Copy, Check,
  ArrowRight, Zap, ChevronDown,
} from "lucide-react";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function createClient() { return createSupabaseClient(); }

const FEATURED_MATCHES = [
  { id: "final",  label: "Final",              detail: "MetLife Stadium · Jul 19" },
  { id: "sf-1",   label: "Semi-Final 1",        detail: "MetLife Stadium · Jul 14" },
  { id: "sf-2",   label: "Semi-Final 2",        detail: "AT&T Stadium · Jul 15"    },
  { id: "qf-1",   label: "Quarter-Final 1",     detail: "MetLife Stadium · Jul 9"  },
  { id: "qf-2",   label: "Quarter-Final 2",     detail: "Rose Bowl · Jul 10"       },
  { id: "g001",   label: "Opening: Mexico vs SA", detail: "Estadio Azteca · Jun 11" },
];

const groupSchema = z.object({
  name:         z.string().min(3, "Group name must be at least 3 characters"),
  buyIn:        z.number().min(0).max(10000),
  payoutFirst:  z.number().min(0).max(100),
  payoutSecond: z.number().min(0).max(100),
  payoutThird:  z.number().min(0).max(100),
}).refine(
  d => d.payoutFirst + d.payoutSecond + d.payoutThird === 100,
  { message: "Payouts must add up to exactly 100%", path: ["payoutFirst"] }
);

const inputCls = [
  "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all",
  "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400",
  "focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100",
].join(" ");

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [passkey,         setPasskey]         = useState<string | null>(null);
  const [groupName,       setGroupName]       = useState<string>("");
  const [copied,          setCopied]          = useState(false);
  const [groupType,       setGroupType]       = useState<"tournament" | "single_match">("tournament");
  const [selectedMatch,   setSelectedMatch]   = useState(FEATURED_MATCHES[0].id);
  const [showMatchPicker, setShowMatchPicker] = useState(false);

  const [form, setForm] = useState({
    name: "", buyIn: 20,
    payoutFirst: 60, payoutSecond: 30, payoutThird: 10,
  });

  const update = (k: keyof typeof form, v: number | string) =>
    setForm(f => ({ ...f, [k]: v }));

  const totalPct = form.payoutFirst + form.payoutSecond + form.payoutThird;
  const selectedMatchLabel = FEATURED_MATCHES.find(m => m.id === selectedMatch)?.label ?? selectedMatch;

  const handleCreate = async () => {
    const result = groupSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Invalid form");
      return;
    }
    setLoading(true); setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to create a group");
      setLoading(false); return;
    }

    // 1. Create the group
    const { data: groupData, error: createError } = await supabase
      .from("groups")
      .insert({
        name:            form.name,
        admin_id:        user.id,
        buy_in_amount:   form.buyIn,
        payout_first:    form.payoutFirst,
        payout_second:   form.payoutSecond,
        payout_third:    form.payoutThird,
        max_members:     100,
        group_type:      groupType,
        single_match_id: groupType === "single_match" ? selectedMatch : null,
        enrollment_fee_cents: 200,
      } as Record<string, unknown>)
      .select("id, passkey")
      .single();

    if (createError || !groupData) {
      setError(createError?.message ?? "Failed to create group");
      setLoading(false); return;
    }

    const { id: groupId, passkey: groupPasskey } = groupData as { id: string; passkey: string };

    // 2. Add admin as a member with payment_status paid
    //    Use upsert to avoid RLS infinite recursion on insert
    const { error: memberError } = await supabase
      .from("group_members")
      .upsert({
        group_id:       groupId,
        user_id:        user.id,
        payment_status: "paid",
        can_predict:    true,
        joined_at:      new Date().toISOString(),
      }, { onConflict: "user_id,group_id" });

    if (memberError) {
      console.error("Member insert error:", memberError);
      // Non-fatal — group was created, passkey still works
    }

    setGroupName(form.name);
    setPasskey(groupPasskey);
    setLoading(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${passkey}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (passkey) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <div className="label-caps mb-1">Group created</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
            Share your group!
          </h1>
        </div>
        <Card variant="glass-accent" className="p-6 text-center">
          <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
            <Check size={28} style={{ color: "#0B141B" }} />
          </div>
          <h2 className="font-display text-2xl uppercase mb-1" style={{ color: "#0F172A" }}>{groupName}</h2>
          <p className="text-sm mb-2" style={{ color: "#64748b" }}>
            Share this passkey or link — members pay $2 to join.
          </p>
          {/* Passkey */}
          <div className="rounded-2xl p-4 mb-4 text-center"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>Entry Passkey</div>
            <div className="font-mono font-black text-4xl tracking-widest" style={{ color: "#0F172A" }}>{passkey}</div>
          </div>
          {/* Join link */}
          <div className="rounded-xl px-4 py-3 font-mono text-sm break-all mb-3"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569" }}>
            {typeof window !== "undefined" ? window.location.origin : "https://cupclash.live"}/join/{passkey}
          </div>
          <Button onClick={copyInviteLink} variant="outline" size="md" className="w-full mb-3"
            leftIcon={copied ? <Check size={15} /> : <Copy size={15} />}>
            {copied ? "Copied!" : "Copy invite link"}
          </Button>
          <Button onClick={() => { window.location.href = "/dashboard"; }} size="md" className="w-full"
            rightIcon={<ArrowRight size={15} />}>
            Go to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <div className="label-caps mb-1">New group</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Create your league
        </h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Free to create. Members pay $2 each to join the leaderboard.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Group type */}
      <Card variant="glass" className="p-5">
        <div className="label-caps mb-3">Group type</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { type: "tournament" as const, icon: Trophy, label: "Full Tournament", desc: "All 104 matches · Jun 11–Jul 19" },
            { type: "single_match" as const, icon: Zap,  label: "Single Match",   desc: "Pick one specific match" },
          ].map(({ type, icon: Icon, label, desc }) => (
            <button key={type} onClick={() => setGroupType(type)}
              className="rounded-xl p-4 text-left border transition-all"
              style={groupType === type ? {
                background: "rgba(0,212,255,0.08)",
                borderColor: "rgba(0,212,255,0.4)",
              } : {
                background: "rgba(255,255,255,0.5)",
                borderColor: "#e2e8f0",
              }}>
              <Icon size={18} className="mb-2"
                style={{ color: groupType === type ? "#0891B2" : "#94a3b8" }} />
              <div className="font-bold text-sm" style={{ color: "#0F172A" }}>{label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{desc}</div>
            </button>
          ))}
        </div>

        {groupType === "single_match" && (
          <div className="mt-4">
            <div className="label-caps mb-2">Select match</div>
            <div className="relative">
              <button onClick={() => setShowMatchPicker(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm"
                style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}>
                <span>{selectedMatchLabel}</span>
                <ChevronDown size={15} style={{ color: "#94a3b8" }} />
              </button>
              {showMatchPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-10"
                  style={{ background: "white", borderColor: "#e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
                  {FEATURED_MATCHES.map(m => (
                    <button key={m.id}
                      onClick={() => { setSelectedMatch(m.id); setShowMatchPicker(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50"
                      style={{ color: selectedMatch === m.id ? "#0891B2" : "#475569" }}>
                      <span className="font-bold">{m.label}</span>
                      <span className="text-xs" style={{ color: "#94a3b8" }}>{m.detail}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Group name */}
      <Card variant="glass" className="p-5">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>
          Group name
        </label>
        <div className="relative">
          <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
          <input type="text" placeholder="e.g. Office World Cup 2026"
            value={form.name} onChange={e => update("name", e.target.value)}
            className={inputCls} />
        </div>
      </Card>

      {/* Buy-in tracker */}
      <Card variant="glass" className="p-5">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>
          Buy-in per player (for tracking only)
        </label>
        <div className="relative">
          <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
          <input type="number" min={0} placeholder="0" value={form.buyIn}
            onChange={e => update("buyIn", Number(e.target.value))}
            className={inputCls} />
        </div>
        <p className="mt-1.5 text-xs" style={{ color: "#94a3b8" }}>
          This is for your records only — Cup Clash does not handle the money.
        </p>
      </Card>

      {/* Payout split */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={15} style={{ color: "#00D4FF" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Payout split</span>
          <span className={cn("ml-auto text-xs font-bold", totalPct === 100 ? "text-green-600" : "text-red-500")}>
            {totalPct}% / 100%
          </span>
        </div>
        <div className="space-y-3">
          {[
            { label: "1st", key: "payoutFirst"  as const, color: "#d97706" },
            { label: "2nd", key: "payoutSecond" as const, color: "#64748b" },
            { label: "3rd", key: "payoutThird"  as const, color: "#b45309" },
          ].map(({ label, key, color }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                {label[0]}
              </div>
              <span className="w-8 text-sm font-bold" style={{ color: "#475569" }}>{label}</span>
              <input type="number" min={0} max={100} value={form[key]}
                onChange={e => update(key, Number(e.target.value))}
                className="flex-1 rounded-xl px-3 py-2 text-sm text-right border focus:outline-none"
                style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }} />
              <span className="text-sm w-4" style={{ color: "#94a3b8" }}>%</span>
              {form.buyIn > 0 && (
                <span className="text-xs w-14 text-right" style={{ color: "#64748b" }}>
                  ${Math.round((100 * form.buyIn) * form[key] / 100)}
                </span>
              )}
            </div>
          ))}
        </div>
        {totalPct !== 100 && (
          <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: "#dc2626" }}>
            <AlertCircle size={12} /> Must add up to exactly 100%
          </p>
        )}
      </Card>

      <Button onClick={handleCreate} loading={loading}
        disabled={!form.name || totalPct !== 100} size="lg" className="w-full"
        rightIcon={<ArrowRight size={18} />}>
        Create group — Free
      </Button>
    </div>
  );
}