"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  Trophy, Check, X, Minus, Lock, Filter,
  ChevronDown, LayoutGrid, Star,
} from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import type { SummaryMatch } from "@/app/(app)/predictions/summary/page";
import { saveGroupPrediction } from "@/lib/services/predictions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupInfo {
  id: string;
  name: string;
  memberCount: number;
  totalPoints: number;
}

interface PredData {
  homeScore: number;
  awayScore: number;
  pointsEarned: number;
  isExact: boolean;
  lockedAt: string | null;
}

interface Props {
  userId: string;
  groups: GroupInfo[];
  matches: SummaryMatch[];
  initialPredictions: Record<string, Record<string, PredData>>;
  initialTournamentPicks: Record<string, Record<string, { value: string; points: number }>>;
}

type FilterStage = "all" | "finished" | "upcoming";

const STAGE_ORDER: Record<string, number> = {
  Group: 0, R32: 1, R16: 2, QF: 3, SF: 4, "3rd": 5, Final: 6,
};

const STAGE_LABELS: Record<string, string> = {
  Group: "GROUP STAGE",
  R32:   "ROUND OF 32",
  R16:   "ROUND OF 16",
  QF:    "QUARTER-FINALS",
  SF:    "SEMI-FINALS",
  "3rd": "THIRD PLACE",
  Final: "FINAL",
};

const TOURN_PICK_LABELS: Record<string, string> = {
  winner:      "Tournament Winner",
  top_scorer:  "Top Scorer",
  top_assister:"Top Assister",
  golden_ball: "Golden Ball",
  best_third:  "Best 3rd Place",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isMatchFinished(m: SummaryMatch) {
  return m.matchStatus === "finished";
}

function isMatchLocked(m: SummaryMatch) {
  if (isMatchFinished(m)) return false;
  const kickoff = new Date(m.utcTime).getTime();
  return Date.now() >= kickoff - 5 * 60 * 1000;
}

function fmtScore(h: number, a: number) { return `${h}–${a}`; }

function fmtDate(m: SummaryMatch) {
  return new Date(m.utcTime).toLocaleDateString(undefined, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    day: "numeric",
    month: "short",
  });
}

