"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Check, ChevronDown, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/a11y";

// ── Types ──────────────────────────────────────────────────────────────────────

type Position = "GK" | "DEF" | "MID" | "FWD";

interface DBPlayer {
  id:             string;
  full_name:      string;
  team:           string;
  position:       Position;
  photo:          string | null;
  api_player_id:  number | null;
}

export interface PlayerPickerProps {
  value:      string;
  onSelect:   (name: string) => void;
  isLocked?:  boolean;
  includeGK?: boolean;   // false (default) = tournament picks exclude GK; true = bonus questions include GK
  label?:     string;
  pts?:       number;
}

// ── Position badge ─────────────────────────────────────────────────────────────

const POS_STYLE: Record<Position, { bg: string; color: string }> = {
  GK:  { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  DEF: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  MID: { bg: "rgba(34,197,94,0.15)",   color: "#4ade80" },
  FWD: { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
};

const POS_ORDER: Record<Position, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

// ── Flag lookup: normalise API-Football team names → flag codes ────────────────

const NAME_FLAG: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const c of ALL_COUNTRIES) map[c.name.toLowerCase()] = c.flagCode;
  // Manual overrides for API-Football name differences
  const overrides: Record<string, string> = {
    "south korea":          "kr",
    "korea republic":       "kr",
    "usa":                  "us",
    "united states":        "us",
    "türkiye":              "tr",
    "turkey":               "tr",
    "cape verde islands":   "cv",
    "cape verde":           "cv",
    "congo dr":             "cd",
    "dr congo":             "cd",
    "ivory coast":          "ci",
    "côte d'ivoire":        "ci",
    "bosnia & herzegovina": "ba",
    "bosnia and herzegovina":"ba",
    "netherlands":          "nl",
    "curaçao":              "cw",
    "curacao":              "cw",
    "new zealand":          "nz",
    "saudi arabia":         "sa",
    "south africa":         "za",
  };
  return { ...map, ...overrides };
})();

function flagCode(teamName: string): string {
  return NAME_FLAG[teamName.toLowerCase()] ?? "";
}

// ── Component ──────────────────────────────────────────────────────────────────

