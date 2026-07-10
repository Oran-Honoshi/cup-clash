"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Check, X, Minus, Lock, Filter, ChevronDown } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { BallLoader } from "@/components/ui/BallLoader";
import type { ScheduleMatch } from "@/lib/schedule";
import type { MemberPredictionsResponse, MemberPrediction, UpcomingPrediction } from "@/app/api/member-predictions/route";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupInfo {
  id:   string;
  name: string;
}

interface Props {
  userId:  string;
  groups:  GroupInfo[];
  matches: ScheduleMatch[];
}

type FilterStage = "all" | "finished" | "upcoming";

type CellKind = "exact" | "correct" | "wrong" | "pending" | "none";
interface CellInfo {
  predicted: string | null;
  pts:       number;
  kind:      CellKind;
}

type GroupLookup = {
  finished: Record<string, MemberPrediction>;
  upcoming: Record<string, UpcomingPrediction>;
};

// ── Stage ordering — WC's Group/R32/R16/QF/SF/Final vocabulary, plus the
// namespaced "UCL R16" etc. rounds so a future UCL-based group's picks sort
// and section correctly too. Anything unrecognized still sorts (at the end,
// under Knockout) instead of breaking. ────────────────────────────────────────

const STAGE_ORDER: Record<string, number> = {
  Group: 0, R32: 1, R16: 2, QF: 3, SF: 4, "3rd": 5, Final: 6,
  "UCL R16": 7, "UCL QF": 8, "UCL SF": 9, "UCL Final": 10,
};
const STAGE_LABELS: Record<string, string> = {
  Group: "Group Stage", R32: "Round of 32", R16: "Round of 16", QF: "Quarter-Finals",
  SF: "Semi-Finals", "3rd": "Third Place", Final: "Final",
  "UCL R16": "UCL · Round of 16", "UCL QF": "UCL · Quarter-Finals",
  "UCL SF": "UCL · Semi-Finals", "UCL Final": "UCL · Final",
};

function stageRank(stage: string)  { return STAGE_ORDER[stage] ?? 99; }
function stageLabel(stage: string) { return STAGE_LABELS[stage] ?? stage; }
function stageSection(stage: string) { return stage === "Group" ? "Group Stage" : "Knockout"; }

function isMatchFinished(m: ScheduleMatch) { return m.status === "finished"; }
function isMatchLocked(m: ScheduleMatch) {
  if (isMatchFinished(m)) return false;
  return Date.now() >= new Date(m.kickoff_at).getTime() - 5 * 60 * 1000;
}

function cellFor(lookup: GroupLookup | undefined, matchId: string, finished: boolean): CellInfo {
  if (!lookup) return { predicted: null, pts: 0, kind: "none" };
  if (finished) {
    const h = lookup.finished[matchId];
    if (!h) return { predicted: null, pts: 0, kind: "none" };
    return { predicted: h.predicted, pts: h.pts, kind: h.type };
  }
  const u = lookup.upcoming[matchId];
  if (!u || u.predicted == null) return { predicted: null, pts: 0, kind: "none" };
  return { predicted: u.predicted, pts: 0, kind: "pending" };
}

// Renders local date · time entirely on the client to avoid SSR timezone mismatch.
function MatchDateTime({ utcTime, timeConfirmed }: { utcTime: string; timeConfirmed?: boolean }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (timeConfirmed === false) { setLabel("Date TBD"); return; }
    const d = new Date(utcTime);
    setLabel(`${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`);
  }, [utcTime, timeConfirmed]);
  return <span suppressHydrationWarning>{label}</span>;
}

function ComparisonCell({ cell }: { cell: CellInfo }) {
  if (cell.kind === "exact") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Trophy size={14} style={{ color: "var(--sc)" }} />
        <span className="text-[10px] font-black" style={{ color: "var(--sc)" }}>+{cell.pts}</span>
      </div>
    );
  }
  if (cell.kind === "correct") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Check size={14} style={{ color: "var(--ac)" }} />
        {cell.pts > 0 && <span className="text-[10px] font-black" style={{ color: "var(--ac)" }}>+{cell.pts}</span>}
      </div>
    );
  }
  if (cell.kind === "wrong") {
    return <X size={14} style={{ color: "#f87171" }} />;
  }
  if (cell.kind === "pending") {
    return <span className="text-xs font-mono font-bold" style={{ color: "var(--t2)" }}>{cell.predicted}</span>;
  }
  return <Minus size={13} style={{ color: "var(--ft)" }} />;
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
      style={active
        ? { background: "color-mix(in srgb, var(--ac) 18%, transparent)", color: "var(--ac)", border: "1px solid color-mix(in srgb, var(--ac) 40%, transparent)" }
        : { background: "var(--ip)", color: "var(--t2)", border: "1px solid var(--br)" }}
    >
      {children}
    </button>
  );
}

function LegendItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px]" style={{ color: "var(--t2)" }}>{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PredictionsSummaryClient({ userId, groups, matches }: Props) {
  const [responses, setResponses] = useState<Record<string, MemberPredictionsResponse | null>>({});
  const [loading,   setLoading]   = useState(true);

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() => groups.map(g => g.id));
  const [filterStage, setFilterStage] = useState<FilterStage>("all");
  const [onlyPredicted, setOnlyPredicted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Single source of truth for a member's per-group predictions — the same
  // API that powers the dashboard "My Stats" panel and the player drawer.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(groups.map(g =>
      fetch(`/api/member-predictions?userId=${encodeURIComponent(userId)}&groupId=${encodeURIComponent(g.id)}`)
        .then(r => r.json() as Promise<MemberPredictionsResponse>)
        .then(data => [g.id, data] as const)
        .catch(() => [g.id, null] as const)
    )).then(entries => {
      if (cancelled) return;
      setResponses(Object.fromEntries(entries));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId, groups]);

  const lookups = useMemo(() => {
    const out: Record<string, GroupLookup> = {};
    for (const g of groups) {
      const data = responses[g.id];
      const finished: Record<string, MemberPrediction> = {};
      const upcoming: Record<string, UpcomingPrediction> = {};
      data?.history.forEach(h => { finished[h.matchId] = h; });
      data?.upcoming.forEach(u => { upcoming[u.matchId] = u; });
      out[g.id] = { finished, upcoming };
    }
    return out;
  }, [groups, responses]);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const visibleGroups = groups.filter(g => selectedGroupIds.includes(g.id));

  const sortedMatches = useMemo(() => [...matches].sort((a, b) => {
    const d = stageRank(a.stage) - stageRank(b.stage);
    if (d !== 0) return d;
    return new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime();
  }), [matches]);

  const filteredMatches = useMemo(() => sortedMatches.filter(m => {
    const finished = isMatchFinished(m);
    if (filterStage === "finished" && !finished) return false;
    if (filterStage === "upcoming" && finished) return false;
    if (onlyPredicted) {
      const hasPred = visibleGroups.some(g => cellFor(lookups[g.id], m.id, finished).kind !== "none");
      if (!hasPred) return false;
    }
    return true;
  }), [sortedMatches, filterStage, onlyPredicted, visibleGroups, lookups]);

  type Row =
    | { type: "section"; label: string }
    | { type: "stage"; stage: string }
    | { type: "match"; match: ScheduleMatch };

  const rows = useMemo(() => {
    const result: Row[] = [];
    let lastSection = "";
    let lastStage   = "";
    for (const m of filteredMatches) {
      const section = stageSection(m.stage);
      if (section !== lastSection) {
        result.push({ type: "section", label: section });
        lastSection = section;
        lastStage = "";
      }
      if (m.stage !== lastStage) {
        result.push({ type: "stage", stage: m.stage });
        lastStage = m.stage;
      }
      result.push({ type: "match", match: m });
    }
    return result;
  }, [filteredMatches]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-full pt-4">

      {/* Page header */}
      <div className="pt-2 pb-1 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--ac)" }}>
            PREDICTIONS
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase font-black leading-none tracking-tight" style={{ color: "var(--tx)" }}>
            Summary
          </h1>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold mt-2 shrink-0"
          style={showFilters
            ? { background: "color-mix(in srgb, var(--ac) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 40%, transparent)", color: "var(--ac)" }
            : { background: "var(--sf)", border: "1px solid var(--br)", color: "var(--t2)" }}
        >
          <Filter size={13} />
          Filters
          <ChevronDown size={12} style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col gap-3 px-4 py-3 rounded-2xl cc-elevated" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--mt)" }}>Groups</div>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <FilterChip key={g.id} active={selectedGroupIds.includes(g.id)} onClick={() => toggleGroup(g.id)}>
                  {g.name}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--mt)" }}>Matches</div>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={filterStage === "all"}       onClick={() => setFilterStage("all")}>All</FilterChip>
              <FilterChip active={filterStage === "finished"}  onClick={() => setFilterStage("finished")}>Finished</FilterChip>
              <FilterChip active={filterStage === "upcoming"}  onClick={() => setFilterStage("upcoming")}>Upcoming</FilterChip>
            </div>
          </div>

          <button
            onClick={() => setOnlyPredicted(v => !v)}
            className="flex items-center gap-2 text-xs font-bold self-start"
            style={{ color: onlyPredicted ? "var(--ac)" : "var(--t2)" }}
          >
            <div
              className="w-8 h-4 rounded-full flex items-center transition-all"
              style={{
                background: onlyPredicted ? "color-mix(in srgb, var(--ac) 35%, transparent)" : "var(--ip)",
                padding: "2px",
                justifyContent: onlyPredicted ? "flex-end" : "flex-start",
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: onlyPredicted ? "var(--ac)" : "var(--mt)" }} />
            </div>
            Only show matches I&apos;ve predicted
          </button>
        </div>
      )}

      {/* Sticky comparison table */}
      <div className="relative rounded-2xl overflow-hidden cc-elevated" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <BallLoader size="md" label="Loading your predictions…" />
          </div>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: "calc(100dvh - 260px)" }}>
            <table style={{
              borderCollapse: "separate", borderSpacing: 0, width: "100%",
              minWidth: visibleGroups.length > 0 ? `${170 + visibleGroups.length * 110}px` : "100%",
            }}>
              <thead>
                <tr>
                  <th className="text-left" style={{
                    position: "sticky", top: 0, left: 0, zIndex: 4,
                    background: "var(--nv)", borderBottom: "1px solid var(--br)", borderRight: "1px solid var(--dv)",
                    padding: "10px 14px", minWidth: 170, maxWidth: 230,
                  }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--mt)" }}>Match</span>
                  </th>
                  {visibleGroups.map(g => (
                    <th key={g.id} style={{
                      position: "sticky", top: 0, zIndex: 3,
                      background: "var(--nv)", borderBottom: "1px solid var(--br)", borderRight: "1px solid var(--dv)",
                      padding: "10px 12px", minWidth: 110, textAlign: "center",
                    }}>
                      <span className="text-xs font-bold truncate max-w-[100px] block" style={{ color: "var(--tx)" }}>{g.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  if (row.type === "section") {
                    return (
                      <tr key={`section-${row.label}`}>
                        <td colSpan={visibleGroups.length + 1} style={{
                          position: "sticky", left: 0,
                          background: "color-mix(in srgb, var(--ac) 10%, var(--sf))",
                          borderTop: "1px solid var(--br)", borderBottom: "1px solid var(--br)",
                          padding: "9px 14px",
                        }}>
                          <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--ac)" }}>
                            {row.label}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                  if (row.type === "stage") {
                    return (
                      <tr key={`stage-${row.stage}`}>
                        <td colSpan={visibleGroups.length + 1} style={{
                          position: "sticky", left: 0,
                          background: "var(--sf)",
                          borderBottom: "1px solid var(--dv)",
                          padding: "6px 14px",
                        }}>
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--mt)" }}>
                            {stageLabel(row.stage)}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  const m = row.match;
                  const finished = isMatchFinished(m);
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid var(--dv)" }}>
                      <td style={{
                        position: "sticky", left: 0, zIndex: 2,
                        background: "var(--sf)", borderRight: "1px solid var(--dv)",
                        padding: "10px 14px", minWidth: 170, maxWidth: 230,
                      }}>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <FlagBadge code={m.homeFlagCode} size="sm" />
                              <span className="text-[11px] font-bold truncate" style={{ color: "var(--tx)" }}>{m.home}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FlagBadge code={m.awayFlagCode} size="sm" />
                              <span className="text-[11px] font-bold truncate" style={{ color: "var(--tx)" }}>{m.away}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px]" style={{ color: "var(--ft)" }}>
                              <MatchDateTime utcTime={m.kickoff_at} timeConfirmed={m.time_confirmed} />
                            </span>
                            {finished && m.home_score != null && m.away_score != null && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: "color-mix(in srgb, var(--ac) 12%, transparent)", color: "var(--ac)", border: "1px solid color-mix(in srgb, var(--ac) 30%, transparent)" }}>
                                {m.home_score}–{m.away_score}
                              </span>
                            )}
                            {!finished && isMatchLocked(m) && <Lock size={9} style={{ color: "var(--mt)" }} />}
                          </div>
                        </div>
                      </td>
                      {visibleGroups.map(g => (
                        <td key={g.id} style={{ textAlign: "center", padding: "8px 8px", verticalAlign: "middle", borderRight: "1px solid var(--dv)" }}>
                          <ComparisonCell cell={cellFor(lookups[g.id], m.id, finished)} />
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={visibleGroups.length + 1} style={{ textAlign: "center", padding: "40px 20px" }}>
                      <span className="text-sm" style={{ color: "var(--mt)" }}>No matches found for the selected filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-2 flex-wrap">
        <LegendItem icon={<Trophy size={12} style={{ color: "var(--sc)" }} />} label="Exact score" />
        <LegendItem icon={<Check size={12} style={{ color: "var(--ac)" }} />} label="Correct outcome" />
        <LegendItem icon={<X size={12} style={{ color: "#f87171" }} />} label="Wrong" />
        <LegendItem icon={<Minus size={12} style={{ color: "var(--ft)" }} />} label="No prediction" />
      </div>
    </div>
  );
}
