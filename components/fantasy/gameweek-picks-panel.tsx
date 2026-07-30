"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BallLoader } from "@/components/ui/BallLoader";
import type { FantasyPlayerRow, FantasyPosition } from "@/lib/services/fantasy";
import { SQUAD_SIZE } from "@/lib/services/fantasy";

const POS_COLOR: Record<FantasyPosition, string> = {
  GK: "#f59e0b", DEF: "#60a5fa", MID: "#4ade80", FWD: "#f87171",
};

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
};

interface GameweekRow { id: string; number: number; deadlineAt: string; locked: boolean }
interface PickRow { captainFantasyPlayerId: string; oracleCaptainActive: boolean }

interface GameweekPicksPanelProps {
  competitionId: string;
  squadId: string | null;
  players: FantasyPlayerRow[] | null;
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function GameweekPicksPanel({ competitionId, squadId, players }: GameweekPicksPanelProps) {
  const [loading, setLoading] = useState(true);
  const [gameweek, setGameweek] = useState<GameweekRow | null>(null);
  const [savedPick, setSavedPick] = useState<PickRow | null>(null);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [oracleActive, setOracleActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const sb = createClient();
    const nowIso = new Date().toISOString();

    const { data: upcoming } = await sb
      .from("gameweeks").select("id, number, deadline_at")
      .eq("competition_id", competitionId).gte("deadline_at", nowIso)
      .order("deadline_at", { ascending: true }).limit(1).maybeSingle();

    let gw = upcoming as { id: string; number: number; deadline_at: string } | null;
    if (!gw) {
      const { data: past } = await sb
        .from("gameweeks").select("id, number, deadline_at")
        .eq("competition_id", competitionId)
        .order("deadline_at", { ascending: false }).limit(1).maybeSingle();
      gw = past as { id: string; number: number; deadline_at: string } | null;
    }

    if (!gw) { setGameweek(null); setLoading(false); return; }
    const locked = new Date(gw.deadline_at).getTime() <= Date.now();
    setGameweek({ id: gw.id, number: gw.number, deadlineAt: gw.deadline_at, locked });

    if (squadId) {
      const { data: pick } = await sb
        .from("fantasy_gameweek_picks")
        .select("captain_fantasy_player_id, oracle_captain_active")
        .eq("fantasy_squad_id", squadId).eq("gameweek_id", gw.id).maybeSingle();
      const p = pick as { captain_fantasy_player_id: string; oracle_captain_active: boolean } | null;
      const mapped = p ? { captainFantasyPlayerId: p.captain_fantasy_player_id, oracleCaptainActive: p.oracle_captain_active } : null;
      setSavedPick(mapped);
      setCaptainId(mapped?.captainFantasyPlayerId ?? null);
      setOracleActive(mapped?.oracleCaptainActive ?? false);
    }
    setLoading(false);
  }, [competitionId, squadId]);

  useEffect(() => { load(); }, [load]);

  const hasChanges = captainId !== (savedPick?.captainFantasyPlayerId ?? null) || oracleActive !== (savedPick?.oracleCaptainActive ?? false);

  const handleSave = async () => {
    if (!squadId || !gameweek || !captainId) return;
    setSaving(true); setError(null); setSaved(false);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    try {
      const res = await fetch("/api/fantasy/gameweek-pick", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ fantasySquadId: squadId, gameweekId: gameweek.id, captainFantasyPlayerId: captainId, oracleCaptainActive: oracleActive }),
      });
      const result = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !result.success) throw new Error(result.error ?? "Failed to save pick");
      setSavedPick({ captainFantasyPlayerId: captainId, oracleCaptainActive: oracleActive });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pick");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 flex justify-center"><BallLoader size="md" /></div>;

  if (!gameweek) {
    return (
      <div style={{ ...glassCard, padding: 20, textAlign: "center" }}>
        <p className="text-sm" style={{ color: "var(--t2)" }}>No gameweek data yet — check back once the season schedule is live.</p>
      </div>
    );
  }

  const needsFullSquad = !players || players.length !== SQUAD_SIZE;

  return (
    <div className="space-y-4">
      <div style={{ ...glassCard, padding: 16 }} className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>Gameweek {gameweek.number}</div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--t2)" }}>
            {gameweek.locked ? "Deadline passed" : `Locks ${formatDeadline(gameweek.deadlineAt)}`}
          </div>
        </div>
        {gameweek.locked && (
          <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "var(--t2)" }}>LOCKED</span>
        )}
      </div>

      {needsFullSquad ? (
        <div style={{ ...glassCard, padding: 20, textAlign: "center" }}>
          <p className="text-sm" style={{ color: "var(--t2)" }}>Complete your 11-player squad to set a captain.</p>
        </div>
      ) : gameweek.locked ? (
        <div style={{ ...glassCard, padding: 16 }} className="space-y-2">
          {savedPick ? (
            <>
              <div className="flex items-center gap-2">
                <Crown size={16} style={{ color: "#D4AF37" }} />
                <span className="text-sm font-bold" style={{ color: "var(--tx)" }}>
                  Captain: {players!.find(p => p.id === savedPick.captainFantasyPlayerId)?.fullName ?? "?"}
                </span>
              </div>
              {savedPick.oracleCaptainActive ? (
                <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "#00D4FF" }}>
                  <Sparkles size={12} /> Oracle Captain active — result revealed once the match finishes
                </div>
              ) : (
                <div className="text-[11px] font-bold" style={{ color: "var(--t2)" }}>Captain: ×2</div>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--t2)" }}>No captain was set for this gameweek.</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {players!.map(p => {
              const isCaptain = captainId === p.id;
              return (
                <button key={p.id} type="button" onClick={() => setCaptainId(p.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={isCaptain
                    ? { background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={isCaptain ? { background: "#D4AF37", color: "#0B141B" } : { background: "rgba(255,255,255,0.08)", color: "var(--t2)" }}>
                    <Crown size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{p.fullName}</div>
                    <div className="text-[11px]" style={{ color: "var(--t2)" }}>{p.teamName}</div>
                  </div>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${POS_COLOR[p.position]}18`, color: POS_COLOR[p.position] }}>
                    {p.position}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ ...glassCard, padding: 14 }} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold" style={{ color: captainId ? "var(--tx)" : "var(--t2)" }}>Oracle Captain</div>
              <p className="text-[11px]" style={{ color: "var(--t2)" }}>
                If the Oracle correctly predicts your captain&apos;s match winner, their score triples instead of doubles.
              </p>
            </div>
            <button type="button" disabled={!captainId} onClick={() => setOracleActive(v => !v)}
              className="relative h-6 w-11 rounded-full shrink-0 transition-all disabled:opacity-40"
              style={{ background: oracleActive ? "#00D4FF" : "rgba(255,255,255,0.12)" }}>
              <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: oracleActive ? "22px" : "2px" }} />
            </button>
          </div>

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              {error}
            </div>
          )}
          {saved && !hasChanges && (
            <div className="text-xs px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", color: "#00FF88" }}>
              <Check size={12} /> Gameweek pick saved!
            </div>
          )}

          <button type="button" onClick={handleSave} disabled={saving || !captainId || !hasChanges}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black uppercase text-sm disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", fontFamily: "var(--font-display)", border: "none" }}>
            {saving ? <BallLoader size="inline" label={null} /> : "Save Gameweek Pick"}
          </button>
        </>
      )}
    </div>
  );
}
