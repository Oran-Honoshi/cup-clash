"use client";

import { useState } from "react";
import { FileText, Check, AlertCircle, Percent, DollarSign } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SCORING_EXAMPLES } from "@/lib/scoring";
import { cn } from "@/lib/utils";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface GroupRulesEditorProps {
  groupId: string;
  initialRulesText?: string;
  initialAdminFee?: number;
  buyInAmount?: number;
  memberCount?: number;
}

export function GroupRulesEditor({
  groupId,
  initialRulesText = "",
  initialAdminFee = 0,
  buyInAmount = 0,
  memberCount = 0,
}: GroupRulesEditorProps) {
  const [rulesText,  setRulesText]  = useState(initialRulesText);
  const [adminFee,   setAdminFee]   = useState(initialAdminFee);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const totalPot   = buyInAmount * memberCount;
  const feeAmount  = Math.round(totalPot * adminFee / 100);
  const netPot     = totalPot - feeAmount;

  const handleSave = async () => {
    setSaving(true); setError(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await new Promise(r => setTimeout(r, 600));
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); return;
    }

    const sb = getClient();
    const { error: updateError } = await sb.from("groups")
      .update({ rules_text: rulesText, admin_fee_percent: adminFee } as Record<string, unknown>)
      .eq("id", groupId);

    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Admin fee */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <Percent size={18} style={{ color: "rgb(var(--accent-glow))" }} />
          <span className="font-display text-xl uppercase text-white tracking-tight">
            Administrator Fee
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <input type="number" min={0} max={50} step={0.5}
              value={adminFee}
              onChange={e => { setAdminFee(Number(e.target.value)); setSaved(false); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent text-center font-display text-2xl" />
          </div>
          <span className="text-pitch-400 font-bold text-lg">%</span>
        </div>

        {adminFee > 0 ? (
          <div className="glass rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-pitch-300">
              <span>Total pot ({memberCount} × ${buyInAmount})</span>
              <span className="font-bold text-white">${totalPot}</span>
            </div>
            <div className="flex justify-between text-pitch-300">
              <span>Admin fee ({adminFee}%)</span>
              <span className="font-bold text-warning">${feeAmount}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/[0.06]">
              <span className="font-bold text-white">Prize pool</span>
              <span className="font-display text-xl" style={{ color: "rgb(var(--accent-glow))" }}>
                ${netPot}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-pitch-500">
            Set to 0% by default. If you set a fee, it will be clearly shown to all members in the group rules.
          </p>
        )}

        {adminFee > 0 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-warning">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            Members will see this fee prominently in the group rules and welcome email.
          </div>
        )}
      </Card>

      {/* Group rules text */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <FileText size={18} style={{ color: "rgb(var(--accent-glow))" }} />
          <span className="font-display text-xl uppercase text-white tracking-tight">
            Group Rules
          </span>
        </div>

        <p className="text-xs text-pitch-500 mb-3">
          These rules are shown to all members and sent in the welcome email.
          Auto-populated with your scoring settings — add any custom rules below.
        </p>

        <textarea
          value={rulesText}
          onChange={e => { setRulesText(e.target.value); setSaved(false); }}
          placeholder="e.g. No changing predictions after discussing with others. Buy-ins collected by June 10. Disputes resolved by admin."
          rows={6}
          className="w-full px-4 py-3 rounded-xl text-sm text-white bg-white/[0.06] border border-white/[0.12] placeholder:text-pitch-600 focus:outline-none focus:border-accent resize-none"
        />

        {/* Scoring examples */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="label-caps mb-3">Scoring examples (auto-included in rules)</div>
          {SCORING_EXAMPLES.map((ex) => (
            <div key={ex.match} className="mb-4 last:mb-0">
              <div className="text-xs font-bold text-white mb-2">{ex.match}</div>
              <div className="space-y-1">
                {ex.predictions.map((p) => (
                  <div key={p.guess} className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-pitch-300 w-8 shrink-0">{p.guess}</span>
                    <span className="text-pitch-400 flex-1">{p.label}</span>
                    <span className={cn("font-bold shrink-0",
                      p.points >= 3 ? "text-success" : p.points > 0 ? "text-pitch-200" : "text-pitch-600")}>
                      {p.points > 0 ? `+${p.points}` : "0"} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {error && <div className="flex items-center gap-2 text-xs text-danger"><AlertCircle size={13} />{error}</div>}

      <Button onClick={handleSave} loading={saving} size="sm" className="w-full"
        leftIcon={saved ? <Check size={14} /> : <FileText size={14} />}>
        {saved ? "Saved!" : "Save rules & admin fee"}
      </Button>
    </div>
  );
}
