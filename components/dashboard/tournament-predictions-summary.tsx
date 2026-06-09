"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Target, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES } from "@/lib/countries";

const TOURNAMENT_LOCK_UTC = new Date("2026-06-11T19:55:00Z");

interface PickCount {
  value:    string;
  count:    number;
  pct:      number;
  photo?:   string | null;
  flagCode: string;
  country?: string;
}

interface SummaryData {
  winner:      PickCount[];
  topScorer:   PickCount[];
  topAssister: PickCount[];
  total:       number;
}

const FLAG_MAP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const c of ALL_COUNTRIES) m[c.name.toLowerCase()] = c.flagCode;
  // common API-Football aliases
  const overrides: Record<string, string> = {
    "south korea": "kr", "korea republic": "kr",
    "usa": "us", "united states": "us",
    "türkiye": "tr", "turkey": "tr",
    "cape verde islands": "cv", "ivory coast": "ci",
    "congo dr": "cd", "bosnia & herzegovina": "ba",
    "netherlands": "nl", "curaçao": "cw", "new zealand": "nz",
    "saudi arabia": "sa", "south africa": "za",
  };
  return { ...m, ...overrides };
})();

function getFlag(name: string) { return FLAG_MAP[name.toLowerCase()] ?? ""; }

const RANK_COLORS = ["#fbbf24", "#94a3b8", "#f97316"];
const RANK_LABELS = ["1st", "2nd", "3rd"];

function PickRow({ pick, rank, isPlayer }: { pick: PickCount; rank: number; isPlayer: boolean }) {
  const color = RANK_COLORS[rank] ?? "rgba(255,255,255,0.4)";
  const fc    = pick.flagCode;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-[10px] font-black w-6 shrink-0 text-center" style={{ color }}>{RANK_LABELS[rank]}</span>

      {isPlayer && (
        pick.photo ? (
          <img src={pick.photo} alt={pick.value}
            className="w-8 h-8 rounded-full object-cover shrink-0 bg-white/10"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Users size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        )
      )}

      {fc && (
        <img src={`/flags/${fc}.svg`} alt={fc}
          className="w-6 h-4 object-cover rounded-sm shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
      )}

      <span className="flex-1 text-sm font-bold truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
        {pick.value}
      </span>

      <div className="flex items-center gap-2 shrink-0">
        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pick.pct}%`, background: color }} />
        </div>
        <span className="text-xs font-black w-8 text-right" style={{ color, fontFamily: "var(--font-mono)" }}>
          {pick.pct}%
        </span>
      </div>
    </div>
  );
}

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: 22,
} as const;

interface Props { groupId: string; memberCount: number; }

export function TournamentPredictionsSummary({ groupId, memberCount }: Props) {
  const [data,    setData]    = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const isVisible = new Date() >= TOURNAMENT_LOCK_UTC;

  useEffect(() => {
    if (!isVisible) { setLoading(false); return; }
    const sb = createClient();
    async function load() {
      const { data: picks } = await sb
        .from("group_predictions")
        .select("pred_type, pred_value")
        .eq("group_id", groupId)
        .in("pred_type", ["winner", "top_scorer", "top_assister"]);

      if (!picks?.length) { setLoading(false); return; }

      const agg: Record<string, Record<string, number>> = {
        winner: {}, top_scorer: {}, top_assister: {},
      };
      for (const p of picks) {
        if (agg[p.pred_type] !== undefined)
          agg[p.pred_type][p.pred_value] = (agg[p.pred_type][p.pred_value] ?? 0) + 1;
      }

      const topN = (map: Record<string, number>): PickCount[] =>
        Object.entries(map)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([value, count]) => ({
            value,
            count,
            pct:     memberCount > 0 ? Math.round((count / memberCount) * 100) : 0,
            flagCode: "",
          }));

      const winnerPicks   = topN(agg.winner);
      const scorerPicks   = topN(agg.top_scorer);
      const assisterPicks = topN(agg.top_assister);

      // Enrich winner with flag
      for (const p of winnerPicks) p.flagCode = getFlag(p.value);

      // Fetch player photos + country for scorer/assister
      const playerNames = [...scorerPicks, ...assisterPicks].map(p => p.value);
      if (playerNames.length) {
        const { data: players } = await sb
          .from("players")
          .select("full_name, photo, country")
          .in("full_name", playerNames)
          .limit(playerNames.length + 10);
        const pm: Record<string, { photo: string | null; country: string }> = {};
        for (const pl of players ?? []) pm[pl.full_name] = { photo: pl.photo, country: pl.country };
        const enrich = (arr: PickCount[]) => arr.forEach(p => {
          const pl = pm[p.value];
          if (pl) { p.photo = pl.photo; p.flagCode = getFlag(pl.country); p.country = pl.country; }
        });
        enrich(scorerPicks);
        enrich(assisterPicks);
      }

      setData({ winner: winnerPicks, topScorer: scorerPicks, topAssister: assisterPicks, total: memberCount });
      setLoading(false);
    }
    load();
  }, [groupId, memberCount, isVisible]);

  if (!isVisible) {
    return (
      <div className="p-5 text-center space-y-1" style={glassCard}>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
          Tournament Predictions Summary
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          Visible after the first match kicks off — June 11, 2026
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-5 text-center" style={glassCard}>
        <div className="text-xs animate-pulse" style={{ color: "rgba(255,255,255,0.3)" }}>Loading predictions…</div>
      </div>
    );
  }

  if (!data || (!data.winner.length && !data.topScorer.length && !data.topAssister.length)) return null;

  const sections = [
    { key: "winner",      label: "Tournament Winner",    icon: <Trophy size={16} style={{ color: "#d97706" }} />, picks: data.winner,      isPlayer: false },
    { key: "topScorer",   label: "Top Scorer · Boot",    icon: <Target size={16} style={{ color: "#00FF88" }} />, picks: data.topScorer,   isPlayer: true  },
    { key: "topAssister", label: "Top Assister",         icon: <Star   size={16} style={{ color: "#00D4FF" }} />, picks: data.topAssister, isPlayer: true  },
  ].filter(s => s.picks.length > 0);

  return (
    <div className="p-5 space-y-5" style={glassCard}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: "#fbbf24" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>
            Group Predictions
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
          {data.total} member{data.total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {sections.map(s => (
          <div key={s.key}>
            <div className="flex items-center gap-1.5 mb-2">
              {s.icon}
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                {s.label}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {s.picks.map((p, i) => (
                <PickRow key={p.value} pick={p} rank={i} isPlayer={s.isPlayer} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