function fmtTime(m: SummaryMatch) {
  return new Date(m.utcTime).toLocaleTimeString(undefined, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

// ── Result badge ──────────────────────────────────────────────────────────────

function ResultBadge({ pred, match }: { pred: PredData | undefined; match: SummaryMatch }) {
  // Only show result badges for truly finished matches
  if (!isMatchFinished(match)) return null;
  // No prediction → gray dash
  if (!pred) {
    return <Minus size={13} style={{ color: "rgba(255,255,255,0.25)" }} />;
  }
  // Exact score (trust DB flag OR verify against actual scores)
  if (pred.isExact) {
    return <Trophy size={13} style={{ color: "#FBBF24" }} />;
  }
  // Compute outcome from actual scores (don't rely solely on pointsEarned=0,
  // which can be zero for recently-finished matches that haven't been scored yet)
  const actualH = match.homeScore;
  const actualA = match.awayScore;
  if (actualH != null && actualA != null) {
    const predW   = pred.homeScore > pred.awayScore ? "H" : pred.homeScore < pred.awayScore ? "A" : "D";
    const actualW = actualH > actualA ? "H" : actualH < actualA ? "A" : "D";
    if (pred.homeScore === actualH && pred.awayScore === actualA) {
      return <Trophy size={13} style={{ color: "#FBBF24" }} />;
    }
    if (predW === actualW) {
      return <Check size={13} style={{ color: "#00FF88" }} />;
    }
    return <X size={13} style={{ color: "#f87171" }} />;
  }
  // Fallback: use stored points if actual scores somehow unavailable
  if (pred.pointsEarned > 0) {
    return <Check size={13} style={{ color: "#00FF88" }} />;
  }
  return <X size={13} style={{ color: "#f87171" }} />;
}

// ── Editable score cell ───────────────────────────────────────────────────────

function ScoreCell({
  matchId, groupId, userId, pred, match, onSaved,
}: {
  matchId: string;
  groupId: string;
  userId: string;
  pred: PredData | undefined;
  match: SummaryMatch;
  onSaved: (groupId: string, matchId: string, home: number, away: number) => void;
}) {
  const finished = isMatchFinished(match);
  const locked   = isMatchLocked(match);

  const [home, setHome] = useState(pred?.homeScore != null ? String(pred.homeScore) : "");
  const [away, setAway] = useState(pred?.awayScore != null ? String(pred.awayScore) : "");
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAutoSave = useCallback((h: string, a: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const hNum = parseInt(h, 10);
    const aNum = parseInt(a, 10);
    if (isNaN(hNum) || isNaN(aNum)) return;
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      const res = await saveGroupPrediction({ userId, groupId, matchId, homeScore: hNum, awayScore: aNum });
      setSaving(false);
      if (res.success) onSaved(groupId, matchId, hNum, aNum);
    }, 800);
  }, [userId, groupId, matchId, onSaved]);

  // Finished match
  if (finished) {
    return (
      <div className="flex flex-col items-center gap-1">
        {pred ? (
          <>
            <span className="text-xs font-mono font-bold text-white">
              {fmtScore(pred.homeScore, pred.awayScore)}
            </span>
            <div className="flex items-center gap-1">
              <ResultBadge pred={pred} match={match} />
              {pred.pointsEarned > 0 && (
                <span className="text-[10px] font-bold" style={{ color: pred.isExact ? "#FBBF24" : "#00FF88" }}>
                  +{pred.pointsEarned}
                </span>
              )}
            </div>
          </>
        ) : (
          <Minus size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
        )}
      </div>
    );
  }

  // Locked upcoming
  if (locked) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Lock size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
        {pred ? (
          <span className="text-xs font-mono font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
            {fmtScore(pred.homeScore, pred.awayScore)}
          </span>
        ) : (
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>–</span>
        )}
      </div>
    );
  }

  // Editable upcoming
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1">
        <ScoreInputCC
          value={home}
          onChange={v => { setHome(v); scheduleAutoSave(v, away); }}
          size={32}
        />
        <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>–</span>
        <ScoreInputCC
          value={away}
          onChange={v => { setAway(v); scheduleAutoSave(home, v); }}
          size={32}
        />
      </div>
      {saving && (
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>saving…</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PredictionsSummaryClient({
  userId, groups, matches, initialPredictions, initialTournamentPicks,
}: Props) {
  const [predictions, setPredictions] = useState(initialPredictions);
  const [filterGroup, setFilterGroup] = useState<string | "all">("all");
  const [filterStage, setFilterStage] = useState<FilterStage>("all");
  const [filterOnlyPredicted, setFilterOnlyPredicted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const visibleGroups = filterGroup === "all" ? groups : groups.filter(g => g.id === filterGroup);

  const handleSaved = useCallback((groupId: string, matchId: string, home: number, away: number) => {
    setPredictions(prev => ({
      ...prev,
      [groupId]: {
        ...(prev[groupId] ?? {}),
        [matchId]: {
          ...(prev[groupId]?.[matchId] ?? { pointsEarned: 0, isExact: false, lockedAt: null }),
          homeScore: home,
          awayScore: away,
        },
      },
    }));
  }, []);

  // Build ordered match rows with stage separators
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const stageDiff = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
      if (stageDiff !== 0) return stageDiff;
      return new Date(a.utcTime).getTime() - new Date(b.utcTime).getTime();
    });
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return sortedMatches.filter(m => {
      if (filterStage === "finished" && !isMatchFinished(m)) return false;
      if (filterStage === "upcoming" && isMatchFinished(m)) return false;
      if (filterOnlyPredicted) {
        const hasPred = visibleGroups.some(g => predictions[g.id]?.[m.id] != null);
        if (!hasPred) return false;
      }
      return true;
    });
  }, [sortedMatches, filterStage, filterOnlyPredicted, visibleGroups, predictions]);

  // Build rows with stage separators inserted
  const rows = useMemo(() => {
    type Row =
      | { type: "stage"; stage: string }
      | { type: "match"; match: SummaryMatch };

    const result: Row[] = [];
    let lastStage = "";
    for (const m of filteredMatches) {
      if (m.stage !== lastStage) {
        result.push({ type: "stage", stage: m.stage });
        lastStage = m.stage;
      }
      result.push({ type: "match", match: m });
    }
    return result;
  }, [filteredMatches]);

  const glass = {
    background: "rgba(18,14,38,0.32)",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.14)",
  } as const;

  return (
    <div className="flex flex-col gap-4 w-full max-w-full">

      {/* Page header */}
      <div className="pt-2 pb-1 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>
            PREDICTIONS
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase font-black text-white leading-none tracking-tight">
            My Summary
          </h1>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold mt-2 shrink-0"
          style={showFilters
            ? { background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.35)", color: "#00D4FF" }
            : { ...glass, borderRadius: 12, color: "rgba(255,255,255,0.55)" }}
        >
          <Filter size={13} />
          Filters
          <ChevronDown size={12} style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col gap-3 px-4 py-3 rounded-2xl" style={glass}>
          {/* Group filter */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              Group
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={filterGroup === "all"} onClick={() => setFilterGroup("all")}>
                All Groups
              </FilterChip>
              {groups.map(g => (
                <FilterChip key={g.id} active={filterGroup === g.id} onClick={() => setFilterGroup(g.id)}>
                  {g.name}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Stage filter */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              Matches
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={filterStage === "all"} onClick={() => setFilterStage("all")}>All</FilterChip>
              <FilterChip active={filterStage === "finished"} onClick={() => setFilterStage("finished")}>Finished</FilterChip>
              <FilterChip active={filterStage === "upcoming"} onClick={() => setFilterStage("upcoming")}>Upcoming</FilterChip>
            </div>
          </div>

          {/* Only predicted toggle */}
          <button
            onClick={() => setFilterOnlyPredicted(v => !v)}
            className="flex items-center gap-2 text-xs font-bold self-start"
            style={{ color: filterOnlyPredicted ? "#00D4FF" : "rgba(255,255,255,0.45)" }}
          >
            <div
              className="w-8 h-4 rounded-full flex items-center transition-all"
              style={{
                background: filterOnlyPredicted ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.1)",
                padding: "2px",
                justifyContent: filterOnlyPredicted ? "flex-end" : "flex-start",
              }}
            >
              <div className="w-3 h-3 rounded-full"
                style={{ background: filterOnlyPredicted ? "#00D4FF" : "rgba(255,255,255,0.4)" }} />
            </div>
            Only show matches I&apos;ve predicted
          </button>
        </div>
      )}

      {/* Sticky grid */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ ...glass, borderRadius: 18 }}
      >
        <div
          className="overflow-auto"
          style={{ maxHeight: "calc(100dvh - 260px)" }}
        >
          <table
            style={{
              borderCollapse: "separate",
              borderSpacing: 0,
              width: "100%",
              minWidth: visibleGroups.length > 0 ? `${160 + visibleGroups.length * 120}px` : "100%",
            }}
          >
            {/* Sticky header */}
            <thead>
              <tr>
                {/* Match column header */}
                <th
                  className="text-left"
                  style={{
                    position: "sticky",
                    top: 0,
                    left: 0,
                    zIndex: 4,
                    background: "rgba(10,6,28,0.97)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    borderRight: "1px solid rgba(255,255,255,0.07)",
                    padding: "10px 14px",
                    minWidth: 160,
                    maxWidth: 220,
                  }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.35)" }}>
                    Match
                  </span>
                </th>
                {/* Group columns */}
                {visibleGroups.map(g => (
                  <th
                    key={g.id}
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 3,
                      background: "rgba(10,6,28,0.97)",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      borderRight: "1px solid rgba(255,255,255,0.04)",
                      padding: "10px 12px",
                      minWidth: 120,
                      textAlign: "center",
                    }}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold text-white truncate max-w-[100px]">{g.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {g.memberCount} members
                        </span>
                        {g.totalPoints > 0 && (
                          <span className="text-[10px] font-bold" style={{ color: "#00FF88" }}>
                            {g.totalPoints}pts
                          </span>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, idx) => {
                if (row.type === "stage") {
                  return (
                    <tr key={`stage-${row.stage}`}>
                      <td
                        colSpan={visibleGroups.length + 1}
                        style={{
                          position: "sticky",
                          left: 0,
                          background: "rgba(0,212,255,0.06)",
                          borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.07)" : undefined,
                          borderBottom: "1px solid rgba(255,255,255,0.07)",
                          padding: "8px 14px",
                        }}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest"
                          style={{ color: "#00D4FF" }}>
                          {STAGE_LABELS[row.stage] ?? row.stage}
                        </span>
                      </td>
                    </tr>
                  );
                }

                const m = row.match;
                const finished = isMatchFinished(m);
                return (
                  <tr
                    key={m.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {/* Left sticky column — match info */}
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        background: "rgba(10,6,28,0.95)",
                        borderRight: "1px solid rgba(255,255,255,0.07)",
                        padding: "10px 14px",
                        minWidth: 160,
                        maxWidth: 220,
                      }}
                    >
                      <div className="flex flex-col gap-1.5">
                        {/* Teams */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Flag code={m.homeFlagCode} size="xs" />
                            <span className="text-[11px] font-bold text-white truncate">{m.home}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Flag code={m.awayFlagCode} size="xs" />
                            <span className="text-[11px] font-bold text-white truncate">{m.away}</span>
                          </div>
                        </div>
                        {/* Date / time / result */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {fmtDate(m)} · {fmtTime(m)}
                          </span>
                          {finished && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>
                              {fmtScore(m.homeScore!, m.awayScore!)}
                            </span>
                          )}
                          {!finished && isMatchLocked(m) && (
                            <Lock size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Group prediction cells */}
                    {visibleGroups.map(g => {
                      const pred = predictions[g.id]?.[m.id];
                      return (
                        <td
                          key={g.id}
                          style={{
                            textAlign: "center",
                            padding: "8px 8px",
                            verticalAlign: "middle",
                            borderRight: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <ScoreCell
                            matchId={m.id}
                            groupId={g.id}
                            userId={userId}
                            pred={pred}
                            match={m}
                            onSaved={handleSaved}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleGroups.length + 1}
                    style={{ textAlign: "center", padding: "40px 20px" }}
                  >
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                      No matches found for the selected filters.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-2 flex-wrap">
        <LegendItem icon={<Trophy size={12} style={{ color: "#FBBF24" }} />} label="Exact score" />
        <LegendItem icon={<Check size={12} style={{ color: "#00FF88" }} />} label="Correct outcome" />
        <LegendItem icon={<X size={12} style={{ color: "#f87171" }} />} label="Missed" />
        <LegendItem icon={<Minus size={12} style={{ color: "rgba(255,255,255,0.25)" }} />} label="No prediction" />
      </div>

      {/* Tournament Picks Section */}
      {visibleGroups.some(g => initialTournamentPicks[g.id]) && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} style={{ color: "#FBBF24" }} />
            <span className="font-display text-sm font-black uppercase tracking-wide text-white">
              Tournament Picks
            </span>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {visibleGroups.map(g => {
              const picks = initialTournamentPicks[g.id];
              if (!picks || Object.keys(picks).length === 0) return null;
              return (
                <div key={g.id} className="rounded-2xl p-4" style={glass}>
                  <div className="text-xs font-bold text-white mb-3 truncate">{g.name}</div>
                  <div className="flex flex-col gap-2">
                    {Object.entries(TOURN_PICK_LABELS).map(([key, label]) => {
                      const pick = picks[key];
                      if (!pick) return null;
                      return (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wide"
                            style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[120px]">{pick.value}</span>
                            {pick.points > 0 && (
                              <span className="text-[10px] font-bold" style={{ color: "#FBBF24" }}>
                                +{pick.points}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Points summary */}
      {visibleGroups.length > 1 && (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {visibleGroups.map(g => (
            <div key={g.id} className="rounded-2xl px-4 py-3 flex items-center justify-between" style={glass}>
              <div>
                <div className="text-xs font-bold text-white truncate">{g.name}</div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {g.memberCount} members
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black" style={{ color: "#00FF88" }}>{g.totalPoints}</div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────────────────

function FilterChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
      style={active
        ? { background: "rgba(0,212,255,0.2)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.4)" }
        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {children}
    </button>
  );
}

function LegendItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
    </div>
  );
}
