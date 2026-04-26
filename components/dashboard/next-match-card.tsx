"use client";

import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

interface NextMatchCardProps {
  match: Match;
}

export function NextMatchCard({ match }: NextMatchCardProps) {
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const matchDate = new Date(match.time);
  const formattedTime = formatInTimeZone(matchDate, "UTC", "EEE dd MMM · HH:mm 'UTC'");

  const handleSubmit = () => {
    if (homeScore !== "" && awayScore !== "") {
      setSubmitted(true);
    }
  };

  return (
    <Card variant="glass-accent" className="overflow-hidden">
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--accent) / 0.6), transparent)",
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="label-caps mb-0.5">Next Match</div>
            <div className="text-xs text-pitch-400 font-mono">{formattedTime}</div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pitch-400 bg-white/[0.04] rounded-full px-2.5 py-1 border border-white/[0.08]">
            <Lock size={10} />
            Locks 5 min before kickoff
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-4">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={match.homeFlagCode ?? "un"} size="lg" />
            <span className="font-display text-xl uppercase text-white tracking-tight text-center">
              {match.home}
            </span>
          </div>

          {/* Score input / result */}
          <div className="flex items-center gap-2 shrink-0">
            {submitted ? (
              <>
                <ScoreDisplay value={homeScore} />
                <span className="font-display text-2xl text-pitch-500">–</span>
                <ScoreDisplay value={awayScore} />
              </>
            ) : (
              <>
                <ScoreInput
                  value={homeScore}
                  onChange={setHomeScore}
                  label={match.home}
                />
                <span className="font-display text-2xl text-pitch-500">–</span>
                <ScoreInput
                  value={awayScore}
                  onChange={setAwayScore}
                  label={match.away}
                />
              </>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={match.awayFlagCode ?? "un"} size="lg" />
            <span className="font-display text-xl uppercase text-white tracking-tight text-center">
              {match.away}
            </span>
          </div>
        </div>

        {/* Points hint */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-pitch-400">
          <span className="flex items-center gap-1">
            <span className="text-success font-bold">+10</span> correct outcome
          </span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1">
            <span style={{ color: "rgb(var(--accent-glow))" }} className="font-bold">+25</span> exact score
          </span>
        </div>

        {/* Submit */}
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={homeScore === "" || awayScore === ""}
            size="md"
            className="w-full mt-4"
            rightIcon={<Send size={15} />}
          >
            Lock in prediction
          </Button>
        ) : (
          <div className="mt-4 text-center text-sm font-bold uppercase tracking-widest text-success">
            ✓ Prediction locked
          </div>
        )}
      </div>
    </Card>
  );
}

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <input
      type="number"
      min="0"
      max="99"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="–"
      aria-label={`${label} score`}
      className={cn(
        "w-14 h-14 text-center font-display text-3xl text-white rounded-xl",
        "bg-white/[0.06] border border-white/[0.12]",
        "focus:outline-none focus:border-accent focus:bg-white/[0.1]",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
        "transition-all duration-150"
      )}
      style={{
        caretColor: "rgb(var(--accent))",
      }}
    />
  );
}

function ScoreDisplay({ value }: { value: string }) {
  return (
    <div
      className="w-14 h-14 flex items-center justify-center font-display text-3xl text-white rounded-xl border"
      style={{
        backgroundColor: "rgb(var(--accent) / 0.12)",
        borderColor: "rgb(var(--accent) / 0.4)",
        color: "rgb(var(--accent-glow))",
      }}
    >
      {value}
    </div>
  );
}
