"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Trophy, MapPin, Clock, Target } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { Card } from "@/components/ui/card";

interface BracketTeam {
  label: string;      // e.g. "1A" or "Spain"
  flagCode?: string;  // set once confirmed
  isConfirmed: boolean;
}

interface BracketMatch {
  id: string;
  home: BracketTeam;
  away: BracketTeam;
  date: string;
  time: string;
  stadium: string;
  city: string;
  timeConfirmed?: boolean; // false ⇒ date/time/venue is a guess, not yet confirmed by API-Football
  homeScore?: number;
  awayScore?: number;
  homeScoreET?: number;
  awayScoreET?: number;
  penaltyWinner?: string;
  stage: string;
}

// Bracket data: labels show group positions until draw is made.
// R32/R16 fixture data below is a placeholder until the draw is made, hence timeConfirmed: false.
const R32_MATCHES: BracketMatch[] = [
  { id: "r32-1",  home: { label: "1A", isConfirmed: false }, away: { label: "2B", isConfirmed: false }, date: "Jul 1",  time: "16:00 ET", stadium: "MetLife Stadium",          city: "New York/NJ",    timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-2",  home: { label: "1B", isConfirmed: false }, away: { label: "2A", isConfirmed: false }, date: "Jul 1",  time: "20:00 ET", stadium: "SoFi Stadium",             city: "Los Angeles",    timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-3",  home: { label: "1C", isConfirmed: false }, away: { label: "2D", isConfirmed: false }, date: "Jul 2",  time: "16:00 ET", stadium: "AT&T Stadium",             city: "Dallas",         timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-4",  home: { label: "1D", isConfirmed: false }, away: { label: "2C", isConfirmed: false }, date: "Jul 2",  time: "20:00 ET", stadium: "Hard Rock Stadium",        city: "Miami",          timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-5",  home: { label: "1E", isConfirmed: false }, away: { label: "2F", isConfirmed: false }, date: "Jul 3",  time: "16:00 ET", stadium: "Estadio Azteca",           city: "Mexico City",    timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-6",  home: { label: "1F", isConfirmed: false }, away: { label: "2E", isConfirmed: false }, date: "Jul 3",  time: "20:00 ET", stadium: "BMO Field",                city: "Toronto",        timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-7",  home: { label: "1G", isConfirmed: false }, away: { label: "2H", isConfirmed: false }, date: "Jul 4",  time: "16:00 ET", stadium: "NRG Stadium",              city: "Houston",        timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-8",  home: { label: "1H", isConfirmed: false }, away: { label: "2G", isConfirmed: false }, date: "Jul 4",  time: "20:00 ET", stadium: "Arrowhead Stadium",        city: "Kansas City",    timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-9",  home: { label: "1I", isConfirmed: false }, away: { label: "2J", isConfirmed: false }, date: "Jul 5",  time: "16:00 ET", stadium: "Lincoln Financial Field",  city: "Philadelphia",   timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-10", home: { label: "1J", isConfirmed: false }, away: { label: "2I", isConfirmed: false }, date: "Jul 5",  time: "20:00 ET", stadium: "Gillette Stadium",         city: "Boston",         timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-11", home: { label: "1K", isConfirmed: false }, away: { label: "2L", isConfirmed: false }, date: "Jul 6",  time: "16:00 ET", stadium: "BC Place",                 city: "Vancouver",      timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-12", home: { label: "1L", isConfirmed: false }, away: { label: "2K", isConfirmed: false }, date: "Jul 6",  time: "20:00 ET", stadium: "Levi's Stadium",           city: "San Francisco",  timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-13", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 7", time: "16:00 ET", stadium: "Estadio BBVA",      city: "Monterrey",      timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-14", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 7", time: "20:00 ET", stadium: "Estadio Akron",      city: "Guadalajara",    timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-15", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 8", time: "16:00 ET", stadium: "MetLife Stadium",     city: "New York/NJ",    timeConfirmed: false, stage: "Round of 32" },
  { id: "r32-16", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 8", time: "20:00 ET", stadium: "SoFi Stadium",        city: "Los Angeles",    timeConfirmed: false, stage: "Round of 32" },
];

const R16_MATCHES: BracketMatch[] = [
  { id: "r16-1", home: { label: "W R32-1", isConfirmed: false }, away: { label: "W R32-2", isConfirmed: false },  date: "Jul 9",  time: "16:00 ET", stadium: "AT&T Stadium",             city: "Dallas",       timeConfirmed: false, stage: "Round of 16" },
  { id: "r16-2", home: { label: "W R32-3", isConfirmed: false }, away: { label: "W R32-4", isConfirmed: false },  date: "Jul 9",  time: "20:00 ET", stadium: "Hard Rock Stadium",        city: "Miami",        timeConfirmed: false, stage: "Round of 16" },
  { id: "r16-3", home: { label: "W R32-5", isConfirmed: false }, away: { label: "W R32-6", isConfirmed: false },  date: "Jul 10", time: "16:00 ET", stadium: "BMO Field",                city: "Toronto",      timeConfirmed: false, stage: "Round of 16" },
  { id: "r16-4", home: { label: "W R32-7", isConfirmed: false }, away: { label: "W R32-8", isConfirmed: false },  date: "Jul 10", time: "20:00 ET", stadium: "NRG Stadium",              city: "Houston",      timeConfirmed: false, stage: "Round of 16" },
  { id: "r16-5", home: { label: "W R32-9", isConfirmed: false }, away: { label: "W R32-10", isConfirmed: false }, date: "Jul 11", time: "16:00 ET", stadium: "Arrowhead Stadium",        city: "Kansas City",  timeConfirmed: false, stage: "Round of 16" },
  { id: "r16-6", home: { label: "W R32-11", isConfirmed: false }, away: { label: "W R32-12", isConfirmed: false },date: "Jul 11", time: "20:00 ET", stadium: "Lincoln Financial Field",  city: "Philadelphia", timeConfirmed: false, stage: "Round of 16" },
  { id: "r16-7", home: { label: "W R32-13", isConfirmed: false }, away: { label: "W R32-14", isConfirmed: false },date: "Jul 12", time: "16:00 ET", stadium: "Estadio Azteca",           city: "Mexico City",  timeConfirmed: false, stage: "Round of 16" },
  { id: "r16-8", home: { label: "W R32-15", isConfirmed: false }, away: { label: "W R32-16", isConfirmed: false },date: "Jul 12", time: "20:00 ET", stadium: "BC Place",                 city: "Vancouver",    timeConfirmed: false, stage: "Round of 16" },
];

// Fallback skeleton shown only until the DB fetch below resolves — dates/venues
// here are placeholders, not real fixture data, hence timeConfirmed: false.
const QF_MATCHES: BracketMatch[] = [
  { id: "qf-1", home: { label: "W R16-1", isConfirmed: false }, away: { label: "W R16-2", isConfirmed: false }, date: "Jul 13", time: "16:00 ET", stadium: "MetLife Stadium",  city: "New York/NJ",   timeConfirmed: false, stage: "Quarter-Final" },
  { id: "qf-2", home: { label: "W R16-3", isConfirmed: false }, away: { label: "W R16-4", isConfirmed: false }, date: "Jul 13", time: "20:00 ET", stadium: "SoFi Stadium",     city: "Los Angeles",   timeConfirmed: false, stage: "Quarter-Final" },
  { id: "qf-3", home: { label: "W R16-5", isConfirmed: false }, away: { label: "W R16-6", isConfirmed: false }, date: "Jul 14", time: "16:00 ET", stadium: "AT&T Stadium",     city: "Dallas",        timeConfirmed: false, stage: "Quarter-Final" },
  { id: "qf-4", home: { label: "W R16-7", isConfirmed: false }, away: { label: "W R16-8", isConfirmed: false }, date: "Jul 14", time: "20:00 ET", stadium: "Levi's Stadium",   city: "San Francisco", timeConfirmed: false, stage: "Quarter-Final" },
];

const SF_MATCHES: BracketMatch[] = [
  { id: "sf-1", home: { label: "W QF-1", isConfirmed: false }, away: { label: "W QF-2", isConfirmed: false }, date: "Jul 17", time: "20:00 ET", stadium: "MetLife Stadium", city: "New York/NJ", timeConfirmed: false, stage: "Semi-Final" },
  { id: "sf-2", home: { label: "W QF-3", isConfirmed: false }, away: { label: "W QF-4", isConfirmed: false }, date: "Jul 18", time: "20:00 ET", stadium: "AT&T Stadium",   city: "Dallas",      timeConfirmed: false, stage: "Semi-Final" },
];

const FINAL_MATCH: BracketMatch = {
  id: "final",
  home: { label: "W SF-1", isConfirmed: false },
  away: { label: "W SF-2", isConfirmed: false },
  date: "Jul 19",
  time: "18:00 ET",
  stadium: "MetLife Stadium",
  city: "New York/NJ",
  timeConfirmed: false,
  stage: "Final",
};

const ROUND_TABS = [
  { id: "r32",   label: "R32"   },
  { id: "r16",   label: "R16"   },
  { id: "qf",    label: "QF"    },
  { id: "sf",    label: "SF"    },
  { id: "final", label: "Final" },
] as const;

type RoundId = typeof ROUND_TABS[number]["id"];

function TeamSlot({ team }: { team: BracketTeam }) {
  const showHint = !team.isConfirmed && team.label && team.label !== "TBD";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 12px", borderRadius: 10,
      border: team.isConfirmed ? "1px solid color-mix(in srgb, var(--ac) 30%, transparent)" : "1.5px dashed var(--br)",
      background: team.isConfirmed ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "var(--ip)",
      transition: "all 0.15s",
    }}>
      {team.isConfirmed && team.flagCode ? (
        <FlagBadge code={team.flagCode} label={team.label} size="sm" />
      ) : (
        <div className="rounded-full shrink-0 flex items-center justify-center"
          style={{ width: 24, height: 24, background: "var(--ip)", border: "1.5px dashed var(--br)" }}>
          <span style={{ fontSize: 8, color: "var(--ft)" }}>?</span>
        </div>
      )}
      <div className="min-w-0 flex flex-col">
        <span className="text-sm font-bold truncate" style={{ color: team.isConfirmed ? "var(--tx)" : "var(--ft)" }}>
          {team.isConfirmed ? team.label : "TBD"}
        </span>
        {showHint && (
          <span className="text-[9px] font-bold uppercase tracking-wide truncate" style={{ color: "var(--ft)" }}>
            {team.label}
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreBadges({ match }: { match: BracketMatch }) {
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const hasET    = match.homeScoreET !== undefined && match.awayScoreET !== undefined;
  const hasPen   = !!match.penaltyWinner;
  if (!hasScore) return null;
  const displayHome = hasET ? match.homeScoreET! : match.homeScore!;
  const displayAway = hasET ? match.awayScoreET! : match.awayScore!;
  return (
    <div className="flex items-center gap-1.5 px-3 pb-1">
      <span className="font-mono font-black text-sm" style={{ color: "var(--sc)" }}>
        {displayHome}–{displayAway}
      </span>
      {hasET && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
          AET
        </span>
      )}
      {hasPen && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "color-mix(in srgb, var(--sc) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--sc) 32%, transparent)", color: "var(--sc)" }}>
          PEN · {match.penaltyWinner}
        </span>
      )}
    </div>
  );
}

