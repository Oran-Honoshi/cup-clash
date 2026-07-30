"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Check, Trash2, ArrowRightLeft, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BallLoader } from "@/components/ui/BallLoader";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { FantasyPitch } from "@/components/fantasy/fantasy-pitch";
import { FantasyPlayerPicker } from "@/components/fantasy/fantasy-player-picker";
import {
  mapFantasyPlayerRow, tallyByPosition, totalCreditsSpent, budgetRemaining,
  isSquadValid, canAddPlayer,
  SQUAD_BUDGET_CREDITS, SQUAD_SIZE, POSITION_BOUNDS, POSITION_ORDER,
  type FantasyPlayerRow, type FantasyPosition,
} from "@/lib/services/fantasy";

// Squad builder AND transfer flow share this one screen (confirmed design):
// "build mode" (no complete 11 saved yet) allows free-form add/remove;
// once a complete 11 has been saved once, editing becomes "transfer mode",
// gated by fantasy_squads.free_transfers_banked — removing one of the
// ORIGINAL (already-saved) players costs 1 free transfer, hard-stopping at
// 0 (no penalty-cost transfers, confirmed). Swapping in a replacement, or
// undoing a pending removal, is always free.

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

interface LeagueInfo { id: string; name: string; competitionId: string; }

export default function FantasySquadPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [league, setLeague] = useState<LeagueInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [squadId, setSquadId] = useState<string | null>(null);
  const [freeTransfersBanked, setFreeTransfersBanked] = useState(1);
  const [originalPlayers, setOriginalPlayers] = useState<FantasyPlayerRow[]>([]);
  const [currentPlayers, setCurrentPlayers] = useState<FantasyPlayerRow[]>([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<FantasyPosition | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<FantasyPlayerRow | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Load league, squad, and its active players ──────────────────────────
  useEffect(() => {
    if (!leagueId) return;
    const sb = createClient();

    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoadError("You must be signed in"); setLoading(false); return; }
      setUserId(user.id);

      const { data: leagueRow, error: leagueErr } = await sb
        .from("fantasy_leagues")
        .select("id, name, competition_id")
        .eq("id", leagueId)
        .single();
      if (leagueErr || !leagueRow) { setLoadError("Fantasy league not found"); setLoading(false); return; }
      const l = leagueRow as { id: string; name: string; competition_id: string };
      setLeague({ id: l.id, name: l.name, competitionId: l.competition_id });

      const { data: squadRow } = await sb
        .from("fantasy_squads")
        .select("id, free_transfers_banked")
        .eq("fantasy_league_id", leagueId)
        .eq("user_id", user.id)
        .maybeSingle();

      const sq = squadRow as { id: string; free_transfers_banked: number } | null;

      if (sq) {
        setSquadId(sq.id);
        setFreeTransfersBanked(sq.free_transfers_banked);

        const { data: squadPlayerRows } = await sb
          .from("fantasy_squad_players")
          .select("fantasy_players ( id, competition_id, api_player_id, api_team_id, full_name, team_name, position, photo, credit_cost )")
          .eq("fantasy_squad_id", sq.id)
          .is("removed_at", null);

        const players = ((squadPlayerRows ?? []) as unknown as Array<{ fantasy_players: Parameters<typeof mapFantasyPlayerRow>[0] }>)
          .map(row => mapFantasyPlayerRow(row.fantasy_players));

        setOriginalPlayers(players);
        setCurrentPlayers(players);
      }

      setLoading(false);
    })();
  }, [leagueId]);

  const isTransferMode = originalPlayers.length === SQUAD_SIZE;
  const transfersUsed = useMemo(
    () => originalPlayers.filter(op => !currentPlayers.some(cp => cp.id === op.id)).length,
    [originalPlayers, currentPlayers]
  );
  const remainingFreeTransfers = freeTransfersBanked - transfersUsed;

  const tally = useMemo(() => tallyByPosition(currentPlayers), [currentPlayers]);
  const spent = useMemo(() => totalCreditsSpent(currentPlayers), [currentPlayers]);
  const remaining = SQUAD_BUDGET_CREDITS - spent;
  const spentPct = Math.min(100, (spent / SQUAD_BUDGET_CREDITS) * 100);

  const hasChanges = useMemo(() => {
    if (currentPlayers.length !== originalPlayers.length) return true;
    return currentPlayers.some(cp => !originalPlayers.some(op => op.id === cp.id));
  }, [currentPlayers, originalPlayers]);

  const canSave =
    !saving &&
    isSquadValid(currentPlayers) &&
    hasChanges &&
    (!isTransferMode || transfersUsed <= freeTransfersBanked);

  const canRemove = useCallback((player: FantasyPlayerRow): boolean => {
    const isOriginal = originalPlayers.some(op => op.id === player.id);
    if (!isOriginal || !isTransferMode) return true;
    return remainingFreeTransfers > 0;
  }, [originalPlayers, isTransferMode, remainingFreeTransfers]);

  const attemptToggle = useCallback((player: FantasyPlayerRow) => {
    setSaveError(null);
    const already = currentPlayers.some(p => p.id === player.id);
    if (already) {
      if (!canRemove(player)) {
        setSaveError("No free transfers remaining — undo a pending swap to free one up.");
        return;
      }
      setCurrentPlayers(prev => prev.filter(p => p.id !== player.id));
      return;
    }
    if (!canAddPlayer(currentPlayers, player)) return;
    setCurrentPlayers(prev => [...prev, player]);
  }, [currentPlayers, canRemove]);

  const handleSlotClick = (position: FantasyPosition, player: FantasyPlayerRow | null) => {
    if (player) { setDetailPlayer(player); return; }
    setPickerPosition(position);
    setPickerOpen(true);
  };

  const handleRemoveFromDetail = () => {
    if (!detailPlayer) return;
    if (!canRemove(detailPlayer)) {
      setSaveError("No free transfers remaining — undo a pending swap to free one up.");
      return;
    }
    const position = detailPlayer.position;
    attemptToggle(detailPlayer);
    setDetailPlayer(null);
    setPickerPosition(position);
    setPickerOpen(true);
  };

  const handleReset = () => {
    setCurrentPlayers(originalPlayers);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!league || !userId || !isSquadValid(currentPlayers)) return;
    setSaving(true); setSaveError(null); setSuccessMsg(null);
    const sb = createClient();

    let sid = squadId;
    if (!sid) {
      const { data, error: insErr } = await sb
        .from("fantasy_squads")
        .insert({
          fantasy_league_id: league.id,
          user_id: userId,
          budget_remaining: budgetRemaining(currentPlayers),
          free_transfers_banked: freeTransfersBanked,
        } as Record<string, unknown>)
        .select("id")
        .single();
      if (insErr || !data) { setSaveError(insErr?.message ?? "Failed to create squad"); setSaving(false); return; }
      sid = (data as { id: string }).id;
      setSquadId(sid);
    }

    const toRemove = originalPlayers.filter(op => !currentPlayers.some(cp => cp.id === op.id));
    const toAdd = currentPlayers.filter(cp => !originalPlayers.some(op => op.id === cp.id));

    if (toRemove.length) {
      const { error: remErr } = await sb
        .from("fantasy_squad_players")
        .update({ removed_at: new Date().toISOString() } as Record<string, unknown>)
        .eq("fantasy_squad_id", sid)
        .is("removed_at", null)
        .in("fantasy_player_id", toRemove.map(p => p.id));
      if (remErr) { setSaveError(remErr.message); setSaving(false); return; }
    }

    if (toAdd.length) {
      const { error: addErr } = await sb
        .from("fantasy_squad_players")
        .insert(toAdd.map(p => ({ fantasy_squad_id: sid, fantasy_player_id: p.id })) as Record<string, unknown>[]);
      if (addErr) {
        setSaveError(
          addErr.message.includes("fantasy squad composition")
            ? "That formation isn't valid — check position limits and try again."
            : addErr.message
        );
        setSaving(false);
        return;
      }
    }

    const wasTransferMode = isTransferMode;
    const newFreeTransfers = wasTransferMode ? Math.max(0, freeTransfersBanked - toRemove.length) : freeTransfersBanked;

    const { error: updErr } = await sb
      .from("fantasy_squads")
      .update({
        budget_remaining: budgetRemaining(currentPlayers),
        free_transfers_banked: newFreeTransfers,
      } as Record<string, unknown>)
      .eq("id", sid);
    if (updErr) { setSaveError(updErr.message); setSaving(false); return; }

    setFreeTransfersBanked(newFreeTransfers);
    setOriginalPlayers(currentPlayers);
    setSuccessMsg(wasTransferMode ? "Transfers saved!" : "Squad saved!");
    setSaving(false);
  };

  if (loading) {
    return <div className="py-16 flex justify-center"><BallLoader label="Loading squad…" /></div>;
  }
  if (loadError || !league) {
    return (
      <div className="max-w-[480px] mx-auto py-16 text-center" style={{ color: "var(--t2)" }}>
        {loadError ?? "Fantasy league not found"}
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto space-y-4 pb-32">
      <div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00D4FF", fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: 4 }}>
          {isTransferMode ? "Transfers" : "Squad Builder"}
        </div>
        <h1 className="font-display text-3xl uppercase" style={{ color: "var(--tx)" }}>{league.name}</h1>
      </div>

      {/* Budget bar */}
      <div style={{ ...glassCard, padding: 16 }} className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span style={{ color: "var(--t2)" }}>Budget</span>
          <span style={{ color: remaining < 0 ? "#f87171" : "#00D4FF", fontFamily: "var(--font-mono)" }}>
            {remaining.toFixed(1)} / {SQUAD_BUDGET_CREDITS} remaining
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--ip)" }}>
          <div style={{ width: `${spentPct}%`, height: "100%", background: remaining < 0 ? "#f87171" : "linear-gradient(90deg,#00FF88,#00D4FF)", transition: "width 0.3s" }} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {POSITION_ORDER.map(pos => (
            <span key={pos} className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: `${POS_COLOR[pos]}18`, color: POS_COLOR[pos] }}>
              {pos} {tally[pos]}/{POSITION_BOUNDS[pos].max}
            </span>
          ))}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "var(--ip)", color: "var(--t2)" }}>
            {currentPlayers.length}/{SQUAD_SIZE} players
          </span>
        </div>
      </div>

      {isTransferMode && (
        <div style={{ ...glassCard, padding: 14 }} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={14} style={{ color: "#00D4FF" }} />
            <span className="text-xs font-bold" style={{ color: "var(--tx)" }}>
              {remainingFreeTransfers} free transfer{remainingFreeTransfers === 1 ? "" : "s"} remaining
            </span>
          </div>
          {hasChanges && (
            <button onClick={handleReset} className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--t2)" }}>
              <RotateCcw size={11} /> Reset
            </button>
          )}
        </div>
      )}

      {/* Pitch */}
      <FantasyPitch selected={currentPlayers} onSlotClick={handleSlotClick} />

      <button
        type="button"
        onClick={() => { setPickerPosition(null); setPickerOpen(true); }}
        className="w-full text-sm font-bold py-3 rounded-xl"
        style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF" }}>
        Browse All Players
      </button>

      {saveError && (
        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          {saveError}
        </div>
      )}
      {successMsg && !hasChanges && (
        <div className="text-xs px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", color: "#00FF88" }}>
          <Check size={12} /> {successMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black uppercase text-sm disabled:opacity-40"
        style={{
          background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B",
          fontFamily: "var(--font-display)", border: "none", cursor: canSave ? "pointer" : "default",
        }}>
        {saving ? <BallLoader size="inline" label={null} /> : (isTransferMode ? "Save Transfers" : "Save Squad")}
      </button>

      {/* Player detail sheet */}
      <BottomSheet open={!!detailPlayer} onClose={() => setDetailPlayer(null)} title={detailPlayer?.fullName} closeLabel="Close">
        {detailPlayer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {detailPlayer.photo ? (
                <img src={detailPlayer.photo} alt={detailPlayer.fullName} className="w-12 h-12 rounded-full object-cover" />
              ) : null}
              <div>
                <div className="font-bold text-sm" style={{ color: "var(--tx)" }}>{detailPlayer.teamName}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${POS_COLOR[detailPlayer.position]}18`, color: POS_COLOR[detailPlayer.position] }}>
                    {detailPlayer.position}
                  </span>
                  <span className="text-xs font-bold" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>{detailPlayer.creditCost.toFixed(1)} credits</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFromDetail}
              disabled={!canRemove(detailPlayer)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              <Trash2 size={14} /> {isTransferMode ? "Transfer Out" : "Remove from Squad"}
            </button>
            {isTransferMode && !canRemove(detailPlayer) && (
              <p className="text-[11px] text-center" style={{ color: "var(--mt)" }}>No free transfers remaining.</p>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Browse / pick players sheet */}
      <BottomSheet
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerPosition(null); }}
        title={pickerPosition ? `Add ${pickerPosition}` : "All Players"}
        closeLabel="Close"
      >
        <FantasyPlayerPicker
          competitionId={league.competitionId}
          selected={currentPlayers}
          positionFilter={pickerPosition}
          onToggle={attemptToggle}
        />
      </BottomSheet>
    </div>
  );
}
