"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CheckCircle2, XCircle, Lock, ArrowUp, ArrowDown, Check, Minus, Plus } from "lucide-react";
import { BallLoader } from "@/components/ui/BallLoader";
import { CrestSilhouette } from "@/components/ui/crest-silhouette";
import { loadLocalScoreAttempt, saveLocalScoreAttempt } from "@/lib/score-challenge-storage";

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;
const GREEN = "#00c46a";

type NumberFeedback = "correct" | "too_high" | "too_low";
type ClueField = "year" | "homeTeam" | "awayTeam";
type TeamKind = "club" | "national";
type TeamBadgeClue = { url: string; kind: TeamKind };

type ClueState = {
  cluesUnlocked: ClueField[];
  values: { year?: number; homeTeam?: TeamBadgeClue; awayTeam?: TeamBadgeClue };
};

type ScoreGuessRecord = { home: number; away: number; home_feedback: NumberFeedback; away_feedback: NumberFeedback };

type TodayResponse = {
  challengeDate: string;
  competition: string;
  stage: string;
  tryLimit: number;
  clueState: ClueState;
  attempt: {
    guessCount: number;
    solved: boolean;
    outOfTries: boolean;
    guesses: ScoreGuessRecord[];
    homeLocked: boolean;
    awayLocked: boolean;
  } | null;
};

type Reveal = { competition: string; stage: string; year: number; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number };

type GuessResponse = {
  correct: boolean;
  solved: boolean;
  outOfTries: boolean;
  guessCount: number;
  clueState: ClueState;
  homeFeedback: NumberFeedback;
  awayFeedback: NumberFeedback;
  homeLocked: boolean;
  awayLocked: boolean;
  reveal: Reveal | null;
};

const CLUE_LABELS: Record<ClueField, string> = { year: "Year", homeTeam: "Home Team", awayTeam: "Away Team" };

function deriveLock(guesses: ScoreGuessRecord[]): { home: boolean; away: boolean } {
  return {
    home: guesses.some((g) => g.home_feedback === "correct"),
    away: guesses.some((g) => g.away_feedback === "correct"),
  };
}

function FeedbackIcon({ feedback }: { feedback: NumberFeedback }) {
  if (feedback === "correct") return <Check size={12} style={{ color: GREEN }} />;
  if (feedback === "too_high") return <ArrowDown size={12} style={{ color: "#f87171" }} />;
  return <ArrowUp size={12} style={{ color: "#f87171" }} />;
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="flex items-center justify-center h-8 w-8 rounded-lg" style={{ background: "var(--ip)" }}>
          <Minus size={14} style={{ color: "var(--tx)" }} />
        </button>
        <span className="text-2xl font-black w-8 text-center" style={{ color: "var(--tx)" }}>{value}</span>
        <button type="button" onClick={() => onChange(Math.min(19, value + 1))}
          className="flex items-center justify-center h-8 w-8 rounded-lg" style={{ background: "var(--ip)" }}>
          <Plus size={14} style={{ color: "var(--tx)" }} />
        </button>
      </div>
    </div>
  );
}

// Same visual language as a correct Wordle tile — a side that's been
// guessed exactly right locks in green and stops being editable.
function LockedScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black w-8 text-center" style={{ color: GREEN }}>{value}</span>
        <Check size={16} style={{ color: GREEN }} />
      </div>
    </div>
  );
}

