"use client";

import { useState, useEffect } from "react";
import { Lock, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { differenceInMinutes } from "date-fns";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface NextMatchCardProps {
  match: Match;
  groupId?: string;
}

type SaveState = "idle" | "saving" | "saved" | "error" | "locked";

interface PredictionRow {
  home_score: number | null;
  away_score: number | null;
}

export function NextMatchCard({ match, groupId = "grp_titans" }: NextMatchCardProps) {
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const matchDate = new Date(match.time);
  const formattedTime = formatInTimeZone(matchDate, "UTC", "EEE dd MMM · HH:mm 'UTC'");
  const minutesToKickoff = differenceInMinutes(matchDate, new Date());
  const isLocked = minutesToKickoff <= 5;

  useEffect(() => {
    async function loadExisting() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("predictions")
        .select("home_score, away_score")
        .eq("user_id", user.id)
        .eq("group_id", groupId)
        .eq("match_id", match.id)
        .eq("pred_type", "match")
        .maybeSingle();

      if (data) {
        const row = data as PredictionRow;
        setHomeScore(String(row.home_score ?? ""));
        setAwayScore(String(row.away_score ?? ""));
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setSaveState("saved");
      return;
    }

    const supabase = getClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("Sign in to save predictions");
      setSaveState("error");
      return;
    }

    const lockTime = new Date(matchDate.getTime() - 5 * 60 * 1000);
    const { error } = await supabase.from("predictions").upsert(
      {
        user_id:    user.id,
        group_id:   groupId,
        match_id:   match.id,
        pred_type:  "match",
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        locked_at:  lockTime.toISOString(),
      },
      { onConflict: "user_id,group_id,match_id,pred_type" }
    );

    if (error) {
      setErrorMsg(error.message);
      setSaveState("error");
      return;
    }
    setSaveState("saved");
  };

  return (
    <Card variant="glass-accent" className="overflow-hidden">
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgb(var(--accent) / 0.6), transparent)" }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="label-caps mb-0.5">Next Match</div>
            <div className="text-xs text-pitch-400 font-mono">{formattedTime}</div>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 border",
            isLocked ? "text-danger bg-danger/10 border-danger/20" : "text-pitch-400 bg-white/[0.04] border-white/[0.08]"
          )}>
            <Lock size={10} />
            {isLocked ? "Locked" : "Locks 5 min before"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={match.homeFlagCode ?? "un"} size="lg" />
            <span className="font-display text-xl uppercase text-white tracking-tight text-center">{match.home}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saveState === "saved" ? (
              <>
                <ScoreDisplay value={homeScore} />
                <span className="font-display text-2xl text-pitch-500">–</span>
                <ScoreDisplay value={awayScore} />
              </>
            ) : (
              <>
                <ScoreInput value={homeScore} onChange={setHomeScore} label={match.home} disabled={isLocked} />
                <span className="font-display text-2xl text-pitch-500">–</span>
                <ScoreInput value={awayScore} onChange={setAwayScore} label={match.away} disabled={isLocked} />
              </>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={match.awayFlagCode ?? "un"} size="lg" />
            <span className="font-display text-xl uppercase text-white tracking-tight text-center">{match.away}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-pitch-400">
          <span><span className="text-success font-bold">+10</span> correct outcome</span>
          <span className="opacity-30">·</span>
          <span><span style={{ color: "rgb(var(--accent-glow))" }} className="font-bold">+25</span> exact score</span>
        </div>

        {saveState === "error" && errorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-danger">
            <AlertCircle size={13} />{errorMsg}
          </div>
        )}

        <div className="mt-4">
          {saveState === "locked" ? (
            <div className="text-center text-xs font-bold uppercase tracking-widest text-pitch-500">Predictions locked</div>
          ) : saveState === "saved" ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-success">
                <CheckCircle size={15} />Prediction saved
              </div>
              <button onClick={() => setSaveState("idle")} className="text-xs text-pitch-500 hover:text-white transition-colors uppercase tracking-widest">Edit</button>
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
    </Card>
  );
}

function ScoreInput({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return (
    <input type="number" min="0" max="99" value={value} onChange={(e) => onChange(e.target.value)}
      placeholder="–" disabled={disabled} aria-label={`${label} score`}
      className={cn("w-14 h-14 text-center font-display text-3xl text-white rounded-xl bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent focus:bg-white/[0.1] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed")}
      style={{ caretColor: "rgb(var(--accent))" }}
    />
  );
}

function ScoreDisplay({ value }: { value: string }) {
  return (
    <div className="w-14 h-14 flex items-center justify-center font-display text-3xl text-white rounded-xl border"
      style={{ backgroundColor: "rgb(var(--accent) / 0.12)", borderColor: "rgb(var(--accent) / 0.4)", color: "rgb(var(--accent-glow))" }}>
      {value}
    </div>
  );
}
