"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Clock, MapPin, RefreshCw, Activity, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FlagBadge } from "@/components/ui/FlagBadge";

// ── Types ────────────────────────────────────────────────────────────────────
// Mirrors what app/api/scores/route.ts actually writes to the `matches` table
// (match_events / live_stats) — not the raw API-Football fixture shape.

interface MatchEventEntry {
  minute: number;
  extra:  number | null;
  player: string | null;
  assist: string | null;
  team:   string | null;
  type:   string; // "goal" | "own_goal" | "penalty" | "missed_penalty" | "yellow_card" | "red_card" | "sub"
}

interface TeamLiveStats {
  possession:    number | null;
  shots_on_goal: number | null;
  shots_total:   number | null;
  corners:       number | null;
  fouls:         number | null;
  yellow_cards:  number | null;
  red_cards:     number | null;
  offsides:      number | null;
}

interface LiveStats { home: TeamLiveStats; away: TeamLiveStats }

interface MatchRow {
  home_score:     number | null;
  away_score:     number | null;
  home_score_et:  number | null;
  away_score_et:  number | null;
  penalty_winner: string | null;
  status:         string; // "upcoming" | "live" | "finished"
  minute:         number | null;
  match_events:   MatchEventEntry[] | null;
  live_stats:     LiveStats | null;
}

interface UserPrediction {
  homeScore:    number;
  awayScore:    number;
  pointsEarned: number | null;
  isExact:      boolean | null;
}

interface LiveMatchHubProps {
  matchId:      string;
  home:         string;
  away:         string;
  homeFlagCode?: string;
  awayFlagCode?: string;
  kickoffAt:    string;
  stage?:       string;
  group?:       string;
  stadium?:     string;
  city?:        string;
  groupId?:     string;
  onClose:      () => void;
}

const MATCH_SELECT = "home_score, away_score, home_score_et, away_score_et, penalty_winner, status, minute, match_events, live_stats";

// ── Helpers ──────────────────────────────────────────────────────────────────

function stageLabel(stage?: string, group?: string): string {
  if (stage === "Group" && group) return `Group ${group}`;
  const labels: Record<string, string> = {
    R32: "Round of 32", R16: "Round of 16", QF: "Quarter-final",
    SF: "Semi-final", "3rd": "3rd Place", Final: "Final",
  };
  return stage ? (labels[stage] ?? stage) : "";
}

function finishedLabel(m: MatchRow): string {
  if (m.penalty_winner) return "Pens";
  if (m.home_score_et != null) return "AET";
  return "FT";
}

function calcLivePoints(pred: UserPrediction, home: number, away: number, rules = { exact: 25, outcome: 10 }) {
  if (pred.homeScore === home && pred.awayScore === away) return { pts: rules.exact, label: "Exact" };
  const predW = pred.homeScore > pred.awayScore ? "H" : pred.homeScore < pred.awayScore ? "A" : "D";
  const realW = home > away ? "H" : home < away ? "A" : "D";
  if (predW === realW) return { pts: rules.outcome, label: "Correct outcome" };
  return { pts: 0, label: "No points" };
}

