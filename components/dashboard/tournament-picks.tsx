"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, Star, Search, Check, Lock, AlertCircle, BarChart2, Shield } from "lucide-react";
import { PlayerPicker } from "@/components/predictions/player-picker";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES } from "@/lib/countries";
import { FOCUS_RING } from "@/lib/a11y";
import { cn } from "@/lib/utils";

// ─── Time locking ─────────────────────────────────────────────────────────────

const TOURNAMENT_LOCK_DEFAULT = new Date("2026-06-11T19:55:00Z");

function isTournamentLocked(customLockAt?: string | null): boolean {
  const lockDate = customLockAt ? new Date(customLockAt) : TOURNAMENT_LOCK_DEFAULT;
  return new Date() >= lockDate;
}


interface TournamentPicksProps {
  groupId: string;
  userId?: string;
  locked?: boolean;
}

interface Picks {
  winner:          string;
  topScorer:       string;
  topAssister:     string;
  goldenBall:      string;
  bestDefence:     string;
  bestYoungPlayer: string;
  bestThird:       string[];
  finalGoalMinute: string;
}

interface ScoringRules {
  tournament_winner:        number;
  top_scorer:               number;
  top_assister:             number;
  golden_ball:              number;
  best_defence:             number;
  best_young_player:        number;
  best_third:               number;
  enable_winner:            boolean;
  enable_scorer:            boolean;
  enable_assister:          boolean;
  enable_golden_ball:       boolean;
  enable_best_defence:      boolean;
  enable_best_young_player: boolean;
  enable_best_third:        boolean;
  tournament_lock_at?:      string | null;
}

const DEFAULT_RULES: ScoringRules = {
  tournament_winner:        100,
  top_scorer:                50,
  top_assister:              50,
  golden_ball:               40,
  best_defence:              30,
  best_young_player:         30,
  best_third:                20,
  enable_winner:            true,
  enable_scorer:            true,
  enable_assister:          true,
  enable_golden_ball:       false,
  enable_best_defence:      false,
  enable_best_young_player: false,
  enable_best_third:        true,
};

// ── Glass token ───────────────────────────────────────────────────────────────
const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: 22,
} as const;

// ── Country picker ─────────────────────────────────────────────────────────
interface CountryPickerProps {
  value: string;
  onSelect: (name: string) => void;
  label: string;
  pts: number;
  isLocked: boolean;
}

