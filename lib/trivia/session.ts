/**
 * Trivia Session Engine
 * Handles all state transitions for a trivia game session.
 * Designed to work both for points mode and free-play mode.
 */

import type { TriviaQuestion } from "./questions";

export type TriviaMode = "points" | "free";
export type SessionStatus = "waiting" | "active" | "paused" | "finished";

export interface QuestionResult {
  questionId: string;
  selectedAnswer: string | null;  // null = time ran out
  correct: boolean;
  timeUsed: number;               // seconds taken to answer (for tie-breaking)
  points: number;
}

export interface TriviaSession {
  sessionId: string;
  groupId: string;
  userId: string;
  mode: TriviaMode;
  questions: TriviaQuestion[];
  currentIndex: number;
  results: QuestionResult[];
  status: SessionStatus;
  startedAt: number;              // timestamp
  totalTimeMs: number;            // total time taken (for tie-breaking)
  score: number;
  correctCount: number;
}

export function createSession(
  groupId: string,
  userId: string,
  questions: TriviaQuestion[],
  mode: TriviaMode
): TriviaSession {
  return {
    sessionId: `${userId}-${groupId}-${Date.now()}`,
    groupId,
    userId,
    mode,
    questions,
    currentIndex: 0,
    results: [],
    status: "active",
    startedAt: Date.now(),
    totalTimeMs: 0,
    score: 0,
    correctCount: 0,
  };
}

export function recordAnswer(
  session: TriviaSession,
  answer: string | null,
  timeUsed: number
): TriviaSession {
  const q = session.questions[session.currentIndex];
  if (!q) return session;

  const correct = answer === q.answer;
  const points = correct ? 1 : 0;

  const result: QuestionResult = {
    questionId: q.id,
    selectedAnswer: answer,
    correct,
    timeUsed,
    points,
  };

  const newResults = [...session.results, result];
  const isLast = session.currentIndex >= session.questions.length - 1;

  return {
    ...session,
    results: newResults,
    currentIndex: isLast ? session.currentIndex : session.currentIndex + 1,
    status: isLast ? "finished" : "active",
    score: session.score + points,
    correctCount: session.correctCount + (correct ? 1 : 0),
    totalTimeMs: session.totalTimeMs + (timeUsed * 1000),
  };
}

export function pauseSession(session: TriviaSession): TriviaSession {
  return { ...session, status: "paused" };
}

export function resumeSession(session: TriviaSession): TriviaSession {
  return { ...session, status: "active" };
}

/**
 * Serialize session to localStorage for persistence (free-play mode).
 */
export function saveSession(session: TriviaSession): void {
  try {
    const key = `trivia_session_${session.groupId}_${session.userId}_${session.mode}`;
    localStorage.setItem(key, JSON.stringify(session));
  } catch { /* ignore */ }
}

export function loadSession(groupId: string, userId: string, mode: TriviaMode): TriviaSession | null {
  try {
    const key = `trivia_session_${groupId}_${userId}_${mode}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as TriviaSession;
  } catch { return null; }
}

export function clearSession(groupId: string, userId: string, mode: TriviaMode): void {
  try {
    const key = `trivia_session_${groupId}_${userId}_${mode}`;
    localStorage.removeItem(key);
  } catch { /* ignore */ }
}

/**
 * Generate a shareable result string (Wordle-style).
 */
export function generateShareText(session: TriviaSession, groupName: string): string {
  const emojis = session.results.map(r => r.correct ? "🟩" : "🟥").join("");
  return [
    `🏆 Cup Clash Trivia — ${groupName}`,
    `${session.correctCount}/${session.questions.length} correct`,
    emojis,
    `cupclash.com`,
  ].join("\n");
}
