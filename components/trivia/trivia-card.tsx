"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TriviaQuestion } from "@/lib/trivia/questions";
import { SECONDS_PER_QUESTION } from "@/lib/trivia/questions";

interface TriviaCardProps {
  question: TriviaQuestion;
  questionNumber: number;
  totalQuestions: number;
  isPointsMode: boolean;
  onAnswer: (answer: string | null, timeUsed: number) => void;
}

export function TriviaCard({
  question,
  questionNumber,
  totalQuestions,
  isPointsMode,
  onAnswer,
}: TriviaCardProps) {
  const [selected,  setSelected]  = useState<string | null>(null);
  const [revealed,  setRevealed]  = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(SECONDS_PER_QUESTION);
  const [startTime, setStartTime] = useState(Date.now());

  // Reset state when question changes
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setTimeLeft(SECONDS_PER_QUESTION);
    setStartTime(Date.now());
  }, [question.id]);

  // Countdown timer (only in points mode)
  useEffect(() => {
    if (!isPointsMode || revealed) return;
    if (timeLeft <= 0) {
      // Time's up — auto-submit null
      const timeUsed = (Date.now() - startTime) / 1000;
      setRevealed(true);
      setTimeout(() => onAnswer(null, timeUsed), 1800);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, isPointsMode, revealed, onAnswer, startTime]);

  const handleSelect = useCallback((option: string) => {
    if (revealed || selected) return;
    const timeUsed = Math.min(
      SECONDS_PER_QUESTION,
      (Date.now() - startTime) / 1000
    );
    setSelected(option);
    setRevealed(true);

    // Auto-advance after showing the reveal
    const delay = isPointsMode ? 1800 : 2500;
    setTimeout(() => onAnswer(option, timeUsed), delay);
  }, [revealed, selected, startTime, isPointsMode, onAnswer]);

  const timerProgress = (timeLeft / SECONDS_PER_QUESTION) * 100;
  const timerColor =
    timeLeft > 4 ? "#22c55e" :
    timeLeft > 2 ? "#f59e0b" :
    "#ef4444";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Progress bar header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <span className="text-pitch-400">
            Question {questionNumber} of {totalQuestions}
          </span>
          {isPointsMode && (
            <span className="font-mono text-base" style={{ color: timerColor }}>
              {timeLeft}s
            </span>
          )}
        </div>

        {/* Timer progress bar */}
        {isPointsMode && (
          <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-colors duration-300"
              style={{ backgroundColor: timerColor }}
              animate={{ width: `${timerProgress}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        )}

        {/* Question progress dots */}
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div key={i}
              className={cn("h-1 flex-1 rounded-full transition-all",
                i < questionNumber - 1 ? "bg-success" :
                i === questionNumber - 1 ? "bg-white" :
                "bg-white/10")} />
          ))}
        </div>
      </div>

      {/* Category badge */}
      <div
        className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
        style={{ borderColor: "rgb(var(--accent)/0.3)", color: "rgb(var(--accent-glow))", backgroundColor: "rgb(var(--accent)/0.08)" }}
      >
        {question.category}
      </div>

      {/* Question text */}
      <h2 className="font-display text-2xl sm:text-3xl uppercase text-white leading-tight tracking-tight">
        {question.question}
      </h2>

      {/* Answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, i) => {
          const isCorrect = option === question.answer;
          const isSelected = option === selected;
          const isWrong = isSelected && !isCorrect;

          let bg = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-cyan-200";
          if (revealed && isCorrect) bg = "bg-success/20 border-success/60 text-white";
          else if (revealed && isWrong) bg = "bg-danger/20 border-danger/60 text-white";
          else if (revealed) bg = "bg-white/[0.03] border-white/[0.06] text-pitch-600";

          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={revealed}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "relative flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl border font-bold transition-all duration-200",
                bg,
                !revealed && "cursor-pointer active:scale-[0.98]",
                revealed && "cursor-default"
              )}
              style={revealed && isCorrect ? {
                boxShadow: "0 0 20px rgba(34,197,94,0.3)",
              } : undefined}
            >
              {/* Option letter */}
              <span className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                revealed && isCorrect ? "bg-success text-white" :
                revealed && isWrong ? "bg-danger text-white" :
                "bg-white/10 text-pitch-400"
              )}>
                {["A","B","C","D"][i]}
              </span>
              <span className="text-sm leading-tight">{option}</span>

              {/* Correct/Wrong indicator */}
              {revealed && (isCorrect || isWrong) && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-lg shrink-0"
                >
                  {isCorrect ? "✓" : "✗"}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation + image reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Image with zoom-in animation (from the brief) */}
            <div className="relative h-36 overflow-hidden">
              {question.imagePlaceholder?.startsWith("http") ? (
                // Real image URL
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img
                  src={question.imagePlaceholder}
                  alt={question.answer}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              ) : (
                // Placeholder for images not yet sourced
                <div className="h-full bg-gradient-to-br from-pitch-800 to-pitch-900 flex items-center justify-center">
                  <div className="text-center text-pitch-500 text-xs">
                    <span className="text-3xl">📸</span>
                    <div className="mt-1">{question.imagePlaceholder?.split("/").pop()}</div>
                  </div>
                </div>
              )}
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(17,29,39,0.9) 100%)" }} />
            </div>
            <div className="p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1">
                {selected === question.answer ? "✓ Correct!" : selected === null ? "⏱ Time's up!" : "✗ Incorrect"}
              </div>
              <p className="text-sm text-pitch-200 leading-relaxed">
                <strong className="text-white">{question.answer}</strong> — {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-points mode: tap to continue hint */}
      {!isPointsMode && !revealed && (
        <p className="text-center text-xs text-pitch-600">Tap an answer to continue</p>
      )}
    </div>
  );
}
