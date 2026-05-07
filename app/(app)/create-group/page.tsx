"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, DollarSign, Trophy, AlertCircle, Copy, Check,
  ArrowRight, Zap, Calendar, ChevronDown,
} from "lucide-react";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const TIERS = [
  { label: "Free",       max: 3,  price: 0,   paddleKey: ""           },
  { label: "Startup",    max: 10, price: 20,  paddleKey: "startup"    },
  { label: "Pro",        max: 30, price: 50,  paddleKey: "pro"        },
  { label: "Enterprise", max: 60, price: 100, paddleKey: "enterprise" },
];

// Key upcoming matches for single-match groups
const FEATURED_MATCHES = [
  { id: "final",  label: "Final",                  detail: "MetLife Stadium · Jul 19" },
  { id: "sf-1",   label: "Semi-Final 1",               detail: "MetLife Stadium · Jul 21" },
  { id: "sf-2",   label: "Semi-Final 2",               detail: "AT&T Stadium · Jul 22"    },
  { id: "qf-1",   label: "Quarter-Final 1",            detail: "MetLife Stadium · Jul 15" },
  { id: "qf-2",   label: "Quarter-Final 2",            detail: "SoFi Stadium · Jul 15"   },
  { id: "qf-3",   label: "Quarter-Final 3",            detail: "AT&T Stadium · Jul 16"   },
  { id: "qf-4",   label: "Quarter-Final 4",            detail: "Levi's Stadium · Jul 16" },
  { id: "g001",   label: "Opening Match: Mexico vs SA", detail: "Estadio Azteca · Jun 11" },
];

const groupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  buyIn: z.number().min(0).max(10000),
  payoutFirst:  z.number().min(0).max(100),
  payoutSecond: z.number().min(0).max(100),
  payoutThird:  z.number().min(0).max(100),
}).refine(
  (d) => d.payoutFirst + d.payoutSecond + d.payoutThird === 100,
  { message: "Payouts must add up to exactly 100%", path: ["payoutFirst"] }
);

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [inviteCode,   setInviteCode]   = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);
  const [selectedTier, setSelectedTier] = useState(1);
  const [groupType,    setGroupType]    = useState<"tournament" | "single_match">("tournament");
  const [selectedMatch, setSelectedMatch] = useState<string>(FEATURED_MATCHES[0].id);
  const [showMatchPicker, setShowMatchPicker] = useState(false);

  // Single match extra options
  const [singleOpts, setSingleOpts] = useState({
    yellowCards: false, redCards: false,
    corners: false, extraTime: false, penalties: false,
  });

  const [form, setForm] = useState({
    name: "",
    buyIn: 20,
    payoutFirst: 60,
    payoutSecond: 30,
    payoutThird: 10,
  });

  const update = (k: keyof typeof form, v: number | string) =>
    setForm(f => ({ ...f, [k]: v }));

  const totalPct = form.payoutFirst + form.payoutSecond + form.payoutThird;
  const pot = TIERS[selectedTier].max * form.buyIn;
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

    const { data, error: createError } = await supabase
      .from("groups")
      .insert({
        name:           form.name,
        admin_id:       user.id,
        buy_in_amount:  form.buyIn,
        payout_first:   form.payoutFirst,
        payout_second:  form.payoutSecond,
        payout_third:   form.payoutThird,
        max_members:    TIERS[selectedTier].max,
        group_type:     groupType,
        single_match_id: groupType === "single_match" ? selectedMatch : null,
      } as Record<string, unknown>)
      .select("id, invite_code")
      .single();

    if (createError || !data) {
      setError(createError?.message ?? "Failed to create group");
      setLoading(false); return;
    }

    const groupData = data as { id: string; invite_code: string };

    await supabase.from("group_members").insert({
      group_id: groupData.id, user_id: user.id, paid: true,
    } as Record<string, unknown>);

    if (TIERS[selectedTier].price === 0) {
      setInviteCode(groupData.invite_code);
      setLoading(false); return;
    }

    try {
      const res = await fetch("/api/paddle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: TIERS[selectedTier].paddleKey,
          groupId: groupData.id, groupName: form.name,
        }),
      });
      const { url, error: paddleError } = await res.json() as { url?: string; error?: string };
      if (paddleError || !url) throw new Error(paddleError ?? "No URL");
      window.location.href = url;
    } catch {
      setInviteCode(groupData.invite_code);
    }
    setLoading(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // ── Success state
  if (inviteCode) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <div className="label-caps mb-1">Group created</div>
          <h1 className="font-display text-4xl uppercase text-white">Share the link</h1>
        </div>
        <Card variant="glass-accent" className="p-6 text-center">
          <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}>
            <Check size={28} className="text-white" />
          </div>
          <h2 className="font-display text-2xl uppercase text-white mb-1">{form.name}</h2>
          {groupType === "single_match" && (
            <p className="text-xs text-pitch-400 mb-2">Single match: {selectedMatchLabel}</p>
          )}
          <p className="text-sm text-pitch-400 mb-6">Your group is ready. Share this link.</p>
          <div className="glass rounded-xl p-3 font-mono text-sm text-pitch-200 break-all mb-3">
            {window.location.origin}/join/{inviteCode}
          </div>
          <Button onClick={copyInviteLink} variant="outline" size="md" className="w-full mb-3"
            leftIcon={copied ? <Check size={15} /> : <Copy size={15} />}>
            {copied ? "Copied!" : "Copy invite link"}
          </Button>
          <Button onClick={() => router.push("/dashboard")} size="md" className="w-full"
            rightIcon={<ArrowRight size={15} />}>
            Go to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const inputCls = cn(
    "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white",
    "bg-white/[0.06] border border-white/[0.12] placeholder:text-pitch-500",
    "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
  );

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <div className="label-caps mb-1">New group</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Create your league
        </h1>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Group type selector */}
      <Card variant="glass" className="p-5">
        <div className="label-caps mb-3">Group type</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { type: "tournament" as const, icon: Trophy,   label: "Full Tournament", desc: "All 104 matches, Jun 11–Jul 19" },
            { type: "single_match" as const, icon: Zap, label: "Single Match",    desc: "Pick one specific match" },
          ].map(({ type, icon: Icon, label, desc }) => (
            <button key={type} onClick={() => setGroupType(type)}
              className={cn("rounded-xl p-4 text-left border transition-all",
                groupType === type ? "bg-accent/10" : "border-white/10 bg-white/[0.02] hover:border-white/20")}
              style={groupType === type ? { borderColor: "rgb(var(--accent)/0.5)" } : undefined}>
              <Icon size={18} className="mb-2" style={{ color: groupType === type ? "rgb(var(--accent-glow))" : "#64748b" }} />
              <div className="font-bold text-white text-sm">{label}</div>
              <div className="text-xs text-pitch-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {/* Match picker for single match */}
        {groupType === "single_match" && (
          <div className="mt-4">
            <div className="label-caps mb-2">Select match</div>
            <div className="relative">
              <button onClick={() => setShowMatchPicker(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-sm text-white">
                <span>{selectedMatchLabel}</span>
                <ChevronDown size={15} className="text-pitch-500" />
              </button>
              {showMatchPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-xl border border-white/[0.12] overflow-hidden z-10">
                  {FEATURED_MATCHES.map(m => (
                    <button key={m.id} onClick={() => { setSelectedMatch(m.id); setShowMatchPicker(false); }}
                      className={cn("w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.04]",
                        selectedMatch === m.id ? "text-white" : "text-pitch-300")}
                      style={selectedMatch === m.id ? { color: "rgb(var(--accent-glow))" } : undefined}>
                      <span className="font-bold">{m.label}</span>
                      <span className="text-pitch-500 text-xs">{m.detail}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Single match extra options */}
            <div className="mt-4">
              <div className="label-caps mb-2">Extra predictions (admin choice)</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "yellowCards" as const, label: "🟨 Yellow cards" },
                  { key: "redCards"    as const, label: "🟥 Red cards"    },
                  { key: "corners"     as const, label: "🚩 Corners"      },
                  { key: "extraTime"   as const, label: "⏱ Extra time"   },
                  { key: "penalties"   as const, label: "🎯 Penalties"    },
                ].map(({ key, label }) => (
                  <button key={key}
                    onClick={() => setSingleOpts(o => ({ ...o, [key]: !o[key] }))}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all text-left",
                      singleOpts[key] ? "border-accent/50 bg-accent/10 text-white" : "border-white/10 text-pitch-500 hover:border-white/20")}
                    style={singleOpts[key] ? { borderColor: "rgb(var(--accent)/0.5)" } : undefined}>
                    <div className={cn("h-3.5 w-3.5 rounded border-2 flex items-center justify-center shrink-0",
                      singleOpts[key] ? "border-accent bg-accent/30" : "border-white/30")}
                      style={singleOpts[key] ? { borderColor: "rgb(var(--accent))" } : undefined}>
                      {singleOpts[key] && <Check size={9} style={{ color: "rgb(var(--accent-glow))" }} />}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Group name */}
      <Card variant="glass" className="p-5">
        <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-2">Group name</label>
        <div className="relative">
          <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
          <input type="text" placeholder="e.g. Office World Cup 2026" value={form.name}
            onChange={e => update("name", e.target.value)} className={inputCls} />
        </div>
      </Card>

      {/* Plan tier */}
      <Card variant="glass" className="p-5">
        <div className="label-caps mb-3">Plan</div>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map((tier, i) => (
            <button key={i} onClick={() => setSelectedTier(i)}
              className={cn("rounded-xl p-3 text-left border transition-all",
                selectedTier === i ? "bg-accent/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]")}
              style={selectedTier === i ? { borderColor: "rgb(var(--accent)/0.5)" } : undefined}>
              <div className="font-bold text-white text-sm">{tier.label}</div>
              <div className="text-xs text-pitch-400">Up to {tier.max} members</div>
              <div className="font-display text-xl mt-1" style={{ color: "rgb(var(--accent-glow))" }}>
                {tier.price === 0 ? "Free" : `$${tier.price}`}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Buy-in */}
      <Card variant="glass" className="p-5">
        <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-2">Buy-in per player</label>
        <div className="relative">
          <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
          <input type="number" min={0} placeholder="0" value={form.buyIn}
            onChange={e => update("buyIn", Number(e.target.value))} className={inputCls} />
        </div>
        {form.buyIn > 0 && (
          <p className="mt-2 text-xs text-pitch-500">
            Estimated pot: <span className="font-bold text-pitch-200">${pot}</span>{" "}
            ({TIERS[selectedTier].max} players × ${form.buyIn})
          </p>
        )}
      </Card>

      {/* Payout split */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={15} style={{ color: "rgb(var(--accent-glow))" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-pitch-400">Payout split</span>
          <span className={cn("ml-auto text-xs font-bold", totalPct === 100 ? "text-success" : "text-danger")}>
            {totalPct}% / 100%
          </span>
        </div>
        <div className="space-y-3">
          {[
            { label: "1st", key: "payoutFirst"  as const, medal: "1" },
            { label: "2nd", key: "payoutSecond" as const, medal: "2" },
            { label: "3rd", key: "payoutThird"  as const, medal: "3" },
          ].map(({ label, key, medal }, i) => (
            <div key={key} className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  background: i === 0 ? "rgba(217,119,6,0.12)" : i === 1 ? "rgba(100,116,139,0.12)" : "rgba(180,83,9,0.12)",
                  color: i === 0 ? "#d97706" : i === 1 ? "#64748b" : "#b45309",
                  border: `1px solid ${i === 0 ? "rgba(217,119,6,0.25)" : i === 1 ? "rgba(100,116,139,0.25)" : "rgba(180,83,9,0.25)"}`,
                }}>
                {medal}
              </div>
              <span className="w-10 text-sm font-bold" style={{ color: "#475569" }}>{label}</span>
              <input type="number" min={0} max={100} value={form[key]}
                onChange={e => update(key, Number(e.target.value))}
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white text-right bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent" />
              <span className="text-pitch-500 text-sm w-4">%</span>
              {form.buyIn > 0 && (
                <span className="text-xs text-pitch-500 w-12 text-right">${Math.round(pot * form[key] / 100)}</span>
              )}
            </div>
          ))}
        </div>
        {totalPct !== 100 && (
          <p className="mt-3 text-xs text-danger flex items-center gap-1.5">
            <AlertCircle size={12} /> Must add up to exactly 100%
          </p>
        )}
      </Card>

      <Button onClick={handleCreate} loading={loading}
        disabled={!form.name || totalPct !== 100} size="lg" className="w-full"
        rightIcon={<ArrowRight size={18} />}>
        Create {groupType === "single_match" ? "match group" : "group"}
      </Button>
    </div>
  );
}