function formatKickoff(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
      + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

// ── Event icon ───────────────────────────────────────────────────────────────

function EventIcon({ type }: { type: string }) {
  if (type === "goal")      return <span className="text-base">⚽</span>;
  if (type === "penalty")   return <span className="text-base">⚽ <span style={{ fontSize: 9 }}>P</span></span>;
  if (type === "own_goal")  return <span className="text-base" style={{ color: "#f87171" }}>⚽ OG</span>;
  if (type === "missed_penalty") return <span className="text-base" style={{ color: "var(--mt)" }}>❌ <span style={{ fontSize: 9 }}>P</span></span>;
  if (type === "yellow_card") return <div style={{ width: 10, height: 14, borderRadius: 2, background: "#facc15" }} />;
  if (type === "red_card")    return <div style={{ width: 10, height: 14, borderRadius: 2, background: "#ef4444" }} />;
  if (type === "sub")         return <RefreshCw size={14} style={{ color: "var(--mt)" }} />;
  return <Activity size={14} style={{ color: "var(--mt)" }} />;
}

// ── Battle stat bar ───────────────────────────────────────────────────────────

function BattleBar({ label, home, away, isPercent = false }: {
  label: string; home: number | null; away: number | null; isPercent?: boolean;
}) {
  const h = home ?? 0;
  const a = away ?? 0;
  const total = h + a || 1;
  const homePct = Math.round((h / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold">
        <span style={{ color: "var(--tx)" }}>{home == null ? "–" : isPercent ? `${home}%` : home}</span>
        <span className="ta-section-label">{label}</span>
        <span style={{ color: "var(--tx)" }}>{away == null ? "–" : isPercent ? `${away}%` : away}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5" style={{ background: "var(--ip)" }}>
        <div style={{ width: `${homePct}%`, background: "var(--ac)", transition: "width 0.5s" }} />
        <div style={{ width: `${awayPct}%`, background: "var(--br)", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

const STAT_ROWS: Array<{ key: keyof TeamLiveStats; label: string; isPercent?: boolean }> = [
  { key: "possession",    label: "Possession",       isPercent: true },
  { key: "shots_on_goal", label: "Shots on Target" },
  { key: "shots_total",   label: "Total Shots" },
  { key: "corners",       label: "Corners" },
  { key: "fouls",         label: "Fouls" },
  { key: "yellow_cards",  label: "Yellow Cards" },
  { key: "red_cards",     label: "Red Cards" },
  { key: "offsides",      label: "Offsides" },
];

// ── Main Component ────────────────────────────────────────────────────────────

export function LiveMatchHub({
  matchId, home, away, homeFlagCode, awayFlagCode, kickoffAt,
  stage, group, stadium, city, groupId, onClose,
}: LiveMatchHubProps) {
  const [data,    setData]    = useState<MatchRow | null>(null);
  const [pred,    setPred]    = useState<UserPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview" | "live" | "stats" | "lineups">("overview");
  const prevScore = useRef<{ h: number; a: number } | null>(null);

  // Lock background scroll + close on Escape while the overlay is mounted.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Load match row + the user's real saved prediction for this match.
  useEffect(() => {
    let cancelled = false;
    const sb = createClient();

    (async () => {
      const { data: row } = await sb.from("matches").select(MATCH_SELECT).eq("id", matchId).maybeSingle();
      if (!cancelled && row) {
        prevScore.current = { h: row.home_score ?? 0, a: row.away_score ?? 0 };
        setData(row as MatchRow);
      }

      if (groupId) {
        const { data: { user } } = await sb.auth.getUser();
        if (!cancelled && user) {
          const { data: predRow } = await sb
            .from("group_predictions")
            .select("home_score, away_score, points_earned, is_exact")
            .eq("user_id", user.id)
            .eq("group_id", groupId)
            .eq("match_id", matchId)
            .maybeSingle();
          if (!cancelled && predRow) {
            setPred({
              homeScore: predRow.home_score, awayScore: predRow.away_score,
              pointsEarned: predRow.points_earned, isExact: predRow.is_exact,
            });
          }
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [matchId, groupId]);

  // Realtime — reflects cron writes to matches without polling.
  useEffect(() => {
    const sb = createClient();
    const channel = sb.channel(`match-center:${matchId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}`,
      }, (payload) => {
        const updated = payload.new as MatchRow;
        prevScore.current = { h: updated.home_score ?? 0, a: updated.away_score ?? 0 };
        setData(updated);
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [matchId]);

  const status      = data?.status ?? "upcoming";
  const live        = status === "live";
  const finished    = status === "finished";
  const minute      = data?.minute;
  const homeScore   = data?.home_score ?? 0;
  const awayScore   = data?.away_score ?? 0;
  const events      = data?.match_events ?? [];
  const liveStats   = data?.live_stats ?? null;

  const livePoints = pred && (live || finished) ? calcLivePoints(pred, homeScore, awayScore) : null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "var(--bg)" }}>
      {/* ── Close bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: "var(--nv)", borderBottom: "1px solid var(--br)" }}>
        <span className="ta-section-label">Match Center</span>
        <button onClick={onClose} aria-label="Close match center"
          className="flex items-center justify-center rounded-full"
          style={{ width: 30, height: 30, background: "var(--ip)", border: "1px solid var(--br)" }}>
          <X size={16} style={{ color: "var(--tx)" }} />
        </button>
      </div>

      <div className="ta-stadium-bg flex-1 overflow-y-auto">
        {/* ── Scoreboard header ──────────────────────────────────────────── */}
        <div className="relative px-5 py-6">
          <div className="relative flex items-center justify-center mb-5">
            {live ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75" style={{ backgroundColor: "#ef4444" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                </span>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#ef4444" }}>
                  LIVE {minute != null ? `${minute}'` : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "var(--ip)", border: "1px solid var(--br)" }}>
                <Clock size={11} style={{ color: "var(--mt)" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--mt)" }}>
                  {finished ? finishedLabel(data as MatchRow) : "Upcoming"}
                </span>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <FlagBadge code={homeFlagCode} size="lg" />
              <span className="ta-team-name text-center" style={{ color: "var(--tx)" }}>{home}</span>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="ta-score" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>{homeScore}</div>
                <span className="font-black" style={{ fontSize: "1.75rem", color: "var(--mt)" }}>–</span>
                <div className="ta-score" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>{awayScore}</div>
              </div>
              {data?.home_score_et != null && (
                <div className="ta-meta mt-1">AET</div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <FlagBadge code={awayFlagCode} size="lg" />
              <span className="ta-team-name text-center" style={{ color: "var(--tx)" }}>{away}</span>
            </div>
          </div>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────── */}
        <div className="flex" style={{ borderBottom: "1px solid var(--br)" }}>
          {(["overview", "live", "stats", "lineups"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="ta-subtab-label flex-1 py-3 text-center"
              style={tab === t
                ? { color: "var(--ac)", borderBottom: "2px solid var(--ac)" }
                : { color: "var(--mt)" }}>
              {t === "overview" ? "Overview" : t === "live" ? "Live" : t === "stats" ? "Stats" : "Lineups"}
            </button>
          ))}
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="p-4">
          {loading && (
            <div className="py-8 text-center text-sm" style={{ color: "var(--mt)" }}>Loading match data...</div>
          )}

          {/* Overview */}
          {!loading && tab === "overview" && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4 space-y-2.5" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
                <div className="ta-section-label">Match Info</div>
                {stageLabel(stage, group) && (
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--t2)" }}>Stage</span>
                    <span className="font-bold" style={{ color: "var(--tx)" }}>{stageLabel(stage, group)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--t2)" }}>Kickoff</span>
                  <span className="font-bold" style={{ color: "var(--tx)" }} suppressHydrationWarning>{formatKickoff(kickoffAt)}</span>
                </div>
                {(stadium || city) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1" style={{ color: "var(--t2)" }}><MapPin size={12} /> Venue</span>
                    <span className="font-bold text-right" style={{ color: "var(--tx)" }}>
                      {[stadium, city].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {pred ? (
                <div className="rounded-2xl p-4" style={{ background: "color-mix(in srgb, var(--ac) 8%, var(--sf))", border: "1px solid color-mix(in srgb, var(--ac) 25%, transparent)" }}>
                  <div className="flex items-center gap-1.5 ta-section-label mb-1.5" style={{ color: "var(--ac)" }}>
                    <Target size={11} /> Your Prediction
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg" style={{ color: "var(--tx)" }}>
                      {pred.homeScore}–{pred.awayScore}
                    </span>
                    {livePoints && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={livePoints.pts > 0
                          ? { color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 12%, transparent)" }
                          : { color: "var(--mt)", background: "var(--ip)" }}>
                        {livePoints.pts > 0 ? `+${livePoints.pts} pts · ${livePoints.label}` : livePoints.label}
                      </span>
                    )}
                  </div>
                </div>
              ) : groupId ? (
                <div className="text-center py-3 text-sm" style={{ color: "var(--mt)" }}>No prediction saved for this match</div>
              ) : null}
            </div>
          )}

          {/* Live — event timeline */}
          {!loading && tab === "live" && (
            <div className="space-y-1">
              {events.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: "var(--mt)" }}>
                  {status === "upcoming" ? "Match hasn't started yet" : "No events yet"}
                </div>
              ) : (
                [...events].reverse().map((event, i) => {
                  const isHome = event.team === home;
                  return (
                    <div key={i} className={`flex items-center gap-3 py-2 ${isHome ? "" : "flex-row-reverse"}`}>
                      <span className="font-mono font-bold text-xs w-10 shrink-0 text-center" style={{ color: "var(--ac)" }}>
                        {event.minute}{event.extra ? `+${event.extra}` : ""}&apos;
                      </span>
                      <div className="shrink-0"><EventIcon type={event.type} /></div>
                      <div className={`flex-1 ${isHome ? "" : "text-right"}`}>
                        <div className="text-xs font-bold" style={{ color: "var(--tx)" }}>{event.player ?? "Unknown"}</div>
                        {event.type === "sub" && event.assist && (
                          <div className="text-[10px]" style={{ color: "var(--mt)" }}>
                            {isHome ? `↑ ${event.assist}` : `${event.assist} ↑`}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0"><FlagBadge code={isHome ? homeFlagCode : awayFlagCode} size="sm" /></div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Stats */}
          {!loading && tab === "stats" && (
            <div className="space-y-4">
              {!liveStats ? (
                <div className="py-8 text-center text-sm" style={{ color: "var(--mt)" }}>
                  Stats not available for this match
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FlagBadge code={homeFlagCode} size="sm" />
                      <span className="text-xs font-black uppercase" style={{ color: "var(--tx)" }}>{home}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <FlagBadge code={awayFlagCode} size="sm" />
                      <span className="text-xs font-black uppercase" style={{ color: "var(--tx)" }}>{away}</span>
                    </div>
                  </div>
                  {STAT_ROWS.map(row => {
                    const h = liveStats.home[row.key];
                    const a = liveStats.away[row.key];
                    if (h == null && a == null) return null;
                    return <BattleBar key={row.label} label={row.label} home={h} away={a} isPercent={row.isPercent} />;
                  })}
                </>
              )}
            </div>
          )}

          {/* Lineups — no fetch pipeline exists yet; honest empty state */}
          {!loading && tab === "lineups" && (
            <div className="py-8 text-center text-sm" style={{ color: "var(--mt)" }}>
              Lineups not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
