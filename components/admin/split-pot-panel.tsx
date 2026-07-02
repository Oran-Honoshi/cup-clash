"use client";

import { useState } from "react";
import { Scale, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { findPayoutTieGroups, PAYOUT_POSITIONS, type PayoutPosition } from "@/lib/leaderboard-sort";
import type { Member, Group } from "@/lib/types";

interface SplitPotPanelProps {
  groupId:        string;
  members:        Member[]; // must already be sorted via sortMembersForRanking
  payouts:        Group["payouts"];
  payoutSplits:   Group["payoutSplits"];
  buyInAmount:    number;
  currencySymbol: string;
  finalLocked:    boolean;
}

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(251,191,36,0.2)",
} as const;

const POSITION_LABEL: Record<PayoutPosition, string> = { first: "1st", second: "2nd", third: "3rd" };

function parsePct(val: string): number {
  return parseFloat(val.replace("%", "")) || 0;
}

export function SplitPotPanel({ groupId, members, payouts, payoutSplits, buyInAmount, currencySymbol, finalLocked }: SplitPotPanelProps) {
  const [saving, setSaving] = useState<string | null>(null); // key of positions joined, while in flight
  const [localSplits, setLocalSplits] = useState(payoutSplits);

  if (!finalLocked) return null;

  const pool = members.filter(m => m.paid).length * buyInAmount;
  const tieGroups = findPayoutTieGroups(members);

  if (tieGroups.length === 0) return null;

  const isResolved = (positions: PayoutPosition[], memberIds: string[]) =>
    positions.every(pos => {
      const split = localSplits[pos];
      return split && split.length === memberIds.length && memberIds.every(id => split.includes(id));
    });

  const submit = async (positions: PayoutPosition[], memberIds: string[] | null) => {
    const key = positions.join(",");
    setSaving(key);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token ?? "";
    for (const position of positions) {
      await fetch("/api/admin/split-pot", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ groupId, position, memberIds }),
      });
    }
    setLocalSplits(prev => {
      const next = { ...prev };
      positions.forEach(pos => { next[pos] = memberIds; });
      return next;
    });
    setSaving(null);
  };

  return (
    <div className="rounded-2xl p-5 space-y-4" style={glass}>
      <div className="flex items-center gap-2.5">
        <Scale size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
        <span className="font-display text-xl uppercase tracking-tight text-white">Split the Pot</span>
      </div>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        The final standings have a genuine tie after all tiebreakers (exact scores, closest Final goal-minute guess,
        correct Tournament Winner pick). Confirm how to split the prize.
      </p>

      {tieGroups.map(group => {
        const memberIds = group.members.map(m => m.id);
        const names = group.members.map(m => m.name);
        const combinedPct = group.positions.reduce((sum, pos) => sum + parsePct(payouts[pos]), 0);
        const totalPrize = Math.floor((pool * combinedPct) / 100);
        const perMember = group.members.length ? Math.floor(totalPrize / group.members.length) : 0;
        const resolved = isResolved(group.positions, memberIds);
        const key = group.positions.join(",");
        const positionLabel = group.positions.map(p => POSITION_LABEL[p]).join(group.positions.length > 1 ? " + " : "");

        return (
          <div key={key} className="rounded-xl p-4 space-y-3"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
              {names.length === 2
                ? <><strong className="text-white">{names[0]}</strong> and <strong className="text-white">{names[1]}</strong></>
                : <strong className="text-white">{names.join(", ")}</strong>}
              {" "}are tied for {positionLabel} place after all tiebreakers.
              {buyInAmount > 0 && (
                <> Split the {combinedPct}% prize ({currencySymbol}{totalPrize}) — {currencySymbol}{perMember} each?</>
              )}
            </p>

            {resolved ? (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: "#00FF88" }}>
                  <Check size={12} /> Split confirmed — {currencySymbol}{perMember} each
                </span>
                <button
                  onClick={() => submit(group.positions, null)}
                  disabled={saving === key}
                  className="text-xs font-bold uppercase tracking-widest disabled:opacity-40"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  Undo
                </button>
              </div>
            ) : (
              <button
                onClick={() => submit(group.positions, memberIds)}
                disabled={saving === key}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)", color: "#0B141B" }}>
                {saving === key ? "Saving…" : "Split the prize"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
