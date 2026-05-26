"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, Star, Search, Check, Lock, AlertCircle, Medal, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALL_COUNTRIES, flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

// ─── Time locking ─────────────────────────────────────────────────────────────

const TOURNAMENT_LOCK_UTC = new Date("2026-06-11T19:55:00Z");

function isTournamentLocked(): boolean {
  return new Date() >= TOURNAMENT_LOCK_UTC;
}

// ── Player list ───────────────────────────────────────────────────────────────

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
  { name: "Gavi",               team: "Spain",          flagCode: "es"     },
  { name: "Jude Bellingham",    team: "England",        flagCode: "gb-eng" },
  { name: "Antoine Griezmann",  team: "France",         flagCode: "fr"     },
  { name: "Ousmane Dembélé",    team: "France",         flagCode: "fr"     },
  { name: "Marcus Rashford",    team: "England",        flagCode: "gb-eng" },
  { name: "Diogo Jota",         team: "Portugal",       flagCode: "pt"     },
  { name: "Darwin Núñez",       team: "Uruguay",        flagCode: "uy"     },
  { name: "Richarlison",        team: "Brazil",         flagCode: "br"     },
  { name: "Son Heung-min",      team: "Korea Republic", flagCode: "kr"     },
  { name: "Robert Lewandowski", team: "Poland",         flagCode: "pl"     },
  { name: "Christian Pulisic",  team: "USA",            flagCode: "us"     },
  { name: "Weston McKennie",    team: "USA",            flagCode: "us"     },
  { name: "João Félix",         team: "Portugal",       flagCode: "pt"     },
  { name: "Nico Williams",      team: "Spain",          flagCode: "es"     },
  { name: "Dani Olmo",          team: "Spain",          flagCode: "es"     },
  { name: "Achraf Hakimi",      team: "Morocco",        flagCode: "ma"     },
  { name: "Hakim Ziyech",       team: "Morocco",        flagCode: "ma"     },
  { name: "Alphonso Davies",    team: "Canada",         flagCode: "ca"     },
  { name: "Jonathan David",     team: "Canada",         flagCode: "ca"     },
  { name: "Arda Güler",         team: "Turkey",         flagCode: "tr"     },
  { name: "Hakan Çalhanoğlu",   team: "Turkey",         flagCode: "tr"     },
];

interface TournamentPicksProps {
  groupId: string;
  userId?: string;
  locked?: boolean;
}

interface Picks {
  winner:      string;
  topScorer:   string;
  topAssister: string;
  goldenBall:  string;
  bestThird:   string[];
}

interface ScoringRules {
  tournament_winner:  number;
  top_scorer:         number;
  top_assister:       number;
  golden_ball:        number;
  best_third:         number;
  enable_winner:      boolean;
  enable_scorer:      boolean;
  enable_assister:    boolean;
  enable_golden_ball: boolean;
}

const DEFAULT_RULES: ScoringRules = {
  tournament_winner:  100,
  top_scorer:          50,
  top_assister:        50,
  golden_ball:         40,
  best_third:          20,
  enable_winner:      true,
  enable_scorer:      true,
  enable_assister:    true,
  enable_golden_ball: false,
};

// ── Glass token ───────────────────────────────────────────────────────────────
const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: 22,
} as const;

