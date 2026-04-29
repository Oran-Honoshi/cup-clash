"use client";

import { useState } from "react";
import { Trophy, Star, Users, Search, Check, Lock, AlertCircle, Medal, Shirt } from "lucide-react";
import Image from "next/image";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALL_COUNTRIES, flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const KNOWN_PLAYERS = [
  { name: "Kylian Mbappé",     team: "France",    flagCode: "fr"     },
  { name: "Erling Haaland",    team: "Norway",    flagCode: "no"     },
  { name: "Lionel Messi",      team: "Argentina", flagCode: "ar"     },
  { name: "Vinícius Jr.",      team: "Brazil",    flagCode: "br"     },
  { name: "Harry Kane",        team: "England",   flagCode: "gb-eng" },
  { name: "Lamine Yamal",      team: "Spain",     flagCode: "es"     },
  { name: "Rodri",             team: "Spain",     flagCode: "es"     },
  { name: "Raphinha",          team: "Brazil",    flagCode: "br"     },
  { name: "Leroy Sané",        team: "Germany",   flagCode: "de"     },
  { name: "Bruno Fernandes",   team: "Portugal",  flagCode: "pt"     },
  { name: "Kevin De Bruyne",   team: "Belgium",   flagCode: "be"     },
  { name: "Jamal Musiala",     team: "Germany",   flagCode: "de"     },
  { name: "Pedri",             team: "Spain",     flagCode: "es"     },
  { name: "Florian Wirtz",     team: "Germany",   flagCode: "de"     },
  { name: "Phil Foden",        team: "England",   flagCode: "gb-eng" },
  { name: "Bernardo Silva",    team: "Portugal",  flagCode: "pt"     },
  { name: "Federico Valverde", team: "Uruguay",   flagCode: "uy"     },
  { name: "Bukayo Saka",       team: "England",   flagCode: "gb-eng" },
  { name: "Gavi",              team: "Spain",     flagCode: "es"     },
  { name: "Jude Bellingham",   team: "England",   flagCode: "gb-eng" },
  { name: "Alisson Becker",    team: "Brazil",    flagCode: "br"     },
  { name: "Manuel Neuer",      team: "Germany",   flagCode: "de"     },
  { name: "Thibaut Courtois",  team: "Belgium",   flagCode: "be"     },
  { name: "Ederson",           team: "Brazil",    flagCode: "br"     },
  { name: "Yann Sommer",       team: "Switzerland", flagCode: "ch"   },
];

interface ScoringConfig {
  enableSecond:      boolean;
  enableThird:       boolean;
  enableBestThird:   boolean;
  enableTopScorer:   boolean;
  enableTopAssister: boolean;
  enableGoldenBall:  boolean;
  enableGoldenGlove: boolean;
  second:            number;
  third:             number;
  bestThird:         number;
  topScorer:         number;
  topAssister:       number;
  goldenBall:        number;
  goldenGlove:       number;
  tournamentWinner:  number;
}

interface TournamentPicksProps {
  groupId: string;
  locked?: boolean;
  config?: Partial<ScoringConfig>;
}

interface Picks {
  winner:      string | null;
  second:      string | null;
  third:       string | null;
  bestThird:   string[];        // up to 8 countries
  topScorer:   string | null;
  topAssister: string | null;
  goldenBall:  string | null;
  goldenGlove: string | null;
}

const DEFAULT_CONFIG: ScoringConfig = {
  enableSecond: true, enableThird: true, enableBestThird: true,
  enableTopScorer: true, enableTopAssister: true,
  enableGoldenBall: false, enableGoldenGlove: false,
  second: 4, third: 2, bestThird: 1, topScorer: 3,
  topAssister: 3, goldenBall: 2, goldenGlove: 2, tournamentWinner: 6,
};

