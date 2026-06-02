"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Edit3, X, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FinishedMatch {
  matchId:    string;
  home:       string;
  away:       string;
  homeScore:  number | null;
  awayScore:  number | null;
  predCount:  number;
  override:   { homeScore: number; awayScore: number; note: string | null } | null;
}

interface MatchOverridePanelProps {
  groupId: string;
}

const glass = {
  background: "rgba(18,14,38,0.4)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
} as const;

const amberGlass = {
  background: "rgba(251,191,36,0.06)",
  border: "1px solid rgba(251,191,36,0.3)",
  borderRadius: 12,
} as const;

export function MatchOverridePanel({ groupId }: MatchOverridePanelProps) {
  const [matches,    setMatches]    = useState<FinishedMatch[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [homeInput,  setHomeInput]  = useState("");
  const [awayInput,  setAwayInput]  = useState("");
  const [noteInput,  setNoteInput]  = useState("");
  const [saving,     setSaving]     = useState<string | null>(null);
  const [feedback,   setFeedback]   = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const sb = createClient();

    // Get finished matches that have at least one prediction in this group
    const { data: preds } = await sb
      .from("group_predictions")
      .select("match_id")
      .eq("group_id", groupId)
      .not("match_id", "is", null);

    const matchIds = [...new Set(
      (preds as Array<{ match_id: string }> ?? []).map(p => p.match_id)
    )];

    if (!matchIds.length) { setLoading(false); setMatches([]); return; }

    const { data: matchRows } = await sb
      .from("matches")
      .select("id, home, away, home_score, away_score, status")
      .in("id", matchIds)
      .eq("status", "finished")
      .order("kickoff_at", { ascending: false });

    if (!matchRows?.length) { setLoading(false); setMatches([]); return; }

    // Count predictions per match
    const { data: predCounts } = await sb
      .from("group_predictions")
      .select("match_id")
      .eq("group_id", groupId)
      .in("match_id", matchIds);

    const countMap: Record<string, number> = {};
    (predCounts as Array<{ match_id: string }> ?? []).forEach(p => {
      countMap[p.match_id] = (countMap[p.match_id] ?? 0) + 1;
    });

    // Get existing overrides for this group
    const { data: overrideRows } = await sb
      .from("match_overrides")
      .select("match_id, home_score, away_score, note")
      .eq("group_id", groupId);

    const overrideMap: Record<string, { homeScore: number; awayScore: number; note: string | null }> = {};
    (overrideRows as Array<{ match_id: string; home_score: number; away_score: number; note: string | null }> ?? [])
      .forEach(o => { overrideMap[o.match_id] = { homeScore: o.home_score, awayScore: o.away_score, note: o.note }; });

    setMatches((matchRows as Array<{
      id: string; home: string; away: string;
      home_score: number | null; away_score: number | null; status: string;
    }>).map(m => ({
      matchId:   m.id,
      home:      m.home,
      away:      m.away,
      homeScore: m.home_score,
      awayScore: m.away_score,
      predCount: countMap[m.id] ?? 0,
      override:  overrideMap[m.id] ?? null,
    })));

    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const openOverride = (match: FinishedMatch) => {
    setExpandedId(match.matchId);
    setHomeInput(String(match.override?.homeScore ?? match.homeScore ?? ""));
    setAwayInput(String(match.override?.awayScore ?? match.awayScore ?? ""));
    setNoteInput(match.override?.note ?? "");
    setFeedback(null);
  };

  const closeOverride = () => { setExpandedId(null); setFeedback(null); };

  const applyOverride = async (matchId: string) => {
    const home = parseInt(homeInput, 10);
    const away = parseInt(awayInput, 10);
    if (isNaN(home) || isNaN(away)) return;

    setSaving(matchId);
    setFeedback(null);

    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();

    const res = await fetch("/api/admin/override-score", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ groupId, matchId, homeScore: home, awayScore: away, note: noteInput || null }),
    });

    const json = await res.json() as { success?: boolean; error?: string };
    if (json.success) {
      setFeedback({ id: matchId, msg: "Override applied and leaderboard recalculated.", ok: true });
      await load();
      setExpandedId(null);
    } else {
      setFeedback({ id: matchId, msg: json.error ?? "Failed to apply override.", ok: false });
    }
    setSaving(null);
  };

  const removeOverride = async (matchId: string) => {
    setSaving(matchId);
    setFeedback(null);

    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();

    const res = await fetch("/api/admin/override-score", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ groupId, matchId, homeScore: 0, awayScore: 0, remove: true }),
    });

    const json = await res.json() as { success?: boolean; error?: string };
    if (json.success) {
      setFeedback({ id: matchId, msg: "Override removed. Leaderboard restored to official score.", ok: true });
      await load();
    } else {
      setFeedback({ id: matchId, msg: json.error ?? "Failed to remove override.", ok: false });
    }
    setSaving(null);
  };

  const inputStyle = {
    width: "100%", borderRadius: 8, padding: "8px 12px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffffff", fontSize: 14, outline: "none",
    fontFamily: "var(--font-ui)",
  } as const;

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
      <Loader2 size={14} className="animate-spin" /> Loading matches...
    </div>
  );

  if (!matches.length) return (
    <div className="text-center py-8 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
      No finished matches with predictions yet.
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="rounded-xl px-4 py-3 flex items-start gap-2.5"
        style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)" }}>
        <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#d97706" }} />
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          Use this if the official data provider had a wrong or delayed score.
          The correction only affects this group&apos;s leaderboard — other groups are unaffected.
        </p>
      </div>

      {/* Match list */}
      <div className="space-y-2">
        {matches.map(match => {
          const isExpanded = expandedId === match.matchId;
          const hasOverride = !!match.override;
          const isSaving = saving === match.matchId;

          return (
            <div key={match.matchId} style={hasOverride ? amberGlass : glass}>
              {/* Match row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: "white" }}>
                    {match.home} vs {match.away}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Official: {match.homeScore ?? "?"} – {match.awayScore ?? "?"}
                    </span>
                    {hasOverride && (
                      <span className="text-xs font-bold" style={{ color: "rgb(251,191,36)" }}>
                        → Override: {match.override!.homeScore} – {match.override!.awayScore}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {match.predCount} prediction{match.predCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {match.override?.note && (
                    <div className="text-[11px] mt-0.5 italic" style={{ color: "rgba(251,191,36,0.6)" }}>
                      Note: {match.override.note}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {hasOverride && !isExpanded && (
                    <button
                      onClick={() => removeOverride(match.matchId)}
                      disabled={isSaving}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                      style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                      {isSaving ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                      Remove
                    </button>
                  )}
                  <button
                    onClick={() => isExpanded ? closeOverride() : openOverride(match)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                    style={isExpanded
                      ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }
                      : { background: "rgba(251,191,36,0.08)", color: "rgb(251,191,36)", border: "1px solid rgba(251,191,36,0.25)" }}>
                    {isExpanded ? <X size={11} /> : <Edit3 size={11} />}
                    {isExpanded ? "Cancel" : hasOverride ? "Edit" : "Override"}
                  </button>
                </div>
              </div>

              {/* Inline override form */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="pt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                        style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)" }}>
                        {match.home} score
                      </label>
                      <input type="number" min={0} max={99} value={homeInput}
                        onChange={e => setHomeInput(e.target.value)}
                        style={{ ...inputStyle, color: "rgb(251,191,36)" }} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                        style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)" }}>
                        {match.away} score
                      </label>
                      <input type="number" min={0} max={99} value={awayInput}
                        onChange={e => setAwayInput(e.target.value)}
                        style={{ ...inputStyle, color: "rgb(251,191,36)" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)" }}>
                      Note (optional)
                    </label>
                    <input type="text" value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="e.g. Data provider had wrong score for 3 hours"
                      className="placeholder:text-[rgba(255,255,255,0.2)]"
                      style={inputStyle} />
                  </div>

                  {feedback?.id === match.matchId && (
                    <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                      style={feedback.ok
                        ? { background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88" }
                        : { background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
                      {feedback.ok ? <Check size={12} /> : <AlertCircle size={12} />}
                      {feedback.msg}
                    </div>
                  )}

                  <button
                    onClick={() => applyOverride(match.matchId)}
                    disabled={isSaving || homeInput === "" || awayInput === ""}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-40 transition-opacity"
                    style={{ background: "rgba(251,191,36,0.12)", color: "rgb(251,191,36)", border: "1px solid rgba(251,191,36,0.3)" }}>
                    {isSaving
                      ? <><Loader2 size={13} className="animate-spin" /> Applying...</>
                      : <><Check size={13} /> Apply Correction</>}
                  </button>
                </div>
              )}

              {/* Per-match feedback shown outside expanded form */}
              {!isExpanded && feedback?.id === match.matchId && (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                    style={feedback.ok
                      ? { background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88" }
                      : { background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
                    {feedback.ok ? <Check size={12} /> : <AlertCircle size={12} />}
                    {feedback.msg}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
