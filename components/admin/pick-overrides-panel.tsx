"use client";

import { useState, useEffect } from "react";
import { Check, X, AlertCircle, Trophy, Edit3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MemberPick {
  userId:    string;
  userName:  string;
  predType:  string;
  submitted: string;
  hasOverride: boolean;
  overridePoints: number;
}

const PICK_LABELS: Record<string, string> = {
  winner:       "Tournament Winner",
  top_scorer:   "Top Scorer",
  top_assister: "Top Assister",
  golden_ball:  "Golden Ball",
};

const PICK_TYPES = Object.keys(PICK_LABELS);

interface PickOverridesPanelProps {
  groupId: string;
  adminId: string;
}

export function PickOverridesPanel({ groupId, adminId }: PickOverridesPanelProps) {
  const [picks,      setPicks]      = useState<MemberPick[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState<string | null>(null);
  const [actualValues, setActualValues] = useState<Record<string, string>>({});
  const [pointValues,  setPointValues]  = useState<Record<string, number>>({});

  useEffect(() => {
    loadPicks();
  }, [groupId]);

  const loadPicks = async () => {
    setLoading(true);
    const sb = createClient();

    // Get all tournament picks for this group
    const { data: predictions } = await sb
      .from("group_predictions")
      .select("user_id, pred_type, pred_value, match_id")
      .eq("group_id", groupId)
      .in("pred_type", PICK_TYPES);

    if (!predictions?.length) { setLoading(false); return; }

    // Get member names
    const userIds = [...new Set((predictions as Array<{user_id: string}>).map(p => p.user_id))];
    const { data: profiles } = await sb
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    const nameMap: Record<string, string> = {};
    (profiles as Array<{id: string; name: string}> ?? []).forEach(p => { nameMap[p.id] = p.name; });

    // Get existing overrides
    const { data: overrides } = await sb
      .from("pick_overrides")
      .select("user_id, pred_type, points")
      .eq("group_id", groupId);

    const overrideSet = new Set(
      (overrides as Array<{user_id: string; pred_type: string}> ?? [])
        .map(o => `${o.user_id}_${o.pred_type}`)
    );

    const overridePtsMap: Record<string, number> = {};
    (overrides as Array<{user_id: string; pred_type: string; points: number}> ?? [])
      .forEach(o => { overridePtsMap[`${o.user_id}_${o.pred_type}`] = o.points; });

    setPicks((predictions as Array<{user_id: string; pred_type: string; pred_value: string}>).map(p => ({
      userId:         p.user_id,
      userName:       nameMap[p.user_id] ?? "Unknown",
      predType:       p.pred_type,
      submitted:      p.pred_value,
      hasOverride:    overrideSet.has(`${p.user_id}_${p.pred_type}`),
      overridePoints: overridePtsMap[`${p.user_id}_${p.pred_type}`] ?? 0,
    })));

    setLoading(false);
  };

  const grantPoints = async (pick: MemberPick) => {
    const key = `${pick.userId}_${pick.predType}`;
    setSaving(key);
    const actual = actualValues[key] ?? pick.submitted;
    const points = pointValues[key] ?? 50;

    const sb = createClient();
    const { error } = await sb.from("pick_overrides").upsert({
      group_id:  groupId,
      user_id:   pick.userId,
      pred_type: pick.predType,
      submitted: pick.submitted,
      actual,
      points,
      admin_id:  adminId,
      note:      `Admin override — ${actual}`,
    }, { onConflict: "group_id,user_id,pred_type" });

    if (!error) {
      // Also add points to group_predictions
      await sb.from("group_predictions").upsert({
        group_id:     groupId,
        user_id:      pick.userId,
        match_id:     `tournament_${pick.predType}`,
        pred_type:    pick.predType,
        points_earned: points,
        home_score:   0,
        away_score:   0,
      }, { onConflict: "user_id,group_id,match_id" });

      await loadPicks();
    }
    setSaving(null);
  };

  const revokePoints = async (pick: MemberPick) => {
    const key = `${pick.userId}_${pick.predType}`;
    setSaving(key);
    const sb = createClient();
    await sb.from("pick_overrides")
      .delete()
      .eq("group_id",  groupId)
      .eq("user_id",   pick.userId)
      .eq("pred_type", pick.predType);

    // Remove points
    await sb.from("group_predictions")
      .update({ points_earned: 0 })
      .eq("group_id",  groupId)
      .eq("user_id",   pick.userId)
      .eq("match_id",  `tournament_${pick.predType}`);

    await loadPicks();
    setSaving(null);
  };

  // Group by pick type
  const byType = PICK_TYPES.reduce((acc, type) => {
    acc[type] = picks.filter(p => p.predType === type);
    return acc;
  }, {} as Record<string, MemberPick[]>);

  if (loading) return (
    <div className="text-center py-8 text-sm" style={{ color: "#94a3b8" }}>Loading picks...</div>
  );

  if (!picks.length) return (
    <div className="text-center py-8 text-sm" style={{ color: "#94a3b8" }}>
      No tournament picks submitted yet.
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl px-4 py-3 flex items-start gap-2.5"
        style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)" }}>
        <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#d97706" }} />
        <p className="text-xs" style={{ color: "#92400e" }}>
          Use this panel to manually award points when a member guessed correctly but had a typo or name variation.
          Enter the actual correct value and set the point amount before clicking Grant.
        </p>
      </div>

      {PICK_TYPES.map(type => {
        const typePicks = byType[type];
        if (!typePicks?.length) return null;
        return (
          <div key={type}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: "#0891B2" }}>
              <Trophy size={13} />
              {PICK_LABELS[type]}
            </div>
            <div className="space-y-2">
              {typePicks.map(pick => {
                const key = `${pick.userId}_${pick.predType}`;
                return (
                  <div key={key}
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{
                      background: pick.hasOverride ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.9)",
                      border: `1px solid ${pick.hasOverride ? "rgba(0,255,136,0.2)" : "#e2e8f0"}`,
                    }}>
                    {/* Member + submission */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold" style={{ color: "#0F172A" }}>{pick.userName}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                        Submitted: <span className="font-bold">{pick.submitted}</span>
                      </div>
                      {pick.hasOverride && (
                        <div className="text-xs mt-0.5 font-bold" style={{ color: "#059669" }}>
                          ✓ Awarded {pick.overridePoints} pts
                        </div>
                      )}
                    </div>

                    {!pick.hasOverride ? (
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Actual value input */}
                        <input
                          type="text"
                          placeholder="Correct answer"
                          value={actualValues[key] ?? ""}
                          onChange={e => setActualValues(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-28 px-2 py-1.5 rounded-lg text-xs border focus:outline-none"
                          style={{ borderColor: "#e2e8f0", color: "#0F172A" }}
                        />
                        {/* Points input */}
                        <input
                          type="number"
                          placeholder="pts"
                          value={pointValues[key] ?? ""}
                          onChange={e => setPointValues(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="w-14 px-2 py-1.5 rounded-lg text-xs border focus:outline-none text-center"
                          style={{ borderColor: "#e2e8f0", color: "#0F172A" }}
                        />
                        <button
                          onClick={() => grantPoints(pick)}
                          disabled={saving === key || !actualValues[key]}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                          style={{ background: "rgba(0,255,136,0.1)", color: "#059669", border: "1px solid rgba(0,255,136,0.25)" }}>
                          <Check size={12} />
                          {saving === key ? "..." : "Grant"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => revokePoints(pick)}
                        disabled={saving === key}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                        style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                        <X size={12} />
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}