export function PlayerPicker({
  value, onSelect, isLocked = false, includeGK = false, label, pts,
}: PlayerPickerProps) {
  const [players,  setPlayers]  = useState<DBPlayer[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [openTeam, setOpenTeam] = useState<string | null>(null);

  // Fetch from Supabase once
  useEffect(() => {
    const sb = createClient();
    sb.from("players")
      .select("id, full_name, team, position, photo, api_player_id")
      .order("team")
      .then(({ data }) => {
        setPlayers((data ?? []) as DBPlayer[]);
        setLoading(false);
      });
  }, []);

  // Filter by position (GK excluded for tournament picks unless includeGK)
  const eligible = useMemo(
    () => includeGK ? players : players.filter(p => p.position !== "GK"),
    [players, includeGK]
  );

  // Group by team, sorted alphabetically
  const grouped = useMemo(() => {
    const map = new Map<string, DBPlayer[]>();
    for (const p of eligible) {
      if (!map.has(p.team)) map.set(p.team, []);
      map.get(p.team)!.push(p);
    }
    // Sort players within each team by position order then name
    for (const [, list] of map) {
      list.sort((a, b) =>
        POS_ORDER[a.position] - POS_ORDER[b.position] ||
        a.full_name.localeCompare(b.full_name)
      );
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [eligible]);

  // Search: filter players across all teams
  const q = search.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!q) return grouped;
    return grouped
      .map(([team, list]) => {
        const matches = list.filter(
          p => p.full_name.toLowerCase().includes(q) || team.toLowerCase().includes(q)
        );
        return [team, matches] as [string, DBPlayer[]];
      })
      .filter(([, list]) => list.length > 0);
  }, [grouped, q]);

  // Auto-expand first matching team when searching
  useEffect(() => {
    if (q && filteredGroups.length > 0) {
      setOpenTeam(filteredGroups[0][0]);
    }
  }, [q, filteredGroups]);

  // Find which team the selected player belongs to (for the summary pill)
  const selectedPlayer = useMemo(
    () => eligible.find(p => p.full_name === value),
    [eligible, value]
  );

  const toggleTeam = (team: string) =>
    setOpenTeam(prev => (prev === team ? null : team));

  return (
    <div className="space-y-3">
      {/* Optional label + pts row */}
      {(label || pts !== undefined) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
          )}
          {pts !== undefined && (
            <span className="text-xs font-bold"
              style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>+{pts} pts</span>
          )}
        </div>
      )}

      {/* Selected summary */}
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
          {selectedPlayer?.photo ? (
            <img src={selectedPlayer.photo} alt={value}
              className="w-6 h-6 rounded-full object-cover shrink-0 bg-white/10"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.1)" }}>
              <User size={12} style={{ color: "#00D4FF" }} />
            </div>
          )}
          {selectedPlayer && flagCode(selectedPlayer.team) && (
            <img src={`/flags/${flagCode(selectedPlayer.team)}.svg`}
              alt={selectedPlayer.team} className="w-5 h-3.5 object-cover rounded-sm shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <span className="text-sm font-bold text-white flex-1 truncate">{value}</span>
          {selectedPlayer && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ ...POS_STYLE[selectedPlayer.position] }}>
              {selectedPlayer.position}
            </span>
          )}
          <Check size={13} style={{ color: "#00D4FF" }} className="shrink-0" />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(255,255,255,0.4)" }} />
        <input
          type="text"
          placeholder="Search player or team…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isLocked}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          onFocus={e => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
        />
      </div>

      {/* Accordion */}
      {loading ? (
        <div className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading players…
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden max-h-80 overflow-y-auto"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {filteredGroups.length === 0 ? (
            <div className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              No players found
            </div>
          ) : (
            filteredGroups.map(([team, list]) => {
              const isOpen    = openTeam === team;
              const fc        = flagCode(team);
              const teamHit   = team.toLowerCase().includes(q);
              const hasSelect = list.some(p => p.full_name === value);

              return (
                <div key={team} className="border-b last:border-0"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>

                  {/* Team header row */}
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleTeam(team)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors disabled:opacity-40",
                      FOCUS_RING
                    )}
                    style={{
                      background: isOpen
                        ? "rgba(255,255,255,0.06)"
                        : hasSelect
                          ? "rgba(0,212,255,0.05)"
                          : "transparent",
                    }}>
                    {fc ? (
                      <img src={`/flags/${fc}.svg`} alt={team}
                        className="w-6 h-4 object-cover rounded-sm shrink-0"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-6 h-4 rounded-sm shrink-0 bg-white/10" />
                    )}
                    <span className="flex-1 text-sm font-bold truncate"
                      style={{ color: hasSelect ? "#00D4FF" : teamHit && q ? "#fff" : "rgba(255,255,255,0.8)" }}>
                      {team}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                      {list.length}
                    </span>
                    {hasSelect && <Check size={11} style={{ color: "#00D4FF" }} className="shrink-0" />}
                    <ChevronDown size={13}
                      className="shrink-0 transition-transform"
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        transform: isOpen ? "rotate(180deg)" : "none",
                      }} />
                  </button>

                  {/* Players list */}
                  {isOpen && (
                    <div style={{ background: "rgba(0,0,0,0.2)" }}>
                      {list.map(player => {
                        const active = value === player.full_name;
                        return (
                          <button
                            key={player.id}
                            type="button"
                            disabled={isLocked}
                            onClick={() => { onSelect(player.full_name); setSearch(""); }}
                            aria-pressed={active}
                            className={cn(
                              "w-full flex items-center gap-2.5 pl-5 pr-3 py-2 border-b last:border-0 text-left transition-colors disabled:opacity-40",
                              FOCUS_RING
                            )}
                            style={{
                              borderColor: "rgba(255,255,255,0.04)",
                              background: active ? "rgba(0,212,255,0.1)" : "transparent",
                            }}
                            onMouseEnter={e => {
                              if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                            }}
                            onMouseLeave={e => {
                              if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}>
                            {/* Photo */}
                            {player.photo ? (
                              <img src={player.photo} alt={player.full_name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 bg-white/10"
                                onError={e => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = "none";
                                  el.nextElementSibling?.removeAttribute("style");
                                }} />
                            ) : null}
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white/5",
                              player.photo ? "hidden" : ""
                            )}>
                              <User size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                            </div>

                            {/* Name */}
                            <span className="flex-1 text-sm truncate"
                              style={{ color: active ? "#fff" : "rgba(255,255,255,0.8)", fontWeight: active ? 700 : 400 }}>
                              {player.full_name}
                            </span>

                            {/* Position badge */}
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0"
                              style={POS_STYLE[player.position]}>
                              {player.position}
                            </span>

                            {active && <Check size={12} style={{ color: "#00D4FF" }} className="shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
