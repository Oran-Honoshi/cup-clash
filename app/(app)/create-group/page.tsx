"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Users, DollarSign, Trophy, AlertCircle, Copy, Check,
  ArrowRight, Zap, ChevronDown, Settings, Building2, UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

const inputCls = [
  "w-full px-4 py-2.5 rounded-xl text-sm transition-all",
  "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400",
  "focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100",
].join(" ");

const FEATURED_MATCHES = [
  { id: "final", label: "Final — MetLife Stadium",           detail: "Jul 19" },
  { id: "sf-1",  label: "Semi-Final 1 — MetLife Stadium",    detail: "Jul 14" },
  { id: "sf-2",  label: "Semi-Final 2 — AT&T Stadium",       detail: "Jul 15" },
  { id: "qf-1",  label: "Quarter-Final 1 — MetLife Stadium", detail: "Jul 9"  },
  { id: "g001",  label: "Opening: Mexico vs South Africa",   detail: "Jun 11" },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} type="button"
      className="relative h-6 w-11 rounded-full shrink-0 transition-all"
      style={{ background: enabled ? "#00D4FF" : "#e2e8f0" }}>
      <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: enabled ? "22px" : "2px" }} />
    </button>
  );
}

function RuleRow({ label, desc, pts, setPts, enabled, onToggle }: {
  label: string; desc: string; pts: number;
  setPts: (v: number) => void; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "#f1f5f9" }}>
      <Toggle enabled={enabled} onToggle={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold" style={{ color: enabled ? "#0F172A" : "#94a3b8" }}>{label}</div>
        <div className="text-xs" style={{ color: "#94a3b8" }}>{desc}</div>
      </div>
      {enabled && (
        <div className="flex items-center gap-1.5 shrink-0">
          <input type="number" min={0} value={pts}
            onChange={e => setPts(Number(e.target.value))}
            className="w-16 rounded-lg px-2 py-1.5 text-sm text-center border focus:outline-none"
            style={{ borderColor: "#e2e8f0", color: "#0F172A", background: "white" }} />
          <span className="text-xs w-5" style={{ color: "#94a3b8" }}>pts</span>
        </div>
      )}
    </div>
  );
}

type PaymentModel = "pay_per_member" | "corporate_sponsored";

