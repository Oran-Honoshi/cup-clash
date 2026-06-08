"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HelpCircle, Lock, Check, AlertCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/a11y";

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
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: 22,
} as const;

const KNOWN_PLAYERS = [
  { name: "Kylian Mbappé",      team: "France",         flagCode: "fr"     },
  { name: "Erling Haaland",     team: "Norway",         flagCode: "no"     },
  { name: "Lionel Messi",       team: "Argentina",      flagCode: "ar"     },
  { name: "Vinícius Jr.",       team: "Brazil",         flagCode: "br"     },
  { name: "Harry Kane",         team: "England",        flagCode: "gb-eng" },
  { name: "Lamine Yamal",       team: "Spain",          flagCode: "es"     },
  { name: "Rodri",              team: "Spain",          flagCode: "es"     },
  { name: "Raphinha",           team: "Brazil",         flagCode: "br"     },
  { name: "Leroy Sané",         team: "Germany",        flagCode: "de"     },
  { name: "Bruno Fernandes",    team: "Portugal",       flagCode: "pt"     },
  { name: "Kevin De Bruyne",    team: "Belgium",        flagCode: "be"     },
  { name: "Jamal Musiala",      team: "Germany",        flagCode: "de"     },
  { name: "Pedri",              team: "Spain",          flagCode: "es"     },
  { name: "Florian Wirtz",      team: "Germany",        flagCode: "de"     },
  { name: "Phil Foden",         team: "England",        flagCode: "gb-eng" },
  { name: "Bernardo Silva",     team: "Portugal",       flagCode: "pt"     },
  { name: "Federico Valverde",  team: "Uruguay",        flagCode: "uy"     },
  { name: "Bukayo Saka",        team: "England",        flagCode: "gb-eng" },
  { name: "Jude Bellingham",    team: "England",        flagCode: "gb-eng" },
  { name: "Antoine Griezmann",  team: "France",         flagCode: "fr"     },
];

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
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
        <input type="text" placeholder="Search country…" value={search}
          onChange={e => setSearch(e.target.value)} disabled={isLocked}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          onFocus={e => { e.target.style.border = "1px solid #00D4FF"; }}
          onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; }}
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
                ? { border: "1px solid rgba(0,255,136,0.4)", background: "rgba(0,255,136,0.1)" }
                : { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <img src={`/flags/${c.flagCode}.svg`} alt={c.name} className="w-7 h-4 object-cover rounded-sm"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="text-[8px] font-bold truncate w-full text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                {(c.code ?? c.flagCode).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
      {value && <div className="text-xs font-bold" style={{ color: "#0891B2" }}>✓ {value}</div>}
    </div>
  );
}

// ── Player picker (simplified) ─────────────────────────────────────────────
function BonusPlayerPicker({ value, onSelect, isLocked }: { value: string; onSelect: (v: string) => void; isLocked: boolean }) {
  const [search, setSearch] = useState("");
  const filtered = KNOWN_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.team.toLowerCase().includes(search.toLowerCase())
  );
  const showCustom = search.length > 1 && !filtered.some(p => p.name.toLowerCase() === search.toLowerCase());

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
        <input type="text" placeholder="Search or type player name…" value={search}
          onChange={e => setSearch(e.target.value)} disabled={isLocked}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          onFocus={e => { e.target.style.border = "1px solid #00D4FF"; }}
          onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; }}
        />
      </div>
      {search.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="max-h-40 overflow-y-auto">
            {filtered.map(player => {
              const active = value === player.name;
              return (
                <button key={player.name} type="button" disabled={isLocked}
                  onClick={() => { onSelect(player.name); setSearch(""); }}
                  className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 border-b last:border-0 text-left transition-all", isLocked && "opacity-40 cursor-not-allowed", FOCUS_RING)}
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: active ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.04)" }}>
                  <img src={`/flags/${player.flagCode}.svg`} alt={player.team} className="w-6 h-4 object-cover rounded-sm shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{player.name}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{player.team}</div>
                  </div>
                  {active && <Check size={13} style={{ color: "#0891B2" }} />}
                </button>
              );
            })}
            {showCustom && (
              <button type="button"
                onClick={() => { onSelect(search); setSearch(""); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all ${FOCUS_RING}`}
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <span style={{ color: "#0891B2", fontSize: 10 }}>+</span>
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Use &quot;{search}&quot;</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Custom player pick</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
      {value && <div className="text-xs font-bold" style={{ color: "#0891B2" }}>✓ {value}</div>}
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

  if (!activeQuestions.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <HelpCircle size={16} style={{ color: "#00D4FF" }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#00D4FF" }}>
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
              <div className="font-display text-lg uppercase font-black text-white leading-snug">
                {q.question}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)", fontFamily: "var(--font-mono)" }}>
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
              <div className="rounded-xl px-4 py-3" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Correct answer</div>
                <div className="font-bold text-sm" style={{ color: "#00FF88" }}>{q.correct_answer}</div>
                {currentAnswer && (
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Your answer: {currentAnswer}
                    {currentAnswer.trim().toLowerCase() === (q.correct_answer ?? "").trim().toLowerCase()
                      ? <span className="ml-2 font-bold" style={{ color: "#00FF88" }}>✓ +{q.points_awarded} pts</span>
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
                  <BonusPlayerPicker value={currentAnswer} onSelect={v => updateAnswer(q.id, v)} isLocked={isLocked} />
                )}
                {q.question_type === "number" && (
                  <input
                    type="number" min={0} max={999}
                    value={currentAnswer}
                    onChange={e => updateAnswer(q.id, e.target.value)}
                    placeholder="Enter a number…"
                    disabled={isLocked}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                    onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
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
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                    onFocus={e => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  />
                )}

                {!isLocked && (isSaving || isSaved) && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold"
                    style={{ color: isSaved ? "#00FF88" : "rgba(255,255,255,0.4)" }}>
                    {isSaving ? <span className="animate-spin">⟳</span> : <Check size={11} />}
                    {isSaving ? "Saving…" : "Answer saved ✓"}
                  </div>
                )}

                {q.lock_at && !isLocked && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    <Lock size={10} />
                    Locks {new Date(q.lock_at).toLocaleString()}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
        ✓ Answers save automatically
      </p>
    </div>
  );
}
