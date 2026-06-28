"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Trophy, MapPin, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import { flagUrl } from "@/lib/countries";

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
  homeScore?: number;
  awayScore?: number;
  stage: string;
}

// Bracket data: labels show group positions until draw is made.
const R32_MATCHES: BracketMatch[] = [
  { id: "r32-1",  home: { label: "1A", isConfirmed: false }, away: { label: "2B", isConfirmed: false }, date: "Jul 1",  time: "16:00 ET", stadium: "MetLife Stadium",          city: "New York/NJ",    stage: "Round of 32" },
  { id: "r32-2",  home: { label: "1B", isConfirmed: false }, away: { label: "2A", isConfirmed: false }, date: "Jul 1",  time: "20:00 ET", stadium: "SoFi Stadium",             city: "Los Angeles",    stage: "Round of 32" },
  { id: "r32-3",  home: { label: "1C", isConfirmed: false }, away: { label: "2D", isConfirmed: false }, date: "Jul 2",  time: "16:00 ET", stadium: "AT&T Stadium",             city: "Dallas",         stage: "Round of 32" },
  { id: "r32-4",  home: { label: "1D", isConfirmed: false }, away: { label: "2C", isConfirmed: false }, date: "Jul 2",  time: "20:00 ET", stadium: "Hard Rock Stadium",        city: "Miami",          stage: "Round of 32" },
  { id: "r32-5",  home: { label: "1E", isConfirmed: false }, away: { label: "2F", isConfirmed: false }, date: "Jul 3",  time: "16:00 ET", stadium: "Estadio Azteca",           city: "Mexico City",    stage: "Round of 32" },
  { id: "r32-6",  home: { label: "1F", isConfirmed: false }, away: { label: "2E", isConfirmed: false }, date: "Jul 3",  time: "20:00 ET", stadium: "BMO Field",                city: "Toronto",        stage: "Round of 32" },
  { id: "r32-7",  home: { label: "1G", isConfirmed: false }, away: { label: "2H", isConfirmed: false }, date: "Jul 4",  time: "16:00 ET", stadium: "NRG Stadium",              city: "Houston",        stage: "Round of 32" },
  { id: "r32-8",  home: { label: "1H", isConfirmed: false }, away: { label: "2G", isConfirmed: false }, date: "Jul 4",  time: "20:00 ET", stadium: "Arrowhead Stadium",        city: "Kansas City",    stage: "Round of 32" },
  { id: "r32-9",  home: { label: "1I", isConfirmed: false }, away: { label: "2J", isConfirmed: false }, date: "Jul 5",  time: "16:00 ET", stadium: "Lincoln Financial Field",  city: "Philadelphia",   stage: "Round of 32" },
  { id: "r32-10", home: { label: "1J", isConfirmed: false }, away: { label: "2I", isConfirmed: false }, date: "Jul 5",  time: "20:00 ET", stadium: "Gillette Stadium",         city: "Boston",         stage: "Round of 32" },
  { id: "r32-11", home: { label: "1K", isConfirmed: false }, away: { label: "2L", isConfirmed: false }, date: "Jul 6",  time: "16:00 ET", stadium: "BC Place",                 city: "Vancouver",      stage: "Round of 32" },
  { id: "r32-12", home: { label: "1L", isConfirmed: false }, away: { label: "2K", isConfirmed: false }, date: "Jul 6",  time: "20:00 ET", stadium: "Levi's Stadium",           city: "San Francisco",  stage: "Round of 32" },
  { id: "r32-13", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 7", time: "16:00 ET", stadium: "Estadio BBVA",      city: "Monterrey",      stage: "Round of 32" },
  { id: "r32-14", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 7", time: "20:00 ET", stadium: "Estadio Akron",      city: "Guadalajara",    stage: "Round of 32" },
  { id: "r32-15", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 8", time: "16:00 ET", stadium: "MetLife Stadium",     city: "New York/NJ",    stage: "Round of 32" },
  { id: "r32-16", home: { label: "Best 3rd", isConfirmed: false }, away: { label: "TBD", isConfirmed: false }, date: "Jul 8", time: "20:00 ET", stadium: "SoFi Stadium",        city: "Los Angeles",    stage: "Round of 32" },
];

const R16_MATCHES: BracketMatch[] = [
  { id: "r16-1", home: { label: "W R32-1", isConfirmed: false }, away: { label: "W R32-2", isConfirmed: false },  date: "Jul 9",  time: "16:00 ET", stadium: "AT&T Stadium",             city: "Dallas",       stage: "Round of 16" },
  { id: "r16-2", home: { label: "W R32-3", isConfirmed: false }, away: { label: "W R32-4", isConfirmed: false },  date: "Jul 9",  time: "20:00 ET", stadium: "Hard Rock Stadium",        city: "Miami",        stage: "Round of 16" },
  { id: "r16-3", home: { label: "W R32-5", isConfirmed: false }, away: { label: "W R32-6", isConfirmed: false },  date: "Jul 10", time: "16:00 ET", stadium: "BMO Field",                city: "Toronto",      stage: "Round of 16" },
  { id: "r16-4", home: { label: "W R32-7", isConfirmed: false }, away: { label: "W R32-8", isConfirmed: false },  date: "Jul 10", time: "20:00 ET", stadium: "NRG Stadium",              city: "Houston",      stage: "Round of 16" },
  { id: "r16-5", home: { label: "W R32-9", isConfirmed: false }, away: { label: "W R32-10", isConfirmed: false }, date: "Jul 11", time: "16:00 ET", stadium: "Arrowhead Stadium",        city: "Kansas City",  stage: "Round of 16" },
  { id: "r16-6", home: { label: "W R32-11", isConfirmed: false }, away: { label: "W R32-12", isConfirmed: false },date: "Jul 11", time: "20:00 ET", stadium: "Lincoln Financial Field",  city: "Philadelphia", stage: "Round of 16" },
  { id: "r16-7", home: { label: "W R32-13", isConfirmed: false }, away: { label: "W R32-14", isConfirmed: false },date: "Jul 12", time: "16:00 ET", stadium: "Estadio Azteca",           city: "Mexico City",  stage: "Round of 16" },
  { id: "r16-8", home: { label: "W R32-15", isConfirmed: false }, away: { label: "W R32-16", isConfirmed: false },date: "Jul 12", time: "20:00 ET", stadium: "BC Place",                 city: "Vancouver",    stage: "Round of 16" },
];

const QF_MATCHES: BracketMatch[] = [
  { id: "qf-1", home: { label: "W R16-1", isConfirmed: false }, away: { label: "W R16-2", isConfirmed: false }, date: "Jul 15", time: "16:00 ET", stadium: "MetLife Stadium",  city: "New York/NJ",   stage: "Quarter-Final" },
  { id: "qf-2", home: { label: "W R16-3", isConfirmed: false }, away: { label: "W R16-4", isConfirmed: false }, date: "Jul 15", time: "20:00 ET", stadium: "SoFi Stadium",     city: "Los Angeles",   stage: "Quarter-Final" },
  { id: "qf-3", home: { label: "W R16-5", isConfirmed: false }, away: { label: "W R16-6", isConfirmed: false }, date: "Jul 16", time: "16:00 ET", stadium: "AT&T Stadium",     city: "Dallas",        stage: "Quarter-Final" },
  { id: "qf-4", home: { label: "W R16-7", isConfirmed: false }, away: { label: "W R16-8", isConfirmed: false }, date: "Jul 16", time: "20:00 ET", stadium: "Levi's Stadium",   city: "San Francisco", stage: "Quarter-Final" },
];

const SF_MATCHES: BracketMatch[] = [
  { id: "sf-1", home: { label: "W QF-1", isConfirmed: false }, away: { label: "W QF-2", isConfirmed: false }, date: "Jul 21", time: "20:00 ET", stadium: "MetLife Stadium", city: "New York/NJ", stage: "Semi-Final" },
  { id: "sf-2", home: { label: "W QF-3", isConfirmed: false }, away: { label: "W QF-4", isConfirmed: false }, date: "Jul 22", time: "20:00 ET", stadium: "AT&T Stadium",   city: "Dallas",      stage: "Semi-Final" },
];

const ROUND_TABS = [
  { id: "r32",   label: "R32",   count: 16 },
  { id: "r16",   label: "R16",   count: 8  },
  { id: "qf",    label: "QF",    count: 4  },
  { id: "sf",    label: "SF",    count: 2  },
  { id: "final", label: "Final", count: 1  },
];

const FINAL_MATCH: BracketMatch = {
  id: "final",
  home: { label: "W SF-1", isConfirmed: false },
  away: { label: "W SF-2", isConfirmed: false },
  date: "Jul 19",
  time: "18:00 ET",
  stadium: "MetLife Stadium",
  city: "New York/NJ",
  stage: "Final",
};

function TeamSlot({ team }: { team: BracketTeam }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 12px", borderRadius: 10,
      border: team.isConfirmed ? "1px solid rgba(0,255,136,0.25)" : "1px solid rgba(255,255,255,0.08)",
      background: team.isConfirmed ? "rgba(0,255,136,0.05)" : "rgba(255,255,255,0.02)",
      transition: "all 0.15s",
    }}>
      {team.isConfirmed && team.flagCode ? (
        <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
          <Image src={flagUrl(team.flagCode, 40)} alt={team.label} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-6 h-4 rounded-sm shrink-0 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.18)" }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>?</span>
        </div>
      )}
      <span className="text-sm font-bold truncate"
        style={{ color: team.isConfirmed ? "#ffffff" : "rgba(255,255,255,0.3)" }}>
        {team.label}
      </span>
    </div>
  );
}