function BracketMatchCard({ match, highlight = false, myPick }: { match: BracketMatch; highlight?: boolean; myPick?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      {myPick && (
        <div className="absolute -top-2 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide"
          style={{ background: "var(--ac)", color: "var(--at)", boxShadow: "0 2px 8px color-mix(in srgb, var(--ac) 50%, transparent)" }}>
          <Target size={9} /> Your pick: {myPick}
        </div>
      )}
      <Card
        variant="glass-accent"
        className="overflow-hidden"
        style={{
          background: "var(--sf)",
          border: highlight ? "1px solid var(--sc)" : "1px solid var(--br)",
          boxShadow: highlight ? "0 0 20px color-mix(in srgb, var(--sc) 25%, transparent)" : "0 4px 16px var(--shad)",
        }}
      >
        {highlight && <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--sc), transparent)" }} />}
        <div className="p-3 space-y-1.5">
          <TeamSlot team={match.home} />
          <div className="flex items-center gap-2 px-3">
            <div className="flex-1 h-px" style={{ background: "var(--dv)" }} />
            <span className="font-bold" style={{ fontSize: 10, color: "var(--ft)" }}>VS</span>
            <div className="flex-1 h-px" style={{ background: "var(--dv)" }} />
          </div>
          <TeamSlot team={match.away} />
        </div>
        <ScoreBadges match={match} />
        <div className="px-3 pb-3 flex items-center gap-3 flex-wrap" style={{ fontSize: 10, color: "var(--mt)" }}>
          <span className="flex items-center gap-1">
            <Clock size={9} />{match.timeConfirmed === false ? "Date TBD" : `${match.date} · ${match.time}`}
          </span>
          <span className="flex items-center gap-1"><MapPin size={9} />{match.city}</span>
        </div>
      </Card>
    </motion.div>
  );
}

