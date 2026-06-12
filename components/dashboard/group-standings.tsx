"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { flagUrl } from "@/lib/countries";
import { NeonBar } from "@/components/ui/neon-bar";
import { FOCUS_RING } from "@/lib/a11y";

function createSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// All 12 groups with real teams from the official FIFA draw
const GROUPS: Record<string, string[]> = {
  A: ["Mexico",       "South Africa",         "Korea Republic", "Czechia"            ],
  B: ["Canada",       "Bosnia & Herzegovina", "Qatar",          "Switzerland"        ],
  C: ["Brazil",       "Morocco",              "Haiti",          "Scotland"           ],
  D: ["USA",          "Paraguay",             "Australia",      "Türkiye"            ],
  E: ["Germany",      "Curaçao",              "Côte d'Ivoire",  "Ecuador"            ],
  F: ["Netherlands",  "Japan",                "Sweden",         "Tunisia"            ],
  G: ["Belgium",      "Egypt",                "IR Iran",        "New Zealand"        ],
  H: ["Spain",        "Cabo Verde",           "Saudi Arabia",   "Uruguay"            ],
  I: ["France",       "Senegal",              "Iraq",           "Norway"             ],
  J: ["Argentina",    "Algeria",              "Austria",        "Jordan"             ],
  K: ["Portugal",     "Congo DR",             "Uzbekistan",     "Colombia"           ],
  L: ["England",      "Croatia",              "Ghana",          "Panama"             ],
};

const FLAG_CODES: Record<string, string> = {
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
};

interface TeamRow {
  team:    string;
  played:  number;
  won:     number;
  drawn:   number;
  lost:    number;
  gf:      number;
  ga:      number;
  gd:      number;
  points:  number;
}

