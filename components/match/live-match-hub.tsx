"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Clock, MapPin, RefreshCw, Activity, Target, ChevronDown, Shirt, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { MvpVotePanel } from "@/components/match/mvp-vote-panel";
import { BallLoader } from "@/components/ui/BallLoader";
import { useLocale } from "@/components/i18n/locale-provider";
import type { Translations } from "@/lib/i18n";

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

// Mirrors app/api/match-center/*'s JSON shapes (see lib/services/match-center.ts).

interface PlayerSeasonStat {
  apiPlayerId:      number;
  name:             string;
  photo:            string | null;
  position:         string | null;
  appearances:      number | null;
  minutes:          number | null;
  goals:            number | null;
  assists:          number | null;
  yellowCards:      number | null;
  redCards:         number | null;
  shotsTotal:       number | null;
  keyPasses:        number | null;
  dribblesAttempts: number | null;
  tacklesTotal:     number | null;
}

interface FixtureTeamRef { id: number; name: string; logo: string | null }

interface H2HMatch {
  apiFixtureId: number;
  date:         string;
  competition:  string;
  stage:        string | null;
  venue:        string | null;
  city:         string | null;
  home:         FixtureTeamRef;
  away:         FixtureTeamRef;
  homeScore:    number | null;
  awayScore:    number | null;
  penalties:    boolean;
}

interface LineupPlayerRef { apiPlayerId: number; name: string; number: number | null; position: string | null }

interface TeamLineup {
  team:        FixtureTeamRef;
  formation:   string | null;
  startXI:     LineupPlayerRef[];
  substitutes: LineupPlayerRef[];
  coach:       { name: string; photo: string | null } | null;
}

type LineupsState = "early" | "loading" | "pending" | "available" | "error";

// Mirrors lib/services/match-center.ts's isInLineupsWindow — duplicated
// (rather than imported) so this client component never pulls in that
// server-only module (API_FOOTBALL_KEY access) into the browser bundle.
function isInLineupsWindow(kickoffAt: string, status: string): boolean {
  if (status === "live" || status === "finished") return true;
  return new Date(kickoffAt).getTime() - Date.now() <= 60 * 60 * 1000;
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
  initialTab?:  "overview" | "live" | "stats" | "lineups" | "mvp";
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

function formatH2HDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
}