export function GuessTheScoreClient({ userId }: { userId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [guesses, setGuesses] = useState<ScoreGuessRecord[]>([]);
  const [guessCount, setGuessCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [outOfTries, setOutOfTries] = useState(false);
  const [homeLocked, setHomeLocked] = useState(false);
  const [awayLocked, setAwayLocked] = useState(false);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [homeGuess, setHomeGuess] = useState(1);
  const [awayGuess, setAwayGuess] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const completed = solved || outOfTries;

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/score-challenge");
      const data = (await res.json()) as TodayResponse;

      if (!userId) {
        const local = loadLocalScoreAttempt(data.challengeDate);
        const wrongCount = local.guesses.filter(g => !g.correct).length;
        if (local.guesses.length > 0) {
          const refetch = await fetch(`/api/score-challenge?wrongGuesses=${wrongCount}`);
          const refreshed = (await refetch.json()) as TodayResponse;
          const mappedGuesses: ScoreGuessRecord[] = local.guesses.map(g => ({
            home: g.home,
            away: g.away,
            home_feedback: g.homeFeedback as NumberFeedback,
            away_feedback: g.awayFeedback as NumberFeedback,
          }));
          const lock = deriveLock(mappedGuesses);
          setToday(refreshed);
          setGuesses(mappedGuesses);
          setGuessCount(local.guesses.length);
          setSolved(lock.home && lock.away);
          setOutOfTries(!(lock.home && lock.away) && local.guesses.length >= refreshed.tryLimit);
          setHomeLocked(lock.home);
          setAwayLocked(lock.away);
          setLoading(false);
          return;
        }
      }

      setToday(data);
      if (data.attempt) {
        setGuesses(data.attempt.guesses);
        setGuessCount(data.attempt.guessCount);
        setSolved(data.attempt.solved);
        setOutOfTries(data.attempt.outOfTries);
        setHomeLocked(data.attempt.homeLocked);
        setAwayLocked(data.attempt.awayLocked);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const wrongGuessCount = guessCount - (solved ? 1 : 0);

  const homeLockedValue = useMemo(() => guesses.find(g => g.home_feedback === "correct")?.home, [guesses]);
  const awayLockedValue = useMemo(() => guesses.find(g => g.away_feedback === "correct")?.away, [guesses]);

  const handleGuess = useCallback(async () => {
    if (!today || completed || submitting) return;
    setSubmitting(true);
    try {
      const effectiveHome = homeLocked ? homeLockedValue! : homeGuess;
      const effectiveAway = awayLocked ? awayLockedValue! : awayGuess;
      const res = await fetch("/api/score-challenge/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeGuess: effectiveHome,
          awayGuess: effectiveAway,
          priorWrongGuesses: wrongGuessCount,
          homeLockedPrior: homeLocked,
          awayLockedPrior: awayLocked,
        }),
      });
      const data = (await res.json()) as GuessResponse;

      const record: ScoreGuessRecord = { home: effectiveHome, away: effectiveAway, home_feedback: data.homeFeedback, away_feedback: data.awayFeedback };
      setGuesses(prev => [...prev, record]);
      setGuessCount(data.guessCount);
      setSolved(data.solved);
      setOutOfTries(data.outOfTries);
      setHomeLocked(data.homeLocked);
      setAwayLocked(data.awayLocked);
      setReveal(data.reveal);
      setToday(prev => (prev ? { ...prev, clueState: data.clueState } : prev));

      if (!userId) {
        const local = loadLocalScoreAttempt(today.challengeDate);
        saveLocalScoreAttempt(today.challengeDate, {
          guesses: [...local.guesses, { home: effectiveHome, away: effectiveAway, homeFeedback: data.homeFeedback, awayFeedback: data.awayFeedback, correct: data.correct }],
        });
      }
    } finally {
      setSubmitting(false);
    }
  }, [today, completed, submitting, userId, homeGuess, awayGuess, wrongGuessCount, homeLocked, awayLocked, homeLockedValue, awayLockedValue]);

  const dots = useMemo(() => {
    if (!today) return [];
    return Array.from({ length: today.tryLimit }, (_, i) => {
      if (i < guessCount - (solved ? 1 : 0)) return "wrong" as const;
      if (i === guessCount - 1 && solved) return "correct" as const;
      return "empty" as const;
    });
  }, [today, guessCount, solved]);

  if (loading || !today) {
    return (
      <div className="py-16 flex justify-center">
        <BallLoader size="lg" label="Guess the Score" />
      </div>
    );
  }

  const clueOrder: ClueField[] = ["year", "homeTeam", "awayTeam"];
  const clueState = today.clueState;

  return (
    <div className="space-y-5">
      <div>
        <div className="label-caps mb-1">🎯 Guess the Score</div>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>
          Guess the Score
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--t2)" }}>
          One historic match. {today.tryLimit} tries. Nail the final scoreline.
        </p>
      </div>

      {/* Try counter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: "var(--t2)" }}>
          Try {Math.min(guessCount + (completed ? 0 : 1), today.tryLimit)} of {today.tryLimit}
        </span>
        <div className="flex gap-1.5">
          {dots.map((d, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full"
              style={{ background: d === "correct" ? GREEN : d === "wrong" ? "#f87171" : "var(--ip)" }} />
          ))}
        </div>
      </div>

      {/* Clues */}
      <div className="p-5 cc-elevated grid grid-cols-2 sm:grid-cols-4 gap-3" style={surface}>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>Match</span>
          <span className="text-sm font-bold" style={{ color: "var(--tx)" }}>{today.competition}</span>
          <span className="text-xs" style={{ color: "var(--t2)" }}>{today.stage}</span>
        </div>
        {clueOrder.map(clue => {
          const unlocked = clueState.cluesUnlocked.includes(clue);
          return (
            <div key={clue} className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>
                {CLUE_LABELS[clue]}
              </span>
              {!unlocked ? (
                <div className="flex items-center justify-center h-10 w-10 rounded-xl" style={{ background: "var(--ip)" }}>
                  <Lock size={14} style={{ color: "var(--t2)" }} />
                </div>
              ) : clue === "year" ? (
                <span className="text-sm font-bold" style={{ color: "var(--tx)" }}>{clueState.values.year ?? "—"}</span>
              ) : (
                <CrestSilhouette
                  url={clueState.values[clue]!.url}
                  className="h-10 w-10 rounded-xl"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Guess history */}
      {guesses.length > 0 && (
        <div className="space-y-1.5">
          {guesses.map((g, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "var(--ip)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--t2)" }}>#{i + 1}</span>
              <span className="flex items-center gap-1 text-sm font-bold" style={{ color: "var(--tx)" }}>
                {g.home} <FeedbackIcon feedback={g.home_feedback} />
              </span>
              <span className="text-xs" style={{ color: "var(--t2)" }}>–</span>
              <span className="flex items-center gap-1 text-sm font-bold" style={{ color: "var(--tx)" }}>
                {g.away} <FeedbackIcon feedback={g.away_feedback} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Guess input or completed state */}
      {!completed ? (
        <div className="p-5 cc-elevated space-y-4" style={surface}>
          <div className="flex items-center justify-center gap-6">
            {homeLocked ? (
              <LockedScore label="Home" value={homeLockedValue!} />
            ) : (
              <Stepper label="Home" value={homeGuess} onChange={setHomeGuess} />
            )}
            <span className="text-xl font-black" style={{ color: "var(--t2)" }}>–</span>
            {awayLocked ? (
              <LockedScore label="Away" value={awayLockedValue!} />
            ) : (
              <Stepper label="Away" value={awayGuess} onChange={setAwayGuess} />
            )}
          </div>
          <button
            type="button"
            onClick={handleGuess}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cc-elevated-interactive disabled:opacity-60"
            style={{ background: "var(--ac)", color: "#03110c" }}
          >
            {submitting ? <BallLoader size="sm" /> : "Submit Guess"}
          </button>
        </div>
      ) : (
        <div className="p-5 cc-elevated space-y-4" style={surface}>
          <div className="flex items-center gap-2">
            {solved ? <CheckCircle2 size={18} style={{ color: GREEN }} /> : <XCircle size={18} style={{ color: "#f87171" }} />}
            <span className="text-base font-black" style={{ color: "var(--tx)" }}>
              {solved ? "You got it!" : "Out of tries"}
            </span>
          </div>

          {reveal && (
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>
                {reveal.competition} — {reveal.stage}, {reveal.year}
              </div>
              <div className="text-lg font-black" style={{ color: "var(--tx)" }}>
                {reveal.homeTeam} {reveal.homeScore} – {reveal.awayScore} {reveal.awayTeam}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