function buildStandings(group: string, results: Array<{ home: string; away: string; homeScore: number; awayScore: number }>) {
  const teams = GROUPS[group] ?? [];
  const rows: Record<string, TeamRow> = {};
  teams.forEach(t => { rows[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }; });

  results.forEach(({ home, away, homeScore, awayScore }) => {
    if (!rows[home] || !rows[away]) return;
    rows[home].played++; rows[away].played++;
    rows[home].gf += homeScore; rows[home].ga += awayScore;
    rows[away].gf += awayScore; rows[away].ga += homeScore;
    if (homeScore > awayScore) { rows[home].won++; rows[home].points += 3; rows[away].lost++; }
    else if (awayScore > homeScore) { rows[away].won++; rows[away].points += 3; rows[home].lost++; }
    else { rows[home].drawn++; rows[away].drawn++; rows[home].points++; rows[away].points++; }
    rows[home].gd = rows[home].gf - rows[home].ga;
    rows[away].gd = rows[away].gf - rows[away].ga;
  });

  return Object.values(rows).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

type MatchResult = {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  homeFlagCode?: string | null;
  awayFlagCode?: string | null;
  kickoffAt?: string;
};

function GroupTable({ group, results }: { group: string; results: MatchResult[] }) {
  const standings = buildStandings(group, results);
  const played = [...results].sort((a, b) =>
    new Date(b.kickoffAt ?? 0).getTime() - new Date(a.kickoffAt ?? 0).getTime()
  );

  return (
    <div
      style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 22,
        overflow: "hidden",
      }}>
      <NeonBar />

      {/* Group header */}
      <div className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
        <span className="font-display text-lg font-black uppercase" style={{ color: "white" }}>
          Group {group}
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,212,255,0.08)", color: "#00D4FF" }}>
          Starts Jun {group === "A" ? "11" : "12–17"}
        </span>
      </div>

      {/* Table header */}
      <div className="grid text-[10px] font-bold uppercase tracking-widest px-4 py-2"
        style={{ gridTemplateColumns: "1fr 28px 28px 28px 28px 28px 36px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)" }}>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GD</span>
        <span className="text-center">Pts</span>
      </div>

      {/* Rows */}
      {standings.map((row, i) => (
        <div key={row.team}
          className="grid items-center px-4 py-2.5 border-t"
          style={{
            gridTemplateColumns: "1fr 28px 28px 28px 28px 28px 36px",
            borderColor: "rgba(255,255,255,0.05)",
            background: i < 2 ? "rgba(0,255,136,0.04)" : "transparent",
            borderLeft: i < 2
              ? "2px solid rgba(0,255,136,0.5)"
              : i === 2
              ? "2px solid rgba(251,191,36,0.35)"
              : "2px solid transparent",
          }}>
          {/* Team */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold w-4 shrink-0" style={{ color: i < 2 ? "#00FF88" : "rgba(255,255,255,0.3)" }}>
              {i + 1}
            </span>
            <div className="relative h-4 w-6 rounded-sm overflow-hidden shrink-0">
              <Image src={flagUrl(FLAG_CODES[row.team] ?? "un", 20)} alt={row.team}
                fill className="object-cover" unoptimized />
            </div>
            <span className="text-sm font-bold truncate" style={{ color: "white" }}>
              {row.team}
            </span>
          </div>
          {/* Stats: played */}
          <span className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>{row.played}</span>
          {/* Stats: won */}
          <span className="text-xs text-center" style={{ color: "#00FF88" }}>{row.won}</span>
          {/* Stats: drawn */}
          <span className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>{row.drawn}</span>
          {/* Stats: lost */}
          <span className="text-xs text-center" style={{ color: "#f87171" }}>{row.lost}</span>
          {/* GD */}
          <span className="text-xs text-center" style={{ color: row.gd > 0 ? "#00FF88" : row.gd < 0 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
            {row.gd > 0 ? `+${row.gd}` : row.gd}
          </span>
          {/* Points */}
          <span className="text-sm font-mono font-black text-center" style={{ color: "#00D4FF" }}>{row.points}</span>
        </div>
      ))}

      {/* Qualification note */}
      <div className="px-4 py-2 border-t flex items-center gap-3"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "transparent" }}>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "rgba(0,255,136,0.4)" }} />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Advance to Round of 32</span>
        </div>
      </div>

      {/* Played matches */}
      {played.length > 0 && (
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.02)" }}>
            Results
          </div>
          {played.map((r, i) => (
            <div key={i} className="px-4 py-2.5 border-t flex items-center gap-2"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {/* Home */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span className="text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{r.home}</span>
                {r.homeFlagCode && (
                  <div className="relative h-3.5 w-5 rounded-sm overflow-hidden shrink-0">
                    <Image src={flagUrl(r.homeFlagCode, 20)} alt={r.home} fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>
              {/* Score */}
              <div className="font-mono font-black text-sm shrink-0 px-2 tabular-nums" style={{ color: "white" }}>
                {r.homeScore}–{r.awayScore}
              </div>
              {/* Away */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {r.awayFlagCode && (
                  <div className="relative h-3.5 w-5 rounded-sm overflow-hidden shrink-0">
                    <Image src={flagUrl(r.awayFlagCode, 20)} alt={r.away} fill className="object-cover" unoptimized />
                  </div>
                )}
                <span className="text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{r.away}</span>
              </div>
              {/* Date */}
              {r.kickoffAt && (
                <span className="text-[10px] shrink-0 tabular-nums" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {new Date(r.kickoffAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupStandings({ groupId: _groupId }: { groupId?: string }) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult[]>>({});
  const [loaded, setLoaded] = useState(false);
  const groups = Object.keys(GROUPS);

  useEffect(() => {
    createSb()
      .from("matches")
      .select("home, away, home_score, away_score, home_flag, away_flag, kickoff_at, group_letter")
      .eq("stage", "Group")
      .eq("status", "finished")
      .then(({ data }) => {
        const byGroup: Record<string, MatchResult[]> = {};
        (data ?? []).forEach((m: {
          home: string; away: string;
          home_score: number; away_score: number;
          home_flag: string | null; away_flag: string | null;
          kickoff_at: string;
          group_letter: string | null;
        }) => {
          const g = m.group_letter;
          if (!g) return;
          if (!byGroup[g]) byGroup[g] = [];
          byGroup[g].push({
            home: m.home, away: m.away,
            homeScore: m.home_score, awayScore: m.away_score,
            homeFlagCode: m.home_flag, awayFlagCode: m.away_flag,
            kickoffAt: m.kickoff_at,
          });
        });
        setMatchResults(byGroup);
        setLoaded(true);
      });
  }, []);

  const hasResults = loaded && Object.keys(matchResults).length > 0;

  return (
    <div className="space-y-5">
      {!hasResults && loaded && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2.5"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <span className="text-sm">⏳</span>
          <p className="text-sm" style={{ color: "#fbbf24" }}>
            <strong>Tournament underway.</strong> Standings will update after each match finishes.
          </p>
        </div>
      )}

      {/* Group selector */}
      <div className="flex flex-wrap gap-2">
        {groups.map(g => (
          <button key={g} type="button" aria-label={`View Group ${g}`} aria-pressed={activeGroup === g} onClick={() => setActiveGroup(g)}
            className={`font-display font-black text-sm transition-all ${FOCUS_RING}`}
            style={activeGroup === g ? {
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(0,212,255,0.15)",
              border: "1px solid rgba(0,212,255,0.4)",
              color: "#00D4FF",
              boxShadow: "0 0 12px rgba(0,212,255,0.15)",
            } : {
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            }}>
            {g}
          </button>
        ))}
      </div>

      {/* Active group table */}
      <GroupTable group={activeGroup} results={matchResults[activeGroup] ?? []} />

      {/* All groups grid on larger screens */}
      <div className="hidden xl:grid grid-cols-3 gap-4 mt-6">
        {groups.map(g => <GroupTable key={g} group={g} results={matchResults[g] ?? []} />)}
      </div>
    </div>
  );
}
