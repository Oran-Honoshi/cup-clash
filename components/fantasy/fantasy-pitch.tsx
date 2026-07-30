"use client";

import { Plus, User } from "lucide-react";
import type { FantasyPlayerRow, FantasyPosition } from "@/lib/services/fantasy";
import { POSITION_BOUNDS } from "@/lib/services/fantasy";

// Adapts FormationPitch's row/column layout math (components/match/live-match-hub.tsx)
// — group into rows, space each row's occupants evenly left-to-right, position
// rows evenly top-to-bottom — but rows here are the 4 fixed position groups
// (GK/DEF/MID/FWD), not API-Football's per-player "grid" coordinate, since a
// fantasy squad isn't tied to any one real-match lineup.

const ROWS: FantasyPosition[] = ["GK", "DEF", "MID", "FWD"];

function lastName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
}

type Slot = { player: FantasyPlayerRow } | { player: null; position: FantasyPosition };

interface FantasyPitchProps {
  selected: FantasyPlayerRow[];
  onSlotClick: (position: FantasyPosition, player: FantasyPlayerRow | null) => void;
}

export function FantasyPitch({ selected, onSlotClick }: FantasyPitchProps) {
  return (
    <div
      style={{
        position: "relative", width: "100%", aspectRatio: "4 / 5", borderRadius: 16,
        background: "linear-gradient(180deg, color-mix(in srgb, #22c55e 18%, var(--sf)), color-mix(in srgb, #22c55e 10%, var(--sf)))",
        border: "1px solid var(--br)", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "color-mix(in srgb, #22c55e 40%, transparent)" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 64, height: 64, borderRadius: "50%", border: "1px solid color-mix(in srgb, #22c55e 40%, transparent)", transform: "translate(-50%, -50%)" }} />

      {ROWS.map((position, rowIdx) => {
        const rowPlayers = selected.filter(p => p.position === position);
        const min = POSITION_BOUNDS[position].min;
        const emptyCount = Math.max(0, min - rowPlayers.length);
        const slots: Slot[] = [
          ...rowPlayers.map(player => ({ player })),
          ...Array.from({ length: emptyCount }, () => ({ player: null as null, position })),
        ];
        const yPct = 92 - (rowIdx / (ROWS.length - 1)) * 84;

        return slots.map((slot, colIdx) => {
          const xPct = ((colIdx + 1) / (slots.length + 1)) * 100;
          const key = slot.player ? slot.player.id : `${position}-empty-${colIdx}`;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSlotClick(position, slot.player)}
              style={{
                position: "absolute", left: `${xPct}%`, top: `${yPct}%`,
                transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 2, width: 64, cursor: "pointer", background: "none", border: "none", padding: 0,
              }}
            >
              {slot.player ? (
                <>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
                    background: "var(--ac)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
                  }}>
                    {slot.player.photo ? (
                      <img src={slot.player.photo} alt={slot.player.fullName}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <span className="truncate" style={{ fontSize: 9, fontWeight: 700, color: "var(--tx)", textShadow: "0 1px 2px var(--sf)", maxWidth: 64, textAlign: "center" }}>
                    {lastName(slot.player.fullName)}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#00D4FF", fontFamily: "var(--font-mono)" }}>
                    {slot.player.creditCost.toFixed(1)}
                  </span>
                </>
              ) : (
                <>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    border: "1.5px dashed color-mix(in srgb, #22c55e 60%, transparent)",
                    background: "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Plus size={13} style={{ color: "color-mix(in srgb, #22c55e 70%, white)" }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "var(--mt)" }}>{position}</span>
                </>
              )}
            </button>
          );
        });
      })}
    </div>
  );
}