export function TournamentPicks({ groupId, locked = false, config: configOverride }: TournamentPicksProps) {
  const config = { ...DEFAULT_CONFIG, ...configOverride };
  const [picks, setPicks]       = useState<Picks>({ winner: null, second: null, third: null, bestThird: [], topScorer: null, topAssister: null, goldenBall: null, goldenGlove: null });
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);
  const [error,  setError]      = useState<string | null>(null);
  const [search, setSearch]     = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"countries" | "players">("countries");

  const setSearch_ = (key: string, val: string) => setSearch(s => ({ ...s, [key]: val }));

  const toggleBestThird = (code: string) => {
    setPicks(p => {
      const has = p.bestThird.includes(code);
      if (has) return { ...p, bestThird: p.bestThird.filter(c => c !== code) };
      if (p.bestThird.length >= 8) return p;
      return { ...p, bestThird: [...p.bestThird, code] };
    });
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await new Promise(r => setTimeout(r, 600));
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); return;
    }
    const sb = getClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Sign in required"); setSaving(false); return; }

    const upsert = async (type: string, value: string | null) => {
      if (!value) return;
      await sb.from("predictions").upsert(
        { user_id: user.id, group_id: groupId, pred_type: type, pred_value: value, match_id: null },
        { onConflict: "user_id,group_id,match_id,pred_type" }
      );
    };

    await Promise.all([
      upsert("winner",       picks.winner),
      upsert("second",       picks.second),
      upsert("third",        picks.third),
      upsert("top_scorer",   picks.topScorer),
      upsert("top_assister", picks.topAssister),
      upsert("golden_ball",  picks.goldenBall),
      upsert("golden_glove", picks.goldenGlove),
      ...picks.bestThird.map((c, i) => upsert(`best_third_${i + 1}`, c)),
    ]);

    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  // Country picker (used for winner/2nd/3rd/best third)
  const CountryPicker = ({ pickKey, label, pts, max }: { pickKey: keyof Picks; label: string; pts: number; max?: number }) => {
    const s = search[pickKey] ?? "";
    const filtered = ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(s.toLowerCase()) || c.code.toLowerCase().includes(s.toLowerCase())
    ).slice(0, 48);
    const value = picks[pickKey];
    const isArray = Array.isArray(value);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-pitch-400 uppercase tracking-widest">{label}</span>
          <span className="text-xs font-bold text-success">+{pts} pts{max ? ` × ${max}` : ""}</span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pitch-500" />
          <input type="text" placeholder="Search country..." value={s}
            onChange={e => setSearch_(pickKey, e.target.value)} disabled={locked}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white bg-white/[0.06] border border-white/[0.10] placeholder:text-pitch-600 focus:outline-none focus:border-accent disabled:opacity-40" />
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-40 overflow-y-auto">
          {filtered.map(c => {
            const isSelected = isArray
              ? (value as string[]).includes(c.name)
              : value === c.name;
            const isDisabled = isArray && !isSelected && (value as string[]).length >= (max ?? 99);
            return (
              <button key={c.code} title={c.name} disabled={locked || isDisabled}
                onClick={() => isArray ? toggleBestThird(c.name) : setPicks(p => ({ ...p, [pickKey]: c.name }))}
                className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all",
                  isSelected ? "border-accent/50 bg-accent/10" : "border-white/[0.06] hover:border-white/20",
                  (locked || isDisabled) && "opacity-40 cursor-not-allowed"
                )}>
                <div className="relative w-7 h-4.5 rounded-sm overflow-hidden">
                  <Image src={flagUrl(c.flagCode, 20)} alt={c.name} fill className="object-cover" unoptimized />
                </div>
                <span className="text-[8px] font-bold text-pitch-600 truncate w-full text-center">{c.code}</span>
              </button>
            );
          })}
        </div>
        {isArray && (
          <div className="text-[10px] text-pitch-500">
            {(value as string[]).length}/8 selected
            {(value as string[]).length > 0 && `: ${(value as string[]).join(", ")}`}
          </div>
        )}
        {!isArray && value && (
          <div className="text-xs font-bold text-center" style={{ color: "rgb(var(--accent-glow))" }}>
            ✓ {value as string}
          </div>
        )}
      </div>
    );
  };

  // Player picker (scorer, assister, golden ball, golden glove)
  const PlayerPicker = ({ pickKey, label, pts }: { pickKey: keyof Picks; label: string; pts: number }) => {
    const s = search[pickKey] ?? "";
    const filtered = KNOWN_PLAYERS.filter(p =>
      p.name.toLowerCase().includes(s.toLowerCase()) || p.team.toLowerCase().includes(s.toLowerCase())
    );
    const value = picks[pickKey] as string | null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-pitch-400 uppercase tracking-widest">{label}</span>
          <span className="text-xs font-bold text-success">+{pts} pts</span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pitch-500" />
          <input type="text" placeholder="Search player..." value={s}
            onChange={e => setSearch_(pickKey, e.target.value)} disabled={locked}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white bg-white/[0.06] border border-white/[0.10] placeholder:text-pitch-600 focus:outline-none focus:border-accent disabled:opacity-40" />
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {filtered.map(player => {
            const active = value === player.name;
            return (
              <button key={player.name} disabled={locked}
                onClick={() => setPicks(p => ({ ...p, [pickKey]: player.name }))}
                className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all",
                  active ? "border-accent/40 bg-accent/10" : "border-transparent hover:border-white/10 hover:bg-white/[0.03]",
                  locked && "opacity-40 cursor-not-allowed")}>
                <div className="relative w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
                  <Image src={flagUrl(player.flagCode, 20)} alt={player.team} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{player.name}</div>
                  <div className="text-[10px] text-pitch-500">{player.team}</div>
                </div>
                {active && <Check size={13} style={{ color: "rgb(var(--accent-glow))" }} className="shrink-0" />}
              </button>
            );
          })}
        </div>
        {value && <div className="text-xs font-bold text-center" style={{ color: "rgb(var(--accent-glow))" }}>✓ {value}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {locked && (
        <div className="flex items-center gap-2 text-xs text-warning font-bold uppercase tracking-widest p-3 rounded-xl bg-warning/10 border border-warning/20">
          <Lock size={13} /> Tournament picks are locked — first match has started
        </div>
      )}

      {/* Winner — always shown */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} style={{ color: "#D4AF37" }} />
          <span className="font-display text-xl uppercase text-white">Tournament Picks</span>
        </div>
        <CountryPicker pickKey="winner" label="🥇 Tournament Winner" pts={config.tournamentWinner} />
      </Card>

      {/* 2nd and 3rd place */}
      {(config.enableSecond || config.enableThird) && (
        <Card variant="glass" className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Medal size={18} style={{ color: "rgb(var(--accent-glow))" }} />
            <span className="font-display text-xl uppercase text-white">Podium Picks</span>
          </div>
          {config.enableSecond && <CountryPicker pickKey="second" label="🥈 2nd Place" pts={config.second} />}
          {config.enableThird  && <CountryPicker pickKey="third"  label="🥉 3rd Place" pts={config.third}  />}
        </Card>
      )}

      {/* Best 3rd place — 8 picks */}
      {config.enableBestThird && (
        <Card variant="glass" className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={18} style={{ color: "rgb(var(--accent-glow))" }} />
            <span className="font-display text-xl uppercase text-white">Best 3rd-Place Teams</span>
          </div>
          <p className="text-xs text-pitch-500 mb-4">Pick which 8 of the 12 group 3rd-place finishers will qualify for the Round of 32.</p>
          <CountryPicker pickKey="bestThird" label="8 qualifiers" pts={config.bestThird} max={8} />
        </Card>
      )}

      {/* Players */}
      {(config.enableTopScorer || config.enableTopAssister || config.enableGoldenBall || config.enableGoldenGlove) && (
        <Card variant="glass" className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-warning" />
            <span className="font-display text-xl uppercase text-white">Player Awards</span>
          </div>
          {config.enableTopScorer   && <PlayerPicker pickKey="topScorer"   label="⚽ Top Scorer (Golden Boot)"   pts={config.topScorer}   />}
          {config.enableTopAssister && <PlayerPicker pickKey="topAssister" label="🎯 Top Assister"                pts={config.topAssister} />}
          {config.enableGoldenBall  && <PlayerPicker pickKey="goldenBall"  label="🏅 Golden Ball (Best Player)"   pts={config.goldenBall}  />}
          {config.enableGoldenGlove && <PlayerPicker pickKey="goldenGlove" label="🧤 Golden Glove (Best GK)"       pts={config.goldenGlove} />}
        </Card>
      )}

      {error && <div className="flex items-center gap-2 text-xs text-danger"><AlertCircle size={13} />{error}</div>}

      {!locked && (
        <>
          <Button onClick={handleSave} loading={saving} size="md" className="w-full"
            leftIcon={saved ? <Check size={15} /> : <Trophy size={15} />}>
            {saved ? "Picks saved!" : "Save all tournament picks"}
          </Button>
          <p className="text-[11px] text-pitch-500 text-center">
            All picks lock when the first match kicks off on June 11, 2026.
          </p>
        </>
      )}
    </div>
  );
}

// Need to import BarChart2 from lucide
import { BarChart2 } from "lucide-react";