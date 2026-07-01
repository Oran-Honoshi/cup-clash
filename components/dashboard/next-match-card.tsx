"use client";

import { useState, useEffect } from "react";
import { Lock, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { differenceInMinutes } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NeonBar } from "@/components/ui/neon-bar";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { LiveDot } from "@/components/ui/live-dot";
import { FOCUS_RING } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

interface NextMatchCardProps {
  match:      Match;
  groupId?:   string;
  cardLabel?: string;
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

export function NextMatchCard({ match, groupId = "", cardLabel }: NextMatchCardProps) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);

  const matchDate        = new Date(match.time);
  const minutesToKickoff = differenceInMinutes(matchDate, new Date());

  const etFallback = formatInTimeZone(matchDate, "America/New_York", "EEE dd MMM · h:mm a 'ET'");
  const [formattedTime, setFormattedTime] = useState(etFallback);
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const d = matchDate;
    const dayStr  = d.toLocaleDateString("en", { timeZone: tz, weekday: "short", day: "2-digit", month: "short" });
    const timeStr = d.toLocaleTimeString("en", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });
    const tzAbbr  = new Intl.DateTimeFormat("en", { timeZoneName: "short", timeZone: tz })
      .formatToParts(d).find(p => p.type === "timeZoneName")?.value ?? "";
    setFormattedTime(`${dayStr} · ${timeStr} ${tzAbbr}`);
  }, [match.time]); // eslint-disable-line react-hooks/exhaustive-deps
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
    window.dispatchEvent(new CustomEvent("cupclash:first_prediction"));
  };

  return (
    <div
      className="w-full max-w-full overflow-hidden"
      style={{
        background: "var(--color-background-secondary)",
        border: "1px solid rgba(0,212,255,0.35)",
        borderRadius: "var(--border-radius-lg)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      {/* Top accent line */}
      <NeonBar gradient="linear-gradient(90deg,#00D4FF,#00FF88)" height={2.5} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-5">
          <div className="min-w-0">
            <div
              className="flex items-center gap-1.5 mb-0.5"
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#00D4FF",
                fontFamily: "var(--font-ui)",
              }}
            >
              {isLive && <LiveDot />}
              {cardLabel ?? (isLive ? "Live Match" : "Next Match")}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-ui)",
                marginBottom: 2,
              }}
            >
              {getStageLabel(match)}
            </div>
            <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }} suppressHydrationWarning>
              {formattedTime}
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap",
              isLocked
                ? "bg-red-500/15 border border-red-500/30 text-red-400"
                : "border text-slate-400"
            )}
            style={{
              marginTop: 1,
              ...(!isLocked ? { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" } : {}),
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
            <span className="font-display text-sm uppercase font-black text-center leading-tight text-white w-full truncate px-1">
              {match.home}
            </span>
          </div>

          {/* Score inputs */}
          <div className="flex items-center gap-1.5 flex-none">
            {saveState === "saved" ? (
              <>
                <ScoreDisplay value={homeScore} />
                <span className="font-barlow text-2xl font-black" style={{ color: "#1c4a1c" }}>–</span>
                <ScoreDisplay value={awayScore} />
              </>
            ) : (
              <>
                <ScoreInputCC value={homeScore} onChange={setHomeScore} disabled={isLocked} />
                <span className="font-barlow text-2xl font-black" style={{ color: "#1c4a1c" }}>–</span>
                <ScoreInputCC value={awayScore} onChange={setAwayScore} disabled={isLocked} />
              </>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 min-w-0 flex flex-col items-center gap-2">
            <FlagBadge code={awayFlagCode} size="md" />
            <span className="font-display text-sm uppercase font-black text-center leading-tight text-white w-full truncate px-1">
              {match.away}
            </span>
          </div>
        </div>

        {/* Points hint */}
        <div
          className="mt-4 flex items-center justify-center gap-4 font-barlow"
          style={{ color: "#3a7a3a", fontSize: 11, letterSpacing: "0.5px" }}
        >
          <span><span className="font-bold" style={{ color: "#5aaa6a" }}>+10</span> correct outcome</span>
          <span style={{ color: "#1c3a1c" }}>·</span>
          <span><span className="font-bold" style={{ color: "#00e5a0" }}>+25</span> exact score</span>
        </div>

        {saveState === "error" && errorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "#f87171" }}>
            <AlertCircle size={13} />{errorMsg}
          </div>
        )}

        {/* Action */}
        <div className="mt-4">
          {saveState === "locked" ? (
            <div
              className="text-center text-xs font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Predictions locked
            </div>
          ) : saveState === "saved" ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-barlow font-bold" style={{ color: "#00e5a0", fontSize: 13, letterSpacing: "0.5px" }}>
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
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={homeScore === "" || awayScore === "" || saveState === "saving"}
              size="md" className="w-full"
              rightIcon={saveState === "saving" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            >
              {saveState === "saving" ? "Saving..." : "Lock in prediction"}
            </Button>
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
        background: "#091808",
        border: "2px solid #00e5a0",
        color: "#00e5a0",
        fontSize: 26,
      }}
    >
      {value}
    </div>
  );
}
