"use client";

import { useState, useEffect } from "react";
import { Gift, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

interface Props {
  groupId:       string;
  isCashGroup:   boolean; // false = company rewards group (no cash)
  currencySymbol: string;
}

export function GroupStagePrizeEditor({ groupId, isCashGroup, currencySymbol }: Props) {
  const [enabled,      setEnabled]      = useState(false);
  const [amount,       setAmount]       = useState<number>(0);
  const [label,        setLabel]        = useState("");
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.from("groups")
      .select("enable_group_stage_prize, group_stage_prize_amount, group_stage_prize_label")
      .eq("id", groupId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const d = data as {
          enable_group_stage_prize: boolean;
          group_stage_prize_amount: number | null;
          group_stage_prize_label:  string | null;
        };
        setEnabled(d.enable_group_stage_prize ?? false);
        setAmount(d.group_stage_prize_amount ?? 0);
        setLabel(d.group_stage_prize_label ?? "");
      });
  }, [groupId]);

  const handleSave = async () => {
    setSaving(true); setError(null);
    const sb = createClient();
    const { error: err } = await sb.from("groups")
      .update({
        enable_group_stage_prize: enabled,
        group_stage_prize_amount: enabled && isCashGroup  ? amount : null,
        group_stage_prize_label:  enabled && !isCashGroup ? label.trim() || null : null,
      } as Record<string, unknown>)
      .eq("id", groupId);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
        borderRadius: 22,
      }}>

      <div className="flex items-center gap-2.5">
        <Gift size={18} style={{ color: "#a78bfa" }} />
        <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>
          Group Stage Prize
        </span>
      </div>

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
        Award a bonus prize to the member with the most points after all 48 group stage matches
        (ends approximately July 2, 2026).
      </p>

      {/* Toggle row */}
      <div className="flex items-center justify-between gap-3 py-3 border-y"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div>
          <div className="text-sm font-bold" style={{ color: enabled ? "white" : "rgba(255,255,255,0.5)" }}>
            Enable group stage prize
          </div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            Shown in the dashboard and calculated automatically
          </div>
        </div>
        <Toggle enabled={enabled} onToggle={() => setEnabled(v => !v)} />
      </div>

      {enabled && (
        isCashGroup ? (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Prize amount ({currencySymbol})
            </label>
            <input
              type="number" min={0} value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl text-center font-display text-2xl font-black focus:outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#00D4FF" }}
              onFocus={e => e.target.style.borderColor = "#00D4FF"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Paid out from the prize pool to the group stage winner
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Prize description
            </label>
            <input
              type="text" value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Free lunch + early Friday"
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
              onFocus={e => e.target.style.borderColor = "#a78bfa"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Displayed to all members on their dashboard
            </p>
          </div>
        )
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
          style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
          <AlertCircle size={13} />{error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        style={{
          padding: "12px 24px", borderRadius: 12, width: "100%", border: "none",
          background: "linear-gradient(135deg, #a78bfa, #00D4FF)",
          color: "#050810", fontSize: 14, fontWeight: 800,
          fontFamily: "var(--font-display)", textTransform: "uppercase" as const,
          letterSpacing: "0.05em", cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}>
        {saved ? <span className="flex items-center justify-center gap-2"><Check size={14} /> Saved!</span>
          : saving ? "Saving…" : "Save group stage prize"}
      </button>
    </div>
  );
}