export function TournamentPicks({ groupId, userId, locked = false }: TournamentPicksProps) {
  const [picks,   setPicks]   = useState<Picks>({ winner: "", topScorer: "", topAssister: "", goldenBall: "", bestThird: [] });
  const [rules,   setRules]   = useState<ScoringRules>(DEFAULT_RULES);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Separate search state per picker — fixes typing lag
  const [winnerSearch,    setWinnerSearch]    = useState("");
  const [scorerSearch,    setScorerSearch]    = useState("");
  const [assisterSearch,  setAssisterSearch]  = useState("");
  const [goldenSearch,    setGoldenSearch]    = useState("");
  const [thirdSearch,     setThirdSearch]     = useState("");

  // Auto-save timer
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const picksRef  = useRef(picks);
  picksRef.current = picks;

  // Check time-based lock
  const timeLocked = isTournamentLocked();
  const isLocked   = locked || timeLocked;

  // Load scoring rules and existing picks
  useEffect(() => {
    if (!groupId) return;
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
        .in("pred_type", ["winner","top_scorer","top_assister","golden_ball",
          "best_third_1","best_third_2","best_third_3","best_third_4",
          "best_third_5","best_third_6","best_third_7","best_third_8"])
        .then(({ data }) => {
          if (!data?.length) return;
          const p: Partial<Picks> = { bestThird: [] };
          (data as Array<{ pred_type: string; pred_value: string }>).forEach(row => {
            if (row.pred_type === "winner")       p.winner      = row.pred_value;
            if (row.pred_type === "top_scorer")   p.topScorer   = row.pred_value;
            if (row.pred_type === "top_assister") p.topAssister = row.pred_value;
            if (row.pred_type === "golden_ball")  p.goldenBall  = row.pred_value;
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

    addPick("winner",       currentPicks.winner);
    addPick("top_scorer",   currentPicks.topScorer);
    addPick("top_assister", currentPicks.topAssister);
    addPick("golden_ball",  currentPicks.goldenBall);
    currentPicks.bestThird.forEach((c, i) => addPick(`best_third_${i + 1}`, c));

    if (rows.length === 0) { setSaving(false); return; }

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

  // ── Country picker ─────────────────────────────────────────────────────────
  const CountryPicker = ({ value, search, onSearch, onSelect, label, pts }: {
    value: string; search: string; onSearch: (s: string) => void;
    onSelect: (name: string) => void; label: string; pts: number;
  }) => {
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
            onChange={e => onSearch(e.target.value)}
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
              <button key={c.flagCode} title={c.name} disabled={isLocked}
                onClick={() => { onSelect(c.name); onSearch(""); }}
                className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all",
                  isLocked && "opacity-40 cursor-not-allowed")}
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
  };

  // ── Player picker ──────────────────────────────────────────────────────────
  const PlayerPicker = ({ pickKey, label, pts, search, onSearch }: {
    pickKey: "topScorer" | "topAssister" | "goldenBall";
    label: string; pts: number;
    search: string; onSearch: (s: string) => void;
  }) => {
    const filtered = KNOWN_PLAYERS.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase())
    );
    const value    = picks[pickKey];
    const showCustom = search.length > 1 && !filtered.some(p => p.name.toLowerCase() === search.toLowerCase());

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
          <span className="text-xs font-bold" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>+{pts} pts</span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
          <input
            type="text"
            placeholder="Search or type player name..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            disabled={isLocked}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
            onFocus={e => { e.target.style.border = "1px solid #00D4FF"; }}
            onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; }}
          />
        </div>
        {search.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(player => {
                const active = value === player.name;
                return (
                  <button key={player.name} disabled={isLocked}
                    onClick={() => { updatePick(pickKey, player.name); onSearch(""); }}
                    className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 border-b last:border-0 text-left transition-all",
                      isLocked && "opacity-40 cursor-not-allowed")}
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      background: active ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.04)",
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}>
                    <img src={`/flags/${player.flagCode}.svg`} alt={player.team}
                      className="w-6 h-4 object-cover rounded-sm shrink-0"
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
                <button
                  onClick={() => { updatePick(pickKey, search); onSearch(""); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}>
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
  };

  // ── Best 3rd picker ────────────────────────────────────────────────────────
  const BestThirdPicker = () => {
    const filtered = ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(thirdSearch.toLowerCase()) ||
      (c.code ?? c.flagCode).toLowerCase().includes(thirdSearch.toLowerCase())
    ).slice(0, 48);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
            8 qualifying 3rd-place teams
          </span>
          <span className="text-xs font-bold" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>
            +{rules.best_third} pts each · {picks.bestThird.length}/8
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Pick which 8 of the 12 group 3rd-place finishers advance to the Round of 32.
        </p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
          <input type="text" placeholder="Search country..." value={thirdSearch}
            onChange={e => setThirdSearch(e.target.value)}
            disabled={isLocked}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}
            onFocus={e => { e.target.style.border = "1px solid #00D4FF"; }}
            onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; }}
          />
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto">
          {filtered.map(c => {
            const isSelected = picks.bestThird.includes(c.name);
            const isDisabled = !isSelected && picks.bestThird.length >= 8;
            return (
              <button key={c.flagCode} title={c.name}
                disabled={isLocked || isDisabled}
                onClick={() => toggleBestThird(c.name)}
                className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all",
                  (isLocked || isDisabled) && "opacity-40 cursor-not-allowed")}
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
        {picks.bestThird.length > 0 && (
          <div className="text-xs" style={{ color: "#0891B2" }}>✓ {picks.bestThird.join(", ")}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Lock banner */}
      {isLocked && (
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest p-3 rounded-xl"
          style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706" }}>
          <Lock size={13} />
          {timeLocked ? "Tournament picks are locked — first match has started" : "Picks locked by admin"}
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

      {/* Tournament Winner */}
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
          search={winnerSearch}
          onSearch={setWinnerSearch}
          onSelect={v => updatePick("winner", v)}
          label="Pick the World Cup 2026 champion"
          pts={rules.tournament_winner}
        />
      </div>

      {/* Best 3rd place */}
      <div className="p-5" style={glassCard}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={18} style={{ color: "#0891B2" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>Best 3rd-Place Teams</span>
        </div>
        <BestThirdPicker />
      </div>

      {/* Player awards */}
      <div className="p-5 space-y-5" style={glassCard}>
        <div className="flex items-center gap-2">
          <Star size={18} style={{ color: "#d97706" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "white" }}>Player Awards</span>
        </div>
        {rules.enable_scorer && (
          <PlayerPicker pickKey="topScorer" label="Top Scorer — Golden Boot" pts={rules.top_scorer}
            search={scorerSearch} onSearch={setScorerSearch} />
        )}
        {rules.enable_assister && (
          <PlayerPicker pickKey="topAssister" label="Top Assister" pts={rules.top_assister}
            search={assisterSearch} onSearch={setAssisterSearch} />
        )}
        {rules.enable_golden_ball && (
          <PlayerPicker pickKey="goldenBall" label="Golden Ball — Best Player" pts={rules.golden_ball}
            search={goldenSearch} onSearch={setGoldenSearch} />
        )}
      </div>

      {/* Scoring rules summary */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
          Points for these picks
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Tournament winner", pts: rules.tournament_winner, enabled: rules.enable_winner    },
            { label: "Top scorer",        pts: rules.top_scorer,        enabled: rules.enable_scorer    },
            { label: "Top assister",      pts: rules.top_assister,      enabled: rules.enable_assister  },
            { label: "Golden Ball",       pts: rules.golden_ball,       enabled: rules.enable_golden_ball },
            { label: "Best 3rd (each)",   pts: rules.best_third,        enabled: true                   },
          ].filter(r => r.enabled).map(r => (
            <div key={r.label} className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{r.label}</span>
              <span className="font-black" style={{ color: "#00D4FF", fontFamily: "var(--font-mono)" }}>+{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {!isLocked && (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
          ✓ Picks save automatically · All picks lock June 11, 2026 at first kickoff
        </p>
      )}
    </div>
  );
}
