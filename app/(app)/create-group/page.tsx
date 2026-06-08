"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Users, Trophy, AlertCircle, Copy, Check,
  ArrowRight, Zap, ChevronDown, Settings, Building2, UserCheck, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { NeonBar } from "@/components/ui/neon-bar";
import { Chip } from "@/components/ui/chip";
import { useLocale } from "@/components/i18n/locale-provider";

const inputStyle = {
  width: "100%",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#ffffff",
  fontSize: 14,
  fontFamily: "var(--font-ui)",
  outline: "none",
  transition: "all 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: 10,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.5)",
  fontFamily: "var(--font-ui)",
  fontWeight: 700,
  marginBottom: 6,
};

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
};

const neutralTagStyle = {
  fontSize: 10, fontWeight: 600,
  color: "rgba(255,255,255,0.55)",
  background: "rgba(255,255,255,0.05)",
  padding: "3px 8px", borderRadius: 100,
  border: "1px solid rgba(255,255,255,0.08)",
  fontFamily: "var(--font-ui)",
};

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "ILS", symbol: "₪" },
  { code: "GBP", symbol: "£" },
  { code: "Other", symbol: "" },
];

const FEATURED_MATCHES = [
  { id: "final", label: "Final, MetLife Stadium",           detail: "Jul 19" },
  { id: "sf-1",  label: "Semi-Final 1, MetLife Stadium",    detail: "Jul 14" },
  { id: "sf-2",  label: "Semi-Final 2, AT&T Stadium",       detail: "Jul 15" },
  { id: "qf-1",  label: "Quarter-Final 1, MetLife Stadium", detail: "Jul 9"  },
  { id: "g001",  label: "Opening: Mexico vs South Africa",   detail: "Jun 11" },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} type="button"
      className="relative h-6 w-11 rounded-full shrink-0 transition-all"
      style={{ background: enabled ? "#00D4FF" : "rgba(255,255,255,0.12)" }}>
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
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <Toggle enabled={enabled} onToggle={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold" style={{ color: enabled ? "white" : "rgba(255,255,255,0.3)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)" }}>{desc}</div>
      </div>
      {enabled && (
        <div className="flex items-center gap-1.5 shrink-0">
          <input type="number" min={0} value={pts}
            onChange={(e: { target: HTMLInputElement }) => setPts(Number(e.target.value))}
            className="text-center"
            style={{
              width: 64, borderRadius: 10, padding: "6px 8px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#00D4FF", fontSize: 13, fontFamily: "var(--font-ui)", outline: "none",
            }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", width: 20 }}>pts</span>
        </div>
      )}
    </div>
  );
}

type PaymentModel = "pay_per_member" | "corporate_sponsored";

