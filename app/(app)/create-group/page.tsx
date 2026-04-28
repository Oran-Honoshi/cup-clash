"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, DollarSign, Trophy, AlertCircle, Copy, Check, ArrowRight } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
import { cn } from "@/lib/utils";

const TIERS = [
  { label: "Free",       max: 3,  price: 0,   stripeKey: ""           },
  { label: "Startup",    max: 10, price: 20,  stripeKey: "startup"    },
  { label: "Pro",        max: 30, price: 50,  stripeKey: "pro"        },
  { label: "Enterprise", max: 60, price: 100, stripeKey: "enterprise" },
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1);

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

  const handleCreate = async () => {
    const result = groupSchema.safeParse({
      ...form,
      buyIn: form.buyIn,
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Invalid form");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to create a group");
      setLoading(false);
      return;
    }

    const { data, error: createError } = await supabase
      .from("groups")
      .insert({
        name: form.name,
        admin_id: user.id,
        buy_in_amount: form.buyIn,
        payout_first: form.payoutFirst,
        payout_second: form.payoutSecond,
        payout_third: form.payoutThird,
        max_members: TIERS[selectedTier].max,
      } as Record<string, unknown>)
      .select("id, invite_code")
      .single();

    if (createError || !data) {
      setError(createError?.message ?? "Failed to create group");
      setLoading(false);
      return;
    }

    const groupData = data as { id: string; invite_code: string };

    // Auto-join as admin
    await supabase.from("group_members").insert({
      group_id: groupData.id,
      user_id: user.id,
      paid: true,
    } as Record<string, unknown>);

    // Free tier — go straight to invite link
    if (TIERS[selectedTier].price === 0) {
      setInviteCode(groupData.invite_code);
      setLoading(false);
      return;
    }

    // Paid tier — redirect to Stripe
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier:      TIERS[selectedTier].stripeKey,
          groupId:   groupData.id,
          groupName: form.name,
        }),
      });
      const { url, error: stripeError } = await res.json() as { url?: string; error?: string };
      if (stripeError || !url) throw new Error(stripeError ?? "No URL");
      window.location.href = url;
    } catch {
      setInviteCode(groupData.invite_code);
    }

    setLoading(false);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success state ──
  if (inviteCode) {
    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`;
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
          <p className="text-sm text-pitch-400 mb-6">Your group is ready. Share this link with your friends.</p>

          <div className="glass rounded-xl p-3 font-mono text-sm text-pitch-200 break-all mb-3">
            {inviteUrl}
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

  // ── Create form ──
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
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Group name */}
      <Card variant="glass" className="p-5">
        <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-2">
          Group name
        </label>
        <div className="relative">
          <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
          <input
            type="text"
            placeholder="e.g. Tech Titans World Cup"
            value={form.name}
            onChange={e => update("name", e.target.value)}
            className={inputCls}
          />
        </div>
      </Card>

      {/* Plan tier */}
      <Card variant="glass" className="p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-pitch-400 mb-3">
          Plan
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map((tier, i) => (
            <button
              key={i}
              onClick={() => setSelectedTier(i)}
              className={cn(
                "rounded-xl p-3 text-left border transition-all",
                selectedTier === i
                  ? "border-accent bg-accent/10"
                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
              )}
              style={selectedTier === i ? { borderColor: "rgb(var(--accent)/0.5)" } : undefined}
            >
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
        <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-2">
          Buy-in amount per player
        </label>
        <div className="relative">
          <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
          <input
            type="number"
            min={0}
            placeholder="0"
            value={form.buyIn}
            onChange={e => update("buyIn", Number(e.target.value))}
            className={inputCls}
          />
        </div>
        {form.buyIn > 0 && (
          <p className="mt-2 text-xs text-pitch-500">
            Estimated pot: <span className="font-bold text-pitch-200">${pot}</span> ({TIERS[selectedTier].max} players × ${form.buyIn})
          </p>
        )}
      </Card>

      {/* Payout split */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={15} style={{ color: "rgb(var(--accent-glow))" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-pitch-400">
            Payout split
          </span>
          <span className={cn(
            "ml-auto text-xs font-bold",
            totalPct === 100 ? "text-success" : "text-danger"
          )}>
            {totalPct}% / 100%
          </span>
        </div>

        <div className="space-y-3">
          {[
            { label: "1st place", key: "payoutFirst"  as const, medal: "🥇" },
            { label: "2nd place", key: "payoutSecond" as const, medal: "🥈" },
            { label: "3rd place", key: "payoutThird"  as const, medal: "🥉" },
          ].map(({ label, key, medal }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-16 text-sm text-pitch-300">{medal} {label}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={form[key]}
                onChange={e => update(key, Number(e.target.value))}
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white text-right bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent"
              />
              <span className="text-pitch-500 text-sm w-4">%</span>
              {form.buyIn > 0 && (
                <span className="text-xs text-pitch-500 w-12 text-right">
                  ${Math.round(pot * form[key] / 100)}
                </span>
              )}
            </div>
          ))}
        </div>

        {totalPct !== 100 && (
          <p className="mt-3 text-xs text-danger flex items-center gap-1.5">
            <AlertCircle size={12} />
            Payouts must add up to exactly 100%
          </p>
        )}
      </Card>

      <Button
        onClick={handleCreate}
        loading={loading}
        disabled={!form.name || totalPct !== 100}
        size="lg"
        className="w-full"
        rightIcon={<ArrowRight size={18} />}
      >
        Create group
      </Button>
    </div>
  );
}

const inputCls = cn(
  "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white",
  "bg-white/[0.06] border border-white/[0.12]",
  "placeholder:text-pitch-500",
  "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
  "transition-all duration-150"
);