function CountryPicker({ value, onSelect, label, pts, isLocked }: CountryPickerProps) {
  const [search, setSearch] = useState("");
  const filtered = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code ?? c.flagCode).toLowerCase().includes(search.toLowerCase())
  ).slice(0, 48);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>+{pts} pts</span>
      </div>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
        <input type="text" placeholder="Search country..." value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isLocked}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
          onFocus={e => { e.target.style.border = "1px solid #00D4FF"; }}
          onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; }}
        />
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto">
        {filtered.map(c => {
          const isSelected = value === c.name;
          return (
            <button key={c.flagCode} type="button" title={c.name} aria-label={c.name} aria-pressed={isSelected} disabled={isLocked}
              onClick={() => { onSelect(c.name); setSearch(""); }}
              className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all",
                isLocked && "opacity-40 cursor-not-allowed",
                FOCUS_RING)}
              style={isSelected
                ? { border: "1px solid rgba(0,255,136,0.4)", background: "rgba(0,255,136,0.1)" }
                : { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <img src={`/flags/${c.flagCode}.svg`} alt={c.name}
                className="w-7 h-4 object-cover rounded-sm"
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

// ── Best 3rd picker ────────────────────────────────────────────────────────
interface BestThirdPickerProps {
  selected:  string[];
  onToggle:  (country: string) => void;
  isLocked:  boolean;
  pts:       number;
}

function BestThirdPicker({ selected, onToggle, isLocked, pts }: BestThirdPickerProps) {
  const [search, setSearch] = useState("");
  const validNames = new Set(ALL_COUNTRIES.map(c => c.name));
  const filtered = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code ?? c.flagCode).toLowerCase().includes(search.toLowerCase())
  ).slice(0, 48);

  // Picks that no longer correspond to a valid WC2026 team (stale data)
  const orphaned = selected.filter(s => !validNames.has(s));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
          8 qualifying 3rd-place teams
        </span>
        <span className="text-xs font-bold" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>
          +{pts} pts each · {selected.length}/8
        </span>
      </div>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        Pick which 8 of the 12 group 3rd-place finishers advance to the Round of 32.
      </p>

      {/* Orphaned picks — team didn't qualify, show removable chip */}
      {orphaned.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {orphaned.map(name => (
            <button key={name} type="button" disabled={isLocked}
              onClick={() => onToggle(name)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold disabled:opacity-40"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}>
              {name} · did not qualify · ✕
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
        <input type="text" placeholder="Search country..." value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isLocked}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
          onFocus={e => { e.target.style.border = "1px solid #00D4FF"; }}
          onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; }}
        />
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto">
        {filtered.map(c => {
          const isSelected = selected.includes(c.name);
          const isDisabled = !isSelected && selected.length >= 8;
          return (
            <button key={c.flagCode} type="button" title={c.name} aria-label={c.name} aria-pressed={isSelected}
              disabled={isLocked || isDisabled}
              onClick={() => onToggle(c.name)}
              className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all",
                (isLocked || isDisabled) && "opacity-40 cursor-not-allowed",
                FOCUS_RING)}
              style={isSelected
                ? { border: "1px solid rgba(0,255,136,0.4)", background: "rgba(0,255,136,0.1)" }
                : { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <img src={`/flags/${c.flagCode}.svg`} alt={c.name}
                className="w-7 h-4 object-cover rounded-sm"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="text-[8px] font-bold truncate w-full text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                {(c.code ?? c.flagCode).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="text-xs" style={{ color: "#0891B2" }}>✓ {selected.filter(s => validNames.has(s)).join(", ")}</div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function TournamentPicks({ groupId, userId, locked = false }: TournamentPicksProps) {
  const [picks,  setPicks]  = useState<Picks>({ winner: "", topScorer: "", topAssister: "", goldenBall: "", bestDefence: "", bestYoungPlayer: "", bestThird: [], finalGoalMinute: "" });
  const [rules,  setRules]  = useState<ScoringRules>(DEFAULT_RULES);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // Auto-save timer
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const picksRef  = useRef(picks);
  picksRef.current = picks;

  // Check time-based lock (uses custom lock time from scoring_rules if set)
  const timeLocked = isTournamentLocked(rules.tournament_lock_at);
  const isLocked   = locked || timeLocked;

  // Load scoring rules and existing picks
  useEffect(() => {
    if (!groupId) return;
    setPicks({ winner: "", topScorer: "", topAssister: "", goldenBall: "", bestDefence: "", bestYoungPlayer: "", bestThird: [], finalGoalMinute: "" });
    const sb = createClient();
    sb.from("scoring_rules").select("*").eq("group_id", groupId).maybeSingle()
      .then(({ data }) => { if (data) setRules({ ...DEFAULT_RULES, ...data }); });

    if (!userId) return;
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      sb.from("group_predictions")
        .select("match_id, pred_type, pred_value")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .in("pred_type", [
          "winner", "top_scorer", "top_assister", "golden_ball",
          "best_defence", "best_young_player", "final_goal_minute",
          "best_third_1", "best_third_2", "best_third_3", "best_third_4",
          "best_third_5", "best_third_6", "best_third_7", "best_third_8",
        ])
        .then(({ data }) => {
          if (!data?.length) return;
          const p: Partial<Picks> = { bestThird: [] };
          (data as Array<{ pred_type: string; pred_value: string }>).forEach(row => {
            if (row.pred_type === "winner")            p.winner          = row.pred_value;
            if (row.pred_type === "top_scorer")        p.topScorer       = row.pred_value;
            if (row.pred_type === "top_assister")      p.topAssister     = row.pred_value;
            if (row.pred_type === "golden_ball")       p.goldenBall      = row.pred_value;
            if (row.pred_type === "best_defence")      p.bestDefence     = row.pred_value;
            if (row.pred_type === "best_young_player") p.bestYoungPlayer = row.pred_value;
            if (row.pred_type === "final_goal_minute") p.finalGoalMinute = row.pred_value;
            if (row.pred_type.startsWith("best_third_")) {
              p.bestThird = [...(p.bestThird ?? []), row.pred_value];
            }
          });
          setPicks(prev => ({ ...prev, ...p }));
        });
    });
  }, [groupId, userId]);

  // Auto-save whenever picks change
  const savePicks = useCallback(async (currentPicks: Picks) => {
    if (!userId || isLocked) return;
    setSaving(true); setError(null);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaving(false); return; }

    const rows: Record<string, unknown>[] = [];
    const addPick = (type: string, value: string) => {
      if (!value.trim()) return;
      rows.push({
        user_id:    user.id,
        group_id:   groupId,
        match_id:   `tournament_${type}`,
        pred_type:  type,
        pred_value: value,
        home_score: 0,
        away_score: 0,
      });
    };

    addPick("winner",           currentPicks.winner);
    addPick("top_scorer",       currentPicks.topScorer);
    addPick("top_assister",     currentPicks.topAssister);
    addPick("golden_ball",      currentPicks.goldenBall);
    addPick("best_defence",     currentPicks.bestDefence);
    addPick("best_young_player", currentPicks.bestYoungPlayer);
    addPick("final_goal_minute", currentPicks.finalGoalMinute);
    currentPicks.bestThird.forEach((c, i) => addPick(`best_third_${i + 1}`, c));

    if (rows.length === 0) { setSaving(false); return; }

    // Delete all existing best_third rows before reinserting so stale positions
    // (e.g. from deleted invalid picks) never accumulate as duplicates.
    await sb
      .from("group_predictions")
      .delete()
      .eq("user_id", user.id)
      .eq("group_id", groupId)
      .like("pred_type", "best_third_%");

    const { error: saveError } = await sb
      .from("group_predictions")
      .upsert(rows, { onConflict: "user_id,group_id,match_id" });

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [userId, groupId, isLocked]);

  // Debounced auto-save on picks change
  useEffect(() => {
    if (!userId || isLocked) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => savePicks(picksRef.current), 1000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [picks, userId, isLocked, savePicks]);

  const updatePick = (key: keyof Omit<Picks, "bestThird">, value: string) => {
    setPicks(p => ({ ...p, [key]: value }));
  };

  const toggleBestThird = (country: string) => {
    setPicks(p => {
      const has = p.bestThird.includes(country);
      if (has) return { ...p, bestThird: p.bestThird.filter(c => c !== country) };
      if (p.bestThird.length >= 8) return p;
      return { ...p, bestThird: [...p.bestThird, country] };
    });
  };

  // Derive which sections have at least one enabled pick
  const hasPlayerAwards = (
    rules.enable_scorer ||
    rules.enable_assister ||
    rules.enable_golden_ball ||
    rules.enable_best_young_player ||
    rules.enable_best_defence
  );

  // Scoring summary rows — only include enabled categories
  const summaryRows = [
    { label: "Tournament winner",    pts: rules.tournament_winner, enabled: rules.enable_winner            },
    { label: "Top scorer",           pts: rules.top_scorer,        enabled: rules.enable_scorer            },
    { label: "Top assister",         pts: rules.top_assister,      enabled: rules.enable_assister          },
    { label: "Golden Ball",          pts: rules.golden_ball,       enabled: rules.enable_golden_ball       },
    { label: "Best defence",         pts: rules.best_defence,      enabled: rules.enable_best_defence      },
    { label: "Best young player",    pts: rules.best_young_player, enabled: rules.enable_best_young_player },
    { label: "Best 3rd (each)",      pts: rules.best_third,        enabled: rules.enable_best_third        },
  ].filter(r => r.enabled);

  return (
    <div className="space-y-5">
      {/* Lock banner */}
      {isLocked && (
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest p-3 rounded-xl"
          style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706" }}>
          <Lock size={13} />
          {timeLocked ? "Tournament picks are locked. First match has started." : "Picks locked by admin"}
        </div>
      )}

      {/* Auto-save status */}
      {!isLocked && (saving || saved || error) && (
        <div className="flex items-center gap-2 text-xs font-bold"
          style={{ color: saved ? "#00FF88" : error ? "#dc2626" : "rgba(255,255,255,0.4)" }}>
          {saving && <span className="animate-spin">⟳</span>}
          {saved  && <Check size={12} />}
          {error  && <AlertCircle size={12} />}
          {saving ? "Saving picks..." : saved ? "Picks saved automatically ✓" : error}
        </div>
      )}

      {/* Tournament Winner — only if enabled */}
      {rules.enable_winner && (
        <div className="p-5" style={glassCard}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} style={{ color: "#d97706" }} />
            <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>Tournament Winner</span>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,255,136,0.1)", color: "#00D4FF", fontFamily: "var(--font-mono)" }}>
              +{rules.tournament_winner} pts
            </span>
          </div>
          <CountryPicker
            value={picks.winner}
            onSelect={v => updatePick("winner", v)}
            label="Pick the World Cup 2026 champion"
            pts={rules.tournament_winner}
            isLocked={isLocked}
          />
        </div>
      )}

      {/* Golden Guess tiebreaker — always collected, used only to break ties */}
      <div className="p-5" style={glassCard}>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} style={{ color: "#0891B2" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>Golden Guess Tiebreaker</span>
        </div>
        <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          Guess the minute of the first goal in the Final — used only as a tiebreaker, not for points.
        </p>
        <input
          type="number"
          min={1}
          max={130}
          inputMode="numeric"
          placeholder="e.g. 23"
          value={picks.finalGoalMinute}
          disabled={isLocked}
          onChange={e => updatePick("finalGoalMinute", e.target.value)}
          className="w-full sm:w-40 pl-4 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
          onFocus={e => { e.target.style.border = "1px solid #00D4FF"; }}
          onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; }}
        />
      </div>

      {/* Best 3rd place — only if enabled */}
      {rules.enable_best_third && (
        <div className="p-5" style={glassCard}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={18} style={{ color: "#0891B2" }} />
            <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>Best 3rd-Place Teams</span>
          </div>
          <BestThirdPicker
            selected={picks.bestThird}
            onToggle={toggleBestThird}
            isLocked={isLocked}
            pts={rules.best_third}
          />
        </div>
      )}

      {/* Awards — only if at least one award type is enabled */}
      {hasPlayerAwards && (
        <div className="p-5 space-y-5" style={glassCard}>
          <div className="flex items-center gap-2">
            <Star size={18} style={{ color: "#d97706" }} />
            <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>Awards</span>
          </div>
          {rules.enable_scorer && (
            <PlayerPicker
              value={picks.topScorer}
              label="Top Scorer · Golden Boot"
              pts={rules.top_scorer}
              onSelect={v => updatePick("topScorer", v)}
              isLocked={isLocked}
            />
          )}
          {rules.enable_assister && (
            <PlayerPicker
              value={picks.topAssister}
              label="Top Assister"
              pts={rules.top_assister}
              onSelect={v => updatePick("topAssister", v)}
              isLocked={isLocked}
            />
          )}
          {rules.enable_golden_ball && (
            <PlayerPicker
              value={picks.goldenBall}
              label="Golden Ball · Best Player"
              pts={rules.golden_ball}
              onSelect={v => updatePick("goldenBall", v)}
              isLocked={isLocked}
            />
          )}
          {rules.enable_best_young_player && (
            <PlayerPicker
              value={picks.bestYoungPlayer}
              label="Best Young Player"
              pts={rules.best_young_player}
              onSelect={v => updatePick("bestYoungPlayer", v)}
              isLocked={isLocked}
            />
          )}
          {rules.enable_best_defence && (
            <CountryPicker
              value={picks.bestDefence}
              onSelect={v => updatePick("bestDefence", v)}
              label="Best Defence · Fewest Goals Conceded"
              pts={rules.best_defence}
              isLocked={isLocked}
            />
          )}
        </div>
      )}

      {/* Scoring rules summary — only shown if any picks are enabled */}
      {summaryRows.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Points for these picks
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {summaryRows.map(r => (
              <div key={r.label} className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{r.label}</span>
                <span className="font-black" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>+{r.pts}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLocked && (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
          ✓ Picks save automatically · All picks lock June 11, 2026 at first kickoff
        </p>
      )}
    </div>
  );
}
