"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Plus, Trash2, CheckCircle, Clock, Search, ChevronDown, ChevronUp } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ALL_COUNTRIES } from "@/lib/countries";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type QuestionType = "open_text" | "player_pick" | "team_pick";

interface BonusQuestion {
  id: string;
  question: string;
  question_type: QuestionType;
  points_awarded: number;
  correct_answer: string | null;
  is_resolved: boolean;
  lock_at: string | null;
  display_order: number;
  answer_count?: number;
}

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

const KNOWN_PLAYERS = [
  "Kylian Mbappé", "Erling Haaland", "Lionel Messi", "Vinícius Jr.", "Harry Kane",
  "Lamine Yamal", "Rodri", "Raphinha", "Leroy Sané", "Bruno Fernandes",
  "Kevin De Bruyne", "Jamal Musiala", "Pedri", "Florian Wirtz", "Phil Foden",
  "Bernardo Silva", "Federico Valverde", "Bukayo Saka", "Jude Bellingham",
];

interface BonusQuestionsAdminProps {
  groupId: string;
}

export function BonusQuestionsAdmin({ groupId }: BonusQuestionsAdminProps) {
  const [questions,    setQuestions]    = useState<BonusQuestion[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [adding,       setAdding]       = useState(false);
  const [resolveId,    setResolveId]    = useState<string | null>(null);
  const [resolveAnswer, setResolveAnswer] = useState("");
  const [resolving,    setResolving]    = useState(false);
  const [resolveResult, setResolveResult] = useState<{ correctCount: number; totalAnswers: number; pointsAwarded: number } | null>(null);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const [newQ, setNewQ] = useState({
    question:       "",
    question_type:  "open_text" as QuestionType,
    points_awarded: 10,
    lock_at:        "",
  });

  const loadQuestions = async () => {
    setLoading(true);
    const sb = getClient();
    const { data } = await sb
      .from("bonus_questions")
      .select("id, question, question_type, points_awarded, correct_answer, is_resolved, lock_at, display_order")
      .eq("group_id", groupId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!data) { setLoading(false); return; }

    // Get answer counts
    const ids = (data as BonusQuestion[]).map(q => q.id);
    let counts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: answerCounts } = await sb
        .from("bonus_answers")
        .select("question_id")
        .in("question_id", ids);
      if (answerCounts) {
        for (const row of answerCounts as Array<{ question_id: string }>) {
          counts[row.question_id] = (counts[row.question_id] ?? 0) + 1;
        }
      }
    }

    setQuestions((data as BonusQuestion[]).map(q => ({ ...q, answer_count: counts[q.id] ?? 0 })));
    setLoading(false);
  };

  useEffect(() => { loadQuestions(); }, [groupId]);

  const addQuestion = async () => {
    if (!newQ.question.trim()) return;
    setAdding(true);
    const sb = getClient();
    const { error } = await sb.from("bonus_questions").insert({
      group_id:       groupId,
      question:       newQ.question.trim(),
      question_type:  newQ.question_type,
      points_awarded: newQ.points_awarded,
      lock_at:        newQ.lock_at || null,
      display_order:  questions.length,
    } as Record<string, unknown>);

    if (!error) {
      setNewQ({ question: "", question_type: "open_text", points_awarded: 10, lock_at: "" });
      setSavedConfirm(true);
      setTimeout(() => setSavedConfirm(false), 1500);
      await loadQuestions();
    }
    setAdding(false);
  };

  const deleteQuestion = async (id: string) => {
    const sb = getClient();
    await sb.from("bonus_questions").delete().eq("id", id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const openResolve = (id: string) => {
    setResolveId(id);
    setResolveAnswer("");
    setResolveResult(null);
  };

  const submitResolve = async () => {
    if (!resolveId || !resolveAnswer.trim()) return;
    setResolving(true);
    const sb = getClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token ?? "";

    const res = await fetch("/api/admin/bonus-questions/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ questionId: resolveId, correctAnswer: resolveAnswer }),
    });
    const result = await res.json() as { success?: boolean; correctCount?: number; totalAnswers?: number; pointsAwarded?: number };
    if (result.success) {
      setResolveResult({ correctCount: result.correctCount ?? 0, totalAnswers: result.totalAnswers ?? 0, pointsAwarded: result.pointsAwarded ?? 0 });
      await loadQuestions();
    }
    setResolving(false);
  };

  const TYPE_LABELS: Record<QuestionType, string> = {
    open_text:   "Open text",
    player_pick: "Player pick",
    team_pick:   "Team pick",
  };

  const TYPE_COLORS: Record<QuestionType, string> = {
    open_text:   "#00D4FF",
    player_pick: "#fbbf24",
    team_pick:   "#00FF88",
  };

  const resolveQuestion = questions.find(q => q.id === resolveId);

  return (
    <div className="rounded-2xl p-5" style={{ ...glass, border: "1px solid rgba(0,212,255,0.2)" }}>
      <div className="flex items-center gap-2.5 mb-5">
        <HelpCircle size={18} strokeWidth={1.5} style={{ color: "#00D4FF" }} />
        <span className="font-display text-xl uppercase tracking-tight text-white">Bonus Questions</span>
      </div>

      {/* Create form */}
      <div className="rounded-xl p-4 mb-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
          Add Question
        </div>

        <input
          type="text"
          value={newQ.question}
          onChange={e => setNewQ(q => ({ ...q, question: e.target.value }))}
          placeholder='e.g. "Which team gets the most red cards?"'
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          onFocus={e => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
        />

        <div className="grid grid-cols-3 gap-2">
          {(["open_text", "player_pick", "team_pick"] as QuestionType[]).map(t => (
            <button key={t} type="button"
              onClick={() => setNewQ(q => ({ ...q, question_type: t }))}
              className="py-2 px-3 rounded-xl text-xs font-bold transition-all"
              style={newQ.question_type === t
                ? { background: `${TYPE_COLORS[t]}18`, border: `1px solid ${TYPE_COLORS[t]}40`, color: TYPE_COLORS[t] }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Points
            </label>
            <input
              type="number" min={1} max={1000}
              value={newQ.points_awarded}
              onChange={e => setNewQ(q => ({ ...q, points_awarded: Number(e.target.value) }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#00D4FF", fontWeight: "bold" }}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Lock date (optional)
            </label>
            <input
              type="datetime-local"
              value={newQ.lock_at}
              onChange={e => setNewQ(q => ({ ...q, lock_at: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
            />
          </div>
        </div>

        {savedConfirm ? (
          <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", color: "#00FF88" }}>
            ✅ Question saved!
          </div>
        ) : (
          <Button
            onClick={addQuestion}
            loading={adding}
            disabled={!newQ.question.trim()}
            size="sm"
            className="w-full"
            leftIcon={<Plus size={14} />}
          >
            Add Another
          </Button>
        )}
      </div>

      {/* Question list */}
      {loading ? (
        <div className="text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</div>
      ) : questions.length === 0 ? (
        <div className="text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>No questions yet</div>
      ) : (
        <div className="space-y-2">
          {questions.map(q => (
            <div key={q.id} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white leading-snug mb-1.5">{q.question}</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{ background: `${TYPE_COLORS[q.question_type]}12`, color: TYPE_COLORS[q.question_type], border: `1px solid ${TYPE_COLORS[q.question_type]}25` }}>
                      {TYPE_LABELS[q.question_type]}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: "#00D4FF" }}>+{q.points_awarded} pts</span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {q.answer_count ?? 0} answered
                    </span>
                    {q.lock_at && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                        <Clock size={10} /> Locks {new Date(q.lock_at).toLocaleDateString()}
                      </span>
                    )}
                    {q.is_resolved && (
                      <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#00FF88" }}>
                        <CheckCircle size={10} /> Resolved · {q.correct_answer}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!q.is_resolved && (
                    <button
                      onClick={() => openResolve(q.id)}
                      className="text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88" }}>
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve modal */}
      {resolveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(18,14,38,0.98)", border: "1px solid rgba(0,255,136,0.25)" }}>
            <div>
              <div className="font-display text-lg uppercase font-black text-white mb-1">Resolve Question</div>
              {resolveQuestion && (
                <div className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>{resolveQuestion.question}</div>
              )}
            </div>

            {resolveResult ? (
              <div className="rounded-xl p-4 text-center space-y-2"
                style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
                <div className="text-3xl font-black" style={{ color: "#00FF88" }}>
                  {resolveResult.correctCount}/{resolveResult.totalAnswers}
                </div>
                <div className="text-sm font-bold text-white">members got it right</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {resolveResult.pointsAwarded} pts awarded to each correct answer
                </div>
                <Button onClick={() => setResolveId(null)} size="sm" className="w-full mt-2">Done</Button>
              </div>
            ) : (
              <>
                {resolveQuestion?.question_type === "team_pick" ? (
                  <TeamSelect value={resolveAnswer} onChange={setResolveAnswer} />
                ) : resolveQuestion?.question_type === "player_pick" ? (
                  <PlayerSelect value={resolveAnswer} onChange={setResolveAnswer} />
                ) : (
                  <input
                    type="text"
                    value={resolveAnswer}
                    onChange={e => setResolveAnswer(e.target.value)}
                    placeholder="Enter correct answer…"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                    onFocus={e => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  />
                )}
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Members whose answers match (case-insensitive) will each receive {resolveQuestion?.points_awarded ?? 0} points.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setResolveId(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                    Cancel
                  </button>
                  <button
                    onClick={submitResolve}
                    disabled={resolving || !resolveAnswer.trim()}
                    className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                    style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88" }}>
                    {resolving ? "Awarding…" : "Award Points"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline selectors for resolve modal ──────────────────────────────────────

function TeamSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 24);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
        <input type="text" placeholder="Search team…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
        />
      </div>
      <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto">
        {filtered.map(c => (
          <button key={c.flagCode} type="button" title={c.name}
            onClick={() => { onChange(c.name); setSearch(""); }}
            className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all"
            style={value === c.name
              ? { border: "1px solid rgba(0,255,136,0.4)", background: "rgba(0,255,136,0.1)" }
              : { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
            <img src={`/flags/${c.flagCode}.svg`} alt={c.name} className="w-7 h-4 object-cover rounded-sm"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </button>
        ))}
      </div>
      {value && <div className="text-xs font-bold" style={{ color: "#00FF88" }}>✓ {value}</div>}
    </div>
  );
}

function PlayerSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = KNOWN_PLAYERS.filter(p => p.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
        <input type="text" placeholder="Search player…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
        />
      </div>
      {search && (
        <div className="rounded-xl overflow-hidden max-h-36 overflow-y-auto" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {filtered.map(p => (
            <button key={p} type="button"
              onClick={() => { onChange(p); setSearch(""); }}
              className="w-full px-3 py-2 text-left text-sm border-b last:border-0 transition-all"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: value === p ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)" }}>
              {p}
            </button>
          ))}
          {search.length > 1 && !filtered.some(p => p.toLowerCase() === search.toLowerCase()) && (
            <button type="button"
              onClick={() => { onChange(search); setSearch(""); }}
              className="w-full px-3 py-2 text-left text-sm transition-all"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#00D4FF" }}>
              Use &quot;{search}&quot;
            </button>
          )}
        </div>
      )}
      {value && <div className="text-xs font-bold" style={{ color: "#00FF88" }}>✓ {value}</div>}
    </div>
  );
}
