"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HelpCircle, Lock, Check, AlertCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/a11y";
import { PlayerPicker } from "@/components/predictions/player-picker";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { BallLoader } from "@/components/ui/BallLoader";

type QuestionType = "open_text" | "player_pick" | "team_pick" | "number";

interface BonusQuestion {
  id: string;
  question: string;
  question_type: QuestionType;
  points_awarded: number;
  is_resolved: boolean;
  correct_answer: string | null;
  lock_at: string | null;
}

interface BonusQuestionsProps {
  groupId: string;
  userId: string;
}

const glassCard = {
  background: "var(--sf)",
  border: "1px solid var(--br)",
  borderRadius: 22,
} as const;


// ── Country picker (simplified, no pts header) ─────────────────────────────
function BonusCountryPicker({ value, onSelect, isLocked }: { value: string; onSelect: (v: string) => void; isLocked: boolean }) {
  const [search, setSearch] = useState("");
  const filtered = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code ?? c.flagCode).toLowerCase().includes(search.toLowerCase())
  ).slice(0, 48);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mt)" }} />
        <input type="text" placeholder="Search country…" value={search}
          onChange={e => setSearch(e.target.value)} disabled={isLocked}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
          onFocus={e => { e.target.style.border = "1px solid var(--ac)"; }}
          onBlur={e => { e.target.style.border = "1px solid var(--br)"; }}
        />
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-40 overflow-y-auto">
        {filtered.map(c => {
          const isSelected = value === c.name;
          return (
            <button key={c.flagCode} type="button" title={c.name} aria-pressed={isSelected}
              disabled={isLocked} onClick={() => { onSelect(c.name); setSearch(""); }}
              className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all", isLocked && "opacity-40 cursor-not-allowed", FOCUS_RING)}
              style={isSelected
                ? { border: "1px solid var(--ac)", background: "rgba(0,207,128,0.12)" }
                : { border: "1px solid var(--br)", background: "var(--ip)" }}>
              <FlagBadge code={c.flagCode} label={c.name} size="sm" />
              <span className="text-[8px] font-bold truncate w-full text-center" style={{ color: "var(--t2)" }}>
                {(c.code ?? c.flagCode).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
      {value && <div className="text-xs font-bold" style={{ color: "var(--ac)" }}>✓ {value}</div>}
    </div>
  );
}


// ── Main component ─────────────────────────────────────────────────────────────
export function BonusQuestions({ groupId, userId }: BonusQuestionsProps) {
  const [questions, setQuestions] = useState<BonusQuestion[]>([]);
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState<Record<string, boolean>>({});
  const [saved,     setSaved]     = useState<Record<string, boolean>>({});
  const [error,     setError]     = useState<string | null>(null);

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const fetchQuestions = useCallback(() => {
    if (!groupId || groupId === "00000000-0000-0000-0000-000000000001") return;
    const sb = createClient();
    sb.from("bonus_questions")
      .select("id, question, question_type, points_awarded, is_resolved, correct_answer, lock_at")
      .eq("group_id", groupId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setQuestions(data as BonusQuestion[]);
      });
  }, [groupId]);

  useEffect(() => {
    if (!groupId || groupId === "00000000-0000-0000-0000-000000000001") return;
    fetchQuestions();

    const sb = createClient();
    const channel = sb
      .channel(`bonus_questions:${groupId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bonus_questions", filter: `group_id=eq.${groupId}` },
        () => { fetchQuestions(); })
      .subscribe();

    if (!userId) return () => { void sb.removeChannel(channel); };

    sb.from("bonus_answers")
      .select("question_id, answer")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          for (const row of data as Array<{ question_id: string; answer: string }>) {
            map[row.question_id] = row.answer;
          }
          setAnswers(map);
        }
      });

    return () => { void sb.removeChannel(channel); };
  }, [groupId, userId, fetchQuestions]);

  const saveAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!userId || !answer.trim()) return;
    setSaving(prev => ({ ...prev, [questionId]: true }));
    setError(null);
    const sb = createClient();
    const { error: saveErr } = await sb.from("bonus_answers").upsert({
      question_id: questionId,
      user_id:     userId,
      group_id:    groupId,
      answer:      answer.trim(),
      points_earned: 0,
    } as Record<string, unknown>, { onConflict: "question_id,user_id" });
    setSaving(prev => ({ ...prev, [questionId]: false }));
    if (saveErr) { setError(saveErr.message); return; }
    setSaved(prev => ({ ...prev, [questionId]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [questionId]: false })), 2000);
  }, [userId, groupId]);

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (saveTimers.current[questionId]) clearTimeout(saveTimers.current[questionId]);
    saveTimers.current[questionId] = setTimeout(() => saveAnswer(questionId, value), 800);
  };

  const activeQuestions = questions.filter(q => {
    if (q.lock_at && new Date() >= new Date(q.lock_at) && q.is_resolved) return false;
    return true;
  });

  if (!activeQuestions.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <HelpCircle size={16} style={{ color: "var(--ac)" }} />
          <span className="ta-match-label" style={{ color: "var(--ac)" }}>
            Bonus Questions
          </span>
        </div>
        <div className="p-6 text-center" style={glassCard}>
          <HelpCircle size={26} className="mx-auto mb-3" style={{ color: "var(--ft)" }} />
          <p className="text-sm font-bold mb-1" style={{ color: "var(--tx)" }}>No bonus questions yet</p>
          <p className="ta-body">
            Check back once your group admin sets them up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <HelpCircle size={16} style={{ color: "var(--ac)" }} />
        <span className="ta-match-label" style={{ color: "var(--ac)" }}>
          Bonus Questions
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "#dc2626" }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}

      {activeQuestions.map(q => {
        const isLocked = Boolean(q.lock_at && new Date() >= new Date(q.lock_at));
        const currentAnswer = answers[q.id] ?? "";
        const isSaving = saving[q.id] ?? false;
        const isSaved  = saved[q.id]  ?? false;

        return (
          <div key={q.id} className="p-5" style={glassCard}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="ta-body" style={{ color: "var(--tx)" }}>
                {q.question}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,207,128,0.1)", color: "var(--ac)", border: "1px solid rgba(0,207,128,0.25)", fontFamily: "var(--font-mono)" }}>
                  +{q.points_awarded} pts
                </span>
                {isLocked && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(217,119,6,0.08)", color: "#d97706", border: "1px solid rgba(217,119,6,0.2)" }}>
                    <Lock size={9} /> Locked
                  </span>
                )}
              </div>
            </div>

            {q.is_resolved ? (
              <div className="rounded-xl px-4 py-3" style={{ background: "rgba(0,207,128,0.06)", border: "1px solid rgba(0,207,128,0.2)" }}>
                <div className="ta-section-label mb-1">Correct answer</div>
                <div className="font-bold text-sm" style={{ color: "var(--ac)" }}>{q.correct_answer}</div>
                {currentAnswer && (
                  <div className="ta-meta mt-1">
                    Your answer: {currentAnswer}
                    {currentAnswer.trim().toLowerCase() === (q.correct_answer ?? "").trim().toLowerCase()
                      ? <span className="ml-2 font-bold" style={{ color: "var(--ac)" }}>✓ +{q.points_awarded} pts</span>
                      : <span className="ml-2" style={{ color: "#f87171" }}>✗</span>}
                  </div>
                )}
              </div>
            ) : (
              <>
                {q.question_type === "team_pick" && (
                  <BonusCountryPicker value={currentAnswer} onSelect={v => updateAnswer(q.id, v)} isLocked={isLocked} />
                )}
                {q.question_type === "player_pick" && (
                  <PlayerPicker value={currentAnswer} onSelect={v => updateAnswer(q.id, v)} isLocked={isLocked} includeGK={true} />
                )}
                {q.question_type === "number" && (
                  <input
                    type="number" min={0} max={999}
                    value={currentAnswer}
                    onChange={e => updateAnswer(q.id, e.target.value)}
                    placeholder="Enter a number…"
                    disabled={isLocked}
                    className="ta-score w-full rounded-xl px-4 py-3 outline-none disabled:opacity-40"
                    style={{ fontSize: 20, textAlign: "left", background: "var(--ip)", border: "1px solid var(--br)" }}
                    onFocus={e => { e.target.style.borderColor = "var(--ac)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--br)"; }}
                  />
                )}
                {q.question_type === "open_text" && (
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={e => updateAnswer(q.id, e.target.value)}
                    placeholder="Type your answer…"
                    disabled={isLocked}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-40"
                    style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
                    onFocus={e => { e.target.style.borderColor = "var(--ac)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--br)"; }}
                  />
                )}

                {!isLocked && (isSaving || isSaved) && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold"
                    style={{ color: isSaved ? "var(--ac)" : "var(--mt)" }}>
                    {isSaving ? <BallLoader size="inline" label={null} /> : <Check size={11} />}
                    {isSaving ? "Saving…" : "Answer saved ✓"}
                  </div>
                )}

                {q.lock_at && !isLocked && (
                  <div className="flex items-center gap-1.5 mt-2 ta-meta">
                    <Lock size={10} />
                    Locks {new Date(q.lock_at).toLocaleString("en-GB")}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <p className="ta-body text-center">
        ✓ Answers save automatically
      </p>
    </div>
  );
}
