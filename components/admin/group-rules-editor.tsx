"use client";

import { useState, useEffect } from "react";
import { FileText, Check, AlertCircle, Percent, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SCORING_EXAMPLES } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface GroupRulesEditorProps {
  groupId:          string;
  initialRulesText?: string;
  initialAdminFee?:  number;
  initialMaxMembers?: number;
  buyInAmount?:     number;
  memberCount?:     number;
}

export function GroupRulesEditor({
  groupId,
  initialRulesText  = "",
  initialAdminFee   = 0,
  initialMaxMembers = 100,
  buyInAmount       = 0,
  memberCount       = 0,
}: GroupRulesEditorProps) {
  const [rulesText,   setRulesText]   = useState(initialRulesText);
  const [adminFee,    setAdminFee]    = useState(initialAdminFee);
  const [maxMembers,  setMaxMembers]  = useState(initialMaxMembers);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Load current max_members from DB
  useEffect(() => {
    const sb = createClient();
    sb.from("groups")
      .select("max_members, rules_text, admin_fee_percent")
      .eq("id", groupId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as { max_members: number; rules_text: string | null; admin_fee_percent: number | null };
          setMaxMembers(d.max_members ?? 100);
          if (d.rules_text)        setRulesText(d.rules_text);
          if (d.admin_fee_percent) setAdminFee(d.admin_fee_percent);
        }
      });
  }, [groupId]);

  const totalPot  = buyInAmount * memberCount;
  const feeAmount = Math.round(totalPot * adminFee / 100);
  const netPot    = totalPot - feeAmount;

  const handleSave = async () => {
    if (maxMembers < memberCount) {
      setError(`Can't set max members below current count (${memberCount})`);
      return;
    }
    setSaving(true); setError(null);
    const sb = createClient();
    const { error: updateError } = await sb.from("groups")
      .update({
        rules_text:         rulesText,
        admin_fee_percent:  adminFee,
        max_members:        maxMembers,
      } as Record<string, unknown>)
      .eq("id", groupId);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">

      {/* Max members + Admin fee row */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Max members */}
        <div className="rounded-2xl p-5"
          style={{
            background: "rgba(18,14,38,0.32)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
            borderRadius: 22,
          }}>
          <div className="flex items-center gap-2.5 mb-4">
            <Users size={18} style={{ color: "#0891B2" }} />
            <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>
              Max Members
            </span>
          </div>
          <input
            type="number" min={memberCount || 1} max={500} step={1}
            value={maxMembers}
            onChange={e => { setMaxMembers(Number(e.target.value)); setSaved(false); }}
            className="w-full px-4 py-3 rounded-xl text-center font-display text-3xl font-black border focus:outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
            onFocus={e => e.target.style.borderColor = "#00D4FF"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
          />
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            {memberCount} joined so far · min {memberCount || 1}
          </p>
        </div>

        {/* Admin fee */}
        <div className="rounded-2xl p-5"
          style={{
            background: "rgba(18,14,38,0.32)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
            borderRadius: 22,
          }}>
          <div className="flex items-center gap-2.5 mb-4">
            <Percent size={18} style={{ color: "#0891B2" }} />
            <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>
              Admin Fee
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={50} step={0.5}
              value={adminFee}
              onChange={e => { setAdminFee(Number(e.target.value)); setSaved(false); }}
              className="flex-1 px-4 py-3 rounded-xl text-center font-display text-3xl font-black border focus:outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
              onFocus={e => e.target.style.borderColor = "#00D4FF"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <span className="font-black text-2xl" style={{ color: "rgba(255,255,255,0.4)" }}>%</span>
          </div>
          {adminFee > 0 ? (
            <div className="mt-3 rounded-xl p-3 space-y-1 text-xs"
              style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
              <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span>Group pool ({memberCount} × ${buyInAmount})</span>
                <span className="font-bold" style={{ color: "white" }}>${totalPot}</span>
              </div>
              <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span>Admin fee ({adminFee}%)</span>
                <span className="font-bold" style={{ color: "#d97706" }}>${feeAmount}</span>
              </div>
              <div className="flex justify-between pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="font-bold" style={{ color: "white" }}>Prize pool</span>
                <span className="font-display text-lg font-black" style={{ color: "#0891B2" }}>${netPot}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              0% by default. Members see any fee you set.
            </p>
          )}
        </div>
      </div>

      {/* Group rules text */}
      <div className="rounded-2xl p-5"
        style={{
          background: "rgba(18,14,38,0.32)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
          borderRadius: 22,
        }}>
        <div className="flex items-center gap-2.5 mb-4">
          <FileText size={18} style={{ color: "#0891B2" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>
            Group Rules
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
          Shown to all members and sent in the welcome email.
          Auto-populated with your scoring settings — add custom rules below.
        </p>
        <textarea
          value={rulesText}
          onChange={e => { setRulesText(e.target.value); setSaved(false); }}
          placeholder="e.g. No changing predictions after discussing with others. Entries collected by June 10."
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm border placeholder:text-slate-300 focus:outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
          onFocus={e => e.target.style.borderColor = "#00D4FF"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
        />

        {/* Scoring examples */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            Scoring examples (auto-included in rules)
          </div>
          {SCORING_EXAMPLES.map(ex => (
            <div key={ex.match} className="mb-4 last:mb-0">
              <div className="text-xs font-bold mb-1" style={{ color: "white" }}>{ex.match}</div>
              <div className="space-y-1">
                {ex.predictions.map(p => (
                  <div key={p.guess} className="flex items-center gap-3 text-xs">
                    <span className="font-mono w-8 shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>{p.guess}</span>
                    <span className="flex-1" style={{ color: "rgba(255,255,255,0.4)" }}>{p.label}</span>
                    <span className={cn("font-bold shrink-0",
                      p.points >= 3 ? "text-emerald-400" : p.points > 0 ? "text-slate-400" : "text-slate-600")}>
                      {p.points > 0 ? `+${p.points}` : "0"} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
          style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
          <AlertCircle size={13} />{error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#050810", fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase" as const, letterSpacing: "0.05em", cursor: "pointer", border: "none", width: "100%", opacity: saving ? 0.7 : 1 }}>
        {saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}