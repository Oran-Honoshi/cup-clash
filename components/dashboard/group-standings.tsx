"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { flagUrl } from "@/lib/countries";
import { useRealtimeStandings } from "@/lib/hooks/use-realtime-standings";
import { cn } from "@/lib/utils";

export const GROUP_STAGE_TEAMS: Record<string, Array<{ name: string; flagCode: string; isHost?: boolean }>> = {
  A: [{ name: "Mexico",   flagCode: "mx", isHost: true }, { name: "South Africa", flagCode: "za" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  B: [{ name: "USA",      flagCode: "us", isHost: true }, { name: "TBD",  flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  C: [{ name: "Canada",   flagCode: "ca", isHost: true }, { name: "TBD",  flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  D: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  E: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  F: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  G: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  H: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  I: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  J: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  K: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
  L: [{ name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }, { name: "TBD", flagCode: "un" }],
};

export interface TeamStanding {
  name: string; flagCode: string; isHost?: boolean;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; pts: number;
}

function blankStandings(group: string): TeamStanding[] {
  return (GROUP_STAGE_TEAMS[group] ?? []).map(t => ({
    name: t.name, flagCode: t.flagCode, isHost: t.isHost,
    played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0,
  }));
}

function sortStandings(teams: TeamStanding[]): TeamStanding[] {
  return [...teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
}

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const ROW_BORDER = (rank: number) => {
  if (rank <= 2)  return "border-l-2 border-l-green-500/60";
  if (rank === 3) return "border-l-2 border-l-yellow-500/40";
  return "";
};

function GroupTable({ groupLetter, standings }: { groupLetter: string; standings: TeamStanding[] }) {
  const sorted  = sortStandings(standings);
  const hasData = sorted.some(t => t.played > 0);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111d27", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(16,185,129,0.05)" }}>
        <span className="font-display text-xl uppercase text-white">Group {groupLetter}</span>
        {!hasData && <span className="text-[10px] text-pitch-600 uppercase tracking-widest">Draw pending</span>}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-pitch-700">
          <span className="w-5 text-center">P</span>
          <span className="w-5 text-center">W</span>
          <span className="w-5 text-center">D</span>
          <span className="w-5 text-center">L</span>
          <span className="w-7 text-center">GD</span>
          <span className="w-7 text-center text-white">PTS</span>
        </div>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {sorted.map((team, i) => (
          <div key={team.name} className={cn("flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.02] transition-colors", ROW_BORDER(i + 1))}>
            <span className={cn("w-4 text-xs font-bold text-center shrink-0",
              i === 0 ? "text-green-400" : i === 1 ? "text-green-400/70" : i === 2 ? "text-yellow-500/70" : "text-pitch-700")}>
              {i + 1}
            </span>
            <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
              <Image src={flagUrl(team.flagCode, 20)} alt={team.name} fill className="object-cover" unoptimized />
            </div>
            <span className={cn("flex-1 text-sm font-bold truncate min-w-0", i <= 1 ? "text-white" : "text-pitch-400")}>
              {team.name}
              {team.isHost && <span className="ml-1 text-[9px] text-pitch-600 uppercase">HOST</span>}
            </span>
            <div className="hidden sm:flex items-center gap-3 shrink-0 text-sm tabular-nums">
              <span className="w-5 text-center text-pitch-400">{team.played}</span>
              <span className="w-5 text-center text-green-400">{team.won}</span>
              <span className="w-5 text-center text-pitch-400">{team.drawn}</span>
              <span className="w-5 text-center text-red-400">{team.lost}</span>
              <span className={cn("w-7 text-center font-bold", team.gd > 0 ? "text-green-400" : team.gd < 0 ? "text-red-400" : "text-pitch-600")}>
                {team.gd > 0 ? `+${team.gd}` : team.gd}
              </span>
              <span className="w-7 text-center font-display text-lg text-white">{team.pts}</span>
            </div>
            {/* Mobile: just pts */}
            <div className="flex sm:hidden items-center gap-2 shrink-0 text-sm tabular-nums text-pitch-500">
              <span>{team.played}</span>
              <span className="font-display text-base text-white">{team.pts}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-4 text-[10px] text-pitch-700">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500/60" /> Qualify (top 2)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500/40" /> Best 3rd (may qualify)</span>
      </div>
    </div>
  );
}

export function GroupStandings({ groupId }: { groupId: string }) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const initialStandings = Object.fromEntries(GROUPS.map(g => [g, blankStandings(g)]));
  const { standings, lastUpdate, isLive } = useRealtimeStandings(groupId, initialStandings);

  return (
    <div className="space-y-5">
      {/* Live indicator + last update */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ color: isLive ? "#10b981" : "#64748b" }}>
          {isLive ? (
            <><Wifi size={12} /><span className="animate-pulse">Live</span></>
          ) : (
            <><WifiOff size={12} />Static</>
          )}
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-1 text-[10px] text-pitch-600">
            <RefreshCw size={9} />
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Group filter pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveGroup(null)}
          className={cn("px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
            !activeGroup ? "bg-white/10 text-white" : "border-white/10 text-pitch-500 hover:text-white hover:border-white/20")}
          style={!activeGroup ? { borderColor: "rgba(16,185,129,0.5)" } : undefined}>
          All groups
        </button>
        {GROUPS.map(g => (
          <button key={g} onClick={() => setActiveGroup(activeGroup === g ? null : g)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
              activeGroup === g ? "bg-white/10 text-white" : "border-white/10 text-pitch-500 hover:text-white hover:border-white/20")}
            style={activeGroup === g ? { borderColor: "rgba(16,185,129,0.5)" } : undefined}>
            {g}
          </button>
        ))}
      </div>

      {/* Tables */}
      <div className={cn("grid gap-4", activeGroup ? "grid-cols-1 max-w-lg" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
        {GROUPS.filter(g => !activeGroup || g === activeGroup).map(g => (
          <motion.div key={g} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <GroupTable groupLetter={g} standings={standings[g] ?? blankStandings(g)} />
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl p-4 text-sm text-pitch-500 text-center">
        🎲 Full group compositions confirmed after the official FIFA draw.
        {isLive && " Standings update automatically after each match."}
      </div>
    </div>
  );
}