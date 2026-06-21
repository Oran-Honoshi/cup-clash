"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Star, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import { flagUrl } from "@/lib/countries";

function createSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Maps team names as stored by API-Football in player_tournament_stats
const TEAM_FLAG_MAP: Record<string, string> = {
  // Our internal names
  "Mexico": "mx", "South Africa": "za", "Korea Republic": "kr", "Czechia": "cz",
  "Canada": "ca", "Bosnia & Herzegovina": "ba", "Qatar": "qa", "Switzerland": "ch",
  "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
  "USA": "us", "Paraguay": "py", "Australia": "au", "Türkiye": "tr",
  "Germany": "de", "Curaçao": "cw", "Côte d'Ivoire": "ci", "Ecuador": "ec",
  "Netherlands": "nl", "Japan": "jp", "Sweden": "se", "Tunisia": "tn",
  "Belgium": "be", "Egypt": "eg", "IR Iran": "ir", "New Zealand": "nz",
  "Spain": "es", "Cabo Verde": "cv", "Saudi Arabia": "sa", "Uruguay": "uy",
  "France": "fr", "Senegal": "sn", "Iraq": "iq", "Norway": "no",
  "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
  "Portugal": "pt", "Congo DR": "cd", "Uzbekistan": "uz", "Colombia": "co",
  "England": "gb-eng", "Croatia": "hr", "Ghana": "gh", "Panama": "pa",
  // API-Football variants (what gets stored in team_name)
  "South Korea": "kr", "Czech Republic": "cz", "Turkey": "tr",
  "Ivory Coast": "ci", "Bosnia": "ba", "United States": "us",
  "Curacao": "cw", "Iran": "ir", "Cape Verde": "cv",
  "DR Congo": "cd", "Democratic Republic of Congo": "cd",
};

interface PlayerRow {
  api_player_id: number;
  player_name: string;
  full_name: string;
  team_name: string;
  goals: number;
  assists: number;
}

const RANK_COLORS: Record<number, string> = { 1: "#d97706", 2: "#64748b", 3: "#b45309" };
const RANK_LABELS: Record<number, string>  = { 1: "1st", 2: "2nd", 3: "3rd" };

const DARK_CARD_STYLE = {
  background: "rgba(12, 18, 32, 0.78)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
} as const;

function StatRow({ rank, player, stat, statLabel }: {
  rank: number;
  player: PlayerRow;
  stat: number;
  statLabel: string;
}) {
  const isTop3     = rank <= 3;
  const rankColor  = RANK_COLORS[rank] ?? "#94a3b8";
  const flagCode   = TEAM_FLAG_MAP[player.team_name] ?? "un";
  const displayName = player.full_name || player.player_name;

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 border-b last:border-0 transition-colors"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
      onMouseEnter={e  => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <div className="w-8 text-center shrink-0">
        {isTop3 ? (
          <span className="text-xs font-black" style={{ color: rankColor }}>{RANK_LABELS[rank]}</span>
        ) : (
          <span className="text-sm font-bold" style={{ color: "#94a3b8" }}>{rank}</span>
        )}
      </div>

      <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
        <Image src={flagUrl(flagCode, 40)} alt={player.team_name} fill className="object-cover" unoptimized />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm truncate">{displayName}</div>
        <div className="text-[11px] text-pitch-500 truncate">{player.team_name}</div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-display text-2xl" style={{ color: "rgb(var(--accent-glow))" }}>
          {stat}
        </div>
        <div className="text-[10px] text-pitch-500 uppercase tracking-widest">{statLabel}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-10 text-center space-y-1">
      <div className="text-2xl">⏳</div>
      <div className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>No data yet</div>
      <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Stats update after each match</div>
    </div>
  );
}

export function TopScorersLeaderboard() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createSb()
      .from("player_tournament_stats")
      .select("api_player_id, player_name, full_name, team_name, goals, assists")
      .gt("goals", 0)
      .order("goals", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setPlayers((data ?? []) as PlayerRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden" style={DARK_CARD_STYLE}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Star size={18} className="text-warning" />
        <span className="font-display text-xl uppercase text-white tracking-tight">Top Scorers</span>
        <span className="ml-auto label-caps">{loading ? "…" : `Top ${players.length}`}</span>
      </div>

      <div className="px-5 py-2 border-b flex items-center gap-2 text-[11px] text-pitch-500" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <TrendingUp size={11} />
        Updated after each match · Live data
      </div>

      <div className="px-5 py-2 border-b text-[11px] font-semibold text-center" style={{ borderColor: "rgba(255,255,255,0.05)", color: "rgb(var(--accent-glow))" }}>
        Points awarded after the Final
      </div>

      {loading ? (
        <div className="px-5 py-8 text-center text-sm animate-pulse" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading…
        </div>
      ) : players.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {players.map((p, i) => (
            <StatRow key={p.api_player_id} rank={i + 1} player={p} stat={p.goals} statLabel="goals" />
          ))}
        </div>
      )}
    </div>
  );
}

export function TopAssistersLeaderboard() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createSb()
      .from("player_tournament_stats")
      .select("api_player_id, player_name, full_name, team_name, goals, assists")
      .gt("assists", 0)
      .order("assists", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setPlayers((data ?? []) as PlayerRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden" style={DARK_CARD_STYLE}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Users size={18} style={{ color: "rgb(var(--accent-glow))" }} />
        <span className="font-display text-xl uppercase text-white tracking-tight">Top Assisters</span>
        <span className="ml-auto label-caps">{loading ? "…" : `Top ${players.length}`}</span>
      </div>

      <div className="px-5 py-2 border-b flex items-center gap-2 text-[11px] text-pitch-500" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <TrendingUp size={11} />
        Updated after each match · Live data
      </div>

      <div className="px-5 py-2 border-b text-[11px] font-semibold text-center" style={{ borderColor: "rgba(255,255,255,0.05)", color: "rgb(var(--accent-glow))" }}>
        Points awarded after the Final
      </div>

      {loading ? (
        <div className="px-5 py-8 text-center text-sm animate-pulse" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading…
        </div>
      ) : players.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {players.map((p, i) => (
            <StatRow key={p.api_player_id} rank={i + 1} player={p} stat={p.assists} statLabel="assists" />
          ))}
        </div>
      )}
    </div>
  );
}
