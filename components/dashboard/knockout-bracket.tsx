"use client";

import { motion } from "framer-motion";
import { Trophy, MapPin, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

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

// Bracket data — labels show group positions until draw is made
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
    <div className={cn(
      "flex items-center gap-2 py-2 px-3 rounded-xl border transition-all",
      team.isConfirmed
        ? "border-accent/30 bg-accent/5"
        : "border-white/[0.08] bg-white/[0.02]"
    )}>
      {team.isConfirmed && team.flagCode ? (
        <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
          <Image src={flagUrl(team.flagCode, 40)} alt={team.label} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-6 h-4 rounded-sm bg-white/[0.08] border border-dashed border-white/20 shrink-0 flex items-center justify-center">
          <span className="text-[8px] text-pitch-600">?</span>
        </div>
      )}
      <span className={cn(
        "text-sm font-bold truncate",
        team.isConfirmed ? "text-white" : "text-pitch-500"
      )}>
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
      className={cn(
        "glass rounded-xl overflow-hidden",
        highlight && "border border-yellow-500/30"
      )}
      style={highlight ? { boxShadow: "0 0 20px rgba(212,175,55,0.2)" } : undefined}
    >
      {highlight && (
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
      )}
      <div className="p-3 space-y-1.5">
        <TeamSlot team={match.home} />
        <div className="flex items-center gap-2 px-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] text-pitch-600 font-bold">VS</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <TeamSlot team={match.away} />
      </div>
      <div className="px-3 pb-3 flex items-center gap-3 text-[10px] text-pitch-500 flex-wrap">
        <span className="flex items-center gap-1"><Clock size={9} />{match.date} · {match.time}</span>
        <span className="flex items-center gap-1"><MapPin size={9} />{match.city}</span>
      </div>
    </motion.div>
  );
}

function StageColumn({ title, matches, color, highlight = false }: {
  title: string;
  matches: BracketMatch[];
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-[200px] flex-1">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="label-caps">{title}</span>
        <span className="text-[10px] text-pitch-600">{matches.length} matches</span>
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
  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm border border-dashed border-white/20 bg-white/[0.04]" />
          <span className="text-pitch-400">TBD — team not yet confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm bg-white/10 border border-accent/30" />
          <span className="text-pitch-400">Confirmed team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm border border-yellow-500/30" style={{ boxShadow: "0 0 8px rgba(212,175,55,0.2)" }} />
          <span className="text-pitch-400">Final match</span>
        </div>
      </div>

      {/* Scrollable bracket — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          <StageColumn
            title="Round of 32"
            matches={R32_MATCHES}
            color="#6366f1"
          />
          <div className="flex flex-col justify-center">
            <ChevronRight size={20} className="text-pitch-600" />
          </div>
          <StageColumn
            title="Round of 16"
            matches={R16_MATCHES}
            color="#8b5cf6"
          />
          <div className="flex flex-col justify-center">
            <ChevronRight size={20} className="text-pitch-600" />
          </div>
          <StageColumn
            title="Quarter-Finals"
            matches={QF_MATCHES}
            color="#f59e0b"
          />
          <div className="flex flex-col justify-center">
            <ChevronRight size={20} className="text-pitch-600" />
          </div>
          <StageColumn
            title="Semi-Finals"
            matches={SF_MATCHES}
            color="#ef4444"
          />
          <div className="flex flex-col justify-center">
            <ChevronRight size={20} className="text-pitch-600" />
          </div>
          {/* Final */}
          <div className="min-w-[220px]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
              <Trophy size={14} style={{ color: "#D4AF37" }} />
              <span className="label-caps">Final</span>
              <span className="text-[10px] text-pitch-600">MetLife · Jul 19</span>
            </div>
            <BracketMatchCard match={FINAL_MATCH} highlight />
          </div>
        </div>
      </div>

      {/* Third place note */}
      <div className="glass rounded-xl p-4 flex items-center gap-3 text-sm text-pitch-400">
        <Trophy size={16} className="text-pitch-500 shrink-0" />
        <span>Third place playoff: Hard Rock Stadium, Miami · July 25, 14:00 ET</span>
      </div>
    </div>
  );
}