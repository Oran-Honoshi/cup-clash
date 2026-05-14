"use client";

import { useState, useEffect } from "react";
import { FileText, Check, AlertCircle, Percent, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <Users size={18} style={{ color: "#0891B2" }} />
            <span className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>
              Max Members
            </span>
          </div>
          <input
            type="number" min={memberCount || 1} max={500} step={1}
            value={maxMembers}
            onChange={e => { setMaxMembers(Number(e.target.value)); setSaved(false); }}
            className="w-full px-4 py-3 rounded-xl text-center font-display text-3xl font-black border focus:outline-none"
            style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}
            onFocus={e => e.target.style.borderColor = "#00D4FF"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
            {memberCount} joined so far · min {memberCount || 1}
          </p>
        </div>

        {/* Admin fee */}
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <Percent size={18} style={{ color: "#0891B2" }} />
            <span className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>
              Admin Fee
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={50} step={0.5}
              value={adminFee}
              onChange={e => { setAdminFee(Number(e.target.value)); setSaved(false); }}
              className="flex-1 px-4 py-3 rounded-xl text-center font-display text-3xl font-black border focus:outline-none"
              style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}
              onFocus={e => e.target.style.borderColor = "#00D4FF"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            <span className="font-black text-2xl" style={{ color: "#94a3b8" }}>%</span>
          </div>
          {adminFee > 0 ? (
            <div className="mt-3 rounded-xl p-3 space-y-1 text-xs"
              style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
              <div className="flex justify-between" style={{ color: "#64748b" }}>
                <span>Total pot ({memberCount} × ${buyInAmount})</span>
                <span className="font-bold" style={{ color: "#0F172A" }}>${totalPot}</span>
              </div>
              <div className="flex justify-between" style={{ color: "#64748b" }}>
                <span>Admin fee ({adminFee}%)</span>
                <span className="font-bold" style={{ color: "#d97706" }}>${feeAmount}</span>
              </div>
              <div className="flex justify-between pt-1 border-t" style={{ borderColor: "#e2e8f0" }}>
                <span className="font-bold" style={{ color: "#0F172A" }}>Prize pool</span>
                <span className="font-display text-lg font-black" style={{ color: "#0891B2" }}>${netPot}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
              0% by default. Members see any fee you set.
            </p>
          )}
        </div>
      </div>

      {/* Group rules text */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <FileText size={18} style={{ color: "#0891B2" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>
            Group Rules
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: "#64748b" }}>
          Shown to all members and sent in the welcome email.
          Auto-populated with your scoring settings — add custom rules below.
        </p>
        <textarea
          value={rulesText}
          onChange={e => { setRulesText(e.target.value); setSaved(false); }}
          placeholder="e.g. No changing predictions after discussing with others. Buy-ins collected by June 10."
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm border placeholder:text-slate-300 focus:outline-none resize-none"
          style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}
          onFocus={e => e.target.style.borderColor = "#00D4FF"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />

        {/* Scoring examples */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "#f1f5f9" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#94a3b8" }}>
            Scoring examples (auto-included in rules)
          </div>
          {SCORING_EXAMPLES.map(ex => (
            <div key={ex.match} className="mb-4 last:mb-0">
              <div className="text-xs font-bold mb-1" style={{ color: "#0F172A" }}>{ex.match}</div>
              <div className="space-y-1">
                {ex.predictions.map(p => (
                  <div key={p.guess} className="flex items-center gap-3 text-xs">
                    <span className="font-mono w-8 shrink-0" style={{ color: "#64748b" }}>{p.guess}</span>
                    <span className="flex-1" style={{ color: "#94a3b8" }}>{p.label}</span>
                    <span className={cn("font-bold shrink-0",
                      p.points >= 3 ? "text-emerald-600" : p.points > 0 ? "text-slate-600" : "text-slate-300")}>
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

      <Button onClick={handleSave} loading={saving} size="sm" className="w-full"
        leftIcon={saved ? <Check size={14} /> : <FileText size={14} />}>
        {saved ? "Saved!" : "Save group settings"}
      </Button>
    </div>
  );
}