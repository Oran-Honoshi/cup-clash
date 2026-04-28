"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

// WC 2026 group compositions (confirmed host nations + estimated qualified teams)
// Will update with official draw results when available
export const GROUP_STAGE_TEAMS: Record<string, Array<{ name: string; flagCode: string; isHost?: boolean }>> = {
  A: [
    { name: "Mexico",   flagCode: "mx", isHost: true },
    { name: "TBD",      flagCode: "un" },
    { name: "TBD",      flagCode: "un" },
    { name: "TBD",      flagCode: "un" },
  ],
  B: [
    { name: "USA",      flagCode: "us", isHost: true },
    { name: "TBD",      flagCode: "un" },
    { name: "TBD",      flagCode: "un" },
    { name: "TBD",      flagCode: "un" },
  ],
  C: [
    { name: "Canada",   flagCode: "ca", isHost: true },
    { name: "TBD",      flagCode: "un" },
    { name: "TBD",      flagCode: "un" },
    { name: "TBD",      flagCode: "un" },
  ],
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
  name: string;
  flagCode: string;
  isHost?: boolean;
  played:  number;
  won:     number;
  drawn:   number;
  lost:    number;
  gf:      number; // goals for
  ga:      number; // goals against
  gd:      number; // goal difference
  pts:     number;
}

// Generate blank standings for a group
function blankStandings(group: string): TeamStanding[] {
  return (GROUP_STAGE_TEAMS[group] ?? []).map(t => ({
    name: t.name, flagCode: t.flagCode, isHost: t.isHost,
    played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0,
  }));
}

// Sort standings by: pts → gd → gf → name
function sortStandings(teams: TeamStanding[]): TeamStanding[] {
  return [...teams].sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name)
  );
}

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// Row styling: top 2 qualify automatically, 3rd may qualify as best 3rd
const ROW_STYLE = (rank: number) => {
  if (rank <= 2)  return "border-l-2 border-l-success/60";
  if (rank === 3) return "border-l-2 border-l-warning/40";
  return "";
};

interface GroupTableProps {
  groupLetter: string;
  standings: TeamStanding[];
}

function GroupTable({ groupLetter, standings }: GroupTableProps) {
  const sorted = sortStandings(standings);
  const hasData = sorted.some(t => t.played > 0);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Group header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
        style={{ background: "rgb(var(--brand)/0.08)" }}>
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl text-white uppercase">Group {groupLetter}</span>
          {!hasData && (
            <span className="text-[10px] text-pitch-600 uppercase tracking-widest">Draw pending</span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-pitch-600">
          <span className="w-6 text-center">P</span>
          <span className="w-6 text-center">W</span>
          <span className="w-6 text-center">D</span>
          <span className="w-6 text-center">L</span>
          <span className="w-8 text-center">GF</span>
          <span className="w-8 text-center">GA</span>
          <span className="w-8 text-center">GD</span>
          <span className="w-8 text-center text-white">PTS</span>
        </div>
        {/* Mobile headers */}
        <div className="flex sm:hidden items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-pitch-600">
          <span>P</span><span>W</span><span>D</span><span>L</span><span className="text-white">PTS</span>
        </div>
      </div>

      {/* Team rows */}
      <div className="divide-y divide-white/[0.04]">
        {sorted.map((team, i) => (
          <div key={team.name}
            className={cn("flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]", ROW_STYLE(i + 1))}>
            {/* Rank */}
            <span className={cn("w-4 text-xs font-bold shrink-0 text-center",
              i === 0 ? "text-success" : i === 1 ? "text-success/70" : i === 2 ? "text-warning/70" : "text-pitch-600")}>
              {i + 1}
            </span>

            {/* Flag + name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
                <Image src={flagUrl(team.flagCode, 20)} alt={team.name} fill className="object-cover" unoptimized />
              </div>
              <span className={cn("text-sm font-bold truncate",
                i <= 1 ? "text-white" : "text-pitch-300")}>
                {team.name}
              </span>
              {team.isHost && (
                <span className="text-[9px] text-pitch-500 font-bold uppercase shrink-0">HOST</span>
              )}
            </div>

            {/* Stats — desktop */}
            <div className="hidden sm:flex items-center gap-4 shrink-0 text-sm tabular">
              <span className="w-6 text-center text-pitch-400">{team.played}</span>
              <span className="w-6 text-center text-success">{team.won}</span>
              <span className="w-6 text-center text-pitch-400">{team.drawn}</span>
              <span className="w-6 text-center text-danger">{team.lost}</span>
              <span className="w-8 text-center text-pitch-300">{team.gf}</span>
              <span className="w-8 text-center text-pitch-300">{team.ga}</span>
              <span className={cn("w-8 text-center font-bold",
                team.gd > 0 ? "text-success" : team.gd < 0 ? "text-danger" : "text-pitch-400")}>
                {team.gd > 0 ? `+${team.gd}` : team.gd}
              </span>
              <span className="w-8 text-center font-display text-lg text-white">{team.pts}</span>
            </div>

            {/* Stats — mobile (condensed) */}
            <div className="flex sm:hidden items-center gap-3 shrink-0 text-sm tabular text-pitch-400">
              <span>{team.played}</span>
              <span className="text-success">{team.won}</span>
              <span>{team.drawn}</span>
              <span className="text-danger">{team.lost}</span>
              <span className="font-display text-base text-white w-5 text-center">{team.pts}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Qualification legend */}
      <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-4 text-[10px] text-pitch-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success/60" /> Qualify (top 2)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning/40" /> Best 3rd (may qualify)
        </span>
      </div>
    </div>
  );
}

export function GroupStandings() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // In production, standings come from Supabase matches table.
  // For now, all groups show blank (no matches played yet).
  const allStandings: Record<string, TeamStanding[]> = Object.fromEntries(
    GROUPS.map(g => [g, blankStandings(g)])
  );

  return (
    <div className="space-y-5">
      {/* Group filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveGroup(null)}
          className={cn("px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
            !activeGroup ? "bg-white/10 border-accent text-white" : "border-white/10 text-pitch-500 hover:text-white hover:border-white/20")}
          style={!activeGroup ? { borderColor: "rgb(var(--accent)/0.5)" } : undefined}
        >
          All groups
        </button>
        {GROUPS.map(g => (
          <button key={g}
            onClick={() => setActiveGroup(activeGroup === g ? null : g)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
              activeGroup === g ? "bg-white/10 border-accent text-white" : "border-white/10 text-pitch-500 hover:text-white hover:border-white/20")}
            style={activeGroup === g ? { borderColor: "rgb(var(--accent)/0.5)" } : undefined}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Group tables */}
      <div className={cn("grid gap-4", activeGroup ? "grid-cols-1 max-w-lg" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
        {GROUPS
          .filter(g => !activeGroup || g === activeGroup)
          .map(g => (
            <motion.div key={g}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}>
              <GroupTable groupLetter={g} standings={allStandings[g]} />
            </motion.div>
          ))
        }
      </div>

      {/* Note about draw */}
      <div className="glass rounded-xl p-4 text-sm text-pitch-400 text-center">
        🎲 Full group compositions confirmed after the official FIFA draw.
        Standings update automatically after each match.
      </div>
    </div>
  );
}
