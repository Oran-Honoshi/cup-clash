"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Lock, ArrowUpDown, Star, Trophy, Medal,
  Users, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft,
} from "lucide-react";
import { AdBanner } from "@/components/ads/ad-banner";
import { CopyPredictions } from "@/components/predictions/copy-predictions";
import { FlaggedTeam } from "@/components/predictions/flagged-team";
import { PredictionBadge } from "@/components/predictions/prediction-badge";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { BallLoader } from "@/components/ui/BallLoader";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { WC2026_MATCHES, type ScheduleMatch } from "@/lib/schedule";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate, type Translations } from "@/lib/i18n";

// ── Theme A tokens (Stadium Night) ──────────────────────────────────────────────
const glassCard = {
  background: "var(--sf)",
  border: "1px solid var(--br)",
} as const;

// ── Time-based locking ────────────────────────────────────────────────────────
function isMatchLocked(utcTime: string): boolean {
  const lockTime = new Date(new Date(utcTime).getTime() - 5 * 60 * 1000);
  return new Date() >= lockTime;
}

function getCountdown(utcTime: string, t: (key: keyof Translations) => string): string {
  const diff = new Date(utcTime).getTime() - 5 * 60 * 1000 - Date.now();
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return interpolate(t("pred_locks_hm"), { h, m });
  return interpolate(t("pred_locks_m"), { m });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScorePrediction { home: string; away: string; }
interface GroupPredictions { [matchId: string]: ScorePrediction; }
export interface TeamStanding {
  name: string; flagCode: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; pts: number;
}

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function getGroupMatches(group: string, src: ScheduleMatch[]) {
  return src.filter(m => m.group === group && m.stage === "Group");
}

function getGroupTeams(group: string, src: ScheduleMatch[]): Array<{ name: string; flagCode: string }> {
  const matches = getGroupMatches(group, src);
  const teams: Record<string, string> = {};
  matches.forEach(m => {
    if (m.home !== "TBD") teams[m.home] = m.homeFlagCode ?? "";
    if (m.away !== "TBD") teams[m.away] = m.awayFlagCode ?? "";
  });
  return Object.entries(teams).map(([name, flagCode]) => ({ name, flagCode }));
}

function calcStandings(group: string, predictions: GroupPredictions, src: ScheduleMatch[]): TeamStanding[] {
  const matches = getGroupMatches(group, src);
  const teams   = getGroupTeams(group, src);
  const table: Record<string, TeamStanding> = {};
  teams.forEach(t => { table[t.name] = { name: t.name, flagCode: t.flagCode, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }; });
  matches.forEach(m => {
    const pred = predictions[m.id];
    if (!pred || pred.home === "" || pred.away === "") return;
    const hg = parseInt(pred.home, 10); const ag = parseInt(pred.away, 10);
    if (isNaN(hg) || isNaN(ag) || !table[m.home] || !table[m.away]) return;
    table[m.home].played++; table[m.away].played++;
    table[m.home].gf += hg; table[m.home].ga += ag;
    table[m.away].gf += ag; table[m.away].ga += hg;
    table[m.home].gd = table[m.home].gf - table[m.home].ga;
    table[m.away].gd = table[m.away].gf - table[m.away].ga;
    if      (hg > ag) { table[m.home].won++; table[m.home].pts += 3; table[m.away].lost++; }
    else if (hg < ag) { table[m.away].won++; table[m.away].pts += 3; table[m.home].lost++; }
    else              { table[m.home].drawn++; table[m.home].pts++; table[m.away].drawn++; table[m.away].pts++; }
  });
  return Object.values(table).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
}

function isGroupComplete(group: string, predictions: GroupPredictions, src: ScheduleMatch[]): boolean {
  return getGroupMatches(group, src).every(m => {
    const p = predictions[m.id]; return p && p.home !== "" && p.away !== "";
  });
}


interface StagePoints { correctOutcome: number; exactScore: number; useProgressive: boolean; }

interface MatchResultData {
  homeScore: number;
  awayScore: number;
  isLive:    boolean;
}

interface LiveMemberPred {
  name:      string;
  avatarUrl: string | null;
  homeScore: number;
  awayScore: number;
}

// ── Match Card Block ──────────────────────────────────────────────────────────
function MatchCard({ match, prediction, onChange, globalLocked, stagePoints, matchResult, earnedPts, livePreds, flashStatus }: {
  match: ScheduleMatch;
  prediction: ScorePrediction;
  onChange: (home: string, away: string) => void;
  globalLocked: boolean;
  stagePoints?: StagePoints;
  matchResult?: MatchResultData;
  earnedPts?: { pts: number; isExact: boolean };
  livePreds?: LiveMemberPred[];
  flashStatus?: "success" | "error" | null;
}) {
  const { t } = useLocale();
  const filled      = prediction.home !== "" && prediction.away !== "";
  const kickoff     = match.kickoff_at;
  const dateConfirmed = match.time_confirmed !== false;
  const matchLocked = globalLocked || isMatchLocked(kickoff);
  const countdown   = !matchLocked && dateConfirmed ? getCountdown(kickoff, t) : "";

  const [localTimeStr, setLocalTimeStr] = useState("");
  useEffect(() => {
    if (!dateConfirmed) { setLocalTimeStr("Date TBD"); return; }
    const d = new Date(kickoff);
    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzAbbr = new Intl.DateTimeFormat("en-GB", { timeZoneName: "short", timeZone: tz })
      .formatToParts(d).find(p => p.type === "timeZoneName")?.value ?? "";
    setLocalTimeStr(`${dateStr} · ${timeStr}${tzAbbr ? ` ${tzAbbr}` : ""}`);
  }, [kickoff, dateConfirmed]);
  const status = matchLocked ? "locked" : filled ? "saved" : "open";

  // Result badge (only for finished matches with a prediction)
  type BadgeType = "exact" | "correct" | "missed" | "none";
  let badgeType: BadgeType = "none";
  let badgePoints = 0;
  if (matchResult && filled) {
    const predH = parseInt(prediction.home, 10);
    const predA = parseInt(prediction.away, 10);
    if (!isNaN(predH) && !isNaN(predA)) {
      if (earnedPts?.isExact || (predH === matchResult.homeScore && predA === matchResult.awayScore)) {
        badgeType = "exact";
      } else {
        const pw = predH > predA ? "H" : predH < predA ? "A" : "D";
        const rw = matchResult.homeScore > matchResult.awayScore ? "H"
          : matchResult.homeScore < matchResult.awayScore ? "A" : "D";
        badgeType = pw === rw ? "correct" : "missed";
      }
      badgePoints = earnedPts?.pts ?? 0;
    }
  } else if (matchResult && !filled) {
    badgeType = "none";
  }

  const cardStyle = {
    open:   { background: "var(--sf)", border: "1px solid var(--ac)" },
    saved:  { background: "var(--sf)", border: "1px solid rgba(251,191,36,0.35)" },
    locked: { background: "var(--sf)", border: "1px solid var(--br)" },
  }[status];

  return (
    <div className="cc-elevated" style={{ ...cardStyle, borderRadius: 16, padding: "8px 12px", opacity: matchLocked ? 0.7 : 1, width: "100%" }}>

      {/* Row 1 — meta strip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div className="ta-meta">
          <span suppressHydrationWarning>{localTimeStr}</span>
          {stagePoints?.useProgressive && (
            <span style={{ marginLeft: 8, color: "#fbbf24", fontWeight: 700 }}>
              ⭐ {stagePoints.correctOutcome + stagePoints.exactScore} pts
            </span>
          )}
        </div>
        {status === "open" && countdown && (
          <span className="ta-subtab-label flex items-center px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,207,128,0.12)", color: "var(--ac)", border: "1px solid rgba(0,207,128,0.3)" }}>
            {countdown}
          </span>
        )}
        {status === "saved" && (
          <span className="ta-subtab-label flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
            <CheckCircle2 size={10} /> {t("pred_saved")}
          </span>
        )}
        {status === "locked" && (
          <span className="ta-subtab-label flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            style={{ background: "var(--ip)", color: "var(--mt)" }}>
            <Lock size={9} /> {t("pred_locked")}
          </span>
        )}
      </div>

      {/* Score row — same layout as NextMatchCard */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col items-center gap-1">
          <FlagBadge code={match.homeFlagCode ?? "un"} size="sm" />
          <span className="ta-team-name text-center" style={{ fontSize: 12, color: "var(--tx)" }}>
            {(match.home ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            borderRadius: 8,
            border: flashStatus === "success" ? "1.5px solid var(--ac)" : flashStatus === "error" ? "1.5px solid #f87171" : "1.5px solid transparent",
            padding: "3px 6px",
            background: flashStatus === "success" ? "rgba(0,207,128,0.06)" : flashStatus === "error" ? "rgba(248,113,113,0.06)" : "transparent",
            transition: "border-color 0.3s, background 0.3s",
          }}>
            <ScoreInputCC value={prediction.home} onChange={v => onChange(v, prediction.away)} disabled={matchLocked} />
            <span className="ta-score" style={{ fontSize: 16 }}>:</span>
            <ScoreInputCC value={prediction.away} onChange={v => onChange(prediction.home, v)} disabled={matchLocked} />
          </div>
          {flashStatus === "success" && <span style={{ fontSize: 11, color: "var(--ac)", fontWeight: 700 }}>✓</span>}
          {flashStatus === "error" && <span style={{ fontSize: 11, color: "#f87171", fontWeight: 700 }}>!</span>}
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <FlagBadge code={match.awayFlagCode ?? "un"} size="sm" />
          <span className="ta-team-name text-center" style={{ fontSize: 12, color: "var(--tx)" }}>
            {(match.away ?? "").substring(0, 3).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Result badge row — finished matches */}
      {matchResult && !matchResult.isLive && (
        <div className="flex items-center justify-between mt-2 pt-2"
          style={{ borderTop: "1px solid var(--dv)" }}>
          <span className="ta-score" style={{ fontSize: 16 }}>
            {matchResult.homeScore}–{matchResult.awayScore}
          </span>
          <PredictionBadge
            type={badgeType}
            points={badgeType !== "none" ? badgePoints : undefined}
            size="sm"
          />
        </div>
      )}

      {/* Live indicator */}
      {matchResult?.isLive && (
        <div className="flex items-center gap-1.5 mt-2 pt-2"
          style={{ borderTop: "1px solid var(--dv)" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#f87171" }}>Live now</span>
        </div>
      )}

      {/* Group member predictions revealed when live */}
      {matchResult?.isLive && livePreds && livePreds.length > 0 && (
        <div className="mt-2 pt-2 space-y-1.5" style={{ borderTop: "1px solid var(--dv)" }}>
          <div className="ta-section-label" style={{ marginBottom: 6 }}>
            What your group predicted
          </div>
          {livePreds.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} size="xs" />
              <span className="ta-body" style={{ fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.name}
              </span>
              <span className="ta-score" style={{ fontSize: 15, flexShrink: 0 }}>
                {m.homeScore}–{m.awayScore}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Group Table ───────────────────────────────────────────────────────────────
// `highlightTopN` controls the qualify-styling (green highlight + "Q" badge
// on the top N rows, amber border on row N+1) — meaningful for a 4-team
// World Cup group (top 2 advance) but not for a full league table, where
// callers should pass 0 to disable it entirely. Exported for reuse outside
// this file (see app/(app)/stats/page.tsx's Statistician standings table).
export function GroupTable({ standings, highlightTopN = 2 }: { standings: TeamStanding[]; highlightTopN?: number }) {
  if (!standings.length) return null;
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--br)" }}>
      <div className="ta-section-label grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-2 px-3 py-2"
        style={{ background: "var(--ip)", borderBottom: "1px solid var(--br)" }}>
        <div>Team</div>
        {["P","W","D","L","GD","Pts"].map(h => (
          <div key={h} className={`w-6 text-center${["W","D","L"].includes(h) ? " hidden sm:block" : ""}`} style={h==="Pts" ? { color: "var(--ac)" } : undefined}>{h}</div>
        ))}
      </div>
      {standings.map((team, i) => {
        const qualifies  = highlightTopN > 0 && i < highlightTopN;
        const thirdPlace = highlightTopN > 0 && i === highlightTopN;
        return (
          <div key={team.name}
            className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-2 items-center px-3 py-2"
            style={{
              borderBottom: i < standings.length - 1 ? "1px solid var(--dv)" : undefined,
              background: qualifies ? "rgba(0,207,128,0.04)" : undefined,
              borderLeft: qualifies ? "2px solid var(--ac)" : thirdPlace ? "2px solid rgba(251,191,36,0.35)" : "2px solid transparent",
            }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-black w-3 shrink-0" style={{ color: qualifies ? "var(--ac)" : "var(--ft)" }}>{i + 1}</span>
              <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
              {qualifies && <span className="hidden sm:inline text-[9px] font-bold px-1 rounded shrink-0" style={{ background: "rgba(0,207,128,0.12)", color: "var(--ac)" }}>Q</span>}
            </div>
            <div className="w-6 text-center text-xs" style={{ color: "var(--mt)" }}>{team.played}</div>
            <div className="w-6 text-center text-xs hidden sm:block" style={{ color: "var(--ac)" }}>{team.won}</div>
            <div className="w-6 text-center text-xs hidden sm:block" style={{ color: "var(--mt)" }}>{team.drawn}</div>
            <div className="w-6 text-center text-xs hidden sm:block" style={{ color: "#f87171" }}>{team.lost}</div>
            <div className="w-6 text-center text-xs font-bold"
              style={{ color: team.gd > 0 ? "var(--ac)" : team.gd < 0 ? "#f87171" : "var(--mt)" }}>
              {team.gd > 0 ? `+${team.gd}` : team.gd}
            </div>
            <div className="w-6 text-center font-black text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--ac)" }}>{team.pts}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Qualifiers Summary ────────────────────────────────────────────────────────
function QualifiersSummary({ predictions, allComplete, allMatches }: { predictions: GroupPredictions; allComplete: boolean; allMatches: ScheduleMatch[] }) {
  const { t } = useLocale();
  const qualifiers = useMemo(() => {
    const q: { group: string; pos: 1|2|3; team: TeamStanding }[] = [];
    GROUPS.forEach(g => {
      const s = calcStandings(g, predictions, allMatches);
      if (s[0]?.played > 0) q.push({ group: g, pos: 1, team: s[0] });
      if (s[1]?.played > 0) q.push({ group: g, pos: 2, team: s[1] });
      if (s[2]?.played > 0) q.push({ group: g, pos: 3, team: s[2] });
    });
    return q;
  }, [predictions]);

  const top1  = qualifiers.filter(q => q.pos === 1);
  const top2  = qualifiers.filter(q => q.pos === 2);
  const best8 = qualifiers.filter(q => q.pos === 3).sort((a,b) => b.team.pts - a.team.pts || b.team.gd - a.team.gd).slice(0,8);

  if (!qualifiers.length) return null;

  return (
    <div className="rounded-2xl p-5 space-y-5 cc-elevated" style={glassCard}>
      <div className="flex items-center gap-2.5">
        <Trophy size={18} strokeWidth={1.5} style={{ color: "#fbbf24" }} />
        <span className="ta-match-label" style={{ color: "var(--tx)" }}>{t("pred_title")} — </span>
        {!allComplete && <span className="ta-meta ml-auto">{t("pred_qual_hint")}</span>}
      </div>
      {top1.length > 0 && (
        <div>
          <div className="ta-section-label mb-2 flex items-center gap-1.5">
            <Star size={10} style={{ color: "var(--ac)" }} /> {t("pred_grp_winners")}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {top1.map(({ group, team }) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,207,128,0.06)", border: "1px solid rgba(0,207,128,0.2)" }}>
                <span className="text-[10px] font-black" style={{ color: "var(--ac)" }}>Grp {group}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "var(--ac)" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {top2.length > 0 && (
        <div>
          <div className="ta-section-label mb-2 flex items-center gap-1.5">
            <Medal size={10} style={{ color: "var(--ac)" }} /> {t("pred_runners_up")}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {top2.map(({ group, team }) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,207,128,0.05)", border: "1px solid rgba(0,207,128,0.15)" }}>
                <span className="text-[10px] font-black" style={{ color: "var(--ac)" }}>Grp {group}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "var(--ac)" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {best8.length > 0 && (
        <div>
          <div className="ta-section-label mb-2 flex items-center gap-1.5">
            <Users size={10} style={{ color: "var(--ac)" }} /> {t("pred_best_third")}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {best8.map(({ group, team }, i) => (
              <div key={group} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <span className="text-[10px] font-black" style={{ color: "#fbbf24" }}>#{i+1}</span>
                <FlaggedTeam name={team.name} flagCode={team.flagCode} size="xs" />
                <span className="ml-auto font-mono font-black text-xs" style={{ color: "#fbbf24" }}>{team.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Save indicator ────────────────────────────────────────────────────────────
function SaveIndicator({ status }: { status: "idle"|"saving"|"saved"|"error" }) {
  const { t } = useLocale();
  if (status === "idle") return null;
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-bold"
      style={{ color: status === "saved" ? "var(--ac)" : status === "error" ? "#f87171" : "var(--mt)" }}>
      {status === "saving" && <BallLoader size="inline" label={null} />}
      {status === "saved"  && <Check size={11} />}
      {status === "error"  && <AlertCircle size={11} />}
      {status === "saving" ? t("pred_saving") : status === "saved" ? t("pred_saved") : t("pred_failed")}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface GroupStagePredictionsProps {
  groupId:      string;
  userId?:      string;
  locked?:      boolean;
  isAdFree?:    boolean;
  isCorporate?: boolean;
  allMatches?:  ScheduleMatch[];
}

export function GroupStagePredictions({ groupId, locked = false, userId, isAdFree, isCorporate, allMatches = WC2026_MATCHES }: GroupStagePredictionsProps) {
  const { t } = useLocale();
  const [activeGroup,  setActiveGroup]  = useState("A");
  const [predictions,  setPredictions]  = useState<GroupPredictions>({});
  const [loaded,       setLoaded]       = useState(false);
  const [stagePoints,  setStagePoints]  = useState<StagePoints | undefined>(undefined);
  const [matchResults, setMatchResults] = useState<Record<string, MatchResultData>>({});
  const [earnedPoints, setEarnedPoints] = useState<Record<string, { pts: number; isExact: boolean }>>({});

  const [liveMemberPreds, setLiveMemberPreds] = useState<Record<string, LiveMemberPred[]>>({});
  const [pendingChanges,  setPendingChanges]  = useState<Record<string, boolean>>({});
  const [chipFlash,       setChipFlash]       = useState<Record<string, "success" | "error" | null>>({});
  const autoSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const predictionsRef = useRef(predictions);
  predictionsRef.current = predictions;

  // Warn on navigate-away with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (Object.keys(pendingChanges).length > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pendingChanges]);

  useEffect(() => {
    const sb = createClient();
    sb.from("scoring_rules")
      .select("use_progressive_scoring, gs_correct_outcome, gs_exact_score")
      .eq("group_id", groupId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as Record<string, unknown>;
          setStagePoints({
            useProgressive:  Boolean(d.use_progressive_scoring),
            correctOutcome:  Number(d.gs_correct_outcome) || 10,
            exactScore:      Number(d.gs_exact_score)     || 25,
          });
        }
      });
  }, [groupId]);

  // Fetch finished AND live match scores, reveal member predictions for live
  useEffect(() => {
    const sb = createClient();
    sb.from("matches")
      .select("id, home_score, away_score, status")
      .in("status", ["finished", "live"])
      .then(async ({ data }) => {
        if (!data?.length) return;
        const results: Record<string, MatchResultData> = {};
        const liveIds: string[] = [];
        (data as Array<{ id: string; home_score: number | null; away_score: number | null; status: string }>)
          .forEach(m => {
            const isLive = m.status === "live";
            if (isLive) {
              results[m.id] = { homeScore: 0, awayScore: 0, isLive: true };
              liveIds.push(m.id);
            } else if (m.home_score !== null && m.away_score !== null) {
              results[m.id] = { homeScore: m.home_score, awayScore: m.away_score, isLive: false };
            }
          });
        setMatchResults(results);

        // For live matches, fetch all group member predictions
        if (liveIds.length > 0) {
          const [predsRes, membersRes] = await Promise.all([
            sb.from("group_predictions")
              .select("user_id, match_id, home_score, away_score")
              .eq("group_id", groupId)
              .in("match_id", liveIds)
              .not("home_score", "is", null),
            sb.from("group_members")
              .select("user_id, profiles(name, avatar_url)")
              .eq("group_id", groupId),
          ]);

          const memberMap: Record<string, { name: string; avatarUrl: string | null }> = {};
          ((membersRes.data ?? []) as { user_id: string; profiles: { name: string; avatar_url: string | null } | null }[])
            .forEach(m => {
              if (m.profiles) memberMap[m.user_id] = { name: m.profiles.name, avatarUrl: m.profiles.avatar_url };
            });

          const byMatch: Record<string, LiveMemberPred[]> = {};
          ((predsRes.data ?? []) as { user_id: string; match_id: string; home_score: number; away_score: number }[])
            .forEach(p => {
              const info = memberMap[p.user_id];
              if (!info) return;
              if (!byMatch[p.match_id]) byMatch[p.match_id] = [];
              byMatch[p.match_id].push({
                name:      info.name,
                avatarUrl: info.avatarUrl,
                homeScore: p.home_score,
                awayScore: p.away_score,
              });
            });

          setLiveMemberPreds(byMatch);
        }
      });
  }, [groupId]);

  useEffect(() => {
    if (!userId) return;
    setPredictions({});
    setLoaded(false);
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoaded(true); return; }
      sb.from("group_predictions")
        .select("match_id, home_score, away_score, points_earned, is_exact")
        .eq("group_id", groupId).eq("user_id", user.id).eq("pred_type", "match")
        .then(({ data, error }) => {
          if (error) console.error("Load predictions error:", error.message);
          if (data?.length) {
            const loadedPreds: GroupPredictions = {};
            const earned: Record<string, { pts: number; isExact: boolean }> = {};
            (data as Array<{
              match_id: string; home_score: number; away_score: number;
              points_earned: number | null; is_exact: boolean | null;
            }>).forEach(row => {
              loadedPreds[row.match_id] = { home: String(row.home_score), away: String(row.away_score) };
              if (row.points_earned !== null) {
                earned[row.match_id] = { pts: row.points_earned, isExact: row.is_exact ?? false };
              }
            });
            setPredictions(loadedPreds);
            setEarnedPoints(earned);
          }
          setLoaded(true);
        });
    });
  }, [userId, groupId]);

  const doAutoSave = useCallback(async (matchId: string, home: string, away: string) => {
    if (!userId) return;
    const h = parseInt(home, 10), a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a)) return;
    try {
      const sb = createClient();
      const { error } = await sb.from("group_predictions").upsert({
        user_id: userId, group_id: groupId, match_id: matchId,
        home_score: h, away_score: a, pred_type: "match",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,group_id,match_id" });
      if (error) throw error;
      setPendingChanges(prev => { const n = { ...prev }; delete n[matchId]; return n; });
      setChipFlash(prev => ({ ...prev, [matchId]: "success" }));
      setTimeout(() => setChipFlash(prev => ({ ...prev, [matchId]: null })), 1000);
    } catch {
      setChipFlash(prev => ({ ...prev, [matchId]: "error" }));
      setTimeout(() => setChipFlash(prev => ({ ...prev, [matchId]: null })), 2000);
    }
  }, [userId, groupId]);

  const doAutoSaveRef = useRef(doAutoSave);
  doAutoSaveRef.current = doAutoSave;

  // Flush (not just cancel) pending debounced saves on unmount — this component
  // is remounted via key={groupId} on every group switch, so without a flush
  // an edit made within the 800ms debounce window right before switching
  // groups would be silently discarded instead of saved to its group.
  useEffect(() => {
    return () => {
      const pendingIds = Object.keys(autoSaveTimers.current);
      pendingIds.forEach(id => clearTimeout(autoSaveTimers.current[id]));
      pendingIds.forEach(id => {
        const pred = predictionsRef.current[id];
        if (pred && pred.home !== "" && pred.away !== "") {
          doAutoSaveRef.current(id, pred.home, pred.away);
        }
      });
    };
  }, []);

  const setScore = (matchId: string, home: string, away: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));
    setPendingChanges(prev => ({ ...prev, [matchId]: true }));
    if (autoSaveTimers.current[matchId]) clearTimeout(autoSaveTimers.current[matchId]);
    autoSaveTimers.current[matchId] = setTimeout(() => {
      delete autoSaveTimers.current[matchId]; // fired naturally — nothing left to flush on unmount
      doAutoSave(matchId, home, away);
    }, 800);
  };

  const groupStageMatchIds  = useMemo(() => new Set(allMatches.filter(m => m.stage === "Group").map(m => m.id)), [allMatches]);
  const totalGroupMatches   = groupStageMatchIds.size;
  const groupMatches        = getGroupMatches(activeGroup, allMatches);
  const groupTeams          = getGroupTeams(activeGroup, allMatches);
  const standings           = calcStandings(activeGroup, predictions, allMatches);
  const groupComplete       = isGroupComplete(activeGroup, predictions, allMatches);
  const allComplete         = GROUPS.every(g => isGroupComplete(g, predictions, allMatches));
  const completedCount      = GROUPS.filter(g => isGroupComplete(g, predictions, allMatches)).length;
  const activeIdx           = GROUPS.indexOf(activeGroup);
  const predictedMatchCount = Object.keys(predictions).filter(id => groupStageMatchIds.has(id)).length;

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-clip">

      {/* Progress + save status */}
      <div className="rounded-2xl px-4 py-3 cc-elevated" style={{ ...glassCard, borderRadius: 18 }}>
        {/* Match counter — prominent */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="ta-section-label mb-0.5">
              Matches Predicted
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono" style={{ color: "var(--ac)" }}>{predictedMatchCount}</span>
              <span className="text-sm font-bold" style={{ color: "var(--ft)" }}>/ {totalGroupMatches}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="ta-section-label mb-0.5">
              {t("pred_progress")}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm font-black font-mono" style={{ color: "var(--ac)" }}>{completedCount} / 12</span>
            </div>
          </div>
        </div>
        <div className="overflow-hidden" style={{ height: 6, borderRadius: 3, background: "var(--ip)" }}>
          <div className="h-full transition-all duration-500"
            style={{ width: `${(predictedMatchCount / totalGroupMatches) * 100}%`, background: "var(--ac)", borderRadius: 3 }} />
        </div>
        <p className="ta-meta mt-1.5">
          {t("pred_autosave_hint")}
        </p>
      </div>

      {/* Group pills — scrollable row */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 w-full max-w-full min-w-0"
        style={{
          scrollbarWidth: "none", msOverflowStyle: "none",
          WebkitMaskImage: "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
          maskImage: "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
        }}>
        {GROUPS.map(g => {
          const complete = isGroupComplete(g, predictions, allMatches);
          const isActive = g === activeGroup;
          const teams    = getGroupTeams(g, allMatches);
          return (
            <button key={g} onClick={() => setActiveGroup(g)}
              className="ta-subtab-label flex items-center gap-1.5 px-3 py-2 min-h-[44px] transition-all shrink-0"
              style={isActive ? {
                background: "var(--ac)",
                color: "var(--at)",
                border: "1px solid transparent",
                borderRadius: 100,
              } : {
                background: "var(--ip)",
                color: "var(--t2)",
                border: "1px solid var(--br)",
                borderRadius: 100,
              }}>
              Grp {g}
              <span className="flex -space-x-0.5">
                {teams.slice(0,2).map(t => t.flagCode && (
                  <span key={t.name} className="h-3 w-4 rounded-sm overflow-hidden inline-block border"
                    style={{ borderColor: "rgba(0,0,0,0.3)" }}>
                    <img src={`/flags/${t.flagCode}.svg`} alt={t.name} className="w-full h-full object-cover" />
                  </span>
                ))}
              </span>
              {complete && <Check size={10} style={{ color: isActive ? "var(--at)" : "var(--ac)" }} />}
            </button>
          );
        })}
      </div>

      {/* Ad between group tabs and match cards */}
      {isAdFree !== undefined && isCorporate !== undefined && (
        <AdBanner isAdFree={isAdFree} isCorporate={isCorporate} />
      )}

      {/* Active group section */}
      <AnimatePresence mode="wait">
        <motion.div key={activeGroup}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="w-full max-w-full space-y-4" style={{ overflow: "visible" }}>

          {/* Group header */}
          <div className="flex items-center justify-between px-1 overflow-hidden">
            <div className="min-w-0 flex-1">
              <h2 className="ta-match-label" style={{ fontSize: 22, color: "var(--tx)" }}>Group {activeGroup}</h2>
              <p className="ta-meta truncate">{groupTeams.map(t => t.name).join(" · ")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {groupComplete && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,207,128,0.1)", color: "var(--ac)", border: "1px solid rgba(0,207,128,0.25)" }}>
                  <CheckCircle2 size={11} /> {t("common_complete")}
                </span>
              )}
            </div>
          </div>

          {/* Match cards — single column stack */}
          <div className="flex flex-col w-full max-w-full" style={{ gap: 6, overflow: "visible" }}>
            {groupMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions[match.id] ?? { home: "", away: "" }}
                onChange={(h, a) => setScore(match.id, h, a)}
                globalLocked={locked}
                stagePoints={stagePoints}
                matchResult={matchResults[match.id]}
                earnedPts={earnedPoints[match.id]}
                livePreds={liveMemberPreds[match.id]}
                flashStatus={chipFlash[match.id]}
              />
            ))}
          </div>

          {/* Predicted table — collapsible below matches */}
          {standings.some(t => t.played > 0) && (
            <div className="p-4 cc-elevated" style={{ ...glassCard, borderRadius: 18 }}>
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown size={14} strokeWidth={1.5} style={{ color: "var(--ac)" }} />
                <span className="ta-match-label" style={{ fontSize: 16, color: "var(--tx)" }}>{t("pred_pred_table")}</span>
              </div>
              <GroupTable standings={standings} />
              <div className="mt-3 flex gap-4">
                <div className="ta-meta flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: "var(--ac)" }} /> {t("pred_top2")}
                </div>
                <div className="ta-meta flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(251,191,36,0.4)" }} /> {t("pred_third_may")}
                </div>
              </div>
            </div>
          )}

          {userId && (
            <CopyPredictions
              currentGroupId={groupId}
              userId={userId}
              onCopied={(preds) => setPredictions(prev => {
                const merged = { ...prev };
                Object.entries(preds).forEach(([matchId, scores]) => {
                  const homeVal = scores.home?.trim();
                  const awayVal = scores.away?.trim();
                  if (homeVal && awayVal) merged[matchId] = scores;
                });
                return merged;
              })}
            />
          )}

          {/* Prev / Next group navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => activeIdx > 0 && setActiveGroup(GROUPS[activeIdx - 1])}
              disabled={activeIdx === 0}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--t2)" }}>
              <ChevronLeft size={13} /> Group {GROUPS[activeIdx - 1] ?? ""}
            </button>
            <button
              onClick={() => activeIdx < GROUPS.length - 1 && setActiveGroup(GROUPS[activeIdx + 1])}
              disabled={activeIdx === GROUPS.length - 1}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--t2)" }}>
              Group {GROUPS[activeIdx + 1] ?? ""} <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <QualifiersSummary predictions={predictions} allComplete={allComplete} allMatches={allMatches} />
    </div>
  );
}