"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Play, Lock } from "lucide-react";
import { TriviaCard } from "@/components/trivia/trivia-card";
import { TriviaResults } from "@/components/trivia/trivia-results";
import {
  getRandomQuestions, getRemainingQuestions,
  SECONDS_PER_QUESTION, POINTS_QUESTIONS,
} from "@/lib/trivia/questions";
import {
  createSession, recordAnswer, saveSession, loadSession, clearSession,
  type TriviaSession,
} from "@/lib/trivia/session";

type PageState = "landing" | "playing" | "results" | "free-playing" | "free-results";

interface TriviaPageClientProps {
  groupId:            string;
  groupName:          string;
  userId:             string;
  isPointsMode:       boolean;
  triviaOpen:         boolean;
  triviaOpenDate?:    Date;
  hasPlayedForPoints: boolean;
}

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
} as const;

export function TriviaPageClient({
  groupId, groupName, userId,
  isPointsMode, triviaOpen, triviaOpenDate, hasPlayedForPoints,
}: TriviaPageClientProps) {
  const router = useRouter();
  const [pageState,   setPageState]   = useState<PageState>("landing");
  const [session,     setSession]     = useState<TriviaSession | null>(null);
  const [freeSession, setFreeSession] = useState<TriviaSession | null>(null);

  const startPointsRound = () => {
    const questions = getRandomQuestions(POINTS_QUESTIONS);
    setSession(createSession(groupId, userId, questions, "points"));
    setPageState("playing");
  };

  const startFreePlay = () => {
    const playedIds = session?.results.map(r => r.questionId) ?? [];
    const remaining = getRemainingQuestions(playedIds);
    if (!remaining.length) return;
    const saved = loadSession(groupId, userId, "free");
    setFreeSession(saved ?? createSession(groupId, userId, remaining, "free"));
    setPageState("free-playing");
  };

  const handleAnswer = useCallback((answer: string | null, timeUsed: number) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = recordAnswer(prev, answer, timeUsed);
      if (updated.status === "finished") setTimeout(() => setPageState("results"), 300);
      return updated;
    });
  }, []);

  const handleFreeAnswer = useCallback((answer: string | null, timeUsed: number) => {
    setFreeSession(prev => {
      if (!prev) return null;
      const updated = recordAnswer(prev, answer, timeUsed);
      saveSession(updated);
      if (updated.status === "finished") {
        clearSession(groupId, userId, "free");
        setTimeout(() => setPageState("free-results"), 300);
      }
      return updated;
    });
  }, [groupId, userId]);

  const currentQ = session?.questions[session.currentIndex];
  const freeQ    = freeSession?.questions[freeSession.currentIndex];

  // ── LANDING ───────────────────────────────────────────────────────────────
  if (pageState === "landing") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center space-y-4 pt-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="text-6xl">🧠</motion.div>
          <h1 className="font-display text-5xl sm:text-6xl uppercase text-white leading-[0.9] tracking-tight">
            Think you know<br />
            <span style={{ color: "#00D4FF" }}>
              everything about
            </span><br />
            the World Cup?
          </h1>
          <p className="text-lg max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            20 Questions. {SECONDS_PER_QUESTION} seconds each.
            Glory is forever, but the clock is ticking.{" "}
            <strong className="text-white">Prove it.</strong>
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "❓", value: "20",              label: "Questions"    },
            { icon: "⏱",  value: `${SECONDS_PER_QUESTION}s`, label: "Per question" },
            { icon: "⭐", value: "100",             label: "Max points"   },
          ].map(({ icon, value, label }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={glass}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display text-3xl text-white font-black">{value}</div>
              <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Trivia not open yet */}
        {isPointsMode && !triviaOpen && triviaOpenDate && (
          <div className="rounded-2xl p-5 text-center"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <Lock size={20} className="mx-auto mb-2" style={{ color: "#fbbf24" }} />
            <div className="font-bold text-base" style={{ color: "#fbbf24" }}>Trivia opens soon</div>
            <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Your admin has scheduled the trivia to open on{" "}
              {triviaOpenDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.
            </div>
          </div>
        )}

        {/* Already played for points */}
        {hasPlayedForPoints && isPointsMode && (
          <div className="rounded-2xl p-5 text-center"
            style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
            <div className="text-2xl mb-1">✓</div>
            <div className="font-bold text-base" style={{ color: "#00FF88" }}>Points trivia complete!</div>
            <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Your score has been submitted. Play the remaining questions for fun below.
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {isPointsMode && !hasPlayedForPoints && triviaOpen && (
            <button onClick={startPointsRound}
              className="w-full flex items-center justify-center gap-2"
              style={{
                padding: "14px 24px", borderRadius: 14,
                background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                color: "#050810", fontSize: 15, fontWeight: 800,
                fontFamily: "var(--font-display)", textTransform: "uppercase",
                letterSpacing: "0.05em", cursor: "pointer", border: "none",
                boxShadow: "0 0 24px rgba(0,255,136,0.3)",
              }}>
              <Zap size={18} />Start — Play for Points
            </button>
          )}
          {(!isPointsMode || hasPlayedForPoints) && (
            <button onClick={startFreePlay}
              className="w-full flex items-center justify-center gap-2"
              style={isPointsMode ? {
                padding: "14px 24px", borderRadius: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 800,
                fontFamily: "var(--font-display)", textTransform: "uppercase" as const,
                letterSpacing: "0.05em", cursor: "pointer",
              } : {
                padding: "14px 24px", borderRadius: 14,
                background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                color: "#050810", fontSize: 15, fontWeight: 800,
                fontFamily: "var(--font-display)", textTransform: "uppercase" as const,
                letterSpacing: "0.05em", cursor: "pointer", border: "none",
                boxShadow: "0 0 24px rgba(0,255,136,0.3)",
              }}>
              <Play size={18} />{isPointsMode ? "Play remaining questions (for fun)" : "Start trivia"}
            </button>
          )}
        </div>

        {/* Rules card */}
        <div className="rounded-2xl p-5 space-y-3 text-sm" style={{ ...glass, color: "rgba(255,255,255,0.5)" }}>
          <div className="font-black text-white text-[10px] uppercase tracking-widest">How it works</div>
          {isPointsMode ? (
            <>
              <p>You have <strong className="text-white">one shot</strong> to earn up to 100 points — 5 points per correct answer.</p>
              <p>Each question has a <strong className="text-white">{SECONDS_PER_QUESTION}-second</strong> countdown. Answer before time runs out.</p>
              <p>After the points round, you can play the remaining questions for fun (pausable, no effect on scores).</p>
            </>
          ) : (
            <>
              <p>Answer 20 random World Cup questions. No time limit pressure — go at your own pace.</p>
              <p>You can pause and come back anytime. Your progress is saved.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (pageState === "playing" && session && currentQ) {
    return (
      <div className="py-2">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ.id}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <TriviaCard question={currentQ} questionNumber={session.currentIndex + 1}
              totalQuestions={session.questions.length} isPointsMode={true} onAnswer={handleAnswer} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (pageState === "results" && session) {
    return (
      <TriviaResults session={session} groupName={groupName} isPointsMode={true}
        onPlayFree={startFreePlay} onHome={() => router.push("/dashboard")} />
    );
  }

  // ── FREE PLAYING ──────────────────────────────────────────────────────────
  if (pageState === "free-playing" && freeSession && freeQ) {
    return (
      <div className="py-2">
        <div className="mb-4 flex items-center justify-between max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            Free play — no points
          </div>
          <button
            onClick={() => { if (freeSession) saveSession(freeSession); setPageState("landing"); }}
            className="text-xs uppercase tracking-widest transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            Pause &amp; save →
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={freeQ.id}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <TriviaCard question={freeQ} questionNumber={freeSession.currentIndex + 1}
              totalQuestions={freeSession.questions.length} isPointsMode={false} onAnswer={handleFreeAnswer} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── FREE RESULTS ──────────────────────────────────────────────────────────
  if (pageState === "free-results" && freeSession) {
    return (
      <TriviaResults session={freeSession} groupName={groupName} isPointsMode={false}
        onHome={() => router.push("/dashboard")} />
    );
  }

  return null;
}