function DrawColumn({ title, matches, highlight = false, myPicks }: {
  title: string;
  matches: BracketMatch[];
  highlight?: boolean;
  myPicks: Record<string, string>;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "var(--dv)" }}>
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--ac)" }} />
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--mt)" }}>{title}</span>
        <span style={{ fontSize: 10, color: "var(--ft)" }}>{matches.length} match{matches.length === 1 ? "" : "es"}</span>
      </div>
      <div className="space-y-3">
        {matches.map(m => (
          <BracketMatchCard key={m.id} match={m} highlight={highlight} myPick={myPicks[m.id]} />
        ))}
      </div>
    </div>
  );
}

type DbMatch = {
  id: string; home: string; away: string;
  home_flag: string | null; away_flag: string | null;
  kickoff_at: string; stadium: string | null; city: string | null;
  home_score: number | null; away_score: number | null;
  home_score_et: number | null; away_score_et: number | null;
  penalty_winner: string | null;
  time_confirmed: boolean;
  stage: string;
};

function dbMatchToBracket(m: DbMatch, stageLabel: string): BracketMatch {
  const kickoff = new Date(m.kickoff_at);
  return {
    id: m.id,
    home: { label: m.home, flagCode: m.home_flag ?? undefined, isConfirmed: !!m.home_flag },
    away: { label: m.away, flagCode: m.away_flag ?? undefined, isConfirmed: !!m.away_flag },
    date: kickoff.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
    time: kickoff.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }),
    stadium: m.stadium ?? "TBD",
    city: m.city ?? "TBD",
    timeConfirmed: m.time_confirmed,
    homeScore:     m.home_score     ?? undefined,
    awayScore:     m.away_score     ?? undefined,
    homeScoreET:   m.home_score_et  ?? undefined,
    awayScoreET:   m.away_score_et  ?? undefined,
    penaltyWinner: m.penalty_winner ?? undefined,
    stage: stageLabel,
  };
}