function CreateGroupInner() {
  const { t } = useLocale();
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
  const [currency,     setCurrency]     = useState("USD");
  const [otherSymbol,  setOtherSymbol]  = useState("");
  const [paymentLink,  setPaymentLink]  = useState("");

  const [knockoutPolicy,   setKnockoutPolicy]   = useState<'regular_90' | 'inc_extra_time' | 'to_qualify'>('regular_90');
  const [correctOutcome,   setCorrectOutcome]   = useState(10);
  const [exactScore,       setExactScore]       = useState(25);

  const [useProgressiveScoring, setUseProgressiveScoring] = useState(false);
  const [gsCorrectOutcome,    setGsCorrectOutcome]    = useState(2);
  const [gsExactScore,        setGsExactScore]        = useState(2);
  const [r32CorrectOutcome,   setR32CorrectOutcome]   = useState(3);
  const [r32ExactScore,       setR32ExactScore]       = useState(3);
  const [r16CorrectOutcome,   setR16CorrectOutcome]   = useState(4);
  const [r16ExactScore,       setR16ExactScore]       = useState(4);
  const [qfCorrectOutcome,    setQfCorrectOutcome]    = useState(5);
  const [qfExactScore,        setQfExactScore]        = useState(5);
  const [sfCorrectOutcome,    setSfCorrectOutcome]    = useState(5);
  const [sfExactScore,        setSfExactScore]        = useState(5);
  const [thirdCorrectOutcome, setThirdCorrectOutcome] = useState(5);
  const [thirdExactScore,     setThirdExactScore]     = useState(5);
  const [finalCorrectOutcome, setFinalCorrectOutcome] = useState(6);
  const [finalExactScore,     setFinalExactScore]     = useState(6);
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

  const totalPct    = payoutFirst + payoutSecond + payoutThird;
  const totalPot    = buyIn * memberCount;
  const isCorporate    = paymentModel === "corporate_sponsored";
  const currencySymbol = currency === "Other" ? (otherSymbol.trim() || "$") : CURRENCIES.find(c => c.code === currency)?.symbol ?? "$";

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
        currency:             currency,
        currency_symbol:      currencySymbol,
        payment_link:         paymentLink.trim() || null,
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
      payment_status: "free",
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
      knockout_policy:       knockoutPolicy,
      use_progressive_scoring: useProgressiveScoring,
      gs_correct_outcome:    gsCorrectOutcome,
      gs_exact_score:        gsExactScore,
      r32_correct_outcome:   r32CorrectOutcome,
      r32_exact_score:       r32ExactScore,
      r16_correct_outcome:   r16CorrectOutcome,
      r16_exact_score:       r16ExactScore,
      qf_correct_outcome:    qfCorrectOutcome,
      qf_exact_score:        qfExactScore,
      sf_correct_outcome:    sfCorrectOutcome,
      sf_exact_score:        sfExactScore,
      third_correct_outcome: thirdCorrectOutcome,
      third_exact_score:     thirdExactScore,
      final_correct_outcome: finalCorrectOutcome,
      final_exact_score:     finalExactScore,
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
      <div className="max-w-[480px] mx-auto space-y-4">
        <div style={{
          ...glassCard,
          borderRadius: 28,
          border: "1px solid rgba(0,255,136,0.25)",
          padding: 28,
          textAlign: "center",
        }} className="space-y-4">
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto",
            background: "linear-gradient(135deg, #00FF88, #00D4FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Check size={24} style={{ color: "#0B141B" }} />
          </div>
          <div>
            <h2 className="font-display uppercase font-black" style={{ fontSize: 28, color: "white" }}>
              {createdName}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6, fontFamily: "var(--font-ui)" }}>
              {isCorporate
                ? "Your corporate group is ready. Go to the group to unlock team invites."
                : "Share the passkey: members pay $2 to join."}
            </p>
          </div>

          {isCorporate ? (
            <button onClick={() => { window.location.href = `/groups/${groupId}`; }}
              className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{
                padding: "14px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                color: "#0B141B", fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: 15, textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 0 24px rgba(0,255,136,0.3)",
              }}>
              <Building2 size={16} /> Go to Group: Unlock Invites
            </button>
          ) : (
            <>
              <div style={{
                background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: 16, padding: 20,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#00D4FF",
                  textTransform: "uppercase", letterSpacing: "0.14em",
                  fontFamily: "var(--font-ui)", marginBottom: 8,
                }}>
                  Entry Passkey
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: 40,
                  color: "#00FF88", letterSpacing: "0.2em", lineHeight: 1,
                }}>
                  {passkey}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)", marginTop: 8 }}>
                  cupclash.live/join/{passkey}
                </div>
              </div>
              <button onClick={copyLink}
                className="w-full flex items-center justify-center gap-2"
                style={{
                  padding: "12px", borderRadius: 12,
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)",
                  color: "#00D4FF", fontFamily: "var(--font-ui)", fontWeight: 700,
                  fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
                }}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy invite link</>}
              </button>
              <button onClick={() => { window.location.href = "/dashboard"; }}
                className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{
                  padding: "14px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B", fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: 15, textTransform: "uppercase", cursor: "pointer",
                  boxShadow: "0 0 24px rgba(0,255,136,0.3)",
                }}>
                Go to Dashboard <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1 as const, label: t("cg_step_setup")   },
    { n: 2 as const, label: t("cg_step_prizes")  },
    { n: 3 as const, label: t("cg_step_scoring") },
  ];

  return (
    <div className="max-w-[480px] mx-auto space-y-4">

      {/* Page header */}
      <div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00D4FF", fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: 4 }}>
          New Group
        </div>
        <h1 className="font-display text-4xl uppercase" style={{ color: "white" }}>{t("cg_title")}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          {t("cg_subtitle")}
        </p>
      </div>

      {/* ── STEP 0: Payment model ──────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-3">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)" }}>
            Who pays for this group?
          </div>

          {/* Friend Circle */}
          <button
            onClick={() => { setPaymentModel("pay_per_member"); setStep(1); }}
            className="w-full text-left transition-all hover:-translate-y-0.5"
            style={{
              ...glassCard,
              padding: 0, overflow: "hidden", cursor: "pointer", display: "block",
              ...(paymentModel === "pay_per_member" ? {
                border: "2px solid rgba(0,255,136,0.5)",
                background: "rgba(0,255,136,0.04)",
              } : {}),
            }}>
            <NeonBar gradient={paymentModel === "pay_per_member" ? "linear-gradient(90deg,#00FF88,#00D4FF)" : undefined} />
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)",
                }}>
                  <UserCheck size={22} style={{ color: "#00FF88" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "white", textTransform: "uppercase" }}>
                      {t("cg_friend_mode")}
                    </span>
                    <Chip label="Free for you" color="#00FF88" />
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", lineHeight: 1.45, margin: 0 }}>
                    Free to join. Predict, compete, and win. Play with ads, or remove them for a one-time <strong style={{ color: "white" }}>$2 upgrade</strong>.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                    {["Fantasy leagues", "Friend groups", "Bar buddies", "Family"].map(t => (
                      <span key={t} style={neutralTagStyle}>{t}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={18} style={{ color: "#00FF88", flexShrink: 0, alignSelf: "center" }} />
              </div>
            </div>
          </button>

          {/* Corporate Sponsor */}
          <button
            onClick={() => { setPaymentModel("corporate_sponsored"); setStep(1); }}
            className="w-full text-left transition-all hover:-translate-y-0.5"
            style={{
              ...glassCard,
              padding: 0, overflow: "hidden", cursor: "pointer", display: "block",
              ...(paymentModel === "corporate_sponsored" ? {
                border: "2px solid rgba(0,212,255,0.5)",
                background: "rgba(0,212,255,0.04)",
              } : {}),
            }}>
            <NeonBar gradient="linear-gradient(90deg,#00D4FF,#00FF88)" />
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
                }}>
                  <Building2 size={22} style={{ color: "#00D4FF" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "white", textTransform: "uppercase" }}>
                      {t("cg_corporate_mode")}
                    </span>
                    <Chip label="Team pays $0" color="#00D4FF" />
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", lineHeight: 1.45, margin: 0 }}>
                    You cover the whole team with a one-time flat fee. Every employee joins for <strong style={{ color: "white" }}>$0 (zero friction)</strong>.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF", background: "rgba(0,212,255,0.1)", padding: "4px 8px", borderRadius: 8, fontFamily: "var(--font-mono)" }}>
                      $75 · up to 50 members
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", padding: "4px 8px", borderRadius: 8, fontFamily: "var(--font-mono)" }}>
                      $130 · up to 100 members
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                    {["HR managers", "Office pools", "Tech companies", "Remote teams"].map(t => (
                      <span key={t} style={neutralTagStyle}>{t}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={18} style={{ color: "#00D4FF", flexShrink: 0, alignSelf: "center" }} />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Step indicator */}
      {step > 0 && (
        <div className="space-y-3">
          <button onClick={() => setStep(0)}
            style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", padding: 0 }}>
            ← {t("cg_change_mode")}
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)",
                    transition: "all 0.2s",
                    ...(step > s.n ? {
                      background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                      color: "#0B141B",
                    } : step === s.n ? {
                      background: "rgba(0,212,255,0.1)",
                      border: "2px solid #00D4FF",
                      color: "#00D4FF",
                    } : {
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.25)",
                    }),
                  }}>
                    {step > s.n ? <Check size={12} /> : s.n}
                  </div>
                  <span style={{
                    fontSize: 10, fontFamily: "var(--font-ui)", fontWeight: 700,
                    whiteSpace: "nowrap",
                    color: step === s.n ? "#00D4FF" : step > s.n ? "#00FF88" : "rgba(255,255,255,0.25)",
                  }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 32, height: 1, marginTop: 14, flexShrink: 0,
                    background: step > s.n ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.1)",
                    transition: "all 0.2s",
                  }} />
                )}
              </div>
            ))}
          </div>

          {isCorporate && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <Building2 size={14} style={{ color: "#00D4FF" }} />
              <span className="text-xs font-medium" style={{ color: "#00D4FF" }}>
                Corporate mode: employees join free · activate dashboard link after setup
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div style={{ ...glassCard, padding: 20 }} className="space-y-4">
            <div>
              <label style={labelStyle}>{isCorporate ? t("cg_company_name") : t("cg_group_name")} *</label>
              <div className="relative">
                {isCorporate
                  ? <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.35)" }} />
                  : <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.35)" }} />}
                <input type="text"
                  placeholder={isCorporate ? "e.g. Engineering Dept, World Cup 2026" : "e.g. Sunday Squad World Cup"}
                  value={groupName} onChange={(e: { target: HTMLInputElement }) => setGroupName(e.target.value)}
                  onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,255,136,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.1)"; }}
                  onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                  className="placeholder:text-[rgba(255,255,255,0.3)]"
                  style={{ ...inputStyle, padding: "12px 16px 12px 40px" }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t("cg_group_type")}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "tournament" as const, icon: Trophy, label: t("cg_full_tournament"), desc: "All 104 matches" },
                  { type: "single_match" as const, icon: Zap,  label: t("cg_single_match"),   desc: "One specific match" },
                ].map(({ type, icon: Icon, label, desc }) => (
                  <button key={type} type="button" onClick={() => setGroupType(type)}
                    className="p-3 text-left transition-all"
                    style={groupType === type ? {
                      borderRadius: 12, cursor: "pointer",
                      background: "rgba(0,212,255,0.08)", border: "1.5px solid rgba(0,212,255,0.35)",
                    } : {
                      borderRadius: 12, cursor: "pointer",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                    <Icon size={16} style={{ color: groupType === type ? "#00D4FF" : "rgba(255,255,255,0.3)", marginBottom: 6, display: "block" }} />
                    <div className="text-xs font-bold" style={{ color: groupType === type ? "#00D4FF" : "rgba(255,255,255,0.6)" }}>{label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {groupType === "single_match" && (
              <div className="relative">
                <label style={labelStyle}>Select Match</label>
                <button type="button" onClick={() => setShowPicker((v: boolean) => !v)}
                  className="w-full flex items-center justify-between rounded-xl"
                  style={{ ...inputStyle, padding: "12px 16px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{FEATURED_MATCHES.find(m => m.id === selectedMatch)?.label}</span>
                  <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                </button>
                {showPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                    style={{ background: "rgba(10,8,24,0.96)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                    {FEATURED_MATCHES.map(m => (
                      <button key={m.id} type="button"
                        onClick={() => { setSelectedMatch(m.id); setShowPicker(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-left border-b last:border-0 transition-colors"
                        style={{ borderColor: "rgba(255,255,255,0.07)", color: selectedMatch === m.id ? "#00D4FF" : "rgba(255,255,255,0.6)", background: "transparent" }}
                        onMouseEnter={(e: { currentTarget: HTMLElement }) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e: { currentTarget: HTMLElement }) => { e.currentTarget.style.background = "transparent"; }}>
                        <span className="text-xs font-bold truncate min-w-0">{m.label}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{m.detail}</span>
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
          }} className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{
              padding: "13px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B",
              fontWeight: 700, fontFamily: "var(--font-ui)", fontSize: 14,
              textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
              boxShadow: "0 0 20px rgba(0,255,136,0.25)",
            }}>
            {t("cg_next_prizes")} <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div style={{ ...glassCard, padding: 20 }} className="space-y-4">
            {/* Currency */}
            <div>
              <label style={labelStyle}>Currency</label>
              <div className="grid grid-cols-5 gap-1.5">
                {CURRENCIES.map(c => (
                  <button key={c.code} type="button" onClick={() => setCurrency(c.code)}
                    className="py-2 text-center transition-all"
                    style={{
                      borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
                      border: currency === c.code ? "1.5px solid rgba(0,212,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                      background: currency === c.code ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)",
                      color: currency === c.code ? "#00D4FF" : "rgba(255,255,255,0.5)",
                      fontFamily: "var(--font-ui)",
                    }}>
                    {c.code === "Other" ? "Other" : `${c.symbol} ${c.code}`}
                  </button>
                ))}
              </div>
              {currency === "Other" && (
                <div className="mt-2">
                  <input
                    type="text" maxLength={5} value={otherSymbol}
                    onChange={(e: { target: HTMLInputElement }) => setOtherSymbol(e.target.value)}
                    placeholder="e.g. ₽"
                    className="placeholder:text-[rgba(255,255,255,0.3)]"
                    style={{ ...inputStyle, padding: "8px 12px", width: 120 }} />
                </div>
              )}
            </div>
            {isCorporate ? (
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Prize Structure</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPrizeTrack("cash")}
                      className="p-4 text-left transition-all"
                      style={{
                        borderRadius: 12, cursor: "pointer",
                        border: prizeTrack === "cash" ? "1.5px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                        background: prizeTrack === "cash" ? "rgba(0,212,255,0.05)" : "rgba(255,255,255,0.04)",
                      }}>
                      <div className="text-sm font-bold mb-1" style={{ color: "white" }}>💰 Cash Split</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Track a buy-in pot with % payouts</div>
                    </button>
                    <button type="button" onClick={() => setPrizeTrack("company")}
                      className="p-4 text-left transition-all"
                      style={{
                        borderRadius: 12, cursor: "pointer",
                        border: prizeTrack === "company" ? "1.5px solid rgba(0,255,136,0.4)" : "1px solid rgba(255,255,255,0.1)",
                        background: prizeTrack === "company" ? "rgba(0,255,136,0.05)" : "rgba(255,255,255,0.04)",
                      }}>
                      <div className="text-sm font-bold mb-1" style={{ color: "white" }}>🏆 Company Rewards</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Custom rewards, no financial tracking</div>
                    </button>
                  </div>
                </div>

                {prizeTrack === "cash" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>{t("cg_buy_in")}</label>
                        <input type="number" min={0} value={buyIn} onChange={(e: { target: HTMLInputElement }) => setBuyIn(Number(e.target.value))}
                          style={{ ...inputStyle, padding: "12px 16px", color: "#00D4FF" }} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t("cg_member_count")}</label>
                        <input type="number" min={2} value={memberCount} onChange={(e: { target: HTMLInputElement }) => setMemberCount(Number(e.target.value))}
                          style={{ ...inputStyle, padding: "12px 16px" }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ ...labelStyle, marginBottom: 0 }}>{t("cg_payout_split")}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)", color: totalPct === 100 ? "#00FF88" : "#f87171" }}>
                        {totalPct === 100 ? "✓ 100% allocated" : `${totalPct}% · Must equal 100%`}
                      </span>
                    </div>
                    {([
                      { label: `🥇 ${t("cg_prize_1st")}`, val: payoutFirst,  set: setPayoutFirst  },
                      { label: `🥈 ${t("cg_prize_2nd")}`, val: payoutSecond, set: setPayoutSecond },
                      { label: `🥉 ${t("cg_prize_3rd")}`, val: payoutThird,  set: setPayoutThird  },
                    ] as const).map(({ label, val, set }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-sm w-16 shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                        <input type="number" min={0} max={100} value={val} onChange={(e: { target: HTMLInputElement }) => set(Number(e.target.value))}
                          className="text-center"
                          style={{ width: 64, borderRadius: 10, padding: "6px 8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#00D4FF", fontSize: 13, fontFamily: "var(--font-ui)", outline: "none" }} />
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs rounded-xl px-4 py-3"
                      style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", color: "rgba(255,255,255,0.5)" }}>
                      Specify custom workspace rewards for each leaderboard place below.
                    </p>
                    <div>
                      <label style={labelStyle}>How many places to reward?</label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(n => (
                          <button key={n} type="button" onClick={() => setRewardPlaces(n)}
                            className="flex-1 py-2 text-sm font-bold transition-all"
                            style={{
                              borderRadius: 12, cursor: "pointer",
                              border: rewardPlaces >= n ? "1.5px solid rgba(0,255,136,0.4)" : "1px solid rgba(255,255,255,0.1)",
                              background: rewardPlaces >= n ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.04)",
                              color: rewardPlaces >= n ? "#00FF88" : "rgba(255,255,255,0.4)",
                            }}>
                            {n === 1 ? "1st Only" : n === 2 ? "Top 2" : "Top 3"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {([
                        { place: 1, label: `🥇 ${t("cg_prize_1st")}`, key: "reward1" as const, ph: "e.g. Extra day off + $100 Amazon Voucher" },
                        { place: 2, label: `🥈 ${t("cg_prize_2nd")}`, key: "reward2" as const, ph: "e.g. Free company swag or free lunch"     },
                        { place: 3, label: `🥉 ${t("cg_prize_3rd")}`, key: "reward3" as const, ph: "e.g. Special desk trophy & bragging rights" },
                      ] as const).filter(r => r.place <= rewardPlaces).map(({ label, key, ph }) => (
                        <div key={key}>
                          <label style={labelStyle}>{label}</label>
                          <input type="text" placeholder={ph} value={companyRewards[key]}
                            onChange={(e: { target: HTMLInputElement }) => setCompanyRewards({ ...companyRewards, [key]: e.target.value })}
                            onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,255,136,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.1)"; }}
                            onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                            className="placeholder:text-[rgba(255,255,255,0.3)]"
                            style={{ ...inputStyle, padding: "12px 16px" }} />
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
                    <label style={labelStyle}>{t("cg_buy_in")}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>{currencySymbol}</span>
                      <input type="number" min={0} value={buyIn} onChange={(e: { target: HTMLInputElement }) => setBuyIn(Number(e.target.value))}
                        style={{ ...inputStyle, padding: "12px 16px 12px 36px", color: "#00D4FF" }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{t("cg_member_count")}</label>
                    <input type="number" min={2} value={memberCount} onChange={(e: { target: HTMLInputElement }) => setMemberCount(Number(e.target.value))}
                      style={{ ...inputStyle, padding: "12px 16px" }} />
                  </div>
                </div>

                <div className="px-4 py-3 rounded-xl flex justify-between items-center"
                  style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.12)" }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)" }}>Projected Cash Pool:</span>
                  <span className="font-bold" style={{ color: "#00FF88" }}>{currencySymbol}{totalPot}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label style={{ ...labelStyle, marginBottom: 0 }}>{t("cg_payout_split")}</label>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)", color: totalPct === 100 ? "#00FF88" : "#f87171" }}>
                      {totalPct === 100 ? "✓ 100% allocated" : `${totalPct}% · Must equal 100%`}
                    </span>
                  </div>
                  {[
                    { label: `🥇 ${t("cg_prize_1st")}`, val: payoutFirst,  set: setPayoutFirst,  split: Math.round(totalPot * payoutFirst  / 100) },
                    { label: `🥈 ${t("cg_prize_2nd")}`, val: payoutSecond, set: setPayoutSecond, split: Math.round(totalPot * payoutSecond / 100) },
                    { label: `🥉 ${t("cg_prize_3rd")}`, val: payoutThird,  set: setPayoutThird,  split: Math.round(totalPot * payoutThird  / 100) },
                  ].map(({ label, val, set, split }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-sm w-20 font-medium shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                      <input type="number" min={0} max={100} value={val} onChange={(e: { target: HTMLInputElement }) => set(Number(e.target.value))}
                        className="text-center"
                        style={{ width: 64, borderRadius: 10, padding: "6px 8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#00D4FF", fontSize: 13, fontFamily: "var(--font-ui)", outline: "none" }} />
                      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, width: 20 }}>%</span>
                      <span className="text-xs ml-auto font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{currencySymbol}{split} prize</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Link */}
            <div>
              <label style={labelStyle}>Payment collection link (optional)</label>
              <input
                type="url" value={paymentLink}
                onChange={(e: { target: HTMLInputElement }) => setPaymentLink(e.target.value)}
                placeholder="https://bit.ly/your-paybox-link"
                onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.1)"; }}
                onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                className="placeholder:text-[rgba(255,255,255,0.3)]"
                style={{ ...inputStyle, padding: "12px 16px" }} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
                Share a link where members can send their buy-in (PayBox, Paypal, Venmo, etc.)
              </p>
            </div>
          </div>

          <button type="button" onClick={() => {
            if (!isCorporate && totalPct !== 100) { setError("Prize allocation must equal exactly 100%"); return; }
            if (isCorporate && prizeTrack === "cash" && totalPct !== 100) { setError("Prize allocation must equal exactly 100%"); return; }
            setError(null); setStep(3);
          }} className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{
              padding: "13px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B",
              fontWeight: 700, fontFamily: "var(--font-ui)", fontSize: 14,
              textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
              boxShadow: "0 0 20px rgba(0,255,136,0.25)",
            }}>
            {t("cg_next_scoring")} <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── STEP 3 ─────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div style={{ ...glassCard, padding: 20 }}>
            <div className="flex items-center gap-2 mb-4">
              <Settings size={14} style={{ color: "#00D4FF" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)" }}>
                {t("cg_scoring_rules")}
              </span>
            </div>
            <RuleRow label="Match Outcome"        desc="Correctly predicting W/D/L result"             pts={correctOutcome} setPts={setCorrectOutcome} enabled={enableOutcome}    onToggle={() => setEnableOutcome(!enableOutcome)}       />
            <RuleRow label="Exact Scoreline"       desc="Bonus for guessing identical score (e.g. 2-1)" pts={exactScore}     setPts={setExactScore}     enabled={enableExact}      onToggle={() => setEnableExact(!enableExact)}           />
            <RuleRow label="Knockout Advancement"  desc="Correctly choosing which team advances"        pts={koAdvancement}  setPts={setKoAdvancement}  enabled={enableKO}         onToggle={() => setEnableKO(!enableKO)}                 />
            <RuleRow label="Tournament Champion"   desc="Picking the winner of the trophy"              pts={tourneyWinner}  setPts={setTourneyWinner}  enabled={enableWinner}     onToggle={() => setEnableWinner(!enableWinner)}         />
            <RuleRow label="Golden Boot Winner"    desc="Predicting top goals scorer"                   pts={topScorer}      setPts={setTopScorer}      enabled={enableScorer}     onToggle={() => setEnableScorer(!enableScorer)}         />
            <RuleRow label="Top Assist Playmaker"  desc="Predicting tournament assists champion"        pts={topAssister}    setPts={setTopAssister}    enabled={enableAssister}   onToggle={() => setEnableAssister(!enableAssister)}     />
            <RuleRow label="Best Defence"          desc="Team with lowest goals conceded"               pts={bestDefence}    setPts={setBestDefence}    enabled={enableDefence}    onToggle={() => setEnableDefence(!enableDefence)}       />
            <RuleRow label="Best Young Player"     desc="Official FIFA Best Young Player award"         pts={bestYoung}      setPts={setBestYoung}      enabled={enableYoung}      onToggle={() => setEnableYoung(!enableYoung)}           />
            <RuleRow label="Golden Ball (MVP)"     desc="Tournament best player award winner"           pts={goldenBall}     setPts={setGoldenBall}     enabled={enableGoldenBall} onToggle={() => setEnableGoldenBall(!enableGoldenBall)} />

            {/* Progressive Stage Scoring */}
            <div className="pt-3 mt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Progressive Stage Scoring</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)" }}>
                    Higher-stakes matches award more points
                  </div>
                </div>
                <Toggle enabled={useProgressiveScoring} onToggle={() => setUseProgressiveScoring(v => !v)} />
              </div>

              {useProgressiveScoring && (
                <div className="space-y-3">
                  {/* Stage table */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-ui)" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ textAlign: "left", padding: "6px 8px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stage</th>
                          <th style={{ textAlign: "center", padding: "6px 8px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Outcome</th>
                          <th style={{ textAlign: "center", padding: "6px 8px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Exact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {([
                          { label: "Group Stage",    co: gsCorrectOutcome,    setCo: setGsCorrectOutcome,    es: gsExactScore,        setEs: setGsExactScore        },
                          { label: "Round of 32",    co: r32CorrectOutcome,   setCo: setR32CorrectOutcome,   es: r32ExactScore,       setEs: setR32ExactScore       },
                          { label: "Round of 16",    co: r16CorrectOutcome,   setCo: setR16CorrectOutcome,   es: r16ExactScore,       setEs: setR16ExactScore       },
                          { label: "Quarter Finals", co: qfCorrectOutcome,    setCo: setQfCorrectOutcome,    es: qfExactScore,        setEs: setQfExactScore        },
                          { label: "Semi Finals",    co: sfCorrectOutcome,    setCo: setSfCorrectOutcome,    es: sfExactScore,        setEs: setSfExactScore        },
                          { label: "3rd Place",      co: thirdCorrectOutcome, setCo: setThirdCorrectOutcome, es: thirdExactScore,     setEs: setThirdExactScore     },
                          { label: "Final",          co: finalCorrectOutcome, setCo: setFinalCorrectOutcome, es: finalExactScore,     setEs: setFinalExactScore     },
                        ] as const).map(({ label, co, setCo, es, setEs }) => (
                          <tr key={label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "6px 8px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</td>
                            <td style={{ padding: "6px 8px", textAlign: "center" }}>
                              <input type="number" min={0} value={co}
                                onChange={(e: { target: HTMLInputElement }) => setCo(Number(e.target.value))}
                                className="text-center"
                                style={{ width: 52, borderRadius: 8, padding: "4px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#00D4FF", fontSize: 13, fontFamily: "var(--font-ui)", outline: "none" }} />
                            </td>
                            <td style={{ padding: "6px 8px", textAlign: "center" }}>
                              <input type="number" min={0} value={es}
                                onChange={(e: { target: HTMLInputElement }) => setEs(Number(e.target.value))}
                                className="text-center"
                                style={{ width: 52, borderRadius: 8, padding: "4px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#00FF88", fontSize: 13, fontFamily: "var(--font-ui)", outline: "none" }} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Live preview */}
                  <div style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)", marginBottom: 6 }}>
                      Max pts per match by stage
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {[
                        { label: "Group",  val: gsCorrectOutcome    + gsExactScore        },
                        { label: "R32",    val: r32CorrectOutcome   + r32ExactScore       },
                        { label: "R16",    val: r16CorrectOutcome   + r16ExactScore       },
                        { label: "QF",     val: qfCorrectOutcome    + qfExactScore        },
                        { label: "SF",     val: sfCorrectOutcome    + sfExactScore        },
                        { label: "3rd",    val: thirdCorrectOutcome + thirdExactScore     },
                        { label: "Final",  val: finalCorrectOutcome + finalExactScore     },
                      ].map(({ label, val }) => (
                        <span key={label}>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}: </span>
                          <span style={{ color: "#00D4FF", fontWeight: 700 }}>{val}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Knockout score evaluation policy */}
            <div className="pt-3 mt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", marginBottom: 10 }}>
                {t("cg_knockout_eval")}
              </div>
              <div className="space-y-2">
                {([
                  { value: "regular_90"    as const, label: t("cg_90_mins"),      desc: "Regulation time result only — ET & penalties ignored" },
                  { value: "inc_extra_time" as const, label: t("cg_inc_et"),      desc: "120-minute result counts — penalties still ignored"   },
                  { value: "to_qualify"    as const, label: t("cg_who_advances"), desc: "Advancement pick only — exact score doesn't count"    },
                ] as const).map(({ value, label, desc }) => {
                  const active = knockoutPolicy === value;
                  return (
                    <button key={value} type="button" onClick={() => setKnockoutPolicy(value)}
                      className="w-full text-left transition-all"
                      style={{
                        borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                        background: active ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.03)",
                        border: active ? "1.5px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.09)",
                      }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? "rgb(251,191,36)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-ui)" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)", marginTop: 2 }}>{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button type="button" onClick={handleCreate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:-translate-y-0.5"
            style={{
              padding: "16px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
              textTransform: "uppercase", letterSpacing: "0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 0 24px rgba(0,255,136,0.3)",
            }}>
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Creating your league...</>
              : <><Trophy size={16} /> {t("cg_complete")}</>}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreateGroupPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[480px] mx-auto py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
        Loading...
      </div>
    }>
      <CreateGroupInner />
    </Suspense>
  );
}
