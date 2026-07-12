"use client";

import { useState, useEffect } from "react";
import { Lock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { differenceInMinutes } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NeonBar } from "@/components/ui/neon-bar";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { BallLoader } from "@/components/ui/BallLoader";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { LiveDot } from "@/components/ui/live-dot";
import { FlipCard } from "@/components/ui/flip-card";
import { FOCUS_RING } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { playLockInSound } from "@/lib/sound";
import type { Match } from "@/lib/types";

interface NextMatchCardProps {
  match:      Match;
  groupId?:   string;
  cardLabel?: string;
  onOpenMatchCenter?: (matchId: string) => void;
}

function getStageLabel(match: Match): string {
  if (match.stage === "Group" && match.group) return `Group ${match.group}`;
  const labels: Record<string, string> = {
    R32: "Round of 32",
    R16: "Round of 16",
    QF:  "Quarter-final",
    SF:  "Semi-final",
    "3rd": "3rd Place",
    Final: "Final",
  };
  return labels[match.stage] ?? match.stage;
}

type SaveState = "idle" | "saving" | "saved" | "error" | "locked";

// stage -> [correct-outcome column, exact-score column] on scoring_rules, used
// only when the group has progressive (per-stage) scoring turned on.
const STAGE_COLS: Record<string, [string, string]> = {
  Group: ["gs_correct_outcome",    "gs_exact_score"],
  R32:   ["r32_correct_outcome",   "r32_exact_score"],
  R16:   ["r16_correct_outcome",   "r16_exact_score"],
  QF:    ["qf_correct_outcome",    "qf_exact_score"],
  SF:    ["sf_correct_outcome",    "sf_exact_score"],
  "3rd": ["third_correct_outcome", "third_exact_score"],
  Final: ["final_correct_outcome", "final_exact_score"],
};

