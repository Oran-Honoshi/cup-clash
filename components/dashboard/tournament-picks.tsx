"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Search, Check, Lock, AlertCircle, Medal, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALL_COUNTRIES, flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

// ── Player list ──────────────────────────────────────────────────────────────
const KNOWN_PLAYERS = [
  { name: "Kylian Mbappé",     team: "France",      flagCode: "fr"     },
  { name: "Erling Haaland",    team: "Norway",      flagCode: "no"     },
  { name: "Lionel Messi",      team: "Argentina",   flagCode: "ar"     },
  { name: "Vinícius Jr.",      team: "Brazil",      flagCode: "br"     },
  { name: "Harry Kane",        team: "England",     flagCode: "gb-eng" },
  { name: "Lamine Yamal",      team: "Spain",       flagCode: "es"     },
  { name: "Rodri",             team: "Spain",       flagCode: "es"     },
  { name: "Raphinha",          team: "Brazil",      flagCode: "br"     },
  { name: "Leroy Sané",        team: "Germany",     flagCode: "de"     },
  { name: "Bruno Fernandes",   team: "Portugal",    flagCode: "pt"     },
  { name: "Kevin De Bruyne",   team: "Belgium",     flagCode: "be"     },
  { name: "Jamal Musiala",     team: "Germany",     flagCode: "de"     },
  { name: "Pedri",             team: "Spain",       flagCode: "es"     },
  { name: "Florian Wirtz",     team: "Germany",     flagCode: "de"     },
  { name: "Phil Foden",        team: "England",     flagCode: "gb-eng" },
  { name: "Bernardo Silva",    team: "Portugal",    flagCode: "pt"     },
  { name: "Federico Valverde", team: "Uruguay",     flagCode: "uy"     },
  { name: "Bukayo Saka",       team: "England",     flagCode: "gb-eng" },
  { name: "Gavi",              team: "Spain",       flagCode: "es"     },
  { name: "Jude Bellingham",   team: "England",     flagCode: "gb-eng" },
  { name: "Alisson Becker",    team: "Brazil",      flagCode: "br"     },
  { name: "Manuel Neuer",      team: "Germany",     flagCode: "de"     },
  { name: "Thibaut Courtois",  team: "Belgium",     flagCode: "be"     },
  { name: "Antoine Griezmann", team: "France",      flagCode: "fr"     },
  { name: "Ousmane Dembélé",   team: "France",      flagCode: "fr"     },
  { name: "Marcus Rashford",   team: "England",     flagCode: "gb-eng" },
  { name: "Diogo Jota",        team: "Portugal",    flagCode: "pt"     },
  { name: "Darwin Núñez",      team: "Uruguay",     flagCode: "uy"     },
  { name: "Richarlison",       team: "Brazil",      flagCode: "br"     },
  { name: "Son Heung-min",     team: "Korea Republic", flagCode: "kr"  },
  { name: "Robert Lewandowski",team: "Poland",      flagCode: "pl"     },
  { name: "Ciro Immobile",     team: "Italy",       flagCode: "it"     },
  { name: "Romelu Lukaku",     team: "Belgium",     flagCode: "be"     },
  { name: "Christian Pulisic", team: "USA",         flagCode: "us"     },
  { name: "Weston McKennie",   team: "USA",         flagCode: "us"     },
  { name: "João Félix",        team: "Portugal",    flagCode: "pt"     },
  { name: "Nico Williams",     team: "Spain",       flagCode: "es"     },
  { name: "Dani Olmo",         team: "Spain",       flagCode: "es"     },
  { name: "Achraf Hakimi",     team: "Morocco",     flagCode: "ma"     },
  { name: "Hakim Ziyech",      team: "Morocco",     flagCode: "ma"     },
];

interface TournamentPicksProps {
  groupId:  string;
  userId?:  string;
  locked?:  boolean;
}

interface Picks {
  winner:      string;
  topScorer:   string;
  topAssister: string;
  goldenBall:  string;
  bestThird:   string[];
}

