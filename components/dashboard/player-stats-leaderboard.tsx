"use client";

import { Star, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { flagUrl } from "@/lib/countries";

export interface PlayerStat {
  rank: number;
  name: string;
  team: string;
  teamFlagCode: string;
  count: number;     // goals or assists
  matches: number;   // matches played
}

// Mock data — will be replaced by real API data (TheSportsDB / API-Football)
const MOCK_TOP_SCORERS: PlayerStat[] = [
  { rank: 1, name: "Kylian Mbappé",    team: "France",      teamFlagCode: "fr",     count: 0, matches: 0 },
  { rank: 2, name: "Erling Haaland",   team: "Norway",      teamFlagCode: "no",     count: 0, matches: 0 },
  { rank: 3, name: "Lionel Messi",     team: "Argentina",   teamFlagCode: "ar",     count: 0, matches: 0 },
  { rank: 4, name: "Vinícius Jr.",     team: "Brazil",      teamFlagCode: "br",     count: 0, matches: 0 },
  { rank: 5, name: "Harry Kane",       team: "England",     teamFlagCode: "gb-eng", count: 0, matches: 0 },
  { rank: 6, name: "Lamine Yamal",     team: "Spain",       teamFlagCode: "es",     count: 0, matches: 0 },
  { rank: 7, name: "Rodri",            team: "Spain",       teamFlagCode: "es",     count: 0, matches: 0 },
  { rank: 8, name: "Raphinha",         team: "Brazil",      teamFlagCode: "br",     count: 0, matches: 0 },
  { rank: 9, name: "Leroy Sané",       team: "Germany",     teamFlagCode: "de",     count: 0, matches: 0 },
  { rank: 10, name: "Bruno Fernandes", team: "Portugal",    teamFlagCode: "pt",     count: 0, matches: 0 },
];

const MOCK_TOP_ASSISTERS: PlayerStat[] = [
  { rank: 1, name: "Kevin De Bruyne",  team: "Belgium",     teamFlagCode: "be",     count: 0, matches: 0 },
  { rank: 2, name: "Kylian Mbappé",    team: "France",      teamFlagCode: "fr",     count: 0, matches: 0 },
  { rank: 3, name: "Jamal Musiala",    team: "Germany",     teamFlagCode: "de",     count: 0, matches: 0 },
  { rank: 4, name: "Trent Alexander-Arnold", team: "England", teamFlagCode: "gb-eng", count: 0, matches: 0 },
  { rank: 5, name: "Pedri",            team: "Spain",       teamFlagCode: "es",     count: 0, matches: 0 },
  { rank: 6, name: "Lionel Messi",     team: "Argentina",   teamFlagCode: "ar",     count: 0, matches: 0 },
  { rank: 7, name: "Lucas Paquetá",    team: "Brazil",      teamFlagCode: "br",     count: 0, matches: 0 },
  { rank: 8, name: "Bernardo Silva",   team: "Portugal",    teamFlagCode: "pt",     count: 0, matches: 0 },
  { rank: 9, name: "Florian Wirtz",    team: "Germany",     teamFlagCode: "de",     count: 0, matches: 0 },
  { rank: 10, name: "Sofyan Amrabat",  team: "Morocco",     teamFlagCode: "ma",     count: 0, matches: 0 },
];

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function PlayerRow({ player, statLabel }: { player: PlayerStat; statLabel: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
      {/* Rank */}
      <div className="w-7 text-center shrink-0">
        {RANK_MEDALS[player.rank] ? (
          <span className="text-base">{RANK_MEDALS[player.rank]}</span>
        ) : (
          <span className="text-sm font-bold text-pitch-500">{player.rank}</span>
        )}
      </div>

      {/* Flag */}
      <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
        <Image
          src={flagUrl(player.teamFlagCode, 40)}
          alt={player.team}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm truncate">{player.name}</div>
        <div className="text-[11px] text-pitch-500 truncate">{player.team}</div>
      </div>

      {/* Stat */}
      <div className="text-right shrink-0">
        {player.count > 0 ? (
          <>
            <div className="font-display text-2xl" style={{ color: "rgb(var(--accent-glow))" }}>
              {player.count}
            </div>
            <div className="text-[10px] text-pitch-500 uppercase tracking-widest">{statLabel}</div>
          </>
        ) : (
          <div className="text-xs text-pitch-600 italic">TBD</div>
        )}
      </div>
    </div>
  );
}

export function TopScorersLeaderboard() {
  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
        <Star size={18} className="text-warning" />
        <span className="font-display text-xl uppercase text-white tracking-tight">
          Top Scorers
        </span>
        <span className="ml-auto label-caps">Top 10</span>
      </div>

      <div className="px-5 py-2 border-b border-white/[0.04] flex items-center gap-2 text-[11px] text-pitch-500">
        <TrendingUp size={11} />
        Updated after each match · Live data coming June 11
      </div>

      <div>
        {MOCK_TOP_SCORERS.map((player) => (
          <PlayerRow key={player.name} player={player} statLabel="goals" />
        ))}
      </div>
    </Card>
  );
}

export function TopAssistersLeaderboard() {
  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
        <Users size={18} style={{ color: "rgb(var(--accent-glow))" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">
          Top Assisters
        </span>
        <span className="ml-auto label-caps">Top 10</span>
      </div>

      <div className="px-5 py-2 border-b border-white/[0.04] flex items-center gap-2 text-[11px] text-pitch-500">
        <TrendingUp size={11} />
        Updated after each match · Live data coming June 11
      </div>

      <div>
        {MOCK_TOP_ASSISTERS.map((player) => (
          <PlayerRow key={player.name} player={player} statLabel="assists" />
        ))}
      </div>
    </Card>
  );
}
