"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Zap, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TriviaCard } from "@/components/trivia/trivia-card";
import { TriviaResults } from "@/components/trivia/trivia-results";
import {
  getRandomQuestions, getRemainingQuestions,
  SECONDS_PER_QUESTION, POINTS_QUESTIONS,
} from "@/lib/trivia/questions";
import {
  createSession, recordAnswer,
  saveSession, loadSession, clearSession,
  type TriviaSession, type TriviaMode,
} from "@/lib/trivia/session";

type PageState = "landing" | "playing" | "results" | "free-playing" | "free-results";

interface TriviaPageClientProps {
  groupId: string;
  groupName: string;
  userId: string;
  isPointsMode: boolean;        // admin set trivia as bonus points
  triviaOpen: boolean;          // has admin opened the trivia window
  triviaOpenDate?: Date;        // when it opens (for countdown)
  hasPlayedForPoints: boolean;  // has this user already done the points round
}

export function TriviaPageClient({
  groupId,
  groupName,
  userId,
  isPointsMode,
  triviaOpen,
  triviaOpenDate,
  hasPlayedForPoints,
}: TriviaPageClientProps) {
  const router = useRouter();
  const [pageState, setPageState]     = useState<PageState>("landing");
  const [session,   setSession]       = useState<TriviaSession | null>(null);
  const [freeSession, setFreeSession] = useState<TriviaSession | null>(null);

  // Start the points round
  const startPointsRound = () => {
    const questions = getRandomQuestions(POINTS_QUESTIONS);
    const s = createSession(groupId, userId, questions, "points");
    setSession(s);
    setPageState("playing");
  };

  // Start the free-play round (remaining questions)
  const startFreePlay = () => {
    const playedIds = session?.results.map(r => r.questionId) ?? [];
    const remaining = getRemainingQuestions(playedIds);
    if (remaining.length === 0) return;

    // Try to load a paused session
    const saved = loadSession(groupId, userId, "free");
    const s = saved ?? createSession(groupId, userId, remaining, "free");
    setFreeSession(s);
    setPageState("free-playing");
  };

  // Handle an answer in the points round
  const handleAnswer = useCallback((answer: string | null, timeUsed: number) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = recordAnswer(prev, answer, timeUsed);
      if (updated.status === "finished") {
        setTimeout(() => setPageState("results"), 300);
      }
      return updated;
    });
  }, []);

  // Handle an answer in free play
  const handleFreeAnswer = useCallback((answer: string | null, timeUsed: number) => {
    setFreeSession(prev => {
      if (!prev) return null;
      const updated = recordAnswer(prev, answer, timeUsed);
      saveSession(updated); // persist for pause/resume
      if (updated.status === "finished") {
        clearSession(groupId, userId, "free");
        setTimeout(() => setPageState("free-results"), 300);
      }
      return updated;
    });
  }, [groupId, userId]);

  // Current question (points round)
  const currentQ = session?.questions[session.currentIndex];
  const freeQ    = freeSession?.questions[freeSession.currentIndex];

  // ── LANDING ──────────────────────────────────────────────────────────────
  if (pageState === "landing") {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center space-y-4 pt-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="text-6xl"
          >
            🧠
          </motion.div>
          <h1 className="font-display text-5xl sm:text-6xl uppercase text-white leading-[0.9] tracking-tight">
            Think you know
            <br />
            <span className="gradient-text">everything about</span>
            <br />
            the World Cup?
          </h1>
          <p className="text-pitch-300 text-lg max-w-md mx-auto leading-relaxed">
            20 Questions. {SECONDS_PER_QUESTION} seconds each.
            Glory is forever, but the clock is ticking.
            <strong className="text-white"> Prove it.</strong>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "❓", value: "20", label: "Questions" },
            { icon: "⏱",  value: `${SECONDS_PER_QUESTION}s`, label: "Per question" },
            { icon: "⭐", value: "20", label: "Max points" },
          ].map(({ icon, value, label }) => (
            <Card key={label} variant="glass" className="p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display text-3xl text-white">{value}</div>
              <div className="text-[10px] text-pitch-500 uppercase tracking-widest mt-0.5">{label}</div>
            </Card>
          ))}
        </div>

        {/* Trivia not open yet */}
        {isPointsMode && !triviaOpen && triviaOpenDate && (
          <Card variant="glass" className="p-5 text-center border border-warning/20 bg-warning/5">
            <Lock size={20} className="text-warning mx-auto mb-2" />
            <div className="font-bold text-warning">Trivia opens soon</div>
            <div className="text-pitch-400 text-sm mt-1">
              Your admin has scheduled the trivia to open on{" "}
              {triviaOpenDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.
            </div>
          </Card>
        )}

        {/* Already played for points */}
        {hasPlayedForPoints && isPointsMode && (
          <Card variant="glass" className="p-5 text-center border border-success/20 bg-success/5">
            <div className="text-2xl mb-1">✓</div>
            <div className="font-bold text-success">Points trivia complete!</div>
            <div className="text-pitch-400 text-sm mt-1">
              Your score has been submitted. Play the remaining questions for fun below.
            </div>
          </Card>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {isPointsMode && !hasPlayedForPoints && triviaOpen && (
            <Button onClick={startPointsRound} size="lg" className="w-full"
              leftIcon={<Zap size={18} />}>
              Start — Play for Points
            </Button>
          )}

          {(!isPointsMode || hasPlayedForPoints) && (
            <Button onClick={startFreePlay} variant={isPointsMode ? "outline" : "primary"}
              size="lg" className="w-full" leftIcon={<Play size={18} />}>
              {isPointsMode ? "Play remaining questions (for fun)" : "Start trivia"}
            </Button>
          )}
        </div>

        {/* Rules */}
        <div className="glass rounded-2xl p-5 space-y-3 text-sm text-pitch-300">
          <div className="font-bold text-white label-caps">How it works</div>
          {isPointsMode ? (
            <>
              <p>You have <strong className="text-white">one shot</strong> to earn up to 20 points — 1 point per correct answer.</p>
              <p>Each question has a <strong className="text-white">{SECONDS_PER_QUESTION}-second</strong> countdown. Answer before time runs out.</p>
              <p>After the points round, you can play the remaining questions for fun (pausable, no effect on scores).</p>
              <p>The <strong className="text-white">Trivia Champion 🏆</strong> badge goes to the member with the most correct answers. Ties are broken by total answer time.</p>
            </>
          ) : (
            <>
              <p>Answer 20 random World Cup questions. No time limit pressure — go at your own pace.</p>
              <p>You can pause and come back anytime. Your progress is saved.</p>
              <p>After finishing, you get an answer sheet showing all correct answers.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── PLAYING (points round) ────────────────────────────────────────────────
  if (pageState === "playing" && session && currentQ) {
    return (
      <div className="min-h-screen py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <TriviaCard
              question={currentQ}
              questionNumber={session.currentIndex + 1}
              totalQuestions={session.questions.length}
              isPointsMode={true}
              onAnswer={handleAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── RESULTS (points round) ────────────────────────────────────────────────
  if (pageState === "results" && session) {
    return (
      <TriviaResults
        session={session}
        groupName={groupName}
        isPointsMode={true}
        onPlayFree={startFreePlay}
        onHome={() => router.push("/dashboard")}
      />
    );
  }

  // ── FREE PLAYING ──────────────────────────────────────────────────────────
  if (pageState === "free-playing" && freeSession && freeQ) {
    return (
      <div className="min-h-screen py-8">
        <div className="mb-4 flex items-center justify-between max-w-2xl mx-auto">
          <div className="text-xs text-pitch-500 uppercase tracking-widest">
            Free play — no points
          </div>
          <button
            onClick={() => {
              if (freeSession) saveSession(freeSession);
              setPageState("landing");
            }}
            className="text-xs text-pitch-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Pause & save →
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={freeQ.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <TriviaCard
              question={freeQ}
              questionNumber={freeSession.currentIndex + 1}
              totalQuestions={freeSession.questions.length}
              isPointsMode={false}
              onAnswer={handleFreeAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── FREE RESULTS ──────────────────────────────────────────────────────────
  if (pageState === "free-results" && freeSession) {
    return (
      <TriviaResults
        session={freeSession}
        groupName={groupName}
        isPointsMode={false}
        onHome={() => router.push("/dashboard")}
      />
    );
  }

  return null;
}