export function KnockoutBracket({ groupId }: { groupId?: string }) {
  const [r32Matches, setR32Matches] = useState<BracketMatch[]>(R32_MATCHES);
  const [r16Matches, setR16Matches] = useState<BracketMatch[]>(R16_MATCHES);
  const [qfMatches, setQfMatches] = useState<BracketMatch[]>(QF_MATCHES);
  const [sfMatches, setSfMatches] = useState<BracketMatch[]>(SF_MATCHES);
  const [finalMatch, setFinalMatch] = useState<BracketMatch>(FINAL_MATCH);
  const [round, setRound] = useState<RoundId>("r32");
  const [userId, setUserId] = useState<string | null>(null);
  const [myPicks, setMyPicks] = useState<Record<string, string>>({});

  // Data-fetching/advancement logic — unchanged from the pre-redesign version.
  useEffect(() => {
    const SELECT = "id, home, away, home_flag, away_flag, kickoff_at, stage, stadium, city, home_score, away_score, home_score_et, away_score_et, penalty_winner, time_confirmed";
    createClient()
      .from("matches")
      .select(SELECT)
      .in("stage", ["R32", "R16", "QF", "SF", "Final"])
      .order("kickoff_at", { ascending: true })
      .then(({ data }) => {
        if (!data?.length) return;
        const rows = data as DbMatch[];
        const r32 = rows.filter(m => m.stage === "R32");
        const r16 = rows.filter(m => m.stage === "R16");
        const qf  = rows.filter(m => m.stage === "QF");
        const sf  = rows.filter(m => m.stage === "SF");
        const fn  = rows.filter(m => m.stage === "Final");

        if (r32.length) setR32Matches(r32.map(m => dbMatchToBracket(m, "Round of 32")));
        if (r16.length) setR16Matches(r16.map(m => dbMatchToBracket(m, "Round of 16")));
        if (qf.length)  setQfMatches(qf.map(m => dbMatchToBracket(m, "Quarter-Final")));
        if (sf.length)  setSfMatches(sf.map(m => dbMatchToBracket(m, "Semi-Final")));
        if (fn.length)  setFinalMatch(dbMatchToBracket(fn[0], "Final"));
      });
  }, []);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Additive, presentation-only lookup: the member's own saved pick per bracket
  // match, for the "Your pick" overlay badge. Does not touch match/advancement fetching above.
  useEffect(() => {
    if (!userId || !groupId) return;
    const allIds = [...r32Matches, ...r16Matches, ...qfMatches, ...sfMatches, finalMatch].map(m => m.id);
    if (!allIds.length) return;
    createClient()
      .from("group_predictions")
      .select("match_id, home_score, away_score")
      .eq("user_id", userId)
      .eq("group_id", groupId)
      .in("match_id", allIds)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        for (const row of data as { match_id: string; home_score: number | null; away_score: number | null }[]) {
          if (row.home_score != null && row.away_score != null) {
            map[row.match_id] = `${row.home_score}-${row.away_score}`;
          }
        }
        setMyPicks(map);
      });
  }, [userId, groupId, r32Matches, r16Matches, qfMatches, sfMatches, finalMatch]);

  const allUnconfirmed = r32Matches.every(m => !m.home.isConfirmed && !m.away.isConfirmed);

  const roundMatches: Record<RoundId, BracketMatch[]> = {
    r32: r32Matches, r16: r16Matches, qf: qfMatches, sf: sfMatches, final: [finalMatch],
  };
  const current = roundMatches[round];
  const half = Math.ceil(current.length / 2);
  const leftMatches  = current.slice(0, half);
  const rightMatches = round === "final" ? [] : current.slice(half);

  return (
    <div className="space-y-6">
      {/* Not yet open banner */}
      {allUnconfirmed && (
        <div style={{
          background: "color-mix(in srgb, var(--sc) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--sc) 25%, transparent)",
          borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Trophy size={16} style={{ color: "var(--sc)", flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: "var(--sc)", fontWeight: 600, fontFamily: "var(--font-ui)" }}>
            Bracket not yet open. Team positions will be filled after the group stage concludes.
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{
        background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 14, padding: 16, fontSize: 12,
      }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm shrink-0" style={{ border: "1.5px dashed var(--br)", background: "var(--ip)" }} />
          <span style={{ color: "var(--t2)" }}>TBD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm shrink-0" style={{ background: "color-mix(in srgb, var(--ac) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 30%, transparent)" }} />
          <span style={{ color: "var(--t2)" }}>Confirmed</span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm shrink-0" style={{ border: "1px solid var(--sc)", boxShadow: "0 0 8px color-mix(in srgb, var(--sc) 30%, transparent)" }} />
          <span style={{ color: "var(--t2)" }}>Final match</span>
        </div>
      </div>

      {/* Round selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {ROUND_TABS.map(tab => {
          const active = round === tab.id;
          const count = roundMatches[tab.id].length;
          return (
            <button
              key={tab.id}
              onClick={() => setRound(tab.id)}
              className="flex-none flex items-center gap-1.5 px-4 min-h-[44px] rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95"
              style={active
                ? { background: "var(--ac)", color: "var(--at)", boxShadow: "0 4px 16px color-mix(in srgb, var(--ac) 35%, transparent)" }
                : { background: "var(--sf)", color: "var(--t2)", border: "1px solid var(--br)" }}
            >
              {tab.label}
              <span style={{ fontSize: 9, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Two-column draw: left / right sides of the bracket */}
      {round === "final" ? (
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "var(--dv)" }}>
            <Trophy size={14} style={{ color: "var(--sc)" }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--mt)" }}>Final</span>
            <span style={{ fontSize: 10, color: "var(--ft)" }}>
              {finalMatch.city} · {finalMatch.timeConfirmed === false ? "Date TBD" : finalMatch.date}
            </span>
          </div>
          <BracketMatchCard match={finalMatch} highlight myPick={myPicks[finalMatch.id]} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DrawColumn title="Left Side" matches={leftMatches} myPicks={myPicks} />
          <DrawColumn title="Right Side" matches={rightMatches} myPicks={myPicks} />
        </div>
      )}

      {/* Third place note */}
      <div style={{
        background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 14, padding: 16,
        display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--t2)",
      }}>
        <Trophy size={16} style={{ color: "var(--ft)", flexShrink: 0 }} />
        <span>Third place playoff: Hard Rock Stadium, Miami · July 25, 14:00 ET</span>
      </div>
    </div>
  );
}