export function NextMatchCard({ match, groupId = "", cardLabel, onOpenMatchCenter }: NextMatchCardProps) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);
  const [stagePoints, setStagePoints] = useState({ correctOutcome: 10, exactScore: 25 });

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    const stageCols = STAGE_COLS[match.stage] ?? STAGE_COLS.Group;
    createClient()
      .from("scoring_rules")
      .select(`correct_outcome, exact_score, use_progressive_scoring, ${stageCols.join(", ")}`)
      .eq("group_id", groupId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        const row = data as Record<string, number | boolean | null>;
        const [outcomeCol, exactCol] = STAGE_COLS[match.stage] ?? STAGE_COLS.Group;
        const useProgressive = Boolean(row.use_progressive_scoring);
        setStagePoints({
          correctOutcome: Number((useProgressive ? row[outcomeCol] : row.correct_outcome) ?? 10),
          exactScore:     Number((useProgressive ? row[exactCol]   : row.exact_score)     ?? 25),
        });
      });
    return () => { cancelled = true; };
  }, [groupId, match.stage]);

  const matchDate        = new Date(match.time);
  const minutesToKickoff = differenceInMinutes(matchDate, new Date());
  const dateConfirmed    = match.timeConfirmed !== false;

  const etFallback = dateConfirmed ? formatInTimeZone(matchDate, "America/New_York", "EEE dd MMM · h:mm a 'ET'") : "Date TBD";
  const [formattedTime, setFormattedTime] = useState(etFallback);
  useEffect(() => {
    if (!dateConfirmed) { setFormattedTime("Date TBD"); return; }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const d = matchDate;
    const dayStr  = d.toLocaleDateString("en", { timeZone: tz, weekday: "short", day: "2-digit", month: "short" });
    const timeStr = d.toLocaleTimeString("en", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });
    const tzAbbr  = new Intl.DateTimeFormat("en", { timeZoneName: "short", timeZone: tz })
      .formatToParts(d).find(p => p.type === "timeZoneName")?.value ?? "";
    setFormattedTime(`${dayStr} · ${timeStr} ${tzAbbr}`);
  }, [match.time, dateConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps
  const isLocked         = minutesToKickoff <= 5;
  const isLive           = minutesToKickoff <= 0 && minutesToKickoff > -120;

  const homeFlagCode = match.homeFlagCode ?? "un";
  const awayFlagCode = match.awayFlagCode ?? "un";

  useEffect(() => {
    async function loadExisting() {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user || !groupId) return;
      const { data } = await sb
        .from("group_predictions")
        .select("home_score, away_score")
        .eq("user_id",  user.id)
        .eq("group_id", groupId)
        .eq("match_id", match.id)
        .maybeSingle();
      if (data) {
        const row = data as { home_score: number; away_score: number };
        setHomeScore(String(row.home_score));
        setAwayScore(String(row.away_score));
        setSaveState("saved");
      }
      if (isLocked) setSaveState("locked");
    }
    loadExisting();
  }, [match.id, groupId, isLocked]);

  const handleSubmit = async () => {
    if (homeScore === "" || awayScore === "" || isLocked) return;
    setSaveState("saving");
    setErrorMsg(null);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setErrorMsg("Please sign in to save predictions"); setSaveState("error"); return; }
    const { error } = await sb.from("group_predictions").upsert({
      user_id:    user.id,
      group_id:   groupId,
      match_id:   match.id,
      home_score: Number(homeScore),
      away_score: Number(awayScore),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,group_id,match_id" });
    if (error) { setErrorMsg(error.message); setSaveState("error"); return; }
    setSaveState("saved");
    playLockInSound();
    window.dispatchEvent(new CustomEvent("cupclash:first_prediction"));
  };

  return (
    <div
      className={cn("ta-hero-card w-full max-w-full overflow-hidden cc-elevated", onOpenMatchCenter && "cc-elevated-interactive")}
      style={{ boxShadow: `0 12px 40px var(--shad)`, cursor: onOpenMatchCenter ? "pointer" : undefined }}
      onClick={onOpenMatchCenter ? () => onOpenMatchCenter(match.id) : undefined}
      role={onOpenMatchCenter ? "button" : undefined}
      tabIndex={onOpenMatchCenter ? 0 : undefined}
      onKeyDown={onOpenMatchCenter ? (e => { if (e.key === "Enter" || e.key === " ") onOpenMatchCenter(match.id); }) : undefined}
    >
      {/* Top accent line */}
      <NeonBar gradient="var(--ac)" height={2.5} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-5">
          <div className="min-w-0">
            <div
              className="ta-section-label flex items-center gap-1.5 mb-0.5"
              style={isLive ? { color: "var(--ac)" } : undefined}
            >
              {isLive && <LiveDot />}
              {cardLabel ?? (isLive ? "Live Match" : "Next Match")}
            </div>
            <div className="ta-match-label" style={{ color: "var(--t2)", marginBottom: 2 }}>
              {getStageLabel(match)}
            </div>
            <div className="ta-meta" suppressHydrationWarning>
              {formattedTime}
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap",
              isLocked
                ? "bg-red-500/15 border border-red-500/30 text-red-400"
                : "border"
            )}
            style={{
              marginTop: 1,
              ...(!isLocked ? { borderColor: "var(--br)", background: "var(--ip)", color: "var(--mt)" } : {}),
            }}
          >
            <Lock size={10} />
            {isLocked ? "Locked" : "Locks 5 min before"}
          </div>
        </div>

        {/* Teams + score inputs */}
        <div className="flex items-center gap-2 w-full min-w-0">
          {/* Home team */}
          <div className="flex-1 min-w-0 flex flex-col items-center gap-2">
            <FlagBadge code={homeFlagCode} size="md" />
            <span className="ta-team-name text-center leading-tight w-full truncate px-1" style={{ color: "var(--tx)" }}>
              {match.home}
            </span>
          </div>

          {/* Score inputs */}
          <div className="flex items-center gap-1.5 flex-none" onClick={e => e.stopPropagation()}>
            {saveState === "saved" ? (
              <>
                <ScoreDisplay value={homeScore} />
                <span className="font-barlow text-2xl font-black" style={{ color: "var(--mt)" }}>–</span>
                <ScoreDisplay value={awayScore} />
              </>
            ) : (
              <>
                <ScoreInputCC value={homeScore} onChange={setHomeScore} disabled={isLocked} />
                <span className="font-barlow text-2xl font-black" style={{ color: "var(--mt)" }}>–</span>
                <ScoreInputCC value={awayScore} onChange={setAwayScore} disabled={isLocked} />
              </>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 min-w-0 flex flex-col items-center gap-2">
            <FlagBadge code={awayFlagCode} size="md" />
            <span className="ta-team-name text-center leading-tight w-full truncate px-1" style={{ color: "var(--tx)" }}>
              {match.away}
            </span>
          </div>
        </div>

        {/* Points hint — reflects this group's actual scoring rules for this stage */}
        <div className="ta-meta mt-4 flex items-center justify-center gap-4">
          <span><span className="font-bold" style={{ color: "var(--ac)" }}>+{stagePoints.correctOutcome}</span> correct outcome</span>
          <span style={{ color: "var(--dv)" }}>·</span>
          <span><span className="font-bold" style={{ color: "var(--ac)" }}>+{stagePoints.exactScore}</span> exact score</span>
        </div>

        {saveState === "error" && errorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle size={13} />{errorMsg}
          </div>
        )}

        {/* Action */}
        <div className="mt-4" onClick={e => e.stopPropagation()}>
          {saveState === "locked" ? (
            <div
              className="text-center text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--mt)" }}
            >
              Predictions locked
            </div>
          ) : (
            <FlipCard
              flipped={saveState === "saved"}
              duration={380}
              style={{ height: 44 }}
              front={
                <Button
                  onClick={handleSubmit}
                  disabled={homeScore === "" || awayScore === "" || saveState === "saving"}
                  size="md" className="w-full h-full"
                  rightIcon={saveState === "saving" ? <BallLoader size="inline" label={null} /> : <Send size={15} />}
                >
                  {saveState === "saving" ? "Saving..." : "Lock in prediction"}
                </Button>
              }
              back={
                <div className="h-full flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-barlow font-bold" style={{ color: "var(--ac)", fontSize: 13, letterSpacing: "0.5px" }}>
                    <CheckCircle size={15} /> PREDICTION SAVED
                  </div>
                  <Button
                    type="button"
                    onClick={() => setSaveState("idle")}
                    variant="outline"
                    size="xs"
                    className={FOCUS_RING}
                  >
                    Edit
                  </Button>
                </div>
              }
            />
          )}
        </div>

      </div>
    </div>
  );
}

function ScoreDisplay({ value }: { value: string }) {
  return (
    <div
      className="flex items-center justify-center font-barlow font-black"
      style={{
        width: 46,
        height: 46,
        borderRadius: 10,
        background: "var(--sf)",
        border: "2px solid var(--ac)",
        color: "var(--sc)",
        fontSize: 26,
      }}
    >
      {value}
    </div>
  );
}
