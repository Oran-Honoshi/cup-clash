"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Share2, RotateCcw, Home, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateShareText } from "@/lib/trivia/session";
import type { TriviaSession } from "@/lib/trivia/session";
import { cn } from "@/lib/utils";

interface TriviaResultsProps {
  session: TriviaSession;
  groupName: string;
  isPointsMode: boolean;
  onPlayFree?: () => void;
  onHome: () => void;
}

// Grade thresholds
function getGrade(correct: number, total: number) {
  const pct = (correct / total) * 100;
  if (pct === 100) return { label: "Perfect! 🏆", color: "#D4AF37", emoji: "🏆" };
  if (pct >= 80)   return { label: "Oracle! 🔮",  color: "#22c55e", emoji: "🔮" };
  if (pct >= 60)   return { label: "Sharp! ⚽",   color: "#6ee7b7", emoji: "⚽" };
  if (pct >= 40)   return { label: "Getting there", color: "#f59e0b", emoji: "📚" };
  return               { label: "Keep studying", color: "#ef4444", emoji: "😅" };
}

export function TriviaResults({
  session,
  groupName,
  isPointsMode,
  onPlayFree,
  onHome,
}: TriviaResultsProps) {
  const [copied, setCopied] = useState(false);
  const confettiRef = useRef<boolean>(false);
  const grade = getGrade(session.correctCount, session.questions.length);

  // Launch confetti in Cup Clash brand colors
  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    const colors = ["#2A398D", "#E61D25", "#D4AF37", "#FFFFFF"];

    // Use indirect import string so TypeScript doesn't try to resolve the module
    const pkg = "canvas-confetti";
    import(/* webpackIgnore: true */ pkg as string)
      .then((mod: { default?: (opts: object) => void }) => {
        const confetti = mod.default;
        if (typeof confetti !== "function") return;
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors });
        setTimeout(() => confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors }), 300);
        setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors }), 500);
      })
      .catch(() => { /* not installed yet — skip */ });
  }, []);

  const handleShare = () => {
    const text = generateShareText(session, groupName);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const avgTime = session.results.length
    ? (session.totalTimeMs / session.results.length / 1000).toFixed(1)
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-md mx-auto text-center space-y-6 py-8"
    >
      {/* Grade emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
        className="text-7xl"
      >
        {grade.emoji}
      </motion.div>

      {/* Score */}
      <div>
        <div className="font-display text-7xl text-white leading-none">
          {session.correctCount}
          <span className="text-4xl text-pitch-400">/{session.questions.length}</span>
        </div>
        <div className="font-bold text-xl mt-2" style={{ color: grade.color }}>
          {grade.label}
        </div>
        {isPointsMode && (
          <div className="text-sm text-pitch-400 mt-1">
            +{session.score} points earned
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Correct",  value: session.correctCount,                          color: "text-success" },
          { label: "Wrong",    value: session.questions.length - session.correctCount, color: "text-danger" },
          { label: "Avg time", value: `${avgTime}s`,                                  color: "text-pitch-300" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl py-3">
            <div className={cn("font-display text-3xl", color)}>{value}</div>
            <div className="text-[10px] text-pitch-500 uppercase tracking-widest mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Answer breakdown */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {session.results.map((r, i) => (
          <motion.div
            key={r.questionId}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold",
              r.correct ? "bg-success/20 text-success" :
              r.selectedAnswer === null ? "bg-warning/20 text-warning" :
              "bg-danger/20 text-danger"
            )}
            title={`Q${i + 1}: ${r.correct ? "Correct" : r.selectedAnswer === null ? "Timeout" : "Wrong"}`}
          >
            {r.correct ? "✓" : r.selectedAnswer === null ? "⏱" : "✗"}
          </motion.div>
        ))}
      </div>

      {/* Trivia champion note */}
      {isPointsMode && (
        <div className="glass rounded-xl p-4 text-sm text-pitch-300">
          <Trophy size={16} className="inline-block mr-2" style={{ color: "#D4AF37" }} />
          Results submitted! The <strong className="text-white">Trivia Champion</strong> badge
          will be awarded when all group members have played.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button onClick={handleShare} variant="outline" size="md"
          leftIcon={<Share2 size={15} />}>
          {copied ? "Copied to clipboard!" : "Share my score"}
        </Button>

        {!isPointsMode && onPlayFree && (
          <Button onClick={onPlayFree} variant="outline" size="md"
            leftIcon={<RotateCcw size={15} />}>
            Play remaining questions
          </Button>
        )}

        <Button onClick={onHome} size="md" leftIcon={<Home size={15} />}>
          Back to dashboard
        </Button>
      </div>
    </motion.div>
  );
}