interface ScoringRules {
  tournament_winner: number;
  top_scorer:        number;
  top_assister:      number;
  golden_ball:       number;
  best_third:        number;
  enable_winner:     boolean;
  enable_scorer:     boolean;
  enable_assister:   boolean;
  enable_golden_ball:boolean;
}

const DEFAULT_RULES: ScoringRules = {
  tournament_winner: 100,
  top_scorer:         50,
  top_assister:       50,
  golden_ball:        40,
  best_third:         20,
  enable_winner:     true,
  enable_scorer:     true,
  enable_assister:   true,
  enable_golden_ball:false,
};

export function TournamentPicks({ groupId, userId, locked = false }: TournamentPicksProps) {
  const [picks,   setPicks]   = useState<Picks>({ winner: "", topScorer: "", topAssister: "", goldenBall: "", bestThird: [] });
  const [rules,   setRules]   = useState<ScoringRules>(DEFAULT_RULES);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState<Record<string, string>>({});
  const [customPlayer, setCustomPlayer] = useState<Record<string, string>>({});

  // Load scoring rules and existing picks from Supabase
  useEffect(() => {
    if (!groupId) return;
    const sb = createClient();

    // Load group scoring rules
    sb.from("scoring_rules")
      .select("*")
      .eq("group_id", groupId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRules({ ...DEFAULT_RULES, ...data });
      });

    // Load existing picks
    if (!userId) return;
    sb.from("group_predictions")
      .select("match_id, pred_type, pred_value")
      .eq("group_id", groupId)
      .eq("user_id",  userId)
      .in("pred_type", ["winner", "top_scorer", "top_assister", "golden_ball", "best_third_1", "best_third_2", "best_third_3", "best_third_4", "best_third_5", "best_third_6", "best_third_7", "best_third_8"])
      .then(({ data }) => {
        if (!data?.length) return;
        const p: Partial<Picks> = { bestThird: [] };
        (data as Array<{ pred_type: string; pred_value: string }>).forEach(row => {
          if (row.pred_type === "winner")      p.winner      = row.pred_value;
          if (row.pred_type === "top_scorer")   p.topScorer   = row.pred_value;
          if (row.pred_type === "top_assister") p.topAssister = row.pred_value;
          if (row.pred_type === "golden_ball")  p.goldenBall  = row.pred_value;
          if (row.pred_type.startsWith("best_third_")) {
            p.bestThird = [...(p.bestThird ?? []), row.pred_value];
          }
        });
        setPicks(prev => ({ ...prev, ...p }));
      });
  }, [groupId, userId]);

  const handleSave = async () => {
    setSaving(true); setError(null);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Please sign in to save picks"); setSaving(false); return; }

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

    addPick("winner",      picks.winner);
    addPick("top_scorer",  picks.topScorer   || customPlayer["topScorer"]   || "");
    addPick("top_assister",picks.topAssister  || customPlayer["topAssister"] || "");
    addPick("golden_ball", picks.goldenBall   || customPlayer["goldenBall"]  || "");
    picks.bestThird.forEach((c, i) => addPick(`best_third_${i + 1}`, c));

    if (rows.length === 0) { setError("No picks to save"); setSaving(false); return; }

    const { error: saveError } = await sb
      .from("group_predictions")
      .upsert(rows, { onConflict: "user_id,group_id,match_id" });

    if (saveError) { setError(saveError.message); setSaving(false); return; }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
  const CountryPicker = ({ pickKey, label, pts }: { pickKey: "winner"; label: string; pts: number }) => {
    const s        = search[pickKey] ?? "";
    const filtered = ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(s.toLowerCase()) ||
      (c.code ?? c.flagCode).toLowerCase().includes(s.toLowerCase())
    ).slice(0, 48);
    const value = picks[pickKey];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>{label}</span>
          <span className="text-xs font-bold" style={{ color: "#059669" }}>+{pts} pts</span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
          <input type="text" placeholder="Search country..." value={s}
            onChange={e => setSearch(prev => ({ ...prev, [pickKey]: e.target.value }))}
            disabled={locked}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border focus:outline-none disabled:opacity-40"
            style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}
            onFocus={e => e.target.style.borderColor = "#00D4FF"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto">
          {filtered.map(c => {
            const isSelected = value === c.name;
            return (
              <button key={c.flagCode} title={c.name} disabled={locked}
                onClick={() => setPicks(p => ({ ...p, [pickKey]: c.name }))}
                className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all",
                  isSelected ? "border-cyan-400 bg-cyan-50" : "border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/30",
                  locked && "opacity-40 cursor-not-allowed")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://flagcdn.com/w20/${c.flagCode}.png`} alt={c.name}
                  className="w-7 h-4 object-cover rounded-sm"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="text-[8px] font-bold truncate w-full text-center" style={{ color: "#64748b" }}>
                  {(c.code ?? c.flagCode).toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
        {value && (
          <div className="text-xs font-bold text-center" style={{ color: "#0891B2" }}>✓ {value}</div>
        )}
      </div>
    );
  };

  // ── Best 3rd picker ────────────────────────────────────────────────────────
  const BestThirdPicker = () => {
    const s        = search["bestThird"] ?? "";
    const filtered = ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(s.toLowerCase()) ||
      (c.code ?? c.flagCode).toLowerCase().includes(s.toLowerCase())
    ).slice(0, 48);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
            8 qualifying 3rd-place teams
          </span>
          <span className="text-xs font-bold" style={{ color: "#059669" }}>
            +{rules.best_third} pts each · {picks.bestThird.length}/8
          </span>
        </div>
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          Pick which 8 of the 12 group 3rd-place finishers advance to the Round of 32.
        </p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
          <input type="text" placeholder="Search country..." value={s}
            onChange={e => setSearch(prev => ({ ...prev, bestThird: e.target.value }))}
            disabled={locked}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border focus:outline-none disabled:opacity-40"
            style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}
            onFocus={e => e.target.style.borderColor = "#00D4FF"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto">
          {filtered.map(c => {
            const isSelected = picks.bestThird.includes(c.name);
            const isDisabled = !isSelected && picks.bestThird.length >= 8;
            return (
              <button key={c.flagCode} title={c.name}
                disabled={locked || isDisabled}
                onClick={() => toggleBestThird(c.name)}
                className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all",
                  isSelected ? "border-cyan-400 bg-cyan-50" : "border-slate-100 hover:border-cyan-200",
                  (locked || isDisabled) && "opacity-40 cursor-not-allowed")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://flagcdn.com/w20/${c.flagCode}.png`} alt={c.name}
                  className="w-7 h-4 object-cover rounded-sm"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="text-[8px] font-bold truncate w-full text-center" style={{ color: "#64748b" }}>
                  {(c.code ?? c.flagCode).toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
        {picks.bestThird.length > 0 && (
          <div className="text-xs" style={{ color: "#0891B2" }}>
            ✓ {picks.bestThird.join(", ")}
          </div>
        )}
      </div>
    );
  };

  // ── Player picker ──────────────────────────────────────────────────────────
  const PlayerPicker = ({ pickKey, label, pts }: {
    pickKey: "topScorer" | "topAssister" | "goldenBall"; label: string; pts: number;
  }) => {
    const s        = search[pickKey] ?? "";
    const custom   = customPlayer[pickKey] ?? "";
    const filtered = KNOWN_PLAYERS.filter(p =>
      p.name.toLowerCase().includes(s.toLowerCase()) ||
      p.team.toLowerCase().includes(s.toLowerCase())
    );
    const value    = picks[pickKey];
    const showCustom = s.length > 1 && !filtered.some(p => p.name.toLowerCase() === s.toLowerCase());

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>{label}</span>
          <span className="text-xs font-bold" style={{ color: "#059669" }}>+{pts} pts</span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
          <input type="text" placeholder="Search or type player name..."
            value={s}
            onChange={e => setSearch(prev => ({ ...prev, [pickKey]: e.target.value }))}
            disabled={locked}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border focus:outline-none disabled:opacity-40"
            style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}
            onFocus={e => e.target.style.borderColor = "#00D4FF"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        {/* Known players list */}
        {s.length > 0 && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(player => {
                const active = value === player.name;
                return (
                  <button key={player.name} disabled={locked}
                    onClick={() => {
                      setPicks(p => ({ ...p, [pickKey]: player.name }));
                      setSearch(prev => ({ ...prev, [pickKey]: "" }));
                    }}
                    className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 border-b last:border-0 text-left transition-all hover:bg-slate-50",
                      active && "bg-cyan-50",
                      locked && "opacity-40 cursor-not-allowed")}
                    style={{ borderColor: "#f1f5f9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://flagcdn.com/w20/${player.flagCode}.png`} alt={player.team}
                      className="w-6 h-4 object-cover rounded-sm shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>{player.name}</div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>{player.team}</div>
                    </div>
                    {active && <Check size={13} style={{ color: "#0891B2" }} />}
                  </button>
                );
              })}
              {/* Custom player option — allow any name */}
              {showCustom && (
                <button
                  onClick={() => {
                    setPicks(p => ({ ...p, [pickKey]: s }));
                    setCustomPlayer(prev => ({ ...prev, [pickKey]: s }));
                    setSearch(prev => ({ ...prev, [pickKey]: "" }));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 border-t"
                  style={{ borderColor: "#e2e8f0" }}>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <span style={{ color: "#0891B2", fontSize: 10 }}>+</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#0F172A" }}>Use &quot;{s}&quot;</div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>Custom player pick</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
        {value && (
          <div className="text-xs font-bold" style={{ color: "#0891B2" }}>✓ {value}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {locked && (
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest p-3 rounded-xl"
          style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706" }}>
          <Lock size={13} /> Tournament picks are locked — first match has started
        </div>
      )}

      {/* Tournament Winner */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} style={{ color: "#d97706" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>Tournament Winner</span>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>
            +{rules.tournament_winner} pts
          </span>
        </div>
        <CountryPicker pickKey="winner" label="Pick the World Cup 2026 champion" pts={rules.tournament_winner} />
      </div>

      {/* Best 3rd place — SINGLE section only */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={18} style={{ color: "#0891B2" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>Best 3rd-Place Teams</span>
        </div>
        <BestThirdPicker />
      </div>

      {/* Player awards */}
      <div className="rounded-2xl p-5 space-y-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="flex items-center gap-2">
          <Star size={18} style={{ color: "#d97706" }} />
          <span className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>Player Awards</span>
        </div>
        {rules.enable_scorer   && <PlayerPicker pickKey="topScorer"   label="Top Scorer — Golden Boot"  pts={rules.top_scorer}   />}
        {rules.enable_assister && <PlayerPicker pickKey="topAssister" label="Top Assister"               pts={rules.top_assister} />}
        {rules.enable_golden_ball && <PlayerPicker pickKey="goldenBall"  label="Golden Ball — Best Player" pts={rules.golden_ball}  />}
      </div>

      {/* Scoring rules summary */}
      <div className="rounded-2xl p-4"
        style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>
          Points for these picks
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Tournament winner",    pts: rules.tournament_winner, enabled: rules.enable_winner    },
            { label: "Top scorer",           pts: rules.top_scorer,        enabled: rules.enable_scorer    },
            { label: "Top assister",         pts: rules.top_assister,      enabled: rules.enable_assister  },
            { label: "Golden Ball",          pts: rules.golden_ball,       enabled: rules.enable_golden_ball },
            { label: "Best 3rd (each)",      pts: rules.best_third,        enabled: true                   },
          ].filter(r => r.enabled).map(r => (
            <div key={r.label} className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: "#475569" }}>{r.label}</span>
              <span className="font-black" style={{ color: "#0891B2" }}>+{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-3"
          style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
          <AlertCircle size={13} />{error}
        </div>
      )}

      {!locked && (
        <>
          <Button onClick={handleSave} loading={saving} size="md" className="w-full"
            leftIcon={saved ? <Check size={15} /> : <Trophy size={15} />}>
            {saved ? "Picks saved! ✓" : "Save all tournament picks"}
          </Button>
          <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
            All picks lock when the first match kicks off on June 11, 2026.
          </p>
        </>
      )}
    </div>
  );
}