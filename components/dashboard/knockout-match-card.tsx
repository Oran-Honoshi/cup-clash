"use client";

import { useState, useEffect } from "react";
import { Lock, Send, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
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

interface KnockoutMatchCardProps {
  match: Match & { isKnockout?: boolean };
  groupId?: string;
}

type SaveState = "idle" | "saving" | "saved" | "error" | "locked";

export function KnockoutMatchCard({ match, groupId = "grp_titans" }: KnockoutMatchCardProps) {
  const [homeScore,       setHomeScore]       = useState("");
  const [awayScore,       setAwayScore]       = useState("");
  const [advancementPick, setAdvancementPick] = useState<string | null>(null);
  const [saveState,       setSaveState]       = useState<SaveState>("idle");
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);

  const matchDate        = new Date(match.time);
  const formattedTime    = formatInTimeZone(matchDate, "UTC", "EEE dd MMM · HH:mm 'UTC'");
  const minutesToKickoff = differenceInMinutes(matchDate, new Date());
  const isLocked         = minutesToKickoff <= 5;

  useEffect(() => {
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
      const sb = getClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data } = await sb.from("predictions")
        .select("home_score, away_score, pred_value")
        .eq("user_id", user.id).eq("group_id", groupId)
        .eq("match_id", match.id).eq("pred_type", "match")
        .maybeSingle();

      if (data) {
        const d = data as { home_score: number | null; away_score: number | null; pred_value: string | null };
        setHomeScore(String(d.home_score ?? ""));
        setAwayScore(String(d.away_score ?? ""));
        setAdvancementPick(d.pred_value ?? null);
        setSaveState("saved");
      }
      if (isLocked) setSaveState("locked");
    }
    load();
  }, [match.id, groupId, isLocked]);

  const handleSubmit = async () => {
    if (homeScore === "" || awayScore === "" || isLocked) return;
    setSaveState("saving"); setErrorMsg(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { setSaveState("saved"); return; }

    const sb = getClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setErrorMsg("Sign in to save"); setSaveState("error"); return; }

    const lockTime = new Date(matchDate.getTime() - 5 * 60 * 1000);
    const { error } = await sb.from("predictions").upsert({
      user_id:   user.id,
      group_id:  groupId,
      match_id:  match.id,
      pred_type: "match",
      home_score: Number(homeScore),
      away_score: Number(awayScore),
      pred_value: advancementPick, // who advances
      locked_at:  lockTime.toISOString(),
    } as Record<string, unknown>, { onConflict: "user_id,group_id,match_id,pred_type" });

    if (error) { setErrorMsg(error.message); setSaveState("error"); return; }
    setSaveState("saved");
    window.dispatchEvent(new CustomEvent("cupclash:first_prediction"));
  };

  const canEdit = saveState === "saved" && !isLocked;

  return (
    <Card variant="glass-accent" className="overflow-hidden">
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgb(var(--accent)/0.6), transparent)" }} />
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="label-caps mb-0.5">Knockout Match</div>
            <div className="text-xs text-pitch-400 font-mono">{formattedTime}</div>
          </div>
          <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 border",
            isLocked ? "text-danger bg-danger/10 border-danger/20" : "text-pitch-400 bg-white/[0.04] border-white/[0.08]")}>
            <Lock size={10} />
            {isLocked ? "Locked" : "Locks 5 min before"}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <Flag code={match.homeFlagCode ?? "un"} size="lg" />
            <span className="font-display text-lg uppercase text-white text-center">{match.home}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canEdit ? (
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center font-display text-3xl text-white rounded-xl border"
                  style={{ backgroundColor: "rgb(var(--accent)/0.12)", borderColor: "rgb(var(--accent)/0.4)", color: "rgb(var(--accent-glow))" }}>
                  {homeScore}
                </div>
                <span className="font-display text-2xl text-pitch-500">–</span>
                <div className="w-12 h-12 flex items-center justify-center font-display text-3xl text-white rounded-xl border"
                  style={{ backgroundColor: "rgb(var(--accent)/0.12)", borderColor: "rgb(var(--accent)/0.4)", color: "rgb(var(--accent-glow))" }}>
                  {awayScore}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input type="number" min="0" max="99" value={homeScore} disabled={isLocked}
                  onChange={e => setHomeScore(e.target.value)} placeholder="–" aria-label={`${match.home} score`}
                  className="w-12 h-12 text-center font-display text-3xl text-white rounded-xl bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40" />
                <span className="font-display text-2xl text-pitch-500">–</span>
                <input type="number" min="0" max="99" value={awayScore} disabled={isLocked}
                  onChange={e => setAwayScore(e.target.value)} placeholder="–" aria-label={`${match.away} score`}
                  className="w-12 h-12 text-center font-display text-3xl text-white rounded-xl bg-white/[0.06] border border-white/[0.12] focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40" />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <Flag code={match.awayFlagCode ?? "un"} size="lg" />
            <span className="font-display text-lg uppercase text-white text-center">{match.away}</span>
          </div>
        </div>

        {/* Advancement pick — who goes through */}
        <div className="border-t border-white/[0.06] pt-4">
          <div className="label-caps mb-2.5 flex items-center gap-1.5">
            <ArrowRight size={11} /> Who advances? <span className="text-success ml-auto">+20 pts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { team: match.home, flagCode: match.homeFlagCode ?? "un" },
              { team: match.away, flagCode: match.awayFlagCode ?? "un" },
            ].map(({ team, flagCode }) => {
              const active = advancementPick === team;
              return (
                <button key={team} disabled={isLocked || canEdit}
                  onClick={() => setAdvancementPick(team)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all font-bold text-sm",
                    active ? "text-white" : "text-pitch-400 border-white/[0.08] bg-white/[0.02] hover:border-white/20",
                    (isLocked || canEdit) && "cursor-not-allowed opacity-60"
                  )}
                  style={active ? {
                    borderColor: "rgb(var(--accent)/0.5)",
                    backgroundColor: "rgb(var(--accent)/0.12)",
                    boxShadow: "0 0 12px rgb(var(--accent)/0.2)",
                  } : undefined}
                >
                  <Flag code={flagCode} size="sm" />
                  <span className="truncate uppercase tracking-wide">{team}</span>
                  {active && <CheckCircle size={14} className="ml-auto shrink-0" style={{ color: "rgb(var(--accent-glow))" }} />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-pitch-500 mt-2 text-center">
            Based on 90-min result · ET &amp; penalties don&apos;t affect your score prediction
          </p>
        </div>

        {/* Points hint */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-pitch-400">
          <span><span className="text-success font-bold">+10</span> correct 90-min outcome</span>
          <span className="opacity-30">·</span>
          <span><span style={{ color: "rgb(var(--accent-glow))" }} className="font-bold">+25</span> exact</span>
          <span className="opacity-30">·</span>
          <span><span className="text-success font-bold">+20</span> advancement</span>
        </div>

        {saveState === "error" && errorMsg && (
          <div className="flex items-center gap-2 text-xs text-danger"><AlertCircle size={13} />{errorMsg}</div>
        )}

        {/* Action */}
        {saveState === "locked" ? (
          <div className="text-center text-xs font-bold uppercase tracking-widest text-pitch-500">Predictions locked</div>
        ) : saveState === "saved" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-success">
              <CheckCircle size={15} /> Prediction saved
            </div>
            <button onClick={() => setSaveState("idle")} className="text-xs text-pitch-500 hover:text-white transition-colors uppercase tracking-widest">Edit</button>
          </div>
        ) : (
          <Button onClick={handleSubmit}
            disabled={homeScore === "" || awayScore === "" || !advancementPick || saveState === "saving"}
            size="md" className="w-full"
            rightIcon={saveState === "saving" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}>
            {saveState === "saving" ? "Saving..." : !advancementPick ? "Pick who advances ↑" : "Lock in prediction"}
          </Button>
        )}
      </div>
    </Card>
  );
}
