"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Check, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/a11y";
import { BallLoader } from "@/components/ui/BallLoader";

// Guess-input widget for the "Guess the Club" daily challenge — mirrors
// PlayerPicker's self-fetching search/select shape, but scoped to the same
// standings-linked club pool the puzzle answer is drawn from (see
// createClubChallenge in lib/services/daily-challenge.ts), so every club a
// player can search for is one that could actually be today's answer.

interface DBTeam {
  id: string;
  name: string;
  badge_url: string | null;
}

export interface DailyChallengeTeamPickerProps {
  value: string;
  onSelect: (name: string) => void;
  onSelectTeam?: (team: { id: string; name: string }) => void;
  isLocked?: boolean;
  label?: string;
}

export function DailyChallengeTeamPicker({
  value, onSelect, onSelectTeam, isLocked = false, label,
}: DailyChallengeTeamPickerProps) {
  const [teams, setTeams] = useState<DBTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sb = createClient();
    (async () => {
      const { data: standingsRows } = await sb.from("standings").select("team_id");
      const teamIds = Array.from(new Set((standingsRows ?? []).map(r => r.team_id as string)));
      if (teamIds.length === 0) {
        setTeams([]);
        setLoading(false);
        return;
      }
      const { data, error } = await sb
        .from("teams")
        .select("id, name, badge_url")
        .in("id", teamIds)
        .not("badge_url", "is", null)
        .order("name");
      if (error) console.error("[DailyChallengeTeamPicker] fetch error:", error.message);
      setTeams((data ?? []) as DBTeam[]);
      setLoading(false);
    })();
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? teams.filter(t => t.name.toLowerCase().includes(q)) : teams),
    [teams, q]
  );

  const selectedTeam = useMemo(() => teams.find(t => t.name === value), [teams, value]);

  return (
    <div className="space-y-3">
      {label && (
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>
          {label}
        </span>
      )}

      {value && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
          {selectedTeam?.badge_url ? (
            <img src={selectedTeam.badge_url} alt={value}
              className="w-6 h-6 object-contain shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.1)" }}>
              <Shield size={12} style={{ color: "#00D4FF" }} />
            </div>
          )}
          <span className="text-sm font-bold flex-1 truncate" style={{ color: "var(--tx)" }}>{value}</span>
          <Check size={13} style={{ color: "#00D4FF" }} className="shrink-0" />
        </div>
      )}

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--mt)" }} />
        <input
          type="text"
          placeholder="Search for a club…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isLocked}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
          onFocus={e => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--br)"; }}
        />
      </div>

      {loading ? (
        <div className="py-4 flex justify-center">
          <BallLoader size="sm" />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden max-h-80 overflow-y-auto"
          style={{ border: "1px solid var(--br)" }}>
          {filtered.length === 0 ? (
            <div className="text-xs text-center py-4" style={{ color: "var(--mt)" }}>
              No clubs found
            </div>
          ) : (
            filtered.map(team => {
              const active = value === team.name;
              return (
                <button
                  key={team.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    onSelect(team.name);
                    onSelectTeam?.({ id: team.id, name: team.name });
                    setSearch("");
                  }}
                  aria-pressed={active}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 border-b last:border-0 text-left transition-colors disabled:opacity-40",
                    FOCUS_RING
                  )}
                  style={{
                    borderColor: "var(--br)",
                    background: active ? "rgba(0,212,255,0.1)" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "var(--ip)";
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}>
                  {team.badge_url ? (
                    <img src={team.badge_url} alt={team.name}
                      className="w-7 h-7 object-contain shrink-0"
                      style={{ background: "var(--ip)" }}
                      onError={e => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                        el.nextElementSibling?.removeAttribute("style");
                      }} />
                  ) : null}
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    team.badge_url ? "hidden" : ""
                  )} style={{ background: "var(--ip)" }}>
                    <Shield size={13} style={{ color: "var(--mt)" }} />
                  </div>
                  <span className="flex-1 text-sm truncate"
                    style={{ color: active ? "var(--ac)" : "var(--tx)", fontWeight: active ? 700 : 400 }}>
                    {team.name}
                  </span>
                  {active && <Check size={12} style={{ color: "#00D4FF" }} className="shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