function CreateGroupInner() {
  const [step,         setStep]        = useState<0|1|2|3>(0);
  const [paymentModel, setPaymentModel] = useState<PaymentModel>("pay_per_member");
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [passkey,      setPasskey]     = useState<string | null>(null);
  const [createdName,  setCreatedName] = useState("");
  const [copied,       setCopied]      = useState(false);
  const [groupId,      setGroupId]     = useState<string | null>(null);

  const searchParams = useSearchParams();
  const modelParam   = searchParams.get("model") as PaymentModel | null;

  const [prizeTrack,     setPrizeTrack]     = useState<"cash" | "company">("company");
  const [rewardPlaces,   setRewardPlaces]   = useState(1);
  const [companyRewards, setCompanyRewards] = useState({ reward1: "", reward2: "", reward3: "" });

  useEffect(() => {
    if (modelParam === "corporate_sponsored") {
      setPaymentModel("corporate_sponsored");
      setStep(1);
    } else if (modelParam === "pay_per_member") {
      setPaymentModel("pay_per_member");
      setStep(1);
    }
  }, [modelParam]);

  const [groupName,      setGroupName]      = useState("");
  const [groupType,      setGroupType]      = useState<"tournament"|"single_match">("tournament");
  const [selectedMatch,  setSelectedMatch]  = useState(FEATURED_MATCHES[0].id);
  const [showPicker,     setShowPicker]     = useState(false);
  const [corporatePrize, setCorporatePrize] = useState("");

  const [buyIn,        setBuyIn]        = useState(20);
  const [memberCount,  setMemberCount]  = useState(10);
  const [payoutFirst,  setPayoutFirst]  = useState(60);
  const [payoutSecond, setPayoutSecond] = useState(30);
  const [payoutThird,  setPayoutThird]  = useState(10);

  const [correctOutcome,   setCorrectOutcome]   = useState(10);
  const [exactScore,       setExactScore]       = useState(25);
  const [koAdvancement,    setKoAdvancement]    = useState(20);
  const [tourneyWinner,    setTourneyWinner]    = useState(100);
  const [topScorer,        setTopScorer]        = useState(50);
  const [topAssister,      setTopAssister]      = useState(50);
  const [bestDefence,      setBestDefence]      = useState(40);
  const [bestYoung,        setBestYoung]        = useState(30);
  const [goldenBall,       setGoldenBall]       = useState(40);
  const [enableOutcome,    setEnableOutcome]    = useState(true);
  const [enableExact,      setEnableExact]      = useState(true);
  const [enableKO,         setEnableKO]         = useState(true);
  const [enableWinner,     setEnableWinner]     = useState(true);
  const [enableScorer,     setEnableScorer]     = useState(true);
  const [enableAssister,   setEnableAssister]   = useState(true);
  const [enableDefence,    setEnableDefence]    = useState(false);
  const [enableYoung,      setEnableYoung]      = useState(false);
  const [enableGoldenBall, setEnableGoldenBall] = useState(false);

  const totalPct  = payoutFirst + payoutSecond + payoutThird;
  const totalPot  = buyIn * memberCount;
  const isCorporate = paymentModel === "corporate_sponsored";

  const handleCreate = async () => {
    setLoading(true); setError(null);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("You must be signed in"); setLoading(false); return; }

    let finalCorporatePrize = isCorporate ? corporatePrize.trim() : null;
    if (isCorporate && prizeTrack === "company") {
      const parts = [];
      if (companyRewards.reward1) parts.push(`1st: ${companyRewards.reward1}`);
      if (rewardPlaces >= 2 && companyRewards.reward2) parts.push(`2nd: ${companyRewards.reward2}`);
      if (rewardPlaces >= 3 && companyRewards.reward3) parts.push(`3rd: ${companyRewards.reward3}`);
      if (parts.length > 0) finalCorporatePrize = parts.join(" | ");
    }

    const { data: groupData, error: groupErr } = await sb
      .from("groups")
      .insert({
        name:                 groupName.trim(),
        admin_id:             user.id,
        buy_in_amount:        isCorporate && prizeTrack === "company" ? 0 : buyIn,
        payout_first:         isCorporate && prizeTrack === "company" ? 0 : payoutFirst,
        payout_second:        isCorporate && prizeTrack === "company" ? 0 : payoutSecond,
        payout_third:         isCorporate && prizeTrack === "company" ? 0 : payoutThird,
        max_members:          100,
        group_type:           groupType,
        single_match_id:      groupType === "single_match" ? selectedMatch : null,
        enrollment_fee_cents: isCorporate ? 0 : 200,
        payment_model:        paymentModel,
        is_corporate_paid:    false,
        corporate_prize:      finalCorporatePrize || null,
      } as Record<string, unknown>)
      .select("id, passkey")
      .single();

    if (groupErr || !groupData) {
      setError(groupErr?.message ?? "Failed to create group");
      setLoading(false); return;
    }

    const { id: gId, passkey: gPasskey } = groupData as { id: string; passkey: string };

    await sb.from("group_members").upsert({
      group_id:       gId,
      user_id:        user.id,
      payment_status: "paid",
      can_predict:    true,
      joined_at:      new Date().toISOString(),
    } as Record<string, unknown>, { onConflict: "user_id,group_id" });

    await sb.from("scoring_rules").upsert({
      group_id:              gId,
      correct_outcome:       enableOutcome    ? correctOutcome  : 0,
      exact_score:           enableExact      ? exactScore      : 0,
      ko_advancement:        enableKO         ? koAdvancement   : 0,
      tournament_winner:     enableWinner     ? tourneyWinner   : 0,
      top_scorer:            enableScorer     ? topScorer       : 0,
      top_assister:          enableAssister   ? topAssister     : 0,
      best_defence:          enableDefence    ? bestDefence     : 0,
      best_young_player:     enableYoung      ? bestYoung       : 0,
      golden_ball:           enableGoldenBall ? goldenBall      : 0,
      enable_outcome:        enableOutcome,
      enable_exact:          enableExact,
      enable_ko_advancement: enableKO,
      enable_winner:         enableWinner,
      enable_scorer:         enableScorer,
      enable_assister:       enableAssister,
      enable_best_defence:   enableDefence,
      enable_best_young:     enableYoung,
      enable_golden_ball:    enableGoldenBall,
    } as Record<string, unknown>, { onConflict: "group_id" });

    setCreatedName(groupName.trim());
    setPasskey(gPasskey);
    setGroupId(gId);
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${passkey}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (passkey) {
    return (
      <div className="max-w-lg mx-auto space-y-4 px-4 py-6">
        <div className="rounded-2xl p-6 text-center space-y-4 bg-white border border-slate-200 shadow-sm">
          <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)" }}>
            <Check size={24} style={{ color: "#0B141B" }} />
          </div>
          <div>
            <h2 className="font-display text-3xl uppercase font-black" style={{ color: "#0F172A" }}>{createdName}</h2>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              {isCorporate
                ? "Your corporate group is ready. Go to the group to unlock team invites."
                : "Share the passkey — members pay $2 to join."}
            </p>
          </div>

          {isCorporate ? (
            <button onClick={() => { window.location.href = `/groups/${groupId}`; }}
              className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              <Building2 size={16} /> Go to Group — Unlock Invites
            </button>
          ) : (
            <>
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>Entry Passkey</div>
                <div className="font-mono font-black text-5xl tracking-[0.2em]" style={{ color: "#0F172A" }}>{passkey}</div>
                <div className="text-xs mt-2" style={{ color: "#94a3b8" }}>cupclash.live/join/{passkey}</div>
              </div>
              <button onClick={copyLink}
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy invite link</>}
              </button>
              <button onClick={() => { window.location.href = "/dashboard"; }}
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                Go to Dashboard <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1 as const, label: "Group Setup"     },
    { n: 2 as const, label: isCorporate ? "Company Prizes" : "Buy-In & Prizes" },
    { n: 3 as const, label: "Scoring Rules"   },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4 px-4 py-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>New Group</div>
        <h1 className="font-display text-4xl uppercase font-black" style={{ color: "#0F172A" }}>Create your league</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Free to create · Choose how members join</p>
      </div>

      {/* ── STEP 0 — Payment model ─────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            Who pays for this group?
          </div>

          <button
            onClick={() => { setPaymentModel("pay_per_member"); setStep(1); }}
            className="w-full rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 border-2 bg-white shadow-sm"
            style={{ borderColor: paymentModel === "pay_per_member" ? "rgba(0,255,136,0.5)" : "#e2e8f0" }}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
                <UserCheck size={22} style={{ color: "#059669" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-lg uppercase font-black" style={{ color: "#0F172A" }}>
                    Friend Circle
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                    style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>
                    Free for you
                  </span>
                </div>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  You create the group for free. Each friend pays a flat <strong style={{ color: "#0F172A" }}>$2 entry fee</strong> individually when they join.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Fantasy leagues", "Friend groups", "Bar buddies", "Family"].map(t => (
                    <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#f1f5f9", color: "#64748b" }}>{t}</span>
                  ))}
                </div>
              </div>
              <ArrowRight size={18} style={{ color: "#059669" }} className="self-center" />
            </div>
          </button>

          <button
            onClick={() => { setPaymentModel("corporate_sponsored"); setStep(1); }}
            className="w-full rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 border-2 bg-white shadow-sm"
            style={{ borderColor: paymentModel === "corporate_sponsored" ? "rgba(0,212,255,0.5)" : "#e2e8f0" }}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Building2 size={22} style={{ color: "#0891B2" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-lg uppercase font-black" style={{ color: "#0F172A" }}>
                    Corporate Sponsor
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                    style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2" }}>
                    Team pays $0
                  </span>
                </div>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  You cover the whole team with a one-time flat fee. Every employee joins for <strong style={{ color: "#0F172A" }}>$0 — zero friction</strong>.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["HR managers", "Office pools", "Tech companies", "Remote teams"].map(t => (
                    <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#f1f5f9", color: "#64748b" }}>{t}</span>
                  ))}
                </div>
                <div className="flex gap-3 mt-3">
                  <div className="text-xs rounded-lg px-2.5 py-1.5 font-medium"
                    style={{ background: "rgba(0,212,255,0.06)", color: "#0891B2" }}>
                    $75 · up to 50 members
                  </div>
                  <div className="text-xs rounded-lg px-2.5 py-1.5 font-medium"
                    style={{ background: "rgba(217,119,6,0.06)", color: "#d97706" }}>
                    $130 · up to 100 members
                  </div>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: "#0891B2" }} className="self-center" />
            </div>
          </button>
        </div>
      )}

      {/* Step tabs */}
      {step > 0 && (
        <>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(0)} className="text-xs font-bold" style={{ color: "#0891B2" }}>
              ← Change Mode
            </button>
            <div className="flex-1 flex gap-2">
              {steps.map(s => (
                <button key={s.n} type="button" disabled
                  className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  style={step === s.n ? {
                    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2",
                  } : step > s.n ? {
                    background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)", color: "#059669",
                  } : {
                    background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8",
                  }}>
                  {step > s.n ? "✓ " : ""}{s.label}
                </button>
              ))}
            </div>
          </div>

          {isCorporate && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <Building2 size={14} style={{ color: "#0891B2" }} />
              <span className="text-xs font-medium" style={{ color: "#0891B2" }}>
                Corporate mode — employees join free · activate dashboard link after setup
              </span>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-4 bg-white border border-slate-200 shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>
                {isCorporate ? "Company Group Name *" : "Group Name *"}
              </label>
              <div className="relative">
                {isCorporate
                  ? <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                  : <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />}
                <input type="text"
                  placeholder={isCorporate ? "e.g. Engineering Dept — World Cup 2026" : "e.g. Sunday Squad World Cup"}
                  value={groupName} onChange={e => setGroupName(e.target.value)}
                  className={inputCls} style={{ paddingLeft: "2.25rem" }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Group Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "tournament" as const, icon: Trophy, label: "Full Tournament", desc: "All 104 matches" },
                  { type: "single_match" as const, icon: Zap,  label: "Single Match",   desc: "One specific match" },
                ].map(({ type, icon: Icon, label, desc }) => (
                  <button key={type} type="button" onClick={() => setGroupType(type)}
                    className="rounded-xl p-3 text-left border transition-all"
                    style={groupType === type ? {
                      background: "rgba(0,212,255,0.05)", borderColor: "rgba(0,212,255,0.35)",
                    } : { background: "white", borderColor: "#e2e8f0" }}>
                    <Icon size={16} className="mb-1.5" style={{ color: groupType === type ? "#0891B2" : "#94a3b8" }} />
                    <div className="text-xs font-bold" style={{ color: "#0F172A" }}>{label}</div>
                    <div className="text-[10px]" style={{ color: "#94a3b8" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {groupType === "single_match" && (
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Select Match</label>
                <button type="button" onClick={() => setShowPicker(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm bg-white"
                  style={{ borderColor: "#e2e8f0", color: "#0F172A" }}>
                  <span>{FEATURED_MATCHES.find(m => m.id === selectedMatch)?.label}</span>
                  <ChevronDown size={14} style={{ color: "#94a3b8" }} />
                </button>
                {showPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-20 bg-white shadow-lg"
                    style={{ borderColor: "#e2e8f0" }}>
                    {FEATURED_MATCHES.map(m => (
                      <button key={m.id} type="button"
                        onClick={() => { setSelectedMatch(m.id); setShowPicker(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                        style={{ borderBottom: "1px solid #f1f5f9", color: selectedMatch === m.id ? "#0891B2" : "#475569" }}>
                        <span className="text-xs font-bold">{m.label}</span>
                        <span className="text-xs" style={{ color: "#94a3b8" }}>{m.detail}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="button" onClick={() => {
            if (!groupName.trim()) { setError("Group name is required"); return; }
            setError(null); setStep(2);
          }} className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Next: {isCorporate ? "Company Prizes" : "Buy-In & Prizes"} <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-4 bg-white border border-slate-200 shadow-sm">

            {isCorporate ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>
                    Prize Structure
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPrizeTrack("cash")}
                      className="rounded-xl p-4 text-left border-2 transition-all bg-white"
                      style={{ borderColor: prizeTrack === "cash" ? "rgba(0,212,255,0.4)" : "#e2e8f0", background: prizeTrack === "cash" ? "rgba(0,212,255,0.02)" : "white" }}>
                      <div className="text-sm font-bold mb-1" style={{ color: "#0F172A" }}>💰 Cash Split</div>
                      <div className="text-xs" style={{ color: "#64748b" }}>Track a buy-in pot with % payouts</div>
                    </button>
                    <button type="button" onClick={() => setPrizeTrack("company")}
                      className="rounded-xl p-4 text-left border-2 transition-all bg-white"
                      style={{ borderColor: prizeTrack === "company" ? "rgba(0,255,136,0.4)" : "#e2e8f0", background: prizeTrack === "company" ? "rgba(0,255,136,0.02)" : "white" }}>
                      <div className="text-sm font-bold mb-1" style={{ color: "#0F172A" }}>🏆 Company Rewards</div>
                      <div className="text-xs" style={{ color: "#64748b" }}>Custom rewards, no financial tracking</div>
                    </button>
                  </div>
                </div>

                {prizeTrack === "cash" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Buy-in ($)</label>
                        <input type="number" min={0} value={buyIn} onChange={e => setBuyIn(Number(e.target.value))} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Expected members</label>
                        <input type="number" min={2} value={memberCount} onChange={e => setMemberCount(Number(e.target.value))} className={inputCls} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Payout split</span>
                      <span className="text-xs font-bold" style={{ color: totalPct === 100 ? "#059669" : "#dc2626" }}>{totalPct}%</span>
                    </div>
                    {[
                      { label: "🥇 1st", val: payoutFirst,  set: setPayoutFirst  },
                      { label: "🥈 2nd", val: payoutSecond, set: setPayoutSecond },
                      { label: "🥉 3rd", val: payoutThird,  set: setPayoutThird  },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-sm w-16 shrink-0" style={{ color: "#475569" }}>{label}</span>
                        <input type="number" min={0} max={100} value={val} onChange={e => set(Number(e.target.value))}
                          className="w-16 rounded-lg px-2 py-1.5 text-sm text-center border focus:outline-none"
                          style={{ borderColor: "#e2e8f0", color: "#0F172A", background: "white" }} />
                        <span className="text-sm" style={{ color: "#94a3b8" }}>%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs rounded-xl px-4 py-3"
                      style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", color: "#475569" }}>
                      Specify custom workspace rewards for each leaderboard place below.
                    </p>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>
                        How many places to reward?
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(n => (
                          <button key={n} type="button" onClick={() => setRewardPlaces(n)}
                            className="flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                            style={{
                              borderColor: rewardPlaces >= n ? "rgba(0,255,136,0.4)" : "#e2e8f0",
                              background:  rewardPlaces >= n ? "rgba(0,255,136,0.04)" : "white",
                              color:       rewardPlaces >= n ? "#059669" : "#64748b",
                            }}>
                            {n === 1 ? "1st Only" : n === 2 ? "Top 2" : "Top 3"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {([
                        { place: 1, label: "🥇 1st Place Reward", key: "reward1" as const, ph: "e.g. Extra day off + $100 Amazon Voucher" },
                        { place: 2, label: "🥈 2nd Place Reward", key: "reward2" as const, ph: "e.g. Free company swag or free lunch"     },
                        { place: 3, label: "🥉 3rd Place Reward", key: "reward3" as const, ph: "e.g. Special desk trophy & bragging rights" },
                      ] as const).filter(r => r.place <= rewardPlaces).map(({ label, key, ph }) => (
                        <div key={key}>
                          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>{label}</label>
                          <input type="text" placeholder={ph} value={companyRewards[key]}
                            onChange={e => setCompanyRewards({ ...companyRewards, [key]: e.target.value })}
                            className={inputCls} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Buy-In Amount ($)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                      <input type="number" min={0} value={buyIn} onChange={e => setBuyIn(Number(e.target.value))} className={inputCls} style={{ paddingLeft: "2rem" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Target Members</label>
                    <input type="number" min={2} value={memberCount} onChange={e => setMemberCount(Number(e.target.value))} className={inputCls} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl flex justify-between items-center text-sm"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Projected Cash Pool:</span>
                  <span className="font-bold" style={{ color: "#0F172A" }}>${totalPot}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Prize Pool Split</label>
                    <span className="text-xs font-bold" style={{ color: totalPct === 100 ? "#059669" : "#dc2626" }}>{totalPct}% allocated</span>
                  </div>
                  {[
                    { label: "🥇 1st Place", val: payoutFirst,  set: setPayoutFirst,  split: Math.round(totalPot * payoutFirst  / 100) },
                    { label: "🥈 2nd Place", val: payoutSecond, set: setPayoutSecond, split: Math.round(totalPot * payoutSecond / 100) },
                    { label: "🥉 3rd Place", val: payoutThird,  set: setPayoutThird,  split: Math.round(totalPot * payoutThird  / 100) },
                  ].map(({ label, val, set, split }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-sm w-20 font-medium" style={{ color: "#475569" }}>{label}</span>
                      <input type="number" min={0} max={100} value={val} onChange={e => set(Number(e.target.value))}
                        className="w-16 rounded-lg px-2 py-1.5 text-sm text-center border focus:outline-none"
                        style={{ borderColor: "#e2e8f0", color: "#0F172A", background: "white" }} />
                      <span className="text-sm w-6" style={{ color: "#94a3b8" }}>%</span>
                      <span className="text-xs ml-auto font-mono" style={{ color: "#94a3b8" }}>${split} prize</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="button" onClick={() => {
            if (!isCorporate && totalPct !== 100) { setError("Prize allocation must equal exactly 100%"); return; }
            if (isCorporate && prizeTrack === "cash" && totalPct !== 100) { setError("Prize allocation must equal exactly 100%"); return; }
            setError(null); setStep(3);
          }} className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Next: Scoring Rules <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── STEP 3 ─────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={14} style={{ color: "#0891B2" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Configure point weights</span>
            </div>
            <RuleRow label="Match Outcome"            desc="Correctly predicting W/D/L result"              pts={correctOutcome} setPts={setCorrectOutcome} enabled={enableOutcome}    onToggle={() => setEnableOutcome(!enableOutcome)}       />
            <RuleRow label="Exact Scoreline"          desc="Bonus for guessing identical score (e.g. 2-1)"  pts={exactScore}     setPts={setExactScore}     enabled={enableExact}      onToggle={() => setEnableExact(!enableExact)}           />
            <RuleRow label="Knockout Advancement"     desc="Correctly choosing which team advances"         pts={koAdvancement}  setPts={setKoAdvancement}  enabled={enableKO}         onToggle={() => setEnableKO(!enableKO)}                 />
            <RuleRow label="Tournament Champion"      desc="Picking the winner of the trophy"               pts={tourneyWinner}  setPts={setTourneyWinner}  enabled={enableWinner}     onToggle={() => setEnableWinner(!enableWinner)}         />
            <RuleRow label="Golden Boot Winner"       desc="Predicting top goals scorer"                    pts={topScorer}      setPts={setTopScorer}      enabled={enableScorer}     onToggle={() => setEnableScorer(!enableScorer)}         />
            <RuleRow label="Top Assist Playmaker"     desc="Predicting tournament assists champion"         pts={topAssister}    setPts={setTopAssister}    enabled={enableAssister}   onToggle={() => setEnableAssister(!enableAssister)}     />
            <RuleRow label="Best Defence"             desc="Team with lowest goals conceded"                pts={bestDefence}    setPts={setBestDefence}    enabled={enableDefence}    onToggle={() => setEnableDefence(!enableDefence)}       />
            <RuleRow label="Best Young Player"        desc="Official FIFA Best Young Player award"          pts={bestYoung}      setPts={setBestYoung}      enabled={enableYoung}      onToggle={() => setEnableYoung(!enableYoung)}           />
            <RuleRow label="Golden Ball (MVP)"        desc="Tournament best player award winner"            pts={goldenBall}     setPts={setGoldenBall}     enabled={enableGoldenBall} onToggle={() => setEnableGoldenBall(!enableGoldenBall)} />
          </div>

          <button type="button" onClick={handleCreate} disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            {loading ? "Creating your league..." : <><Trophy size={16} /> Complete & Launch Group</>}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreateGroupPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-4 py-12 text-center text-sm" style={{ color: "#94a3b8" }}>
        Loading...
      </div>
    }>
      <CreateGroupInner />
    </Suspense>
  );
}