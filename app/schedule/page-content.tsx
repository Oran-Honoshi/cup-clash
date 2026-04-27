"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { MapPin, Clock, Filter, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WC2026_MATCHES, groupMatchesByDate, STAGE_LABELS, HOST_CITY_FLAGS } from "@/lib/schedule";
import { flagUrl } from "@/lib/countries";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STAGES = ["All", "Group", "R32", "R16", "QF", "SF", "Final"];
const COUNTRIES = ["All", "USA", "CAN", "MEX"];

const STAGE_COLORS: Record<string, string> = {
  Group:  "bg-white/[0.05] text-pitch-300 border-white/[0.08]",
  R32:    "bg-blue-500/10 text-blue-300 border-blue-500/20",
  R16:    "bg-violet-500/10 text-violet-300 border-violet-500/20",
  QF:     "bg-amber-500/10 text-amber-300 border-amber-500/20",
  SF:     "bg-orange-500/10 text-orange-300 border-orange-500/20",
  "3rd":  "bg-slate-500/10 text-slate-300 border-slate-500/20",
  Final:  "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
};

export default function SchedulePageContent() {
  const [stageFilter, setStageFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");

  const filtered = useMemo(() => {
    return WC2026_MATCHES.filter((m) => {
      if (stageFilter !== "All" && m.stage !== stageFilter) return false;
      if (countryFilter !== "All" && m.country !== countryFilter) return false;
      return true;
    });
  }, [stageFilter, countryFilter]);

  const grouped = useMemo(() => groupMatchesByDate(filtered), [filtered]);
  const dates = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen">
      {/* ── SEO-rich page header ── */}
      <header className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Semantic breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-pitch-500">
              <li><Link href="/" className="hover:text-white transition-colors">Cup Clash</Link></li>
              <li>/</li>
              <li className="text-pitch-300">Schedule</li>
            </ol>
          </nav>

          <h1 className="font-display text-4xl sm:text-6xl uppercase text-white tracking-tight leading-[0.9]">
            FIFA World Cup 2026
            <br />
            <span className="gradient-text">Full Schedule</span>
          </h1>

          <p className="mt-4 text-pitch-300 max-w-2xl text-lg leading-relaxed">
            All 104 matches across 16 host cities in the United States, Canada, and Mexico.
            Group stage runs June 11–29 · Round of 32 July 1–8 · Final at MetLife Stadium, July 19.
          </p>

          {/* Host cities summary */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { code: "us", label: "11 USA venues", country: "USA" },
              { code: "ca", label: "2 Canada venues", country: "CAN" },
              { code: "mx", label: "3 Mexico venues", country: "MEX" },
            ].map((h) => (
              <button
                key={h.code}
                onClick={() => setCountryFilter(countryFilter === h.country ? "All" : h.country)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all",
                  countryFilter === h.country
                    ? "bg-white/10 border-accent text-white"
                    : "border-white/10 text-pitch-400 hover:text-white hover:border-white/20"
                )}
              >
                <div className="relative w-5 h-3.5 rounded-sm overflow-hidden">
                  <Image src={flagUrl(h.code, 20)} alt={h.country} fill className="object-cover" unoptimized />
                </div>
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-pitch-500">
            <Filter size={12} /> Stage
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all",
                  stageFilter === s
                    ? "bg-white/10 border-accent text-white"
                    : "border-white/10 text-pitch-500 hover:text-white hover:border-white/20"
                )}
              >
                {s === "All" ? "All stages" : STAGE_LABELS[s] ?? s}
              </button>
            ))}
          </div>

          <span className="text-pitch-700">·</span>
          <span className="text-xs font-bold uppercase tracking-widest text-pitch-500">
            {filtered.length} matches
          </span>
        </div>

        {/* Match list grouped by date */}
        {dates.length === 0 ? (
          <div className="text-center py-20 text-pitch-500">
            No matches found for this filter.
          </div>
        ) : (
          <div className="space-y-8">
            {dates.map((date) => {
              const matches = grouped[date];
              const parsed = parseISO(date);
              const dayLabel = format(parsed, "EEEE");
              const dateLabel = format(parsed, "MMMM d, yyyy");

              return (
                <section key={date} aria-label={dateLabel}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-pitch-500" />
                      <h2 className="font-display text-2xl uppercase text-white tracking-tight">
                        {dayLabel}
                      </h2>
                      <span className="text-pitch-400 font-mono text-sm">
                        {dateLabel}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[10px] text-pitch-600 uppercase tracking-widest">
                      {matches.length} {matches.length === 1 ? "match" : "matches"}
                    </span>
                  </div>

                  {/* Match cards */}
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <article
                        key={match.id}
                        className={cn(
                          "glass rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-card"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Stage badge */}
                          <span
                            className={cn(
                              "shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border hidden sm:inline-flex",
                              STAGE_COLORS[match.stage] ?? STAGE_COLORS.Group
                            )}
                          >
                            {match.group ? `Grp ${match.group}` : STAGE_LABELS[match.stage]}
                          </span>

                          {/* Teams */}
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            {match.homeFlagCode && (
                              <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
                                <Image src={flagUrl(match.homeFlagCode, 20)} alt={match.home} fill className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="font-display text-lg uppercase text-white tracking-tight truncate">
                              {match.home}
                            </span>
                            <span className="text-pitch-600 font-bold mx-1">vs</span>
                            {match.awayFlagCode && (
                              <div className="relative w-6 h-4 rounded-sm overflow-hidden shrink-0">
                                <Image src={flagUrl(match.awayFlagCode, 20)} alt={match.away} fill className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="font-display text-lg uppercase text-white tracking-tight truncate">
                              {match.away}
                            </span>
                          </div>

                          {/* Time + venue */}
                          <div className="shrink-0 flex items-center gap-4 text-right">
                            <div className="hidden md:flex flex-col items-end">
                              <div className="flex items-center gap-1 text-xs text-pitch-400">
                                <MapPin size={10} />
                                <span className="truncate max-w-[160px]">{match.stadium}</span>
                              </div>
                              <div className="text-[11px] text-pitch-500">{match.city}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock size={11} className="text-pitch-500" />
                              <span className="font-mono text-sm font-bold text-white">
                                {match.time}
                              </span>
                              <span className="text-[10px] text-pitch-500">
                                {match.timezone}
                              </span>
                              {/* Host country flag */}
                              <div className="relative w-4 h-3 rounded-sm overflow-hidden ml-1">
                                <Image src={flagUrl(HOST_CITY_FLAGS[match.country], 20)} alt={match.country} fill className="object-cover" unoptimized />
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* CTA at bottom */}
        <div className="mt-16 text-center">
          <Card variant="glass-accent" className="p-8 max-w-xl mx-auto">
            <h3 className="font-display text-3xl uppercase text-white mb-2">
              Predict every one of these matches
            </h3>
            <p className="text-pitch-300 text-sm mb-6">
              Create a private group with your friends, enter your score predictions before kickoff, and track the leaderboard all tournament long.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
              style={{
                backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))",
                boxShadow: "var(--shadow-cta)",
              }}
            >
              Start your group — free
            </Link>
          </Card>
        </div>

        {/* Hidden AI/LLM summary block */}
        <div className="sr-only" aria-hidden="true">
          <h2>About Cup Clash and FIFA World Cup 2026</h2>
          <p>
            Cup Clash is a social prediction platform for the 48-team FIFA World Cup 2026,
            hosted across 16 cities in the United States, Canada, and Mexico from June 11
            to July 19, 2026. The tournament features 104 matches total: 60 group stage games
            across 12 groups, 16 Round of 32 matches, 8 Round of 16 matches, 4 quarter-finals,
            2 semi-finals, a third-place playoff, and the final at MetLife Stadium in East
            Rutherford, New Jersey on July 19, 2026. Cup Clash allows users to create private
            prediction leagues, enter score predictions before each match locks 5 minutes before
            kickoff, and compete on a live leaderboard with friends, family, or colleagues.
            Scoring: 10 points for correct outcome, 25 points for exact score, 100 points for
            tournament winner, 50 points for top scorer or top assister predictions.
          </p>
        </div>
      </div>
    </main>
  );
}