function BracketMatchCard({ match, highlight = false }: { match: BracketMatch; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: highlight ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: highlight ? "0 0 20px rgba(212,175,55,0.2)" : "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      {highlight && (
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
      )}
      <div className="p-3 space-y-1.5">
        <TeamSlot team={match.home} />
        <div className="flex items-center gap-2 px-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="font-bold" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>VS</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
        <TeamSlot team={match.away} />
      </div>
      <div className="px-3 pb-3 flex items-center gap-3 flex-wrap"
        style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
        <span className="flex items-center gap-1"><Clock size={9} />{match.date} · {match.time}</span>
        <span className="flex items-center gap-1"><MapPin size={9} />{match.city}</span>
      </div>
    </motion.div>
  );
}

function StageColumn({ title, matches, color, highlight = false, id }: {
  title: string;
  matches: BracketMatch[];
  color: string;
  highlight?: boolean;
  id?: string;
}) {
  return (
    <div id={id} className="min-w-[200px] flex-1">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="label-caps">{title}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{matches.length} matches</span>
      </div>
      <div className="space-y-2">
        {matches.map((m) => (
          <BracketMatchCard key={m.id} match={m} highlight={highlight} />
        ))}
      </div>
    </div>
  );
}

export function KnockoutBracket({ groupId: _groupId }: { groupId?: string }) {
  const [r32Matches, setR32Matches] = useState<BracketMatch[]>(R32_MATCHES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient()
      .from("matches")
      .select("id, home, away, home_flag, away_flag, kickoff_at, stadium, city")
      .eq("stage", "R32")
      .order("kickoff_at", { ascending: true })
      .then(({ data }) => {
        if (!data?.length) return;
        setR32Matches(
          (data as Array<{
            id: string; home: string; away: string;
            home_flag: string | null; away_flag: string | null;
            kickoff_at: string; stadium: string | null; city: string | null;
          }>).map(m => {
            const kickoff = new Date(m.kickoff_at);
            return {
              id: m.id,
              home: { label: m.home, flagCode: m.home_flag ?? undefined, isConfirmed: !!m.home_flag },
              away: { label: m.away, flagCode: m.away_flag ?? undefined, isConfirmed: !!m.away_flag },
              date: kickoff.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
              time: kickoff.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }),
              stadium: m.stadium ?? "TBD",
              city: m.city ?? "TBD",
              stage: "Round of 32",
            };
          })
        );
      });
  }, []);

  const allUnconfirmed = r32Matches.every(m => !m.home.isConfirmed && !m.away.isConfirmed);

  const scrollToRound = (roundId: string) => {
    const container = scrollRef.current;
    const el = document.getElementById(`round-${roundId}`);
    if (!container || !el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    container.scrollTo({ left: Math.max(0, container.scrollLeft + elRect.left - containerRect.left - 16), behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Not yet open banner */}
      {allUnconfirmed && (
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Trophy size={16} style={{ color: "#8B5CF6", flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: "#8B5CF6", fontWeight: 600, fontFamily: "var(--font-ui)" }}>
            Bracket not yet open. Team positions will be filled after the group stage concludes.
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14, padding: 16,
        fontSize: 12,
      }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm shrink-0"
            style={{ border: "1px dashed rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)" }} />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>TBD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm shrink-0"
            style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)" }} />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Confirmed</span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm shrink-0"
            style={{ border: "1px solid rgba(212,175,55,0.3)", boxShadow: "0 0 8px rgba(212,175,55,0.2)" }} />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Final match</span>
        </div>
      </div>

      {/* Mobile round navigation — jump to any stage in the horizontal scroll */}
      <div className="sm:hidden flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {ROUND_TABS.map(tab => (
          <button key={tab.id} onClick={() => scrollToRound(tab.id)}
            className="flex-none flex items-center gap-1.5 px-3 min-h-[44px] rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all active:scale-95"
            style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.25)" }}>
            {tab.label}
            <span style={{ fontSize: 9, color: "rgba(139,92,246,0.5)" }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Scrollable bracket: horizontal scroll on mobile */}
      <div className="relative w-full max-w-full">
        {/* Right-edge fade signals more content to the right */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-14 z-10 sm:hidden"
          style={{ background: "linear-gradient(to left, rgba(8,12,22,0.95) 0%, transparent 100%)" }} />
        <div ref={scrollRef} className="overflow-x-auto w-full pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex gap-4 min-w-max">
            <StageColumn id="round-r32" title="Round of 32" matches={r32Matches} color="#8B5CF6" />
            <div className="flex flex-col justify-center">
              <ChevronRight size={20} style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            <StageColumn id="round-r16" title="Round of 16" matches={R16_MATCHES} color="#8B5CF6" />
            <div className="flex flex-col justify-center">
              <ChevronRight size={20} style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            <StageColumn id="round-qf" title="Quarter-Finals" matches={QF_MATCHES} color="#8B5CF6" />
            <div className="flex flex-col justify-center">
              <ChevronRight size={20} style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            <StageColumn id="round-sf" title="Semi-Finals" matches={SF_MATCHES} color="#8B5CF6" />
            <div className="flex flex-col justify-center">
              <ChevronRight size={20} style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            {/* Final */}
            <div id="round-final" className="min-w-[220px]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
                <Trophy size={14} style={{ color: "#D4AF37" }} />
                <span className="label-caps">Final</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>MetLife · Jul 19</span>
              </div>
              <BracketMatchCard match={FINAL_MATCH} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* Third place note */}
      <div style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14, padding: 16,
        display: "flex", alignItems: "center", gap: 12,
        fontSize: 14, color: "rgba(255,255,255,0.4)",
      }}>
        <Trophy size={16} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
        <span>Third place playoff: Hard Rock Stadium, Miami · July 25, 14:00 ET</span>
      </div>
    </div>
  );
}
