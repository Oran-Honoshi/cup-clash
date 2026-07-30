"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Check, ChevronDown, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/a11y";
import { BallLoader } from "@/components/ui/BallLoader";
import {
  mapFantasyPlayerRow, canAddPlayer, type FantasyPlayerRow, type FantasyPosition,
} from "@/lib/services/fantasy";

// Mirrors components/predictions/player-picker.tsx's search + team-grouped
// accordion UX, querying fantasy_players instead of the WC national-squad
// `players` table. Over-budget / position-full players are disabled, not
// hidden, so the full pool stays browsable.

const POS_STYLE: Record<FantasyPosition, { bg: string; color: string }> = {
  GK:  { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  DEF: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  MID: { bg: "rgba(34,197,94,0.15)",   color: "#4ade80" },
  FWD: { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
};

const POS_ORDER: Record<FantasyPosition, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

export interface FantasyPlayerPickerProps {
  competitionId: string;
  selected: FantasyPlayerRow[];
  positionFilter?: FantasyPosition | null;
  onToggle: (player: FantasyPlayerRow) => void;
}

export function FantasyPlayerPicker({ competitionId, selected, positionFilter, onToggle }: FantasyPlayerPickerProps) {
  const [players, setPlayers] = useState<FantasyPlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openTeam, setOpenTeam] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    const PAGE = 1000;
    async function fetchAll() {
      const all: FantasyPlayerRow[] = [];
      let from = 0;
      while (true) {
        const { data, error } = await sb
          .from("fantasy_players")
          .select("id, competition_id, api_player_id, api_team_id, full_name, team_name, position, photo, credit_cost")
          .eq("competition_id", competitionId)
          .order("team_name")
          .range(from, from + PAGE - 1);
        if (error) { console.error("[FantasyPlayerPicker] fetch error:", error.message); break; }
        all.push(...((data ?? []) as Parameters<typeof mapFantasyPlayerRow>[0][]).map(mapFantasyPlayerRow));
        if ((data?.length ?? 0) < PAGE) break;
        from += PAGE;
      }
      setPlayers(all);
      setLoading(false);
    }
    fetchAll();
  }, [competitionId]);

  const eligible = useMemo(
    () => positionFilter ? players.filter(p => p.position === positionFilter) : players,
    [players, positionFilter]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, FantasyPlayerRow[]>();
    for (const p of eligible) {
      if (!map.has(p.teamName)) map.set(p.teamName, []);
      map.get(p.teamName)!.push(p);
    }
    for (const [, list] of map) {
      list.sort((a, b) => POS_ORDER[a.position] - POS_ORDER[b.position] || a.fullName.localeCompare(b.fullName));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [eligible]);

  const q = search.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!q) return grouped;
    return grouped
      .map(([team, list]) => {
        const matches = list.filter(p => p.fullName.toLowerCase().includes(q) || team.toLowerCase().includes(q));
        return [team, matches] as [string, FantasyPlayerRow[]];
      })
      .filter(([, list]) => list.length > 0);
  }, [grouped, q]);

  useEffect(() => {
    if (q && filteredGroups.length > 0) setOpenTeam(filteredGroups[0][0]);
  }, [q, filteredGroups]);

  const toggleTeam = (team: string) => setOpenTeam(prev => (prev === team ? null : team));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--mt)" }} />
        <input
          type="text"
          placeholder="Search player or club…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
          style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
        />
      </div>

      {loading ? (
        <div className="py-4 flex justify-center"><BallLoader size="sm" label="Loading players…" /></div>
      ) : (
        <div className="rounded-xl overflow-hidden max-h-96 overflow-y-auto" style={{ border: "1px solid var(--br)" }}>
          {filteredGroups.length === 0 ? (
            <div className="text-xs text-center py-4" style={{ color: "var(--mt)" }}>No players found</div>
          ) : (
            filteredGroups.map(([team, list]) => {
              const isOpen = openTeam === team;
              const hasSelect = list.some(p => selected.some(s => s.id === p.id));

              return (
                <div key={team} className="border-b last:border-0" style={{ borderColor: "var(--br)" }}>
                  <button
                    type="button"
                    onClick={() => toggleTeam(team)}
                    className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors", FOCUS_RING)}
                    style={{ background: isOpen ? "var(--ip)" : hasSelect ? "rgba(0,212,255,0.05)" : "transparent" }}
                  >
                    <span className="flex-1 text-sm font-bold truncate" style={{ color: hasSelect ? "#00D4FF" : "var(--tx)" }}>{team}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--ip)", color: "var(--t2)" }}>{list.length}</span>
                    {hasSelect && <Check size={11} style={{ color: "#00D4FF" }} className="shrink-0" />}
                    <ChevronDown size={13} className="shrink-0 transition-transform" style={{ color: "var(--mt)", transform: isOpen ? "rotate(180deg)" : "none" }} />
                  </button>

                  {isOpen && (
                    <div style={{ background: "var(--ip)" }}>
                      {list.map(player => {
                        const active = selected.some(s => s.id === player.id);
                        const disabled = !active && !canAddPlayer(selected, player);
                        return (
                          <button
                            key={player.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => onToggle(player)}
                            aria-pressed={active}
                            className={cn(
                              "w-full flex items-center gap-2.5 pl-5 pr-3 py-2 border-b last:border-0 text-left transition-colors disabled:opacity-35",
                              FOCUS_RING
                            )}
                            style={{ borderColor: "var(--br)", background: active ? "rgba(0,212,255,0.1)" : "transparent" }}
                          >
                            {player.photo ? (
                              <img src={player.photo} alt={player.fullName}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                                style={{ background: "var(--ip)" }}
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--ip)" }}>
                                <User size={13} style={{ color: "var(--mt)" }} />
                              </div>
                            )}

                            <span className="flex-1 text-sm truncate" style={{ color: active ? "var(--ac)" : "var(--tx)", fontWeight: active ? 700 : 400 }}>
                              {player.fullName}
                            </span>

                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0" style={POS_STYLE[player.position]}>
                              {player.position}
                            </span>

                            <span className="text-[11px] font-bold shrink-0" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>
                              {player.creditCost.toFixed(1)}
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