// API-Football doesn't return per-90 rates directly — derived client-side
// from season totals. null when minutes are 0/unknown (division by zero).
function per90(total: number | null, minutes: number | null): string {
  if (total == null || !minutes) return "–";
  return (total / (minutes / 90)).toFixed(2);
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

// ── Player season stat row (expandable) ─────────────────────────────────────

function PlayerStatRow({ player, t }: { player: PlayerSeasonStat; t: (k: keyof Translations) => string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--ip)", border: "1px solid var(--br)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate" style={{ color: "var(--tx)" }}>{player.name}</div>
          <div className="ta-meta">{[player.position, `${player.appearances ?? 0} ${t("mc_stats_apps")}`, `${player.minutes ?? 0} ${t("mc_stats_minutes")}`].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <div className="text-xs font-black" style={{ color: "var(--ac)" }}>{player.goals ?? 0}</div>
            <div className="ta-meta">{t("mc_stats_goals")}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-black" style={{ color: "var(--tx)" }}>{player.assists ?? 0}</div>
            <div className="ta-meta">{t("mc_stats_assists")}</div>
          </div>
          <ChevronDown size={14} style={{ color: "var(--mt)", transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }} />
        </div>
      </button>

      {open && (
        <div className="grid grid-cols-3 gap-2 px-3 pb-3 pt-1" style={{ borderTop: "1px solid var(--br)" }}>
          {[
            { label: t("mc_stats_yellow"),     value: player.yellowCards ?? 0 },
            { label: t("mc_stats_red"),        value: player.redCards ?? 0 },
            { label: t("mc_stats_shots"),      value: player.shotsTotal ?? "–" },
            { label: t("mc_stats_key_passes"), value: player.keyPasses ?? "–" },
            { label: t("mc_stats_dribbles"),   value: player.dribblesAttempts ?? "–" },
            { label: t("mc_stats_tackles"),    value: player.tacklesTotal ?? "–" },
          ].map(row => (
            <div key={row.label} className="text-center rounded-lg py-1.5" style={{ background: "var(--sf)" }}>
              <div className="text-xs font-bold" style={{ color: "var(--tx)" }}>{row.value}</div>
              <div className="ta-meta">{row.label}</div>
            </div>
          ))}
          <div className="col-span-3 flex items-center justify-center gap-4 pt-1">
            <span className="ta-meta">{t("mc_stats_per90")} — {t("mc_stats_goals")} <b style={{ color: "var(--tx)" }}>{per90(player.goals, player.minutes)}</b></span>
            <span className="ta-meta">{t("mc_stats_assists")} <b style={{ color: "var(--tx)" }}>{per90(player.assists, player.minutes)}</b></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LiveMatchHub({
  matchId, home, away, homeFlagCode, awayFlagCode, kickoffAt,
  stage, group, stadium, city, groupId, onClose, initialTab,
}: LiveMatchHubProps) {
  const [data,    setData]    = useState<MatchRow | null>(null);
  const [pred,    setPred]    = useState<UserPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview" | "live" | "stats" | "lineups" | "mvp">(initialTab ?? "overview");
  const [mounted, setMounted] = useState(false);
  const { t } = useLocale();
  const prevScore = useRef<{ h: number; a: number } | null>(null);

  // ── Head-to-head (Overview tab) — fetched once, lazily, the first time
  // the tab is active (which for the default "overview" tab means as soon
  // as the modal opens, matching "fetch when the user opens this tab").
  const [h2h,        setH2h]        = useState<H2HMatch[] | null>(null);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [h2hError,   setH2hError]   = useState(false);
  const h2hFetched = useRef(false);

  // ── Player season stats (Stats tab) ─────────────────────────────────────
  const [playerStats,        setPlayerStats]        = useState<{ home: PlayerSeasonStat[]; away: PlayerSeasonStat[] } | null>(null);
  const [playerStatsLoading, setPlayerStatsLoading] = useState(false);
  const [playerStatsError,   setPlayerStatsError]   = useState(false);
  const statsFetched = useRef(false);

  // ── Lineups (Lineups tab) — state-aware: "early" needs no fetch at all.
  const [lineupsState, setLineupsState] = useState<LineupsState>("early");
  const [lineups,      setLineups]      = useState<TeamLineup[]>([]);
  const lineupsFetched = useRef(false);

  // Portal target only exists client-side.
  useEffect(() => { setMounted(true); }, []);

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

  // Head-to-head — on-demand, only when the Overview tab is actually shown.
  useEffect(() => {
    if (tab !== "overview" || h2hFetched.current) return;
    h2hFetched.current = true;
    setH2hLoading(true);
    fetch(`/api/match-center/head-to-head?matchId=${encodeURIComponent(matchId)}`)
      .then(res => { if (!res.ok) throw new Error(String(res.status)); return res.json(); })
      .then((body: { matches: H2HMatch[] }) => setH2h(body.matches))
      .catch(() => setH2hError(true))
      .finally(() => setH2hLoading(false));
  }, [tab, matchId]);

  // Player season stats — on-demand, only when the Stats tab is shown.
  useEffect(() => {
    if (tab !== "stats" || statsFetched.current) return;
    statsFetched.current = true;
    setPlayerStatsLoading(true);
    fetch(`/api/match-center/player-stats?matchId=${encodeURIComponent(matchId)}`)
      .then(res => { if (!res.ok) throw new Error(String(res.status)); return res.json(); })
      .then((body: { home: PlayerSeasonStat[]; away: PlayerSeasonStat[] }) => setPlayerStats({ home: body.home, away: body.away }))
      .catch(() => setPlayerStatsError(true))
      .finally(() => setPlayerStatsLoading(false));
  }, [tab, matchId]);

  // Lineups — on-demand only inside the kickoff window; more than ~1h out,
  // no request is ever issued (server re-checks the same window regardless).
  useEffect(() => {
    if (tab !== "lineups" || lineupsFetched.current || !data) return;
    if (!isInLineupsWindow(kickoffAt, data.status)) { setLineupsState("early"); return; }
    lineupsFetched.current = true;
    setLineupsState("loading");
    fetch(`/api/match-center/lineups?matchId=${encodeURIComponent(matchId)}`)
      .then(res => { if (!res.ok) throw new Error(String(res.status)); return res.json(); })
      .then((body: { state: LineupsState; lineups: TeamLineup[] }) => {
        setLineups(body.lineups);
        setLineupsState(body.state);
      })
      .catch(() => setLineupsState("error"));
  }, [tab, matchId, data, kickoffAt]);

  const status      = data?.status ?? "upcoming";
  const live        = status === "live";
  const finished    = status === "finished";
  const minute      = data?.minute;
  const homeScore   = data?.home_score ?? 0;
  const awayScore   = data?.away_score ?? 0;
  const events      = data?.match_events ?? [];
  const liveStats   = data?.live_stats ?? null;

  // Finished matches use the real stored points_earned (correctly graded
  // against the group's knockout_policy and scoring rules by
  // scoreMatchResult()) rather than re-deriving from the raw 90-minute score
  // — calcLivePoints only applies to live in-progress matches, where no
  // final grading exists yet and homeScore/awayScore is the only signal.
  const livePoints = !pred ? null
    : finished ? { pts: pred.pointsEarned ?? 0, label: pred.isExact ? "Exact" : (pred.pointsEarned ?? 0) > 0 ? "Correct" : "Missed" }
    : live     ? calcLivePoints(pred, homeScore, awayScore)
    : null;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "var(--bg)" }}>
      {/* ── Close bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "var(--nv)",
          borderBottom: "1px solid var(--br)",
          paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
        }}>
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
                <div className="ta-score" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
                  {data?.home_score_et ?? homeScore}
                </div>
                <span className="font-black" style={{ fontSize: "1.75rem", color: "var(--mt)" }}>–</span>
                <div className="ta-score" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
                  {data?.away_score_et ?? awayScore}
                </div>
              </div>
              {data?.home_score_et != null && (
                <div className="ta-meta mt-1">
                  {homeScore}–{awayScore} (90&apos;) · AET
                </div>
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
          {(["overview", "live", "stats", "lineups", "mvp"] as const).map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className="ta-subtab-label flex-1 py-3 text-center"
              style={tab === tabKey
                ? { color: "var(--ac)", borderBottom: "2px solid var(--ac)" }
                : { color: "var(--mt)" }}>
              {tabKey === "overview" ? "Overview" : tabKey === "live" ? "Live" : tabKey === "stats" ? "Stats" : tabKey === "lineups" ? "Lineups" : t("mvp_vote_tab")}
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

              {/* Head-to-head — last 5-10 meetings across every competition, scores only */}
              <div className="rounded-2xl p-4 space-y-2.5" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
                <div className="flex items-center gap-1.5 ta-section-label">
                  <Swords size={11} /> {t("mc_h2h_heading")}
                </div>
                {h2hLoading && (
                  <div className="py-4 flex justify-center"><BallLoader size="inline" label={t("mc_h2h_loading")} /></div>
                )}
                {!h2hLoading && h2hError && (
                  <div className="py-3 text-center text-xs" style={{ color: "var(--mt)" }}>{t("mc_h2h_error")}</div>
                )}
                {!h2hLoading && !h2hError && h2h && h2h.length === 0 && (
                  <div className="py-3 text-center text-xs" style={{ color: "var(--mt)" }}>{t("mc_h2h_empty")}</div>
                )}
                {!h2hLoading && !h2hError && h2h && h2h.length > 0 && (
                  <div className="space-y-2">
                    {h2h.map(m => (
                      <div key={m.apiFixtureId} className="py-1.5" style={{ borderTop: "1px solid var(--br)" }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <FlagBadge code={m.home.logo} size="sm" label={m.home.name} />
                            <span className="text-xs truncate" style={{ color: "var(--tx)" }}>{m.home.name}</span>
                          </div>
                          <div className="flex flex-col items-center shrink-0 px-1">
                            <span className="font-mono font-black text-sm" style={{ color: "var(--tx)" }}>
                              {m.homeScore ?? "–"}–{m.awayScore ?? "–"}{m.penalties ? ` (${t("mc_h2h_pens")})` : ""}
                            </span>
                            <span className="ta-meta whitespace-nowrap">{formatH2HDate(m.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-row-reverse">
                            <FlagBadge code={m.away.logo} size="sm" label={m.away.name} />
                            <span className="text-xs truncate text-right" style={{ color: "var(--tx)" }}>{m.away.name}</span>
                          </div>
                        </div>
                        <div className="ta-meta text-center truncate mt-0.5">
                          {m.stage ? `${m.competition} · ${m.stage}` : m.competition}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

              {/* Player season stats — competition/season totals, fetched on-demand for this tab */}
              <div className="pt-1">
                <div className="ta-section-label mb-2">{t("mc_stats_heading")}</div>
                {playerStatsLoading && (
                  <div className="py-6 flex justify-center"><BallLoader size="inline" label={t("mc_stats_loading")} /></div>
                )}
                {!playerStatsLoading && playerStatsError && (
                  <div className="py-4 text-center text-xs" style={{ color: "var(--mt)" }}>{t("mc_stats_error")}</div>
                )}
                {!playerStatsLoading && !playerStatsError && playerStats && playerStats.home.length === 0 && playerStats.away.length === 0 && (
                  <div className="py-4 text-center text-xs" style={{ color: "var(--mt)" }}>{t("mc_stats_empty")}</div>
                )}
                {!playerStatsLoading && !playerStatsError && playerStats && (playerStats.home.length > 0 || playerStats.away.length > 0) && (
                  <div className="space-y-4">
                    {[{ label: home, flag: homeFlagCode, players: playerStats.home }, { label: away, flag: awayFlagCode, players: playerStats.away }]
                      .filter(side => side.players.length > 0)
                      .map(side => (
                        <div key={side.label} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <FlagBadge code={side.flag} size="sm" />
                            <span className="text-xs font-black uppercase" style={{ color: "var(--tx)" }}>{side.label}</span>
                          </div>
                          {[...side.players]
                            .sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0))
                            .map(p => <PlayerStatRow key={p.apiPlayerId} player={p} t={t} />)}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lineups — state-aware: early (no fetch) / loading / pending (fetched, unannounced) / available */}
          {!loading && tab === "lineups" && (
            <div className="space-y-4">
              {(lineupsState === "early" || lineupsState === "pending") && (
                <div className="py-8 text-center text-sm flex flex-col items-center gap-2" style={{ color: "var(--mt)" }}>
                  <Shirt size={20} style={{ color: "var(--mt)" }} />
                  {lineupsState === "early" ? t("mc_lineups_early") : t("mc_lineups_pending")}
                </div>
              )}
              {lineupsState === "loading" && (
                <div className="py-8 flex justify-center"><BallLoader size="sm" label={t("mc_lineups_loading")} /></div>
              )}
              {lineupsState === "error" && (
                <div className="py-8 text-center text-sm" style={{ color: "var(--mt)" }}>{t("mc_lineups_error")}</div>
              )}
              {lineupsState === "available" && lineups.map(teamLineup => (
                <div key={teamLineup.team.id} className="rounded-2xl p-4 space-y-3" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FlagBadge code={teamLineup.team.logo} size="sm" />
                      <span className="text-xs font-black uppercase" style={{ color: "var(--tx)" }}>{teamLineup.team.name}</span>
                    </div>
                    {teamLineup.formation && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 12%, transparent)" }}>
                        {t("mc_lineups_formation")} {teamLineup.formation}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="ta-section-label mb-1.5">{t("mc_lineups_starting_xi")}</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {teamLineup.startXI.map(p => (
                        <div key={p.apiPlayerId} className="flex items-center gap-1.5 text-xs">
                          <span className="font-mono font-bold w-5 text-right shrink-0" style={{ color: "var(--ac)" }}>{p.number ?? ""}</span>
                          <span className="truncate" style={{ color: "var(--tx)" }}>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {teamLineup.substitutes.length > 0 && (
                    <div>
                      <div className="ta-section-label mb-1.5">{t("mc_lineups_bench")}</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {teamLineup.substitutes.map(p => (
                          <div key={p.apiPlayerId} className="flex items-center gap-1.5 text-xs">
                            <span className="font-mono font-bold w-5 text-right shrink-0" style={{ color: "var(--mt)" }}>{p.number ?? ""}</span>
                            <span className="truncate" style={{ color: "var(--t2)" }}>{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {teamLineup.coach && (
                    <div className="flex items-center justify-between text-xs pt-1" style={{ borderTop: "1px solid var(--br)" }}>
                      <span style={{ color: "var(--t2)" }}>{t("mc_lineups_coach")}</span>
                      <span className="font-bold" style={{ color: "var(--tx)" }}>{teamLineup.coach.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Matchday MVP — community vote, opens once the match is finished */}
          {!loading && tab === "mvp" && (
            <MvpVotePanel matchId={matchId} home={home} away={away} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
