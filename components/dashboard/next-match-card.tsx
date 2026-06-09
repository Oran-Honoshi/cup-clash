"use client";

import { useState, useEffect } from "react";
import { Lock, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { differenceInMinutes } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NeonBar } from "@/components/ui/neon-bar";
import { Flag } from "@/components/ui/flag";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { LiveDot } from "@/components/ui/live-dot";
import { FOCUS_RING } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

interface NextMatchCardProps {
  match:    Match;
  groupId?: string;
}

type SaveState = "idle" | "saving" | "saved" | "error" | "locked";

export function NextMatchCard({ match, groupId = "" }: NextMatchCardProps) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);

  const matchDate        = new Date(match.time);
  const formattedTime    = formatInTimeZone(matchDate, "America/New_York", "EEE dd MMM · h:mm a 'ET'");
  const minutesToKickoff = differenceInMinutes(matchDate, new Date());
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
      className="rounded-[22px] overflow-hidden"
      style={{
        background: "rgba(18,14,38,0.32)",
        border: "1px solid rgba(0,212,255,0.35)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      {/* Top accent line */}
      <NeonBar gradient="linear-gradient(90deg,#00D4FF,#00FF88)" height={2.5} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
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
              {isLive ? "Live Match" : "Next Match"}
            </div>
            <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
              {formattedTime}
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1",
              isLocked
                ? "bg-red-500/15 border border-red-500/30 text-red-400"
                : "border text-slate-400"
            )}
            style={!isLocked ? { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" } : undefined}
          >
            <Lock size={10} />
            {isLocked ? "Locked" : "Locks 5 min before"}
          </div>
        </div>

        {/* Teams + score inputs */}
        <div className="flex items-center gap-3">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={homeFlagCode} size="md" />
            <span className="font-display text-sm uppercase font-black text-center leading-tight text-white">
              {match.home}
            </span>
          </div>

          {/* Score inputs */}
          <div className="flex items-center gap-2 shrink-0">
            {saveState === "saved" ? (
              <>
                <ScoreDisplay value={homeScore} />
                <span className="font-display text-2xl font-black" style={{ color: "rgba(255,255,255,0.3)" }}>–</span>
                <ScoreDisplay value={awayScore} />
              </>
            ) : (
              <>
                <ScoreInputCC value={homeScore} onChange={setHomeScore} disabled={isLocked} />
                <span className="font-display text-2xl font-black" style={{ color: "rgba(255,255,255,0.3)" }}>–</span>
                <ScoreInputCC value={awayScore} onChange={setAwayScore} disabled={isLocked} />
              </>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={awayFlagCode} size="md" />
            <span className="font-display text-sm uppercase font-black text-center leading-tight text-white">
              {match.away}
            </span>
          </div>
        </div>

        {/* Points hint */}
        <div
          className="mt-4 flex items-center justify-center gap-4 text-[11px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <span><span className="font-bold" style={{ color: "#00FF88" }}>+10</span> correct outcome</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span><span className="font-bold" style={{ color: "#00D4FF" }}>+25</span> exact score</span>
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
              <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "#00FF88" }}>
                <CheckCircle size={15} /> Prediction saved
              </div>
              <button
                type="button"
                onClick={() => setSaveState("idle")}
                className={`text-xs uppercase tracking-widest transition-opacity hover:opacity-70 rounded ${FOCUS_RING}`}
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Edit
              </button>
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
      className="w-14 h-14 flex items-center justify-center font-display text-3xl font-black rounded-xl"
      style={{
        background: "rgba(0,255,136,0.08)",
        border: "1px solid rgba(0,255,136,0.3)",
        color: "#00FF88",
        boxShadow: "0 0 12px rgba(0,255,136,0.1)",
      }}
    >
      {value}
    </div>
  );
}
