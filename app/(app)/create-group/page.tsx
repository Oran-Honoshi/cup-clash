"use client";

import { useState } from "react";
import {
  Users, DollarSign, Trophy, AlertCircle, Copy, Check,
  ArrowRight, Zap, ChevronDown, Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

function RuleRow({
  label, desc, pts, setPts, enabled, onToggle,
}: {
  label: string; desc: string; pts: number;
  setPts: (v: number) => void; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0"
      style={{ borderColor: "#f1f5f9" }}>
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

export default function CreateGroupPage() {
  const [step,            setStep]            = useState<1|2|3>(1);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [passkey,         setPasskey]         = useState<string | null>(null);
  const [createdName,     setCreatedName]     = useState("");
  const [copied,          setCopied]          = useState(false);

  // Step 1
  const [groupName,       setGroupName]       = useState("");
  const [groupType,       setGroupType]       = useState<"tournament"|"single_match">("tournament");
  const [selectedMatch,   setSelectedMatch]   = useState(FEATURED_MATCHES[0].id);
  const [showPicker,      setShowPicker]      = useState(false);

  // Step 2
  const [buyIn,           setBuyIn]           = useState(20);
  const [memberCount,     setMemberCount]     = useState(10);
  const [payoutFirst,     setPayoutFirst]     = useState(60);
  const [payoutSecond,    setPayoutSecond]    = useState(30);
  const [payoutThird,     setPayoutThird]     = useState(10);

  // Step 3 — scoring rules with toggles
  const [correctOutcome,   setCorrectOutcome]  = useState(10);
  const [exactScore,       setExactScore]      = useState(25);
  const [koAdvancement,    setKoAdvancement]   = useState(20);
  const [tourneyWinner,    setTourneyWinner]   = useState(100);
  const [topScorer,        setTopScorer]       = useState(50);
  const [topAssister,      setTopAssister]     = useState(50);
  const [bestDefence,      setBestDefence]     = useState(40);
  const [bestYoung,        setBestYoung]       = useState(30);
  const [goldenBall,       setGoldenBall]      = useState(40);

  const [enableOutcome,    setEnableOutcome]   = useState(true);
  const [enableExact,      setEnableExact]     = useState(true);
  const [enableKO,         setEnableKO]        = useState(true);
  const [enableWinner,     setEnableWinner]    = useState(true);
  const [enableScorer,     setEnableScorer]    = useState(true);
  const [enableAssister,   setEnableAssister]  = useState(true);
  const [enableDefence,    setEnableDefence]   = useState(false);
  const [enableYoung,      setEnableYoung]     = useState(false);
  const [enableGoldenBall, setEnableGoldenBall]= useState(false);

  const totalPct = payoutFirst + payoutSecond + payoutThird;
  const totalPot = buyIn * memberCount;
  const prize1   = Math.round(totalPot * payoutFirst  / 100);
  const prize2   = Math.round(totalPot * payoutSecond / 100);
  const prize3   = Math.round(totalPot * payoutThird  / 100);

  const handleCreate = async () => {
    setLoading(true); setError(null);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("You must be signed in"); setLoading(false); return; }

    // 1. Create group
    const { data: groupData, error: groupErr } = await sb
      .from("groups")
      .insert({
        name:             groupName.trim(),
        admin_id:         user.id,
        buy_in_amount:    buyIn,
        payout_first:     payoutFirst,
        payout_second:    payoutSecond,
        payout_third:     payoutThird,
        max_members:      100,
        group_type:       groupType,
        single_match_id:  groupType === "single_match" ? selectedMatch : null,
        enrollment_fee_cents: 200,
      } as Record<string, unknown>)
      .select("id, passkey")
      .single();

    if (groupErr || !groupData) {
      setError(groupErr?.message ?? "Failed to create group");
      setLoading(false); return;
    }

    const { id: groupId, passkey: gPasskey } = groupData as { id: string; passkey: string };

    // 2. Add admin as paid member
    await sb.from("group_members").upsert({
      group_id:       groupId,
      user_id:        user.id,
      payment_status: "paid",
      can_predict:    true,
      joined_at:      new Date().toISOString(),
    } as Record<string, unknown>, { onConflict: "user_id,group_id" });

    // 3. Save scoring rules
    await sb.from("scoring_rules").upsert({
      group_id:          groupId,
      correct_outcome:   enableOutcome   ? correctOutcome  : 0,
      exact_score:       enableExact     ? exactScore      : 0,
      ko_advancement:    enableKO        ? koAdvancement   : 0,
      tournament_winner: enableWinner    ? tourneyWinner   : 0,
      top_scorer:        enableScorer    ? topScorer       : 0,
      top_assister:      enableAssister  ? topAssister     : 0,
      best_defence:      enableDefence   ? bestDefence     : 0,
      best_young_player: enableYoung     ? bestYoung       : 0,
      golden_ball:       enableGoldenBall? goldenBall      : 0,
      enable_outcome:    enableOutcome,
      enable_exact:      enableExact,
      enable_ko_advancement: enableKO,
      enable_winner:     enableWinner,
      enable_scorer:     enableScorer,
      enable_assister:   enableAssister,
      enable_best_defence:    enableDefence,
      enable_best_young:      enableYoung,
      enable_golden_ball:     enableGoldenBall,
    } as Record<string, unknown>, { onConflict: "group_id" });

    setCreatedName(groupName.trim());
    setPasskey(gPasskey);
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${passkey}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // ── Success ──────────────────────────────────────────────────────────────
  if (passkey) {
    return (
      <div className="max-w-lg mx-auto space-y-4 px-4 py-6">
        <div className="rounded-2xl p-6 text-center space-y-4"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,255,136,0.3)" }}>
          <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
            <Check size={24} style={{ color: "#0B141B" }} />
          </div>
          <div>
            <h2 className="font-display text-3xl uppercase font-black" style={{ color: "#0F172A" }}>{createdName}</h2>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>Share the passkey — members pay $2 to join.</p>
          </div>
          <div className="rounded-2xl p-5"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
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
            className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Go to Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1 as const, label: "Group Setup"     },
    { n: 2 as const, label: "Buy-In & Prizes" },
    { n: 3 as const, label: "Scoring Rules"   },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4 px-4 py-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>New Group</div>
        <h1 className="font-display text-4xl uppercase font-black" style={{ color: "#0F172A" }}>Create your league</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Free to create · Members pay $2 each to join</p>
      </div>

      {/* Step tabs */}
      <div className="flex gap-2">
        {steps.map(s => (
          <button key={s.n} type="button"
            className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            style={step === s.n ? {
              background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#0891B2",
            } : step > s.n ? {
              background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", color: "#059669",
            } : {
              background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8",
            }}>
            {step > s.n ? "✓ " : ""}{s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Group Name *</label>
              <div className="relative">
                <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                <input type="text" placeholder="e.g. Office World Cup 2026"
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
                      background: "rgba(0,212,255,0.08)", borderColor: "rgba(0,212,255,0.4)",
                    } : { background: "rgba(255,255,255,0.5)", borderColor: "#e2e8f0" }}>
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
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm"
                  style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}>
                  <span>{FEATURED_MATCHES.find(m => m.id === selectedMatch)?.label}</span>
                  <ChevronDown size={14} style={{ color: "#94a3b8" }} />
                </button>
                {showPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-20"
                    style={{ background: "white", borderColor: "#e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
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
          }} className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Next: Buy-In & Prizes <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Buy-in per player ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                  <input type="number" min={0} value={buyIn}
                    onChange={e => setBuyIn(Number(e.target.value))}
                    className={inputCls} style={{ paddingLeft: "2rem" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Expected members</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                  <input type="number" min={2} max={100} value={memberCount}
                    onChange={e => setMemberCount(Number(e.target.value))}
                    className={inputCls} style={{ paddingLeft: "2rem" }} />
                </div>
              </div>
            </div>

            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Buy-in is for tracking only — Cup Clash doesn&apos;t handle money.
            </p>

            {buyIn > 0 && memberCount > 0 && (
              <div className="rounded-xl p-3 text-center"
                style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>Estimated prize pot</div>
                <div className="font-display text-3xl font-black" style={{ color: "#0F172A" }}>${totalPot.toLocaleString()}</div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Payout split</label>
                <span className="text-xs font-bold" style={{ color: totalPct === 100 ? "#059669" : "#dc2626" }}>
                  {totalPct}% / 100%
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "🥇 1st place", val: payoutFirst,  set: setPayoutFirst,  prize: prize1, color: "#d97706" },
                  { label: "🥈 2nd place", val: payoutSecond, set: setPayoutSecond, prize: prize2, color: "#64748b" },
                  { label: "🥉 3rd place", val: payoutThird,  set: setPayoutThird,  prize: prize3, color: "#b45309" },
                ].map(({ label, val, set, prize, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm w-24 shrink-0" style={{ color: "#475569" }}>{label}</span>
                    <input type="number" min={0} max={100} value={val}
                      onChange={e => set(Number(e.target.value))}
                      className="w-16 rounded-lg px-2 py-1.5 text-sm text-center border focus:outline-none"
                      style={{ borderColor: "#e2e8f0", color: "#0F172A", background: "white" }} />
                    <span className="text-sm" style={{ color: "#94a3b8" }}>%</span>
                    {buyIn > 0 && memberCount > 0 && (
                      <span className="text-sm font-bold ml-auto" style={{ color }}>${prize.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
              {totalPct !== 100 && (
                <p className="mt-2 text-xs flex items-center gap-1" style={{ color: "#dc2626" }}>
                  <AlertCircle size={11} /> Must add up to exactly 100%
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ border: "1px solid #e2e8f0", color: "#64748b", background: "white" }}>
              Back
            </button>
            <button type="button" onClick={() => {
              if (totalPct !== 100) { setError("Payouts must add up to 100%"); return; }
              setError(null); setStep(3);
            }} className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              Next: Scoring Rules <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ─────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Settings size={16} style={{ color: "#0891B2" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Match Predictions</span>
            </div>

            <RuleRow label="Correct outcome" desc="Right result (win/draw/loss), wrong score"
              pts={correctOutcome} setPts={setCorrectOutcome} enabled={enableOutcome} onToggle={() => setEnableOutcome(v => !v)} />
            <RuleRow label="Exact score bonus" desc="Perfect score guess — includes correct outcome"
              pts={exactScore} setPts={setExactScore} enabled={enableExact} onToggle={() => setEnableExact(v => !v)} />
            <RuleRow label="Knockout advancement" desc="Correctly picked the team that advances"
              pts={koAdvancement} setPts={setKoAdvancement} enabled={enableKO} onToggle={() => setEnableKO(v => !v)} />

            <div className="flex items-center gap-2 mt-5 mb-3">
              <Trophy size={14} style={{ color: "#d97706" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Tournament Bonus Picks</span>
              <span className="text-[10px] ml-auto" style={{ color: "#94a3b8" }}>Lock before Jun 11</span>
            </div>

            <RuleRow label="Tournament winner" desc="Predict the World Cup champion"
              pts={tourneyWinner} setPts={setTourneyWinner} enabled={enableWinner} onToggle={() => setEnableWinner(v => !v)} />
            <RuleRow label="Top scorer (Golden Boot)" desc="Player with most goals in the tournament"
              pts={topScorer} setPts={setTopScorer} enabled={enableScorer} onToggle={() => setEnableScorer(v => !v)} />
            <RuleRow label="Top assister" desc="Player with most assists in the tournament"
              pts={topAssister} setPts={setTopAssister} enabled={enableAssister} onToggle={() => setEnableAssister(v => !v)} />
            <RuleRow label="Best defence" desc="Team that concedes fewest goals in group stage"
              pts={bestDefence} setPts={setBestDefence} enabled={enableDefence} onToggle={() => setEnableDefence(v => !v)} />
            <RuleRow label="Best young player" desc="Under-21 player of the tournament"
              pts={bestYoung} setPts={setBestYoung} enabled={enableYoung} onToggle={() => setEnableYoung(v => !v)} />
            <RuleRow label="Golden Ball (Best player)" desc="Overall best player of the tournament"
              pts={goldenBall} setPts={setGoldenBall} enabled={enableGoldenBall} onToggle={() => setEnableGoldenBall(v => !v)} />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ border: "1px solid #e2e8f0", color: "#64748b", background: "white" }}>
              Back
            </button>
            <button type="button" onClick={handleCreate} disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              {loading ? "Creating..." : <><Trophy size={16} /> Create Group — Free</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}